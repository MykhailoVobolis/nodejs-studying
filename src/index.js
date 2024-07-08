import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';
import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';

const bootstrap = async () => {
  await initMongoDB();
  // Використання утіліти яка перевіряє, чи існує директорія для збереженя завантажених файлів за вказаним шляхом (url)
  await createDirIfNotExists(TEMP_UPLOAD_DIR);
  await createDirIfNotExists(UPLOAD_DIR);
  startServer();
};

void bootstrap();

// void bootstrap() - це виклик функції, при якому явно ігнорується значення функції, що повертається. Використовується рідко й у специфічних випадках, коли потрібно виконати функцію, не переймаючись її результатом.
