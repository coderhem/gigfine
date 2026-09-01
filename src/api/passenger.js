import axios from "axios";

export async function registerPassenger({
  name,
  phone,
  email,
  password,
  roles,
}) {
  const response = await axios.post("https://api.gigfine.com/api/auth/passenger/register", {
    name,
    email,
    phone,
    password,
    roles,
  });
  return response.data;
}

export async function loginPassenger({ phone, password, email }) {
  const response = await axios.post(
    "https://api.gigfine.com/api/auth/passenger/login",
    {
      phone,
      password,
      email,
    },
  );
  localStorage.setItem("token", response.data.token);
  return response.data;
}

export const getAllPassenger = async () => {
  try {
    const response = await axios.get(
      "https://gigfine-api.vercel.app/api/passenger",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPassengerById = async (id) => {
  try {
    const response = await axios.get(
      `https://gigfine-api.vercel.app/api/passenger/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePassenger = async (id) => {
  try {
    const response = await axios.delete(
      `https://gigfine-api.vercel.app/api/passenger/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export async function updatePassenger(id, data) {
  const response = await axios.put(
    `https://api.gigfine.com/api/passenger/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return response.data;
}
