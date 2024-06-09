import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { env } from './utils/env.js';

// Читаємо змінну оточення PORT
const PORT = Number(env('PORT', '3000'));

// Функція створення сервера
export const startServer = () => {
  const app = express();

  // Вбудований у express middleware для обробки (парсингу) JSON-даних у запитах
  // наприклад, у запитах POST або PATCH
  app.use(express.json());

  // Middleware CORS
  app.use(cors());

  // Middleware для логування, такий як pino-http, слід розташовувати якомога раніше у ланцюгу middleware
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // Функція-обробник запиту
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  // Middleware для обробки випадку, коли клієнт звертається до неіснуючого маршруту
  app.use('*', (req, res, next) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  // Middleware для обробких помилок (приймає 4 аргументи)
  // додається завжди самим останнім, після всіх інших middleware та маршрутів
  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
