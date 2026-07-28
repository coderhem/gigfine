import axios from "axios";

export const adminLogin = async (data) => {
  const res = await axios.post(
    "https://gigfine-api.vercel.app/api/admin/login",
    data
  );

  return res.data;
};