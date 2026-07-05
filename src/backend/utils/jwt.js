import jwt from "jsonwebtoken";
import config from "../config/config.js";

const createJWT = (data) => {
  const token = jwt.sign(data, config.jwtSecret, {
    expiresIn: "30d"
  });
  return token;
};

const verifyJWT = async (token)=>{
  return await new Promise((resolve, reject)=>{
    jwt.verify(token, config.jwtSecret, (error, data)=>{
    if(error)return reject.error;
    resolve(data);
  })
})
}

export { createJWT, verifyJWT};
