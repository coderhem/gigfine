import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  try {
    const status = await mongoose.connect(config.mongodbUrl);
    console.log(`Database Connected. ${status.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectDB;
