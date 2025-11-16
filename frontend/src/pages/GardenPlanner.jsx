import React, {useState, useEffect, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import "./GardenPlanner.css"
import { fetchWithAuth } from "../utils/fetchWithAuth";
import jwt_decode from "jwt-decode"; // This should work with latest versions
import PLANT_INFO from "../data/plants_test_save_load.json";


function GardenPlanner(){

    //TODO: bring back key validation when loading the page, navigate from the page if key times out
    
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
    
    // load plant types
    const [plantTypes, setPlantTypes] = useState([]);

    // garden save and load
    const [gardenName, setGardenName] = useState("");
    const [gardens, setGardens] = useState([]);
    const [selectedGarden, setSelectedGarden] = useState("");
    const [gardensLoading, setGardensLoading] = useState(false);
    const [gardensError, setGardensError] = useState(null);
    const [selectedGardenName, setSelectedGardenName] = useState("");
    // TODO: add error check for save
    const [saveError, setSaveError] = useState(null);

    const [gardenPlantsByPosition, setGardenPlantsByPosition] = useState({});
    const [selectedGardenPlant, setSelectedGardenPlant] = useState(null);

    // modes for planting or inspecting plants
    const [mode, setMode] = useState("plant");
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedPlantId, setSelectedPlantId] = useState(null);
    const [placement, setPlacement] = useState({});


    // plant list choice, start with veggies. make sure lower case since backend category is saved in lower case. 
    const [category, setCategory] = useState("vegetable");

    const getPlantImage = (id) => {
        if (!id) return null;
        return `/plant-icons-test/${id}.svg`;
    };

    const getPlantTypeById = (id) => {
        if (!id) return null;
        return plantTypes.find((p) => p.id === id) || null;
    };

    const getPlantImageByType = (plantType) => {
        if (!plantType) return null;
        const plantName = plantType.common_name.toLowerCase();
        return `plant-icons-test/${plantName}.svg`;
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

    // load plant types
    useEffect(() => {
        async function loadPlantTypes() {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/planttype/plants");
                const data = await response.json();
                setPlantTypes(data);
            } catch (err) {
                console.error("Error loading plant types:", err);
            }
        }
        loadPlantTypes();
    }, []);

    // group plants by category
    const plantsByCategory = useMemo(() => {
        return plantTypes.reduce((acc, plant) => {
            if(!acc[plant.category]) acc[plant.category] = [];
            acc[plant.category].push(plant);
            return acc;
        }, {});
    }, [plantTypes]);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // get created gardens for my load gardens list
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
                    setSelectedGardenName(data[0].name);
                }
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

    // load an already created garden, uses the button load garden
    const handleLoadGarden = async () => {
        if(!selectedGarden) return;

        try {
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/`);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to load plants: ${response.status} ${text}`);
            }

            const plants = await response.json();

            // building two maps to track plants
            const nextPlacement = {}; // keys to plant type id
            const nextPlantsByPosition = {}; // keys to garden plant object

            plants.forEach((plant) => {
                const key = plant.position;   
                const plantTypeId = plant.type_id;

                if (!plantTypeId) {
                    console.warn("GardenPlant missing plant_type:", plant);
                    return;
                }
                nextPlacement[key] = plantTypeId;

                nextPlantsByPosition[key] = plant;     
            });
            setPlacement(nextPlacement);
            setGardenPlantsByPosition(nextPlantsByPosition);

            setSelectedCell(null);
            setSelectedGardenPlant(null);
            console.log("Loaded garden plants: ", selectedGarden);
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

            // reset vars incase a different garden was laoded before creating a new garden to start with a blank grid
            setPlacement({});
            setGardenPlantsByPosition({});
            setSelectedCell(null);
            setSelectedGardenPlant(null);
        } catch (err) {
            console.error("Error saving garden:", err);
        }
    };


    // vars
    const inspectedPlantId = selectedCell ? placement[selectedCell] : null;
    const plantInfo = inspectedPlantId ? PLANT_INFO[inspectedPlantId] : null;
    const isInspectMode = mode === "inspect";
    const isEmptyCell = isInspectMode && (!selectedCell || !inspectedPlantId); 

    // TODO: replace PLANT_INFO with db plant types
    
    // handles planting and inspecting. saves when a new plant is planted

    const handleCellClick = async (r, c) => {
        const key = `${r}-${c}`;

        // TODO: add token checks if needed here later
        if (mode === "plant") {
            if (!selectedPlantId) {
                console.warn("No plant selected to plant");
                return;
            }

            if(!selectedGarden) {
                console.warn("No garden selcted. Create or select a garden first.");
                return;
            }

            setSaveError(null);

            try {
                const plantTypeId = selectedPlantId;

                if (!plantTypeId) {
                    throw new Error(`Missing id for plant ${plantTypeId}`);
                }

                // build timestamps
                const nowIso = new Date().toISOString();
                const plantedIso = toISOStringLocal(datePlanted, timePlanted) || nowIso;
                const wateredIso = toISOStringLocal(dateWatered, timeWatered) || nowIso;
                
                const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            plant_type_id: plantTypeId,
                            position: key,
                            health: "Healthy",
                            notes: "No notes yet",
                            time_planted: plantedIso,
                            time_watered: wateredIso,
                        })
                    }
                );

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errText}`);
                }

                const savedPlant = await response.json();
                console.log("Successfully saved plant to backend:", savedPlant);

                setPlacement((prev) => ({...prev, [key]: plantTypeId}));
                setGardenPlantsByPosition((prev) => ({...prev, [key]: savedPlant}));
            } catch (error) {
                console.error("Failed to save plant:", error);
                setSaveError(error.message);
            }

            return;
        }

        if (mode === "inspect") {
            setSelectedCell(key);

            const gp = gardenPlantsByPosition[key] || null;
            setSelectedGardenPlant(gp);
            return;
        }
    };

    return (
        <main className="gp-planner">
            <div className="gp-layout">

                {/* Left panel: Plant list*/}
                <div className="gp-panel gp-panel-left">
                    <div className="gp-tablist" role="tablist">
                        {Object.keys(plantsByCategory).map((cat) => (
                            <button 
                                key={cat}
                                className={`gp-tab ${category === cat ? "active" : ""}`}
                                role="tab"
                                onClick={() => setCategory(cat)}
                            >
                                {capitalize(cat)}
                            </button>
                        ))}
                    </div>

                    {/* tab lists */}
                    <ul className="gp-plant-list" role="tabpanel">
                        {(plantsByCategory[category] || []).map((plant) => {
                            const plantSvg = getPlantImage(plant.common_name.toLowerCase());
                            return (
                                <li
                                    key={plant.id}
                                    className={`gp-plant-item ${selectedPlantId === plant.id ? "selected" : ""}`}
                                    onClick={() => {
                                        console.log("Selected: ", plant.id);
                                        setSelectedPlantId(plant.id);
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
                                        <div className="gp-plant-name">{plant.common_name}</div>
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
                        <div>Current plants in db. test with these. Garlic,	Eggplant, Cucumber, Corn, Celery,	Cauliflower, Cabbage, Brussels Sprouts,	Bell Pepper, Basil, Broccoli, Rosemary,	Lettuce, Carrot, Cucumber, Tomato, Pumpkin</div>
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
                                        onChange={(e) => {
                                            setSelectedGarden(e.target.value);
                                            const g = gardens.find(garden => garden.id.toString() === e.target.value);
                                            console.log("garden name " + g + " " + g.name);
                                            setSelectedGardenName(g ? g.name : "");
                                            console.log(selectedGardenName);
                                        }}
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
                                const plantTypeId = placement[key];
                                const plantType = getPlantTypeById(plantTypeId);
                                const imgSrc = plantType ? getPlantImageByType(plantType) : null;
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
                    <div>
                        <header>
                            <h2>
                                {plantInfo?.name ?? (isInspectMode ? "No plant selected" : "Plant details")}
                            </h2>
                            <p>
                                {isInspectMode
                                ? (isEmptyCell
                                    ? "Click a planted cell to view details."
                                    : (plantInfo ? "" : "Select a cell to view details"))
                                : "Switch to inspect mode and click a cell to view details."}
                            </p>
                        </header>

                        {!plantInfo && !selectedGardenPlant ? (
                            <div>
                                <div className="gp-skel-line" style={{ width: "60%" }} />
                                <div className="gp-skel-line" style={{ width: "40%" }} />
                                <div className="gp-skel-line" style={{ width: "75%" }} />
                                <div className="gp-skel-line" style={{ width: "55%" }} />
                            </div>
                        ) : (
                            <div>
                                <dl className="gp-details-list">
                                <div className="gp-detail-row">
                                    <dt>Plant</dt>
                                    <dd>{selectedGardenPlant.plant_type?.common_name}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Position</dt>
                                    <dd>{selectedGardenPlant.position}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Date planted</dt>
                                    <dd>{selectedGardenPlant.time_planted}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Last watered</dt>
                                    <dd>{selectedGardenPlant.time_watered}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Health</dt>
                                    <dd>{selectedGardenPlant.health}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Notes</dt>
                                    <dd>{selectedGardenPlant.notes || "No notes yet."}</dd>
                                </div>
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            
            </div>
        </main>
    )
}

export default GardenPlanner;