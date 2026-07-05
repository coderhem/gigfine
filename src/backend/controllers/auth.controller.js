import authService from "../services/auth.service.js";
import { createJWT } from "../utils/jwt.js";

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);

    // Token Generate Start
    const token = createJWT(data);
    // Token Generate End
    res.cookie("authToken", token, { maxAge: 86400 * 1000 });

    res.json(data);
  } catch (error) {
    res.status(error.status || 400).send(error.message);
  }
};

const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);

    // Token Generate Start
    const token = createJWT(data);
    // Token Generate End

    // Set Cookie Start
    res.cookie("authToken", token, { maxAge: 86400 * 1000 });
    // Set Cookie End

    res.json(data);
  } catch (error) {
    res.status(error.status || 400).send(error.message);
  }
};

export default { login, register };
