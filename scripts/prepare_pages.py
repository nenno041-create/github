"""Prepare the static site for GitHub Pages without modifying its source files.

The repository URL has a prefix such as /github; a custom domain has no prefix.
GitHub's configure-pages action supplies the current prefix to this script.
Only the Python standard library is required.
"""

import argparse
from pathlib import Path
import re
import shutil


HTML_URL_ATTRIBUTE = re.compile(
    r'\b(?P<name>href|src|srcset)\s*=\s*(?P<quote>["\x27])'
    r'(?P<value>.*?)(?P=quote)',
    re.IGNORECASE | re.DOTALL,
)
CSS_URL = re.compile(
    r'url\(\s*(?P<quote>["\x27]?)(?P<value>.*?)(?P=quote)\s*\)',
    re.IGNORECASE | re.DOTALL,
)


def root_url(value, base_path):
    """Leave external URLs, fragments, relative URLs and protocol-relative URLs alone."""
    if value.startswith('/') and not value.startswith('//'):
        return base_path + value
    return value


def html_paths(text, base_path):
    def attribute(match):
        value = match.group('value')
        if match.group('name').lower() == 'srcset':
            candidates = []
            for candidate in value.split(','):
                parts = candidate.strip().split(maxsplit=1)
                if parts:
                    parts[0] = root_url(parts[0], base_path)
                    candidates.append(' '.join(parts))
            updated = ', '.join(candidates)
        else:
            updated = root_url(value, base_path)
        if updated == value:
            return match.group(0)
        start, end = match.span('value')
        return (match.group(0)[:start - match.start()] + updated
                + match.group(0)[end - match.start():])
    return HTML_URL_ATTRIBUTE.sub(attribute, text)


def css_paths(text, base_path):
    def url(match):
        value = match.group('value')
        updated = root_url(value, base_path)
        if value == updated:
            return match.group(0)
        quote = match.group('quote')
        return 'url(' + quote + updated + quote + ')'
    return CSS_URL.sub(url, text)


def prepare(source, output, base_path):
    source = source.resolve()
    output = output.resolve()
    base_path = base_path.rstrip('/')
    if base_path and (not base_path.startswith('/') or base_path.startswith('//')
                      or any(char in base_path for char in '?#\\"\x27\n\r')):
        raise ValueError('Expected an empty base path or a path such as /github.')
    if not (source / 'index.html').is_file():
        raise ValueError('The source directory must contain index.html.')
    if output == source or source in output.parents:
        raise ValueError('The output must be outside the source directory.')
    if output.exists():
        raise ValueError('The output directory already exists; use a new directory.')

    files = sorted(source.rglob('*'))
    if any(path.is_symlink() for path in files):
        raise ValueError('The static site must not contain symbolic links.')
    output.mkdir(parents=True)
    count = 0
    for path in files:
        if not path.is_file() or path.name in {'.htaccess', '.DS_Store', 'Thumbs.db'}:
            continue
        destination = output / path.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True)
        if base_path and path.suffix.lower() in {'.html', '.css'}:
            text = path.read_text(encoding='utf-8')
            transform = html_paths if path.suffix.lower() == '.html' else css_paths
            destination.write_text(transform(text, base_path), encoding='utf-8')
        else:
            shutil.copyfile(path, destination)
        count += 1
    print('Prepared {} files for {}.'.format(count, base_path or '/'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=Path('site'))
    parser.add_argument('--output', type=Path, default=Path('_site'))
    parser.add_argument('--base-path', default='')
    args = parser.parse_args()
    prepare(args.source, args.output, args.base_path)


if __name__ == '__main__':
    main()
