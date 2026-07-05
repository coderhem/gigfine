import User from "../models/User.js";
import bcrypt from "bcryptjs";
// import { createJWT } from "../utils/jwt.js";
import config from "../config/config.js";

const login = async (data) => {
  // console.log("Login");
  const user = await User.findOne({ phone: data.phone });

  if (!user)
    throw {
      status: 404,
      message: "User not found.",
    };

  const isPasswordMatch = bcrypt.compareSync(data.password, user.password);
  if (!isPasswordMatch) {
    throw {
      status: 400,
      message: "Incorrect email or password",
    };
  }

  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    vehicleNumber: user.vehicleNumber,
    roles: user.roles,
    createdAt: user.createdAt,
    isActive: user.isActive,
  };
};

const register = async (data) => {
  const user = await User.findOne({ phone: data.phone });
  if (user)
    throw {
      status: 409,
      message: "User already exist.",
    };
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(data.password, salt);

  const createdUser = await User.create({
    name: data.name,
    phone: data.phone,
    password: hashedPassword,
    vehicleNumber: data.vehicleNumber,
  });
  return {
    _id: createdUser._id,
    name: createdUser.name,
    phone: createdUser.phone,
    vehicleNumber: createdUser.vehicleNumber,
    roles: createdUser.roles,
    createdAt: createdUser.createdAt,
    isActive: createdUser.isActive,
  };
};

export default { register, login };
