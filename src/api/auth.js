import axios from 'axios';

export async function registerUser({ name, phone, vechileNumber, password, role }) {
  const response = await axios.post("http://localhost:8000/backend/auth/register", {
    name,
    phone,
    vechileNumber,
    password,
    role
  });
  return response.data;
}
