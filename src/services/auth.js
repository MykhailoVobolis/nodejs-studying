import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';

// Сервіс-функція для створення користувача
export const registerUser = async (payload) => {
  // Перевірка email на унікальність під час реєстрації.
  // У разі дублювання, повертає відповідь зі статусом 409 і відповідним повідомленням.
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  // Хешування для зберігання паролю за допомогою бібліотеки bcrypt
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// Сервіс-функція для login користувача
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password); // Порівнюємо хеші паролів

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  // функціонал по створенню сесій

  // Видалення попередньої сесії користувача, якщо така існує, з колекції сесій.
  await SessionsCollection.deleteOne({ userId: user._id });

  // Генерація нових токенів доступу та оновлення.
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // Створення нової сесії в базі даних
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// Сервіс-функція для logout користувача
export const logoutUser = async (sessionId) => {
  // Видалення поточної сессії користувача
  await SessionsCollection.deleteOne({ _id: sessionId });
};

// Сервіс-функція для refresh користувача
const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

// Функція refreshUsersSession виконує процес оновлення сесії користувача і взаємодію з базою даних через асинхронні запити
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  // Функція шукає в колекції SessionsCollection сесію з відповідним sessionId та refreshToken.
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  // Якщо сесію не знайдено, функція викликає помилку з кодом 401 (Сесію не знайдено)
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  // Функція перевіряє, чи не минув термін дії refreshToken. Якщо поточна дата перевищує значення refreshTokenValidUntil, це означає, що токен сесії прострочений.
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  // Якщо токен сесії прострочений, функція викликає помилку з кодом 401 (Токен сесії прострочений)
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // Функція викликає createSession, яка генерує нові accessToken і refreshToken, а також встановлює терміни їхньої дії
  // createSession повертає об'єкт з новими токенами і термінами їхньої дії
  const newSession = createSession();

  // Функція створює нову сесію в колекції SessionsCollection, використовуючи ідентифікатор користувача з існуючої сесії та дані нової сесії, згенеровані функцією createSession.
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  // Нову сесію збережено в базі даних і функція повертає її.
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

// Сервіс-функція для створення запиту на скидання паролю
export const requestResetToken = async (email) => {
  // Шукаємо користувача в колекції користувачів за вказаною електронною поштою
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Якщо користувача знайдено, функція створює токен скидання пароля, який містить ідентифікатор користувача та його електронну пошту. Токен підписується секретом JWT і має термін дії 15 хвилин.
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  // Використання шаблонізатора handlebars в процес створення html листа
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  // Після цього функція надсилає електронний лист користувачу, який містить посилання для скидання пароля з включеним створеним токеном.
  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

// Сервіс-функція для зміни паролю
export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  // Видалення поточної сесії користувача при зміні паролю
  await SessionsCollection.deleteOne({ userId: user._id });
};

// Сервіс-функція для Google аутентифікації
export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
