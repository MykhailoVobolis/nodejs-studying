// Функція обгортка для обробки можливих помилок у контролерах при відповідях з бекенду

export const ctrlWrapper = (controller) => {
  return async (req, res, next) => {
    // Використання try...catch на випадок якщо прі запиті на бекенд прийде помилка
    try {
      await controller(req, res, next);
    } catch (err) {
      // Виклик next із помилкою передасть управління до middleware, що вміє обробляти помилки
      next(err);
    }
  };
};
