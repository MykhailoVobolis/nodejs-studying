import dotenv from 'dotenv';

dotenv.config();

// Функцію env призначена для читання змінних оточення.
export function env(name, defaultValue) {
  const value = process.env[name];

  if (value) return value;

  if (defaultValue) return defaultValue;

  throw new Error(`Missing: process.env['${name}'].`);
}
