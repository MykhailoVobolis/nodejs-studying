import { Router } from 'express';

import {
  getStudentsController,
  getStudentByIdController,
  createStudentController,
  deleteStudentController,
  upsertStudentController,
  patchStudentController,
} from '../controllers/students.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

// Обов'язкове обгортання контролерів у функцію ctrlWrapper для обробки можливих помилок шо приходять з бекенду

// Роут отримання колекції всіх студентів
router.get('/students', ctrlWrapper(getStudentsController));

// Роут отримання студента за його id
router.get('/students/:studentId', ctrlWrapper(getStudentByIdController));

// Роут додавання нового студента
router.post('/students', ctrlWrapper(createStudentController));

// Роут видалення студента за його id
router.delete('/students/:studentId', ctrlWrapper(deleteStudentController));

// Роут оновлення даних студента за його id
router.put('/students/:studentId', ctrlWrapper(upsertStudentController));

// Роут часткового оновлення даних студента за його id
router.patch('/students/:studentId', ctrlWrapper(patchStudentController));

export default router;
