import express from "express";
import userRoute from "./backend/routes/user.route.js";
import authRoute from "./backend/routes/auth.route.js";
import config from "./backend/config/config.js";
import connectDB from "./backend/config/database.js";
import auth from "./backend/middlewares/auth.js";
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
