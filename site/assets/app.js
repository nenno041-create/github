import { CLUB, DAYS, GROUP_LABELS, selectSessions, formatBookingMessage } from './content.js';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}

menuToggle.addEventListener('click', () => {
  const opened = menuToggle.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('is-open', opened);
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('[data-price]').forEach(element => {
  const amount = CLUB.prices[element.dataset.price];
  if (amount) element.textContent = new Intl.NumberFormat('ru-RU').format(amount);
});

const scheduleGrid = document.querySelector('#schedule-grid');
const daySelect = document.querySelector('#schedule-day');
const scheduleStatus = document.querySelector('#schedule-status');
const filterButtons = [...document.querySelectorAll('[data-group]')];
let selectedGroup = 'all';

function lessonWord(count) {
  const remainder = count % 100;
  if (remainder >= 11 && remainder <= 14) return 'занятий';
  if (count % 10 === 1) return 'занятие';
  if (count % 10 >= 2 && count % 10 <= 4) return 'занятия';
  return 'занятий';
}

function renderSchedule() {
  const sessions = selectSessions(selectedGroup, daySelect.value);
  const cards = [];
  for (const day of DAYS) {
    const daySessions = sessions.filter(session => session.day === day.id);
    if (!daySessions.length) continue;
    const card = document.createElement('article');
    card.className = 'day-card';
    const heading = document.createElement('div');
    heading.className = 'day-heading';
    const badge = document.createElement('span');
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = day.short;
    const title = document.createElement('h3');
    title.textContent = day.name;
    heading.append(badge, title);
    card.append(heading);
    for (const session of daySessions) {
      const row = document.createElement('div');
      row.className = 'session';
      const time = document.createElement('p');
      time.className = 'session-time';
      time.textContent = `${session.start}–${session.end}`;
      const group = document.createElement('span');
      group.className = `session-group${session.group === 'all' ? ' shared' : ''}`;
      group.textContent = session.group === 'beginner' ? 'Н / Н1' : session.group === 'n2' ? 'Н2' : 'Все группы';
      const name = document.createElement('p');
      name.className = 'session-title';
      name.textContent = session.title;
      row.append(time, group, name);
      card.append(row);
    }
    cards.push(card);
  }
  if (!cards.length) {
    const empty = document.createElement('p');
    empty.className = 'schedule-empty';
    empty.textContent = 'В этот день у выбранной группы нет занятий. Посмотрите другой день или всю неделю.';
    cards.push(empty);
  }
  scheduleGrid.replaceChildren(...cards);
  filterButtons.forEach(button => {
    const active = button.dataset.group === selectedGroup;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const selectedDay = DAYS.find(day => day.id === daySelect.value);
  scheduleStatus.textContent = `${GROUP_LABELS[selectedGroup]} · ${selectedDay ? selectedDay.name.toLowerCase() : 'вся неделя'} · ${sessions.length} ${lessonWord(sessions.length)}${selectedGroup !== 'all' ? ', включая общие' : ''}`;
}

filterButtons.forEach(button => button.addEventListener('click', () => {
  selectedGroup = button.dataset.group;
  renderSchedule();
}));
daySelect.addEventListener('change', renderSchedule);
document.querySelectorAll('[data-schedule-group]').forEach(link => link.addEventListener('click', () => {
  selectedGroup = link.dataset.scheduleGroup;
  daySelect.value = 'all';
  renderSchedule();
}));
renderSchedule();

const bookingDialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
const bookingResult = document.querySelector('#booking-result');
const bookingGroup = document.querySelector('#booking-group');
const bookingMessage = document.querySelector('#booking-message');
const copyStatus = document.querySelector('#copy-status');

function clearBookingDraft() {
  bookingForm.reset();
  bookingMessage.value = '';
  bookingForm.hidden = false;
  bookingResult.hidden = true;
  copyStatus.textContent = '';
}

function closeBooking() {
  bookingDialog.close();
}

document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  bookingForm.hidden = false;
  bookingResult.hidden = true;
  copyStatus.textContent = '';
  bookingGroup.value = button.dataset.book || 'unsure';
  if (typeof bookingDialog.showModal === 'function') {
    bookingDialog.showModal();
    document.body.classList.add('dialog-open');
  } else {
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
  }
}));
document.querySelector('#booking-close').addEventListener('click', closeBooking);
bookingDialog.addEventListener('click', event => {
  if (event.target === bookingDialog) closeBooking();
});
bookingDialog.addEventListener('close', () => {
  clearBookingDraft();
  document.body.classList.remove('dialog-open');
});
window.addEventListener('pagehide', clearBookingDraft);
window.addEventListener('pageshow', event => {
  if (event.persisted) clearBookingDraft();
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(bookingForm);
  bookingMessage.value = formatBookingMessage(Object.fromEntries(fields.entries()));
  bookingForm.hidden = true;
  bookingResult.hidden = false;
  copyStatus.textContent = '';
  document.querySelector('#copy-message').focus();
});

document.querySelector('#edit-message').addEventListener('click', () => {
  bookingForm.hidden = false;
  bookingResult.hidden = true;
  copyStatus.textContent = '';
  bookingGroup.focus();
});

document.querySelector('#copy-message').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available');
    await navigator.clipboard.writeText(bookingMessage.value);
    copyStatus.textContent = 'Скопировано! Откройте группу ВК и отправьте сообщение тренеру.';
  } catch {
    bookingMessage.focus();
    bookingMessage.select();
    bookingMessage.setSelectionRange(0, bookingMessage.value.length);
    copyStatus.textContent = 'Текст выделен — скопируйте его вручную и отправьте в сообщениях группы ВК.';
  }
});

const galleryDialog = document.querySelector('#gallery-dialog');
if (galleryDialog) {
  const galleryLinks = [...document.querySelectorAll('[data-gallery-index]')];
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const lightboxCount = document.querySelector('#lightbox-count');
  let photoIndex = 0;
  let originalPhotoLink = null;

  function showPhoto(index) {
    photoIndex = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[photoIndex];
    const preview = link.querySelector('img');
    lightboxImage.src = link.href;
    lightboxImage.alt = preview.alt;
    lightboxCaption.textContent = link.dataset.caption;
    lightboxCount.textContent = `${photoIndex + 1} / ${galleryLinks.length}`;
  }

  galleryLinks.forEach((link, index) => link.addEventListener('click', event => {
    if (typeof galleryDialog.showModal !== 'function') return;
    event.preventDefault();
    originalPhotoLink = link;
    showPhoto(index);
    galleryDialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  document.querySelector('#lightbox-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  document.querySelector('#lightbox-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  document.querySelector('#lightbox-close').addEventListener('click', () => galleryDialog.close());
  galleryDialog.addEventListener('click', event => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
  galleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
  });
  galleryDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    originalPhotoLink?.focus();
  });
}
