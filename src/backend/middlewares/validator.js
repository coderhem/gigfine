import z from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      res.status(400).json(JSON.parse(error.message));
      error.issues;
    }
    next(error)
  }
};

export default validate;