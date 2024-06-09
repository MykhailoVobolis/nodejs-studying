import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { env } from './utils/env.js';
import { getAllStudents, getStudentById } from './services/students.js';

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

  // Отримання колекції всіх студентів
  app.get('/students', async (req, res) => {
    const students = await getAllStudents();

    res.status(200).json({
      data: students,
    });
  });

  // Отримання студента за його id
  app.get('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    res.status(200).json({
      data: student,
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
