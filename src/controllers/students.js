// 1. Імпортуємо функцію з бібліотеки http-errors для створення помилок
import createHttpError from 'http-errors';

import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from '../services/students.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// Контроллер отримання колекції всіх студентів з бази даних. GET
export const getStudentsController = async (req, res, _next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const students = await getAllStudents({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

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

  // Відповідь, якщо студента знайдено
  res.json({
    status: 200,
    message: `Successfully found student with id ${studentId}!`,
    data: student,
  });
};

// Контролер додавання нових студентів до бази даних користувачами додатку. POST
export const createStudentController = async (req, res) => {
  const student = await createStudent(req.body);

  // Відповідь, якщо студента успішно додано
  res.status(201).json({
    status: 201,
    message: `Successfully created a student!`,
    data: student,
  });
};

// Контролер видалення студента з бази даних. DELETE
export const deleteStudentController = async (req, res, next) => {
  const { studentId } = req.params;

  const student = await deleteStudent(studentId);

  // Обробка помилки, якщо студента по такому id не буде знайдно.
  if (!student) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  // У разі успішного видалення повернемо порожню відповідь із статусом 204 No Content
  res.status(204).send();
};

// Контролер оновлювення даних студентів в базі даних. PUT
export const upsertStudentController = async (req, res, next) => {
  const { studentId } = req.params;

  // Для того, щоб функція updateStudent могла не тільки оновлювати, але й створювати ресурс при його відсутності, необхідно їй аргументом додатково передати { upsert: true }.
  const result = await updateStudent(studentId, req.body, {
    upsert: true,
  });

  // Обробка помилки, якщо студента по такому id не буде знайдно.
  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  // У разі успішного оновлення або створення ресурсу повернемо відповідний статус
  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a student!`,
    data: result.student,
  });
};

// Контролер часткового оновлювення даних студентів в базі даних. PATCH
export const patchStudentController = async (req, res, next) => {
  {
    const { studentId } = req.params;

    // Отримаємо обʼєкт зображення в тілі контролеру:
    const photo = req.file;

    let photoUrl;

    // Реалізація логіки з Feature flag (флаг функції або функціональний флаг)

    // Логіку, яка визначає куди буде завантажено наше фото. Якщо змінна середовища ENABLE_CLOUDINARY встановлена в true, фото завантажується на Cloudinary, інакше — у локальну директорію.
    if (photo) {
      if (env('ENABLE_CLOUDINARY') === 'true') {
        photoUrl = await saveFileToCloudinary(photo);
      } else {
        photoUrl = await saveFileToUploadDir(photo);
      }
    }

    // Перевикористання функції updateStudent яку ми до цього створили для PUT ендпоінта.
    // Єдина відмінність буде полягати в тому, що ми не будемо під час виклику нічого передавати третім аргументом options, оскільки ми завчасно продумали цей варіант і задали options дефолтне значення як порожній об’єкт.
    const result = await updateStudent(studentId, {
      ...req.body,
      photo: photoUrl,
    });

    // Обробка помилки, якщо студента по такому id не буде знайдно.
    if (!result) {
      next(createHttpError(404, 'Student not found'));
      return;
    }

    // У разі успішного часткового оновлення ресурсу повернемо відповідний статус
    res.json({
      status: 200,
      message: `Successfully patched a student!`,
      data: result.student,
    });
  }
};
