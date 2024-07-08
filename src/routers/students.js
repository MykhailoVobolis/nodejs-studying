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
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validation/students.js';
import { ROLES } from '../constants/index.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// Middleware authenticate для запитів до колекції студентів
router.use(authenticate);

// Обов'язкове обгортання контролерів у функцію ctrlWrapper для обробки можливих помилок шо приходять з бекенду

// Роут отримання колекції всіх студентів
router.get('/', checkRoles(ROLES.TEACHER), ctrlWrapper(getStudentsController));

// Роут отримання студента за його id
router.get(
  '/:studentId',
  isValidId,
  checkRoles(ROLES.TEACHER, ROLES.PARENT),
  ctrlWrapper(getStudentByIdController),
);

// Роут додавання нового студента
router.post(
  '',
  checkRoles(ROLES.TEACHER),
  validateBody(createStudentSchema),
  upload.single('photo'), // middleware додавання файлу
  ctrlWrapper(createStudentController),
);

// Роут видалення студента за його id
router.delete(
  '/:studentId',
  isValidId,
  checkRoles(ROLES.TEACHER),
  ctrlWrapper(deleteStudentController),
);

// Роут оновлення даних студента за його id
router.put(
  '/:studentId',
  checkRoles(ROLES.TEACHER),
  validateBody(createStudentSchema),
  upload.single('photo'), // middleware додавання файлу
  ctrlWrapper(upsertStudentController),
);

// Роут часткового оновлення даних студента за його id
router.patch(
  '/:studentId',
  checkRoles(ROLES.TEACHER, ROLES.PARENT),
  validateBody(updateStudentSchema),
  upload.single('photo'), // middleware додавання файлу
  ctrlWrapper(patchStudentController),
);

export default router;
