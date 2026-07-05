import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Number is required."],
    maxlength: [10, "Max 10 digit."],
    minlength: [6, "Min 6 digit"],
    unique: true,
    validate: {
      validator: (value) => {
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
        return phoneRegex.test(value);
      },
      message: "Invalid phone number format.",
    },
  },
  vehicleNumber: {
    type: String,
    required: [true, "Vehicle number is required."],
    unique: true,
    maxlength: [22, "Invalid number plate."],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    validate: {
      validator: (value) => {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        return passwordRegex.test(value);
      },
      message: "Password must be 1 Capital, 1 Number and 1 Special character.",
    },
  },
  roles: {
    type: [String],
    default: ["Passenger"],
    enum: ["Passenger", "Rider", "Admin"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  profileImageUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
