import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function ProfileSettings() {
    const [username, setUsername] = useState("");
    const [dateJoined, setDateJoined] = useState("");
    const [currentZip, setCurrentZip] = useState("");
    const [currentZone, setCurrentZone] = useState("");

    const [newZip, setNewZip] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetchWithAuth("http://127.0.0.1:8000/api/account/me/");
                const data = await res.json();

                setUsername(data.username);
                setCurrentZip(data.zipcode);
                setCurrentZone(data.zone);

                // const formatDate = new Date(data.date_joined).toLocaleDateString();
                // setDateJoined(formatDate);
            } catch (err) {
                console.error("Failed to laod profile:", err)
            }
        };

        loadProfile();
    }, []);

    const isValidZip = (zip) => /^\d{5}$/.test(zip);

    const reloadProfile = async () => {
        const res = await fetchWithAuth("http://127.0.0.1:8000/api/account/me/");
        const data = await res.json();

        setUsername(data.username);
        setCurrentZip(data.zipcode);
        setCurrentZone(data.zone);
    }

    const handleZipUpdate = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if(!isValidZip(newZip)) {
            SetErrorMsg("Please enter a valid 5-digit zip code.");
            return;
        }

        try {
            setLoading(true);

            await fetchWithAuth("http://127.0.0.1:8000/api/account/update-zip/", {
                method: "PATCH",
                body: JSON.stringify({ zipcode: newZip})
            });

            await reloadProfile();
             
            setNewZip("");
            setSuccessMsg("Zipcode updated");

        } catch (err) {
            console.err("Zipcode update failed:", err);
            setErrorMsg("Failed to update zipcode");

        } finally {
            setLoading(false);
            //localStorage.clear();
        }
    };

    return (
        <main className="profile-page">
            <div>
                <h2>Profile Settings</h2>
                <div>
                    <span>Username: </span>
                    <strong>{username}</strong>
                </div>

                {/* <div>
                    <span>Account Created: </span>
                    <strong>{dateJoined}</strong>
                </div> */}

                <div>
                    <span>Zipcode: </span>
                    <strong>{currentZip}</strong>
                </div>

                <div>
                    <span>Zone: </span>
                    <strong>{currentZone}</strong>
                </div>

                <form onSubmit={handleZipUpdate}>
                    <label>Update zipcode: </label>
                    <input
                        type="text"
                        maxLength="5"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        placeholder="Enter new zipcode"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Submit"}
                    </button>
                </form>

                {successMsg && <p>{successMsg}</p>}
                {errorMsg && <p>{errorMsg}</p>}
            </div>
        </main>
    )
}

export default ProfileSettings;