import axios from "axios";

const api = axios.create();

// Each site has its own login page (see src/proxy.ts)
function loginPath() {
  const { pathname } = window.location;
  if (pathname.startsWith("/business")) return "/business/login";
  if (pathname.startsWith("/rent")) return "/rent/login";
  if (pathname.startsWith("/admin")) return "/admin/login";
  return "/login";
}

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      // A request that left with an old token can come back after a fresh login —
      // only end the session when it was sent with the token we still hold
      const sent = String(error.config?.headers?.Authorization ?? "").replace(/^Bearer /, "");
      const current = localStorage.getItem("token");

      if (current && sent === current) {
        localStorage.removeItem("token");
        const path = loginPath();
        if (window.location.pathname !== path) window.location.href = path;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
