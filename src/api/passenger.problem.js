import axios from "axios";

export async function addPassengerProblem({
  driverName,
  vehicleNumber,
  company,
  problem,
}) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "https://gigfine-api.vercel.app/api/passenger/problems/add",
    {
      driverName,
      vehicleNumber,
      company,
      problem,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getAllPassengerProblem() {
  const response = await axios.get(
    "https://gigfine-api.vercel.app/api/passenger/problems/all",
  );
  return response.data;
}

// export async function getPassengerProblemById(id) {
//   const token = localStorage.getItem("token");

//   const response = await axios.get(
//     `https://gigfine-api.vercel.app/api/passenger/problems/${id}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );
//   return response.data;
// }

export async function deleteProblem(id) {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `https://gigfine-api.vercel.app/api/passenger/problems/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getPassengerProblemById(id) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `https://gigfine-api.vercel.app/api/passenger/problems/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function updatePassengerProblem(id, data) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `https://gigfine-api.vercel.app/api/passenger/problems/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
