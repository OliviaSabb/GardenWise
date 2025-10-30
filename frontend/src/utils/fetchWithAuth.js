// src/utils/fetchWithAuth.js


export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  // include Authorization header if we have a token
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };

  // first attempt
  let response = await fetch(url, { ...options, headers });

  // if token expired or unauthorized, try refreshing
  if (response.status === 401 && refresh) {
    try {
      const refreshResponse = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const data = await refreshResponse.json();

      if (data.access) {
        // store the new access token
        localStorage.setItem("access_token", data.access);
        access = data.access;

        // retry the original request with new token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${access}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      } else {
        console.warn("Token refresh failed:", data);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  }

  return response;
}
