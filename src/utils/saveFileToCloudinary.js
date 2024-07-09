import cloudinary from 'cloudinary';

import { env } from './env.js';
import { CLOUDINARY } from '../constants/index.js';

// Утиліта яка буде отримувати файл, передавати його до cloudinary і повертати посилання на цей файл у cloudinary

// Цей код налаштовує з'єднання з Cloudinary, використовуючи параметри конфігурації, такі як ім'я хмари, API-ключ та API-секрет, які зчитуються із змінних середовища.
cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUDINARY.CLOUD_NAME),
  api_key: env(CLOUDINARY.API_KEY),
  api_secret: env(CLOUDINARY.API_SECRET),
});

// Потім створюється асинхронна функція для збереження файлів. Ця функція приймає файл, завантажує його на сервер Cloudinary і повертає безпечну URL-адресу завантаженого файлу.
export const saveFileToCloudinary = async (file) => {
  const response = await cloudinary.v2.uploader.upload(file.path);
  return response.secure_url;
};
