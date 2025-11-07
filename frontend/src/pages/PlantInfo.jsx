import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import "./PlantInfo.css"

function PlantInfo(){
    const navigate = useNavigate();

    const [plantData, setPlantData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // User verification, do we want users to be logged in to view plant info? 
    const userLoggedIn = localStorage.getItem("access_token");
    if(!userLoggedIn) {
        return (
            <main className="PlantInfo">
                <p>You must be logged in to view this page!</p>
            </main>
        
        )
    }

    const handleButtonClick = (item) => {
        navigate(`/plant-info/${item.id}`);
    };

   useEffect(() => {
        const fetchPlantData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError("Please log in to access your garden.");
                return;
            }

            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/planttype/plants");

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
                }

                const data = await response.json();
                setPlantData(data);


            } catch (err) {
                setError("Failed to fetch plants. Please check your connection.");
            } finally {
            setLoading(false);
            }
       };
   
       fetchPlantData();
    }, []);

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <main className="PlantInfo">
        
        <div className = "plantLeftColumn">
        <h1 className = "plantInfoTitle">Plant Information</h1>

        <ul>
          {plantData.map((item, index) => (
            <button key={index} onClick={() => handleButtonClick(item)}>
                {item.common_name}
            </button>
          ))}
        </ul>
        
        </div>

        <div className="PlantDesc">
            <p>Please Click on a Plant!</p>
        </div>

        </main>
    );
}

export default PlantInfo;