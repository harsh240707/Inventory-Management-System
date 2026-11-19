
module.exports = (err, req, res, next) => {
  console.error(err.message);

  let status = 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
  }

  if (err.code === 11000) {
    status = 400;
    message = "SKU already exists";
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  }

  res.status(status).json({
    success: false,
    message
  });
};
