// Імпортуємо клас HttpError для обробки помилок HTTP з відповідними статус-кодами
import { HttpError } from 'http-errors';

// Middleware, для обробких помилок відповіді з бекенду (обов'язково приймає 4 аргументи для того щоб express сприймав middlware як ту що оброблює помилку)
export const errorHandler = (err, req, res, next) => {
  // Перевірка, чи отримали ми помилку від createHttpError
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};
