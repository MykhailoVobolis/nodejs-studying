import { SORT_ORDER } from '../constants/index.js';
import { StudentsCollection } from '../db/models/student.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

// Сервіс-функція яка отримує всіх студентів з бази данних без пагінації

// export const getAllStudents = async () => {
//   const students = await StudentsCollection.find();
//   return students;
// };

// Сервіс-функція яка отримує всіх студентів з бази данних з пагинацією
export const getAllStudents = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const studentsQuery = StudentsCollection.find();

  // Частина коду, яка відповідає за фільтрацію в функції getAllStudents, дозволяє здійснювати вибірку студентів за певними критеріями, що передаються через об'єкт filter. Ця фільтрація реалізована через методи where, equals, lte (less than or equal to), та gte (greater than or equal to), які є частиною запитів до бази даних MongoDB через Mongoose.

  // Фільтрація за статтю
  if (filter.gender) {
    studentsQuery.where('gender').equals(filter.gender);
  }
  // Фільтрація за віком
  if (filter.maxAge) {
    studentsQuery.where('age').lte(filter.maxAge);
  }
  if (filter.minAge) {
    studentsQuery.where('age').gte(filter.minAge);
  }
  // Фільтрація за середньою оцінкою
  if (filter.maxAvgMark) {
    studentsQuery.where('avgMark').lte(filter.maxAvgMark);
  }
  if (filter.minAvgMark) {
    studentsQuery.where('avgMark').gte(filter.minAvgMark);
  }

  // !!! Можемо трохи покращити швидкодію нашого додатка за допомогою Promise.all():

  /* Замість цього коду */

  // const studentsCount = await StudentsCollection.find()
  //   .merge(studentsQuery)
  //   .countDocuments();

  // const totalItems = await StudentsCollection.countDocuments();

  // const students = await studentsQuery
  //   .skip(skip)
  //   .limit(limit)
  //   .sort({ [sortBy]: sortOrder })
  //   .exec();

  /* Ми можемо написати такий код */
  const [studentsCount, totalItems, students] = await Promise.all([
    StudentsCollection.find().merge(studentsQuery).countDocuments(),

    StudentsCollection.countDocuments(),

    studentsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(studentsCount, perPage, page);

  return {
    data: students,
    totalItems,
    ...paginationData,
  };
};

// Сервіс-функція яка отримує одного студента з бази данних за його ID
export const getStudentById = async (studentId) => {
  const student = await StudentsCollection.findById(studentId);
  return student;
};

// Сервіс-функція яка записує отримані дані нового студента (payload) у базу даних.
export const createStudent = async (payload) => {
  const student = await StudentsCollection.create(payload);
  return student;
};

// Сервіс-функція яка видаляє одного студента з бази данних за його ID
export const deleteStudent = async (studentId) => {
  const student = await StudentsCollection.findOneAndDelete({
    _id: studentId,
  });

  return student;
};

// Сервіс-функція яка оновлює дані одного студента з бази данних за його ID
export const updateStudent = async (studentId, payload, options = {}) => {
  const rawResult = await StudentsCollection.findOneAndUpdate(
    { _id: studentId },
    payload,
    {
      // Якщо використовуєть Mongoose хук setUpdateSettings наступні рядки можна видалити

      // new: true,
      // runValidators: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  // Якщо об'єкт з відповідним ID не знайдено
  if (!rawResult || !rawResult.value) return null;

  return {
    student: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
