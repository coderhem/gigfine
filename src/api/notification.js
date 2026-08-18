import axios from "axios";

export async function addNotification({ notification }) {
  const response = await axios.post(
    "https://gigfine-api.vercel.app/api/notification",
    {
      notification,
    },
  );
  return response.data;
}

export async function getAllNotification() {

  const response = await axios.get(
    "https://gigfine-api.vercel.app/api/notification",
  );
  return response.data;
}


export async function deleteNotification(id) {

  const response = await axios.delete(
    `https://gigfine-api.vercel.app/api/notification/${id}`,
  );
  return response.data;
}