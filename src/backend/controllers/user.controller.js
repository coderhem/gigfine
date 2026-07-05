import userService from "../services/user.service.js"

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      message: "User created.",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
export default {createUser};