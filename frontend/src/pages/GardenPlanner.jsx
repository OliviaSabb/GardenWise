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
    const [gardensLoading, setGardensLoading] = useState(false);
    const [gardensError, setGardensError] = useState(null);


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

    const getPlantName = (id) => {
        const plant = PLANT_INFO[id];
        return plant ? plant.common_name : "";
    };

    // handles how many rows/columns and cell size
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(8);
    const [cell, setCell] = useState(64);

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

    const cells = useMemo(() => {
        return Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return { r, c, key: `${r}-${c}` };
        });
    }, [rows, cols]);


    useEffect(() => {
        const fetchGardens = async () => {
            const token = localStorage.getItem('access_token');
            console.log("Fetching gardens with token:", token);

            try {
                setGardensLoading(true);
                setGardensError("");
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/gardens/");

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Failed ot load gardens: ${response.status} ${text}`);
                }

                const data = await response.json();
                setGardens(data);
                if(data.length > 0) {
                    setSelectedGarden(data[0].id.toString());
                }
                // build placement map
                // const placementMap = {};
                // responseData.forEach(garden => {
                //     garden.garden_plants?.forEach(plant => {
                //         const plantInfo = Object.values(PLANT_INFO).find(p => p.id_numeric === plant.type_id);
                //         placementMap[plant.position] = plantInfo ? plantInfo.name : `Plant ${plant.type_id}`;
                //     });
                // });
                // setPlacement(placementMap);


            } catch (err) {
                console.error("Error loading gardens:", err);
                setGardensError(`Could not load your gardens: ${err.message}`);
            }
            finally {
                setGardensLoading(false); 
            }
        };

        fetchGardens();
    }, []);

    const handleLoadGarden = async () => {
        if(!selectedGarden) return;
        try {
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/`);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to load plants: ${response.status} ${text}`);
            }

            const plants = await response.json();

            const nextPlacement = {};

            plants.forEach((plant) => {
                const key = plant.position;         

                const match = Object.entries(PLANT_INFO).find(
                ([plantId, info]) => {
                    const backendName = plant.type_name?.toLowerCase().trim();
                    const commonName  = info.common_name?.toLowerCase().trim();
                    const displayName = info.name?.toLowerCase().trim();

                    return backendName && (backendName === commonName || backendName === displayName);
                }
                );

                if (!match) {
                    console.warn("No PLANT_INFO match for type_id:", plant.type_id);
                    return;
                }

                const [plantId] = match;           
                nextPlacement[key] = plantId;      
            });
            setPlacement(nextPlacement);
            console.log("Loaded garden plants: ", plants);
        } catch (err) {
            console.error("Error loading garden plants:", err);
        }
    };

    const handleCreateGarden = async () => {
        const createGardenName = gardenName.trim();
        if (!createGardenName) {
            console.warn("Garden name is required");
            return;
        }

        try {
            const response = await fetchWithAuth(
            "http://127.0.0.1:8000/api/gardens/",
            {
                method: "POST",
                body: JSON.stringify({ name: createGardenName }),
            }
            );

            console.log("Save garden response status:", response.status);

            const data = await response.json().catch(() => null);
            console.log("Save garden raw response:", data);

            if (!response.ok) {
            throw new Error(
                `Failed to save garden: ${response.status} ${
                data ? JSON.stringify(data) : ""
                }`
            );
            }

            const newGarden = data;
            console.log("Saved garden:", newGarden);

            setGardens((prev) => {
            // avoid duplicates (which also fixes the key warning)
            const exists = prev.some((g) => g.id === newGarden.id);
            return exists ? prev : [...prev, newGarden];
            });

            setSelectedGarden(String(newGarden.id));
        } catch (err) {
            console.error("Error saving garden:", err);
        }
    };


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
                    
                    <div className="gp-grid-title">
                        <h3>Garden Planner Grid</h3>
                    </div>

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
                                    max="20"
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
                                    max="20"
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
                                    onClick={handleCreateGarden}
                                >
                                    Create Garden
                                </button>
                            </div>
                            <div className="gp-load-garden">
                                <label htmlFor="garden-select">Load Garden</label>
                                {gardensLoading ? (
                                    <p>Loading gardens...</p>
                                ) : gardensError ? (
                                    <p>{gardensError}</p>
                                ) : (
                                    <>
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
                                        disabled={!selectedGarden}
                                        onClick={handleLoadGarden}
                                    >
                                        Load Garden
                                    </button>
                                    </>
                                )}                                
                            </div>
                        </div>
                    </div>

                    

                    <div className="gp-grid-container">
                        <div
                            className="gp-grid" 
                            style={{
                                // for dynaic changing grid
                                "--cols": cols,
                                "--rows": rows,
                                "--cellSize": `${cell}px` //maybe allow cell size changes
                            }}
                        >
                            {/*cells will be here */}
                            {cells.map(({r, c, key}) => {
                                const id = placement[key];
                                const label = id ? getPlantName?.(id) : "";
                                const imgSrc = id ? getPlantImage(id) : null;
                                return (
                                    <div 
                                        key={key} 
                                        className="gp-cell" 
                                        data-row={r} 
                                        data-col={c}
                                        onClick={() => handleCellClick(r, c)}
                                    >
                                        {imgSrc && (
                                            <img 
                                                src={imgSrc}
                                                className="gp-plant-icon"
                                                draggable="false"
                                            />
                                        )}
                                        {/* {label} */}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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