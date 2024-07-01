import Joi from 'joi';

// Joi схема для валідації об’єкта юзера при його створенні
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Joi схема для валідації об’єкта юзера при його login
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
