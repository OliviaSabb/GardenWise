import { useState, useEffect } from "react";

function useAuthToken() {
    const [token, setToken] = useState(() => {
        return localStorage.getItem("access_token") || null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("access_token", token);
        } else {
            localStorage.removeItem("access_token");
        }
    }, [token]);

    const saveToken = (newToken) => setToken(newToken);
    const clearToken = () => setToken(null);
    
    return {token, saveToken, clearToken};
}

export default useAuthToken;