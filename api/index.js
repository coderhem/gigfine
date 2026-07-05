import express from "express";
import userRoute from "../src/routes/user.route.js";
import authRoute from "../src/routes/auth.route.js";
import config from "../src/config/config.js";
import connectDB from "../src/config/database.js";
import auth from "../src/middlewares/auth.js";
import cors from "cors";

const app = express();
app.use(cors()); 
// Middlewares
app.use(express.json());

connectDB();

app.use("/backend/users", auth, userRoute);
app.use("/backend/auth", authRoute);

app.listen(config.port, () => {
  console.log(`Server is running at port... ${config.port}`);
});
