// Mongoose хук для повернення правильного статусу помилки 400 замість 500 при додаванні("save") об'єкта що не відповідає схемі валідації
export const mongooseSaveError = (error, data, next) => {
  const { name, code } = error;
  error.status = name === 'MongoServerError' && code === 11000 ? 409 : 400;
  next();
};

// Mongoose хук для додавання налаштувань(параметрів) валідації перед ("pre") оновленням об'екта
export const setUpdateSettings = function (next) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
