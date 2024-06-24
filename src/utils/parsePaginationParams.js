// Логіка парсингу параметрів пошуку:

// 1. Функція parseNumber призначена для перетворення рядкових значень в числа
const parseNumber = (number, defaultValue) => {
  const isString = typeof number === 'string';
  if (!isString) return defaultValue;

  const parsedNumber = parseInt(number);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }
  // У випадку успішного перетворення, функція повертає це число.
  return parsedNumber;
};

// 2. Функція parsePaginationParams використовує parseNumber для обробки пагінаційних параметрів, які зазвичай надходять у запитах до бекенду. Ці параметри, page і perPage, містяться в об'єкті query і можуть бути неправильно вказані або взагалі пропущені.
export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);

  // Кінцевим результатом є об'єкт з коректно обробленими і валідними пагінаційними параметрами.
  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};
