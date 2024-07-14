import dotenv from 'dotenv';

dotenv.config();

export const ENV_VARS = {
  // JWT_SECRET: 'JWT_SECRET',
  // APP_DOMAIN: 'APP_DOMAIN',
  // SMTP_FROM: 'SMTP_FROM',
  // SMTP_HOST: 'SMTP_HOST',
  // SMTP_PORT: 'SMTP_PORT',
  // SMTP_USER: 'SMTP_USER',
  // SMTP_PASS: 'SMTP_PASS',
  GOOGLE_AUTH_CLIENT_ID: 'GOOGLE_AUTH_CLIENT_ID',
  GOOGLE_AUTH_CLIENT_SECRET: 'GOOGLE_AUTH_CLIENT_SECRET',
};

// Функцію env призначена для читання змінних оточення.
export function env(name, defaultValue) {
  const value = process.env[name];

  if (value) return value;

  if (defaultValue) return defaultValue;

  throw new Error(`Missing: process.env['${name}'].`);
}

//  Використати її ми можемо, наприклад, в такому вигляді: env('PORT', '3000');
//  Якщо змінної оточення з такою назвою не було вказано і не було передано дефолтного значення,
// то виклик цієї функції викине помилку з повідомленням Missing: process.env['PORT'].
