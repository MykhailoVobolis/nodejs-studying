// Утиліта, яка перевірятє, чи існує директорія для збереження завантажених файлів за вказаним шляхом (url). Якщо директорія не існує, то функція створить її
import fs from 'node:fs/promises';

export const createDirIfNotExists = async (url) => {
  try {
    await fs.access(url);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(url);
    }
  }
};
