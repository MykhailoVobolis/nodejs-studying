import { Router } from 'express';

import {
  getStudentsController,
  getStudentByIdController,
} from '../controllers/students.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

// Обов'язкове обгортання контролерів у функцію ctrlWrapper для обробки можливих помилок шо приходять з бекенду

// Отримання колекції всіх студентів
router.get('/students', ctrlWrapper(getStudentsController));

// Отримання студента за його id
router.get('/students/:studentId', ctrlWrapper(getStudentByIdController));

export default router;
