import axios from "axios";
import { API_BASE_URL } from "./config.js";

// Sending vehicleNumber + licenseNumber makes the backend register the user
// as a rider and create the rider profile in the same transaction.
export async function registerUser({
  name,
  phone,
  email,
  vehicleNumber,
  licenseNumber,
  password,
}) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
    name,
    email,
    mobile: phone,
    vehicleNumber,
    licenseNumber,
    password,
  });
  return response.data; // { token, user }
}

// username can be email or mobile number
export async function loginUser({ phone, password }) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    username: phone,
    password,
  });
  localStorage.setItem("token", response.data.token);
  return response.data; // { token, user }
}

export const selectRole = async (data) => {
  const response = await axios.post(
    "https://api.gigfine.com/api/auth/select-role",
    data,
  );

  return response.data;
};

export async function forgotPassword({ email }) {
  const response = await axios.post(
    "https://api.gigfine.com/api/auth/forgot-password",
    {
      email,
    },
  );
  return response.data;
}

export async function resetPassword({ userId, token, password }) {
  const response = await axios.post(
    `https://api.gigfine.com/api/auth/reset-password?userId=${userId}&token=${token}`,
    {
      password,
    },
  );
  return response.data;
}

export async function getAllUser(page, limit = 10) {
  const response = await axios.get(
    `https://api.gigfine.com/api/auth/users?page=${page}&limit=${limit}`,
  );
  return response.data;
}

export async function getUserById(id) {
  const response = await axios.get(
    `https://api.gigfine.com/api/auth/users/${id}`,
  );
  localStorage.setItem("token", response.data.token);

  return response.data;
}

export async function updateUser(id, data) {
  const response = await axios.put(
    `https://api.gigfine.com/api/users/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return response.data;
}

export async function deleteUser(id) {
  const response = await axios.delete(
    `https://api.gigfine.com/api/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return response.data;
}
