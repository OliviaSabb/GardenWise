import React, {useState, useEffect, useMemo} from "react";
import { useNavigate, Link } from "react-router-dom";
import "./GardenPlanner.css"
import { fetchWithAuth } from "../utils/fetchWithAuth";
import jwt_decode from "jwt-decode"; // This should work with latest versions
import PLANT_INFO from "../data/plants_test_save_load.json";


function GardenPlanner(){

    //TODO: bring back key validation when loading the page, navigate from the page if key times out
    
    const navigate = useNavigate();
    // Trying to verify the user is logged in to access garden planner page
    const userLoggedIn = localStorage.getItem("access_token");
    console.log(userLoggedIn);
    if(!userLoggedIn) {
        return (
            <main className="gp-planner">
                <p>You must be logged in to view this page! <Link to="/login">Click HERE to login!!</Link></p>
            </main>
        )
        // or can render some sort of info page here instead with register login buttons
    }

    
    // hooks
    
    // get users zone
    const [rawUserZone, setRawUserZone] = useState(null);   // "10b"
    const [userZoneNumber, setUserZoneNumber] = useState(0); // actual number 10
    const [zoneLoading, setZoneLoading] = useState(true);
    const [zoneError, setZoneError] = useState(null);


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

    // notes
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesDraft, setNotesDraft] = useState("");
    const startEditingNotes = () => {
        setEditingNotes(true);
        setNotesDraft(selectedGardenPlant?.notes || "");
    }
    const cancelEditingNotes= () => {
        setEditingNotes(false);
        setNotesDraft("");
    }

    // modes for planting or inspecting plants
    const [mode, setMode] = useState("plant");
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedPlantId, setSelectedPlantId] = useState(null);
    const [selectedPlantType, setSelectedPlantType] = useState(null);
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

    const [creatingGarden, setCreatingGarden] = useState(false);

    // load the user zone from db
    useEffect(() => {
        const loadUserZone = async () => {
            setZoneLoading(true);
            const res = await fetchWithAuth("http://127.0.0.1:8000/api/account/me/");
            const data = await res.json();

            const rawZone = data.zone || data.plant_zone || null;
            setRawUserZone(rawZone);

            const numberZone = rawZone ? parseInt(rawZone, 10) : 0;
            setUserZoneNumber(numberZone);
        };

        loadUserZone();
    }, []);


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

    // filter plants by zone
    const plantsByZone = useMemo(() => {
        const baseList = plantsByCategory[category] || [];

        console.log("ZONE MEMO RUN:", {
            zoneLoading,
            userZoneNumber,
            baseCount: baseList.length
        });


        if (userZoneNumber === 0) {
            return baseList;
        }

        return baseList.filter((plant) => {
            const zoneRange = plant.zone;
            
            if(!zoneRange) return true;

            if(zoneRange === "0") return true; // we can use zone 0 for testing
            
            console.log("zone", zoneRange);

            // check zone range, ex 4-8 then split and check if user zone is in range
            if (zoneRange.includes("-")) {
                const [minStr, maxStr] = zoneRange.split("-");
                const minZone = Number(minStr);
                const maxZone = Number(maxStr);

                return userZoneNumber >= minZone && userZoneNumber <= maxZone;
            } else { // doesnt contain '-', must be single number
                return zoneRange;
            }
            
        });
    }, [plantsByCategory, category, userZoneNumber, zoneLoading]);

    useEffect(() => {
        console.log("Category Base Count:", plantsByCategory[category]?.length || 0);
        console.log("Zone filter count:", plantsByZone.length);
    }, [plantsByZone, category]);

    // capitalize the first letter of the name of plants
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

            return nextPlantsByPosition;
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

        setCreatingGarden(false);
    };

    const reformatTime = async (originalTime) => {
        let dateWateredReform = originalTime.split(' '); // Split date into day and time
        let dayMonthYear = dateWateredReform[0].split('-') // Splits date into day, month, year

        dayMonthYear = dayMonthYear[1] + '/' + dayMonthYear[2] + '/' + dayMonthYear[0];    
        let timeOfDay = dateWateredReform[1].split(':') //Splits time into hour and minute
        let hour = parseInt(timeOfDay[0])
        let aOrP = "PM";
        hour += 6; 
        if (hour > 24){
            hour -= 24;
        }
        if (hour >= 13){ 
            aOrP = "AM";
            hour -= 12;
            if (hour < 10){
                   timeOfDay[0] = "0" + hour; 
                }                
            else {
                timeOfDay[0] = hour; 
            }
        }
        else {
            timeOfDay[0] = hour; 
        }
  
        timeOfDay = timeOfDay[0] + ':' + timeOfDay[1] + " " + aOrP;

        dateWateredReform = timeOfDay + ' - ' + dayMonthYear;
        return dateWateredReform;
    }


    // vars for cells
    const inspectedPlantId = selectedCell ? placement[selectedCell] : null;
    const plantInfo = inspectedPlantId ? PLANT_INFO[inspectedPlantId] : null;
    const isInspectMode = mode === "inspect";
    const isEmptyCell = isInspectMode && (!selectedCell || !inspectedPlantId); 

    // TODO: replace PLANT_INFO with db plant types
    
    // handles planting and inspecting. saves when a new plant is planted

    const handleCellClick = async (r, c) => {
        const key = `${r}-${c}`;

        const gp = gardenPlantsByPosition[key] || null;

        // TODO: add token checks if needed here later
        if (gp == null) {
            setMode("plant");

            if (!selectedPlantId) {
                console.warn("No plant selected to plant");
                return;
            }

            if(!selectedGarden) {
                console.warn("No garden selected. Create or select a garden first.");
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

        if (gp != null) {
            setMode("inspect");
            setSelectedCell(key);
            setSelectedGardenPlant(gp);

            setDatePlanted(reformatTime(gp.time_planted));
            setDateWatered(reformatTime(gp.time_watered));

            return;
        }
    };

    // Updates selected garden plants watered time to current time
    const handleWatertimeChange = async () => {
        const nowIso = new Date().toISOString();

        const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/${selectedGardenPlant.id}/`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            time_watered: nowIso,
                        })
                    }
                );

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            const savedPlant = await response.json();
            console.log("Successfully saved plant to backend:", savedPlant);

            // Changes the ISO string so that it displays properly 
            const nowIsoCondense = nowIso.substring(0, 10) + " " + nowIso.substring(11, 16);

            setSelectedGardenPlant(prevDict => {
                return {
                    ...prevDict,
                    time_watered: nowIsoCondense
                };
            });

            handleLoadGarden();

    };

    const gardenPlantDelete = async () => {
        const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/${selectedGardenPlant.id}/`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            console.log("Successfully deleted plant in backend");

            handleLoadGarden();

    };

    const handleSaveNotes = async () => {
        const position = selectedGardenPlant.position;

        const response = await fetchWithAuth(
            `http://127.0.0.1:8000/api/gardens/${selectedGarden}/plants/${selectedGardenPlant.id}/`,
            {
                method: "PATCH",
                body: JSON.stringify({ notes: notesDraft })
            }
        )

        if(!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        console.log("Successfully updated notes");
        const newMap = await handleLoadGarden();
        

        const reloadPlant = newMap[position];
        setMode("inspect");
        setSelectedGardenPlant(reloadPlant);
        setSelectedCell(position);
        setEditingNotes(false);
    }

    const redirectToInfo = async () => {
        console.log(selectedGardenPlant.plantType)
        
        navigate(`/plant-info/${selectedGardenPlant.plantType}`)
    }

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
                                        setMode("plant");
                                        console.log("Selected: ", plant.id);
                                        setSelectedPlantId(plant.id);
                                        setSelectedPlantType(plant);
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
                    </div>

                    <div className="gp-grid-toolbar">
                        <div className="gp-tools">
                            <h4>Garden Dimensions:</h4>
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
                           
                            <div className="gp-load-garden">
                                <label htmlFor="garden-select">Garden: </label>
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

                            <div className="gp-save-garden">

                                {creatingGarden ? 
                                    (<div>
                                        <label htmlFor="garden-name">Garden Name: </label>
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
                                    </div>) : 

                                    (<div>
                                        <button
                                            type="button"
                                            onClick={() => setCreatingGarden(true)}
                                            
                                        >
                                            Create Garden
                                        </button>
                                    </div>)
                                }   
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
                                {plantInfo?.name ?? (isInspectMode ? "Plant Information" : "Plant Mode")}
                            </h2>
                            <p>
                                {isInspectMode
                                ? (isEmptyCell
                                    ? "Click a planted cell to view details."
                                    : (plantInfo ? "" : ""))
                                : "Click on Empty Grid Space to Plant"}
                            </p>
                        </header>
                        
                        {isInspectMode ? 
                        (!plantInfo && !selectedGardenPlant ? (
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
                                    <dd>{datePlanted}</dd>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Last watered</dt>
                                    <dd>{dateWatered}</dd>
                                    <button onClick={() => handleWatertimeChange()}>Mark Watered</button>
                                </div>

                                <div className="gp-detail-row">
                                    <dt>Health</dt>
                                    <dd>{selectedGardenPlant.health}</dd>
                                </div>

                                {/* <div className="gp-detail-row">
                                    <dt>Notes</dt>
                                    <dd>{selectedGardenPlant.notes || "No notes yet."}</dd>
                                </div> */}
                                <div className="gp-detail-row">
                                    <dt>Notes</dt>
                                    <dd>
                                        {editingNotes ? (
                                            <div>
                                                <textarea
                                                    value={notesDraft}
                                                    onChange={(e) => setNotesDraft(e.target.value)}
                                                    maxLength={250}
                                                    rows={4}
                                                    placeholder="Add notes about this plant!"
                                                />
                                                <div>
                                                    <button onClick={handleSaveNotes}>Save</button>
                                                    <button onClick={cancelEditingNotes}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>{selectedGardenPlant.notes || "No notes yet."}</p>
                                                <button onClick={startEditingNotes}>Update Notes</button>
                                            </div>
                                        )}
                                    </dd>
                                </div>
                                        

                                 <div className="gp-detail-row">
                                    <dt>More Info:</dt>
                                    <button onClick={() => redirectToInfo()}>Click Here</button>
                                </div>

                                <div className="gp-detail-delete">
                                    <button onClick={() => gardenPlantDelete()}>Delete Plant</button>
                                </div>
                                </dl>
                            </div>
                        )) : (
                        <div className="gp-plantmode-selected">
                            <p>Selected Plant:</p>
                            {selectedPlantType ? <p>{selectedPlantType.common_name}</p> : <p></p>}
                        </div>
                        )}
                    </div>
                </div>
            
            </div>
        </main>
    )
}

export default GardenPlanner;