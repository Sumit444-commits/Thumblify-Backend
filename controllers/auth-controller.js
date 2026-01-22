import { User } from "../models/user-model.js";
// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).json({ message: "Email Already Exists" });
    } else {
      const user = await User.create({ name, email, password });
      // setting data in session 
      req.session.isLoggedIn =true
      req.session.userId = user._id
      return res
        .status(201)
        .json({
          message: "Account Created Successfully",
          user:{
            _id: user._id,
            name: user.name,
            email:user.email
          }
        });
    }
  } catch (error) {
    console.error("🔥 Error in register controller:", error);
    res.status(500).json("Internal Server Error");
  }
};

// user login 
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(400).json({message:"Invalid Credentials"});
    }

    const user = await userExists.comparePassword(password);
    if (user) {
      // setting data in session 
      req.session.isLoggedIn =true
      req.session.userId = userExists._id
      res.status(200).json({
        message: "Login Successfull",
        user:{
            _id: userExists._id,
            name: userExists.name,
            email:userExists.email
          }
      });
    } else {
      const status = 401;
      const message = "Fill the input properly";
      const extraDetails = "Invalid name or password";
      const error = {
        status: status,
        message: message,
        extraDetails: extraDetails,
      };
      next(error);
    }
  } catch (error) {
    console.error("🔥 Error in login controller:", error);
    res.status(500).json("Internal Server Error");
  }
};
//  user logout
const userLogout = async (req,res)=>{
 
  req.session.destroy((error)=>{
    if(error){
      console.log(error)
      return res.status(500).json({message: error.message})
    }
  })
  return res.status(200).json({message: "Logout successfull"})
}

// verify user
const verifyUser = async (req, res) => {
  try {
    const {userId} = req.session;
    const user = await User.findById(userId).select("-password")
    if(!user){
      return res.status(400).json({message:"Invalid user"})
    } 
    return res.status(200).json({user});
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export { register, login, verifyUser, userLogout };
