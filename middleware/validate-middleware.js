const validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    const status = 422;
    const message = "Fill the input properly";
    const extraDetails = JSON.parse(err.message)[0].message;

    const error = {
      status,
      message,
      extraDetails,
    };
    next(error);
  }
};
export default validate;
