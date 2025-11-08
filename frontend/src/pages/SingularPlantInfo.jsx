import {Link, useNavigate, useParams, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import "./PlantInfo.css"

function SingularPlantInfo(){

    const { id } = useParams()

    const navigate = useNavigate();

    const location = useLocation()

    const [plantData, setPlantData] = useState(null);
    const [currentPlant, setCurrentPlant] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // User verification, do we want users to be logged in to view plant info? 
    const userLoggedIn = localStorage.getItem("access_token");
    if(!userLoggedIn) {
        return <p>You must be logged in to view this page!</p>
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

                for (let i = 0; i < data.length; i++) {
                if (data[i].id == id){
                    setCurrentPlant(data[i]);
                }
        }
                   

           } catch (err) {
               setError("Failed to fetch plants. Please check your connection.");
           } finally {
            setLoading(false);
          }
       };
       fetchPlantData();
   }, []);

    useEffect(() => {
    
       const assignSinglePlant = async () => {

        try {
            for (let i = 0; i < plantData.length; i++) {
            if (plantData[i].id == id){
                setCurrentPlant(plantData[i]);
                }
            }

          } catch (err) {
               
            }
       
       };
   
       assignSinglePlant();
   }, [location, plantData]);

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    console.log(currentPlant)

    return (
        <main className="PlantInfo">
        <div className = "plantLeftColumn">
        <h1 className = "plantInfoTitle">Plant Information</h1>

        <div className = "plantList">
            <ul>
            {plantData.map((item, index) => (
                <button key={index} onClick={() => handleButtonClick(item)}>
                    {item.common_name}
                </button>
            ))}
            </ul>
        </div>
     
        
        </div>


        <div className="PlantDesc">
            <div className = "plantText">
            <h1>{currentPlant.common_name}</h1>
            <h2>Scientific Name: {currentPlant.scientific_name}</h2>
            <h2>Growth Rate: {currentPlant.growth_rate}</h2>
            <h2>Growth Rate: {currentPlant.growth_rate}</h2>
            <h2>Ph: {currentPlant.ph}</h2>
            <h2>Temperture: {currentPlant.temperture}</h2>
            <h2>Season: {currentPlant.season}</h2>
            <h2>Zone: {currentPlant.zone}</h2>
            <h2>Spacing: {currentPlant.spacing}</h2>
            </div>
        </div>

        </main>
    );
}

export default SingularPlantInfo;