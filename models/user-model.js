import mongoose from "mongoose";
import bcrypt, { hash } from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim:true
    },
    email: {
      type: String,
      required: true,
       trim:true,
       unique:true,
       lowercase:true
    },
    password: {
      type: String,
      required: true,
      
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  try {
    if (!user.isModified("password")) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(user.password, salt);
    user.password = hashPass;
  } catch (error) {
    console.log("error failed to hash the password");
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.log("error failed to compare hash password");
  }
};


export const User = new mongoose.model("User", userSchema);
