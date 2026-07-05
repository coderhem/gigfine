import User from "../models/User.js";

const createUser = async (data) => {
  return await User.create(data);
};

export default { createUser };
