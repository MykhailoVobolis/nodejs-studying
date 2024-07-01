import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

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
  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

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
