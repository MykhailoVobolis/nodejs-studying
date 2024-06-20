import { StudentsCollection } from '../db/models/student.js';

// Сервіс-функція яка отримує всіх студентів з бази данних
export const getAllStudents = async () => {
  const students = await StudentsCollection.find();
  return students;
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
      new: true,
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
