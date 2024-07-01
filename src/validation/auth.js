import Joi from 'joi';

import { emailRegexp } from '../constants/users-constants.js';

// Joi схема для валідації об’єкта юзера при його створенні
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

// Joi схема для валідації об’єкта юзера при його login
export const loginUserSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});
