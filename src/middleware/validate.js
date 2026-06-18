const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map((error) => {
        return {
          field: error.path[0],
          message: error.message,
        };
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    return next(err);
  }
  next();
};

module.exports = validate;
