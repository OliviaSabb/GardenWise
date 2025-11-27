function handleAuthFailure() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}


export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  if (!access) {
    console.error("No access token available. Aborting request.");
    handleAuthFailure();
    return new Response(JSON.stringify({ detail: "No access token" }), { status: 401 });
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${access}`,
  };

  console.log("Making request to:", url);
  console.log("Request headers:", headers);

  let response = await fetch(url, { ...options, headers });

  // If unauthorized, try refreshing
  if (response.status === 401) {
    console.warn("Access token expired or invalid, attempting refresh...");

    if (!refresh) {
      console.warn("No refresh token available. Forcing logout.");
      handleAuthFailure();
      return response;
    }

    try {
      const refreshResponse = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      
      if(!refreshResponse.ok) {
        const refreshError = await refreshResponse.json().catch(() => ({}));
        console.error("Token refresh failed:", refreshError);
        handleAuthFailure();
        return response;
      }


      const data = await refreshResponse.json();
      console.log("Refresh response:", data);

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        access = data.access;

        const retryHeaders = { ...headers, Authorization: `Bearer ${access}` };
        console.log("Retrying request with new access token...");
        response = await fetch(url, { ...options, headers: retryHeaders });
      } else {
        console.error("Token refresh failed:", data);
        handleAuthFailure();
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  }

  console.log("Response status:", response.status);
  return response;
}

