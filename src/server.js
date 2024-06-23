import express from 'express';
import cors from 'cors';

// Імпортуємо роутер
import studentsRouter from './routers/students.js';

import { env } from './utils/env.js';

// Імпортуємо middleware
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { logger } from './middlewares/logger.js';

// Читаємо змінну оточення PORT
const PORT = Number(env('PORT', '3000'));

// Функція створення сервера
export const startServer = () => {
  const app = express();

  // Middleware для логування, такий як pino-http, слід розташовувати якомога раніше у ланцюгу middleware
  app.use(logger);

  // Вбудований у express middleware для обробки (парсингу) JSON-даних у запитах
  // наприклад, у запитах POST або PATCH
  app.use(express.json());

  // Middleware CORS
  app.use(cors());

  // Функція-обробник запиту
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  // Додаємо роутер до app як middleware
  app.use(studentsRouter);

  // Додаємо Middleware для обробки випадку, коли клієнт звертається до неіснуючого маршруту
  app.use('*', notFoundHandler);

  // Додаємо Middleware для обробких помилок
  // додається завжди самим останнім, після всіх інших middleware та маршрутів
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
