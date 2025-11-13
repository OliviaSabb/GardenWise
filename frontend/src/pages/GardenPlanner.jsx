import React, {useState, useEffect, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import "./GardenPlanner.css"
import GardenPlannerGridFlexbox from "../components/GardenPlannerGridFlexbox.jsx";
import GridInfoPanel from "../components/GridInfoPanel.jsx"
import { fetchWithAuth } from "../utils/fetchWithAuth";
import jwt_decode from "jwt-decode"; // This should work with latest versions
import PLANT_INFO from "../data/plants.json";
import MOCK_GARDEN from "../data/plants.json";
import PLANT_CATEGORIES from "../data/plants_categories.json";


function GardenPlanner(){
    //const navigate = useNavigate();
    // Trying to verify the user is logged in to access garden planner page
    // const userLoggedIn = localStorage.getItem("access_token");
    // if(!userLoggedIn) {
    //     return (
    //         <main className="gp-planner">
    //             <p>You must be logged in to view this page!</p>
    //         </main>
    //     )
    //     // or can render some sort of info page here instead with register login buttons
    // }

    

    // hooks
    
    // garden save and load
    const [gardenName, setGardenName] = useState("");
    const [gardens, setGardens] = useState([]);
    const [selectedGarden, setSelectedGarden] = useState("");

    // modes for planting or inspecting plants
    const [mode, setMode] = useState("plant");
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedPlantId, setSelectedPlantId] = useState(null);
    const [placement, setPlacement] = useState({});
     // plant list choice, start with veggies
    const [category, setCategory] = useState("Vegetable");

    const getPlantImage = (id) => {
        if (!id) return null;
        return `/plant-icons-test/${id}.svg`;
    };

    // handles how many rows/columns and cell size
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(8);
    const [cell, setCell] = useState(64);
    const [gardenData, setGardenData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // date/time inputs for planting and watering
    const [datePlanted, setDatePlanted] = useState("");
    const [timePlanted, setTimePlanted] = useState("");
    const [dateWatered, setDateWatered] = useState("");
    const [timeWatered, setTimeWatered] = useState("");

    // helper: combine date and time to ISO format
    const toISOStringLocal = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    const [hour = "00", minute = "00"] = timeStr ? timeStr.split(":") : [];
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
    };



    // useEffect(() => {
    //     const fetchGardenData = async () => {
    //         const token = localStorage.getItem('access_token');

    //         console.log("Fetching gardens with token:", token);

    //         if (!token) {
    //             setError("Please log in to access your garden.");
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             const response = await fetchWithAuth("http://127.0.0.1:8000/api/gardens/");

    //             const responseData = await response.json(); // read once

    //             if (!response.ok) {
    //                 throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
    //             }

    //             setGardenData(responseData);

    //             // build placement map
    //             const placementMap = {};
    //             responseData.forEach(garden => {
    //                 garden.garden_plants?.forEach(plant => {
    //                     const plantInfo = Object.values(PLANT_INFO).find(p => p.id_numeric === plant.type_id);
    //                     placementMap[plant.position] = plantInfo ? plantInfo.name : `Plant ${plant.type_id}`;
    //                 });
    //             });
    //             setPlacement(placementMap);


    //         } catch (err) {
    //             console.error("Fetch error:", err);
    //             setError(`Failed to fetch gardens: ${err.message}`);
    //         }
    //         finally {
    //             setLoading(false); 
    //         }
    //     };

    //     fetchGardenData();
    // }, []);



    // useEffect(() => {
    //     if (!gardenData) {
    //         setPlacement({});
    //     }
    // }, [gardenData]);

    // vars
    const inspectedPlantId = selectedCell ? placement[selectedCell] : null;
    const plantInfo = inspectedPlantId ? PLANT_INFO[inspectedPlantId] : null;
    const isInspectMode = mode === "inspect";
    //const isEmptyCell = isInspectMode && (!selectedCell || !inspectedPlantId); 

    // if we have a plant, plant it

    const handleCellClick = async (r, c) => {
        const key = `${r}-${c}`;


        if (mode === "plant" && selectedPlantId) {
            if (!selectedPlantId) return;
            setPlacement(prev => ({ ...prev, [key]: selectedPlantId}));
            return;
        }

        if (mode === "inspect") {
            setSelectedCell(key);
            return;
        }
    };


    //TODO: fix commented out code. Testing functionality and visuals. Removed features like checking db, saving and 
    // verifying user login for now.

    // const handleCellClick = async (r, c) => {
    //     const key = `${r}-${c}`;

    //     if (mode === "plant") {
    //         if (!selectedPlantId) return;

    //         const token = localStorage.getItem('access_token');
    //         if (!token) {
    //             setError("You must be logged in.");
    //             return;
    //         }

    //         try {
    //             // Decode token to get user ID
    //             const decoded = jwt_decode(token);
    //             const loggedInUserId = decoded?.user_id;

    //             if (!gardenData || gardenData.length === 0) {
    //                 setError("No garden available. Create a garden first.");
    //                 return;
    //             }

    //             console.log("Garden data:", gardenData);
    //             console.log("Logged in user ID:", loggedInUserId);

    //             // Works with both numeric and object forms
    //             const userGarden = gardenData.find(g => 
    //                 Number(g.user) === Number(loggedInUserId) || 
    //                 Number(g.user?.id) === Number(loggedInUserId)
    //             );


    //             if (!userGarden) {
    //                 setError("No garden found for your account.");
    //                 console.warn("No matching garden found for user:", loggedInUserId);
    //                 return;
    //             }

    //             //Used emojis for testing so I could see erroe better
    //             const gardenId = userGarden.id;
    //             console.log("Found garden ID:", gardenId);
    //             console.log("Matched garden:", userGarden);
    //             // Use the numeric id for PlantType
    //             const plantNumericId = PLANT_INFO[selectedPlantId]?.id_numeric;
    //             if (!plantNumericId) {
    //                 setError(`Missing numeric ID for ${selectedPlantId}`);
    //                 console.error("Missing id_numeric for plant:", selectedPlantId);
    //                 return;
    //             }

    //             console.log(`Planting ${selectedPlantId} (ID ${plantNumericId}) at ${key}`);

    //             const response = await fetchWithAuth(
    //                 `http://127.0.0.1:8000/api/gardens/${gardenId}/plants/`,
    //                 {
    //                     method: 'POST',
    //                     body: JSON.stringify({
    //                         plant_type: plantNumericId,
    //                         position: key,
    //                         health: "Healthy",
    //                         time_planted: toISOStringLocal(datePlanted, timePlanted) || new Date().toISOString(),
    //                         time_watered: toISOStringLocal(dateWatered, timeWatered) || new Date().toISOString(),

    //                     }),
    //                 }
    //             );

    //             if (!response.ok) {
    //                 const errData = await response.text();
    //                 throw new Error(`HTTP ${response.status}: ${errData}`);
    //             }

    //             const savedPlant = await response.json();
    //             console.log("Successfully saved plant to backend:", savedPlant);

    //             // Update grid instantly
    //             setPlacement(prev => ({ ...prev, [key]: selectedPlantId }));

    //         } catch (error) {
    //             console.error("Save failed:", error);
    //             setError('Failed to save plant data: ' + error.message);
    //         }

    //         return;
    //     }

    //     if (mode === "inspect") {
    //         setSelectedCell(key);
    //         return;
    //     }
    // };

    // if (loading) {
    //     return <div>Loading garden data...</div>;
    // }

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }
    return (
        <main className="gp-planner">
            <div className="gp-layout">

                {/* Left panel: Plant list*/}
                <div className="gp-panel gp-panel-left">
                    <div className="gp-tablist" role="tablist">
                        {Object.keys(PLANT_CATEGORIES).map((cat) => (
                            <button 
                                key={cat}
                                className={`gp-tab ${category === cat ? "active" : ""}`}
                                role="tab"
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* tab lists */}
                    <ul className="gp-plant-list" role="tabpanel">
                        {(PLANT_CATEGORIES[category] || []).map((plantId) => {
                            const info = PLANT_INFO[plantId];
                            if (!info) return null;
                            const plantSvg = getPlantImage(plantId);
                            return (
                                <li
                                    key={plantId}
                                    className={`gp-plant-item ${selectedPlantId === plantId ? "selected" : ""}`}
                                    onClick={() => {
                                        console.log("Selected: ", plantId);
                                        setSelectedPlantId(plantId);
                                    }}
                                >
                                    <div className="gp-plant-list-tile">
                                        <img
                                            src={plantSvg}
                                            className="gp-plant-thumbnail"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = null; //potential filler if an image fails to load
                                            }}
                                        />
                                        <div className="gp-plant-name">{info.name}</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Middle panel: Garden grid planner*/}
                <div className="gp-panel gp-panel-center">
                    <div className="gp-grid-toolbar">
                        <div className="gp-tools">
                            <button
                                type="button"
                                className={mode === "plant" ? "active" : ""}
                                onClick={() => setMode("plant")}
                            >
                                Plant Mode
                            </button>
                            <button
                                type="button"
                                className={mode === "inspect" ? "active" : ""}
                                onClick={() => setMode("inspect")}
                            >
                                Inspect Mode
                            </button>
                            
                            <div>
                                <label htmlFor="rows">Length: </label>
                                <input
                                    id="rows"
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="10"
                                    value={rows}
                                    onChange={(e) => setRows(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="cols">Width: </label>
                                <input
                                    id="cols"
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="8"
                                    value={cols}
                                    onChange={(e) => setCols(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="gp-garden-actions">
                            <div className="gp-save-garden">
                                <label htmlFor="garden-name">Garden Name</label>
                                <input
                                    id="garden-name"
                                    type="text"
                                    placeholder="My Garden"
                                    value={gardenName}
                                    onChange={(e) => setGardenName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        // TODO: wire save garden to db
                                        console.log("Saved garden with name:", gardenName);
                                    }}
                                >
                                    Save Garden
                                </button>
                            </div>
                            <div className="gp-load-garden">
                                <label htmlFor="garden-select">Load Garden</label>
                                <select
                                    id="garden-select"
                                    value={selectedGarden}
                                    onChange={(e) => setSelectedGarden(e.target.value)}
                                >
                                    <option value="">Select a garden...</option>
                                    {gardens.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // TODO: wire save garden to db
                                        console.log("Load garden clicked for id:", selectedGarden);
                                    }}
                                >
                                    Load Garden
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="gp-grid-title">Garden Planner Grid</div>
                        <GardenPlannerGridFlexbox
                            rows={rows}
                            cols={cols}
                            cell={cell}
                            placement={placement}
                            onCellClick={handleCellClick}
                            getPlantName={(id) => PLANT_INFO[id]?.name ?? id}
                            getPlantImage={getPlantImage}
                        />
                    </div>
                
                    {/* Right panel: Plant information*/}
                    <div className="gp-panel gp-panel-right">
                        <GridInfoPanel
                            plantInfo={plantInfo}
                            isEmptyCell={isInspectMode && !selectedPlantId}
                            isInspectMode={mode === "inspect"}
                        />
                    </div>
            </div>
        </main>
    )
}

export default GardenPlanner;