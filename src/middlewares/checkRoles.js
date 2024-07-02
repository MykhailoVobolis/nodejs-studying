import createHttpError from 'http-errors';

import { StudentsCollection } from '../db/models/student.js';
import { ROLES } from '../constants/index.js';

// Middleware для перевірки ролей
// Виконує перевірку ролей користувача для авторизації доступу до певних ресурсів або дій
// Функція checkRoles приймає необмежену кількість ролей як аргументи і повертає асинхронну функцію-обробник запиту.
// Прийняті ролі передаються в масив roles
export const checkRoles =
  (...roles) =>
  // Перевірка наявності користувача:
  // Обробник запиту приймає об'єкти запиту (req), відповіді (res) і наступної функції (next)
  async (req, res, next) => {
    // Витягується об'єкт користувача з запиту (req.user).
    const { user } = req;
    // Якщо користувач відсутній, викликається помилка з кодом 401 і передається до наступної функції.
    if (!user) {
      next(createHttpError(401));
      return;
    }

    // Перевірка ролі користувача:
    // Витягується роль користувача з об'єкта користувача (user.role)
    const { role } = user;
    // Якщо роль користувача відповідає одній з переданих ролей, доступ дозволяється, і викликається наступна функція (next)
    // Зокрема, якщо роль користувача TEACHER і вона є в масиві ролей, доступ дозволяється
    if (roles.includes(ROLES.TEACHER) && role === ROLES.TEACHER) {
      next();
      return;
    }

    // Перевірка ролі батька (PARENT)
    // Якщо роль користувача PARENT і вона є в масиві ролей, перевіряється наявність studentId у параметрах запиту (req.params).
    if (roles.includes(ROLES.PARENT) && role === ROLES.PARENT) {
      const { studentId } = req.params;
      // Якщо studentId відсутній, викликається помилка з кодом 403 і передається до наступної функції.
      if (!studentId) {
        next(createHttpError(403));
        return;
      }

      // Якщо studentId присутній, функція шукає студента в колекції StudentsCollection, перевіряючи, чи відповідає ідентифікатор студента та ідентифікатор батька (користувача).
      const student = await StudentsCollection.findOne({
        _id: studentId,
        parentId: user._id,
      });

      // Якщо студент знайдений, доступ дозволяється, і викликається наступна функція.
      if (student) {
        next();
        return;
      }
    }
    // Заборона доступу:
    // Якщо жодна з перевірок не пройдена, викликається помилка з кодом 403 і передається до наступної функції
    next(createHttpError(403));
  };
