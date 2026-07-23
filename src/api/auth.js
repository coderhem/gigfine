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
    "https://gigfine-api.vercel.app/api/auth/register",
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
    "https://gigfine-api.vercel.app/api/auth/login",
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
    "https://gigfine-api.vercel.app/api/auth/forgot-password",
    {
      email,
    },
  );
  return response.data;
}

export async function resetPassword({ userId, token, password }) {
  const response = await axios.post(
    `https://gigfine-api.vercel.app/api/auth/reset-password?userId=${userId}&token=${token}`,
    {
      password,
    },
  );
  return response.data;
}

export async function getAllUser() {
  const response = await axios.get(
    "https://gigfine-api.vercel.app/api/auth/users",
  );
  return response.data;
}

export async function getUserById(id) {
  const response = await axios.get(
    `https://gigfine-api.vercel.app/api/auth/users/${id}`,
  );
  localStorage.setItem("token", response.data.token);

  return response.data;
}

export async function updateUser(id, data) {
  const response = await axios.put(
    `https://gigfine-api.vercel.app/api/users/${id}`,
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
    `https://gigfine-api.vercel.app/api/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return response.data;
}
