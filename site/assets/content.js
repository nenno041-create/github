export const CLUB = Object.freeze({
  name: 'Оливия',
  address: 'Великие Луки, ул. Ботвина, 19',
  venue: 'ТРЦ «Планета», 2 этаж',
  vk: 'https://vk.ru/olivevlbt',
  phones: ['+79824645527', '+79215513880'],
  prices: { beginner: 2800, n2: 3500 },
});

export const DAYS = [
  { id: 'mon', name: 'Понедельник', short: 'ПН' },
  { id: 'tue', name: 'Вторник', short: 'ВТ' },
  { id: 'wed', name: 'Среда', short: 'СР' },
  { id: 'thu', name: 'Четверг', short: 'ЧТ' },
  { id: 'fri', name: 'Пятница', short: 'ПТ' },
  { id: 'sat', name: 'Суббота', short: 'СБ' },
];

export const SESSIONS = [
  { day: 'mon', start: '19:00', end: '19:45', group: 'beginner', title: 'Бальные танцы' },
  { day: 'tue', start: '18:00', end: '19:00', group: 'n2', title: 'Стандарт' },
  { day: 'tue', start: '19:15', end: '20:00', group: 'n2', title: 'ОФП' },
  { day: 'wed', start: '17:00', end: '18:00', group: 'n2', title: 'Стандарт' },
  { day: 'wed', start: '18:15', end: '19:00', group: 'n2', title: 'Хореография' },
  { day: 'wed', start: '19:00', end: '19:45', group: 'beginner', title: 'Бальные танцы' },
  { day: 'thu', start: '18:00', end: '19:00', group: 'n2', title: 'Латина' },
  { day: 'thu', start: '19:15', end: '20:00', group: 'n2', title: 'ОФП' },
  { day: 'fri', start: '17:45', end: '18:45', group: 'n2', title: 'Латина' },
  { day: 'fri', start: '19:00', end: '20:00', group: 'all', title: 'Растяжка' },
  { day: 'sat', start: '10:00', end: '10:45', group: 'all', title: 'Концертная репетиция' },
  { day: 'sat', start: '11:00', end: '11:45', group: 'n2', title: 'Прогон · стандарт' },
  { day: 'sat', start: '12:00', end: '12:45', group: 'n2', title: 'Прогон · латина' },
];

export const GROUP_LABELS = {
  beginner: 'Начинающие / Н1',
  n2: 'Начинающие 2',
  all: 'Все группы',
  unsure: 'Нужна помощь с выбором группы',
};

export function selectSessions(group = 'all', day = 'all') {
  const selectedGroup = ['all', 'beginner', 'n2'].includes(group) ? group : 'all';
  return SESSIONS.filter(session =>
    (day === 'all' || session.day === day) &&
    (selectedGroup === 'all' || session.group === selectedGroup || session.group === 'all')
  );
}

export function formatBookingMessage({ parentName = '', childAge = '', group = 'unsure', comment = '' } = {}) {
  const clean = value => String(value).trim();
  const lines = ['Здравствуйте! Хотим записаться на занятие в танцевальный клуб «Оливия».'];
  if (clean(parentName)) lines.push(`Меня зовут: ${clean(parentName)}.`);
  if (clean(childAge)) lines.push(`Возраст ребёнка: ${clean(childAge)}.`);
  lines.push(`Группа: ${GROUP_LABELS[group] || GROUP_LABELS.unsure}.`);
  if (clean(comment)) lines.push(`Наш вопрос: ${clean(comment)}`);
  lines.push('Подскажите, пожалуйста, когда можно прийти и что взять с собой.');
  return lines.join('\n');
}
