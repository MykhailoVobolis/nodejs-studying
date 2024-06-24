import { SORT_ORDER } from '../constants/index.js';

// Парсер квері параметрів для сортування
// Цей парсер використовується для обробки та стандартизації параметрів сортування, які можуть бути вказані у запиті до сервера.

// Функція parseSortOrder приймає параметр sortOrder та перевіряє, чи відповідає він одному з відомих порядків сортування — або зростанню (ASC), або спаданню (DESC).
const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
};

// Функція parseSortBy приймає параметр sortBy, який має вказувати поле, за яким потрібно виконати сортування в базі даних студентів. Вона перевіряє, чи входить дане поле до списку допустимих полів (наприклад, _id, name, age тощо).
const parseSortBy = (sortBy) => {
  const keysOfStudent = [
    '_id',
    'name',
    'age',
    'gender',
    'avgMark',
    'onDuty',
    'createdAt',
    'updatedAt',
  ];

  if (keysOfStudent.includes(sortBy)) {
    return sortBy;
  }

  return '_id';
};

// Загальна функція parseSortParams, яка експортується з модуля, інтегрує обидві ці функції. Вона приймає об'єкт query, з якого витягує значення sortOrder та sortBy, передає їх на обробку у відповідні функції та повертає об'єкт із валідованими та готовими до використання параметрами для сортування.
export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
