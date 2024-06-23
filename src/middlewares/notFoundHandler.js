// Middleware для обробки випадку, коли клієнт звертається до неіснуючого маршруту

export const notFoundHandler = (_req, res, _next) => {
  res.status(404).json({
    message: 'Route not found',
  });
};
