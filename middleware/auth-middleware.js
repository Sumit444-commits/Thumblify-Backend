const authMiddleware = async (req, res, next) => {
  try {
    const {isLoggedIn,userId}= req.session;
    if (!isLoggedIn || !userId) {
      return res
        .status(401)
        .json({ message: "You are not logged in" });
    }
  
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
