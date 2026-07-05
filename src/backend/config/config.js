import dotenv from "dotenv";

dotenv.config();

const config = {
  name: process.env.NAME || "",
  port: process.env.PORT || 8000,
  version: process.env.VERSION || "",
  jwtSecret: process.env.JWT_SECRET || "",
  feature: {
    admin: {
      enabled: parseInt(process.env.FEATURE_ADMIN_ENABLED) || false,
    },
  },
  mongodbUrl:process.env.MONGODB_URI || "",
};

export default config;