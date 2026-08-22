import axios from "axios";

export async function registerUser({
  name,
  phone,
  email,
  vehicleNumber,
  password,
  roles,
}) {
  const response = await axios.post(
    "https://api.gigfine.com/api/auth/register",
    {
      name,
      email,
      phone,
      vehicleNumber,
      password,
      roles,
    },
  );
  return response.data;
}

export async function loginUser({ phone, password, email }) {
  const response = await axios.post(
    "https://api.gigfine.com/api/auth/login",
    {
      phone,
      password,
      email,
    },
  );
  localStorage.setItem("token", response.data.token);
  return response.data;
}

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

export async function getAllUser(page, limit=10) {
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
