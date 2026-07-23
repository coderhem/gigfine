import axios from "axios";

export async function addProblem({ company, problem }) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "https://gigfine-api.vercel.app/api/problem",
    {
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

export async function getAllProblem() {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "https://gigfine-api.vercel.app/api/problem/all",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getProblem() {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "https://gigfine-api.vercel.app/api/problem",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
export async function deleteProblem(id) {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getProblemById(id) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function updateProblem(id, data) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
