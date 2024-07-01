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
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validation/students.js';

const router = Router();

// Обов'язкове обгортання контролерів у функцію ctrlWrapper для обробки можливих помилок шо приходять з бекенду

// Роут отримання колекції всіх студентів
router.get('/', ctrlWrapper(getStudentsController));

// Роут отримання студента за його id
router.get('/:studentId', isValidId, ctrlWrapper(getStudentByIdController));

// Роут додавання нового студента
router.post(
  '',
  validateBody(createStudentSchema),
  ctrlWrapper(createStudentController),
);

// Роут видалення студента за його id
router.delete('/:studentId', ctrlWrapper(deleteStudentController));

// Роут оновлення даних студента за його id
router.put(
  '/:studentId',
  validateBody(createStudentSchema),
  ctrlWrapper(upsertStudentController),
);

// Роут часткового оновлення даних студента за його id
router.patch(
  '/:studentId',
  validateBody(updateStudentSchema),
  ctrlWrapper(patchStudentController),
);

export default router;
