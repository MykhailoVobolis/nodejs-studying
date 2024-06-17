// 1. Імпортуємо функцію з бібліотеки http-errors для створення помилок
import createHttpError from 'http-errors';

import { getAllStudents, getStudentById } from '../services/students.js';

// Контроллер отримання колекції всіх студентів
export const getStudentsController = async (req, res, next) => {
  const students = await getAllStudents();

  res.json({
    status: 200,
    message: 'Successfully found students!',
    data: students,
  });
};

// Контроллер отримання студента за його id
export const getStudentByIdController = async (req, res, next) => {
  const { studentId } = req.params;
  const student = await getStudentById(studentId);

  // Код який був до цього
  // Відповідь, якщо контакт не знайдено
  //   if (!student) {
  //     res.status(404).json({
  //       message: 'Student not found',
  //     });
  //     return;
  //   }

  // А тепер додаємо базову обробку помилки замість res.status(404)
  //   Після виклику next, обробник помилок в нашому додатку (error middleware) у файлі server.js, перехопить і опрацює цю помилку.
  //   Після виклику next обов’язково потрібно додати return
  if (!student) {
    // 2. Створюємо та налаштовуємо помилку
    // В імпортовану функцію передаємо 2 аргументи. Першим — код помилки, а другим — рядок, що містить опис помилки для об'єкта відповіді.
    next(createHttpError(404, 'Student not found'));
    return;
  }

  // Відповідь, якщо контакт знайдено
  res.json({
    status: 200,
    message: `Successfully found student with id ${studentId}!`,
    data: student,
  });
};
