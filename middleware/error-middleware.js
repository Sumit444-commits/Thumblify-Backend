const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Backend Error";
  const extraDetails = err.extraDetails || "Error in Backend";
   
  res.status(status).json({ message, extraDetails });
};

export default errorMiddleware;