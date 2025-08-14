export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.inner.map(e => ({
        path: e.path,
        message: e.message,
      })),
    });
  }
};
