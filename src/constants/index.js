import path from 'node:path';

export const SORT_ORDER = {
  ASC: 'asc', // Сортування за зростанням
  DESC: 'desc', // Сортування за спаданням
};

export const FIFTEEN_MINUTES = 15 * 60 * 1000; // Терміну життя access токену - 15 хв.
export const ONE_DAY = 24 * 60 * 60 * 1000; // Терміну життя refresh токену - 1 день

// Константи з ролями юзерів
export const ROLES = {
  TEACHER: 'teacher',
  PARENT: 'parent',
};

// Константи для надсилання email при скиданні паролю
export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};

// Абсолютний шлях до папки templates
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

// Константи для збереження завантажених файлів у визначеній директорії
export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
