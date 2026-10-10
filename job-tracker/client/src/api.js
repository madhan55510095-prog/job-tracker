const TOKEN_KEY = "jt_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      window.location.href = "/login";
    }
    const detail = data.details?.map((d) => d.message).join(", ");
    throw new Error(detail || data.error || "Request failed");
  }
  return data;
}

export const api = {
  register: (email, password) => request("/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  listApplications: () => request("/applications"),
  createApplication: (body) => request("/applications", { method: "POST", body }),
  changeStage: (id, stage) => request(`/applications/${id}/stage`, { method: "PATCH", body: { stage } }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: "DELETE" }),
};
