import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshUsersSession,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';

// Контроллер створення користувача
export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

// Контроллер login користувача

// Функція loginUserController виконує процес обробки запиту на вхід користувача і взаємодію з клієнтом через HTTP
export const loginUserController = async (req, res) => {
  // Функція аутентифікації loginUser виконує процес аутентифікації і повертає об'єкт сесії
  const session = await loginUser(req.body);

  // Функція встановлює два куки: refreshToken і sessionId, використовуючи метод res.cookie
  // refreshToken зберігається як http-only cookie, що означає, що він доступний тільки через HTTP-запити і не може бути доступним через JavaScript на стороні клієнта. Він має термін дії один день.
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  // sessionId також зберігається як http-only cookie з аналогічним терміном дії.
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  //  Відправлення клієнту відповіді з інформацією про успішний вхід та токеном доступу.
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// Контроллер logout користувача

// Функція logoutUserController виконує процес обробки запиту на вихід користувача і взаємодію з клієнтом через HTTP
export const logoutUserController = async (req, res) => {
  // Перевірка, чи існує кукі sessionId у запиті.
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  // Функція очищає кукі sessionId і refreshToken, використовуючи метод res.clearCookie. Це видаляє відповідні куки з браузера клієнта, що забезпечує вихід користувача з системи на стороні клієнта.
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  // Відправлення клієнту відповіді зі статусним кодом 204 (No Content)
  // Це означає, що запит був успішно оброблений, але у відповіді немає тіла повідомлення
  res.status(204).send();
};

// Контроллер refresh користувача
const setupSession = (res, session) => {
  // setupSession встановлює два куки: refreshToken і sessionId, використовуючи метод res.cookie.
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

// Функція приймає об'єкти запиту (req) і відповіді (res).
export const refreshUserSessionController = async (req, res) => {
  // Вона викликає функцію refreshUsersSession, передаючи їй об'єкт з sessionId та refreshToken, отримані з куків запиту (req.cookies.sessionId та req.cookies.refreshToken).
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  // refreshUsersSession виконує процес оновлення сесії і повертає об'єкт нової сесії.

  // Функція викликає setupSession, передаючи їй об'єкт відповіді (res) та нову сесію.
  setupSession(res, session);

  // Функція формує JSON-відповідь, яка включає статусний код 200, повідомлення про успішне оновлення сесії та дані, що містять accessToken.
  // Використовується метод res.json для відправлення відповіді клієнту
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// Контроллер який буде обробляти запит на зміну пароля
export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

// Контроллер який буде обробляти зміну пароля
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};
