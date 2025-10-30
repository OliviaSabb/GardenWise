import React, {useState, useEffect, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import "./GardenPlanner.css"
import GardenPlannerGridFlexbox from "../components/GardenPlannerGridFlexbox.jsx";
import GridInfoPanel from "../components/GridInfoPanel.jsx"
import { fetchWithAuth } from "../utils/fetchWithAuth";
import jwt_decode from "jwt-decode"; // This should work with latest versions




const PLANT_CATEGORIES = {
    Vegetables: ["tomato", "cucumber", "pumpkin", "carrot", "lettuce"],
    Herbs: ["rosemary", "mint", "basil"],
    Fruits: ["blackberry", "strawberry",]
};

const PLANT_INFO = {
    tomato: {
        id: "tomato",
        id_numeric: 1,
        name: "Tomato",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 18,
        water: "Moderate",
        notes: "Thrives in warm temperatures; stake or cage to support growth."
    },
    cucumber: {
        id: "cucumber",
        id_numeric: 2,
        name: "Cucumber",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 12,
        water: "High",
        notes: "Prefers rich, moist soil and consistent watering for crisp fruit."
    },
    pumpkin: {
        id: "pumpkin",
        id_numeric: 3,
        name: "Pumpkin",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 36,
        water: "Moderate",
        notes: "Requires plenty of space; plant in mounds for better drainage."
    },
    carrot: {
        id: "carrot",
        id_numeric: 4,
        name: "Carrot",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 3,
        water: "Moderate",
        notes: "Loose, sandy soil promotes straight roots; keep evenly moist."
    },
    lettuce: {
        id: "lettuce",
        id_numeric: 5,
        name: "Lettuce",
        type: "Vegetable",
        sunlight: "Partial Sun",
        spacing: 8,
        water: "High",
        notes: "Prefers cool weather; plant successive rows for continuous harvest."
    },

    rosemary: {
        id: "rosemary",
        id_numeric: 6,
        name: "Rosemary",
        type: "Herb",
        sunlight: "Full Sun",
        spacing: 12,
        water: "Low",
        notes: "Tolerates dry soil; aromatic leaves used for cooking and decoration."
    },
    mint: {
        id: "mint",
        id_numeric: 7,
        name: "Mint",
        type: "Herb",
        sunlight: "Partial Sun",
        spacing: 12,
        water: "High",
        notes: "Spreads quickly; grow in containers to prevent invasion."
    },
    basil: {
        id: "basil",
        id_numeric: 8,
        name: "Basil",
        type: "Herb",
        sunlight: "Full Sun",
        spacing: 10,
        water: "Regular",
        notes: "Pinch off flowers to encourage leafy growth; companion to tomatoes."
    },

    blackberry: {
        id: "blackberry",
        id_numeric: 9,
        name: "Blackberry",
        type: "Fruit",
        sunlight: "Full Sun",
        spacing: 36,
        water: "Moderate",
        notes: "Prefers trellis or support; prune canes after fruiting."
    },
    strawberry: {
        id: "strawberry",
        id_numeric: 10,
        name: "Strawberry",
        type: "Fruit",
        sunlight: "Full Sun",
        spacing: 8,
        water: "High",
        notes: "Mulch to retain moisture and protect fruit from soil contact."
    }
};

function GardenPlanner(){
    const navigate = useNavigate();
    // Trying to verify the user is logged in to access garden planner page
    const userLoggedIn = localStorage.getItem("access_token");
    if(!userLoggedIn) {
        return <p>You must be logged in to view this page!</p>
        // or can render some sort of info page here instead with register login buttons
    }

    // hooks
    // modes for planting or inspecting plants
    const [mode, setMode] = useState("plant");
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedPlantId, setSelectedPlantId] = useState(null);
    const [placement, setPlacement] = useState({});
     // plant list choice, start with veggies
    const [category, setCategory] = useState("Vegetables");
    // handles how many rows/columns and cell size
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(8);
    const [cell, setCell] = useState(64);
    const [gardenData, setGardenData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


useEffect(() => {
    const fetchGardenData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError("Please log in to access your garden.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetchWithAuth("http://127.0.0.1:8000/api/gardens/");

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
                throw new Error(
                 `HTTP ${response.status}: ${JSON.stringify(errorData)}`
                );
            }

            const data = await response.json();
            setGardenData(data);

            // build placement map
// build placement map with names
const placementMap = {};
data.forEach(garden => {
    garden.garden_plants.forEach(plant => {
        // find plant info from PLANT_INFO by numeric ID
        const plantInfo = Object.values(PLANT_INFO).find(p => p.id_numeric === plant.type_id);
        placementMap[plant.position] = plantInfo ? plantInfo.name : `Plant ${plant.type_id}`;
    });
});
setPlacement(placementMap);


        } catch (err) {
            setError("Failed to fetch gardens. Please check your connection.");
        } finally {
            setLoading(false); 
        }
    };

    fetchGardenData();
}, []);



    useEffect(() => {
        if (!gardenData) {
            setPlacement({});
        }
    }, [gardenData]);

    // vars
    const inspectedPlantId = selectedCell ? placement[selectedCell] : null;
    const plantInfo = inspectedPlantId ? PLANT_INFO[inspectedPlantId] : null;
    const isInspectMode = mode === "inspect";
    const isEmptyCell = isInspectMode && (!selectedCell || !inspectedPlantId); 

    // if we have a plant, plant it



const handleCellClick = async (r, c) => {
    const key = `${r}-${c}`;

    if (mode === "plant") {
        if (!selectedPlantId) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError("You must be logged in.");
            return;
        }

        try {
            // Decode token to get user ID
            const decoded = jwt_decode(token);
            const loggedInUserId = decoded?.user_id;

            if (!gardenData || gardenData.length === 0) {
                setError("No garden available. Create a garden first.");
                return;
            }

            console.log("🔍 Garden data:", gardenData);
            console.log("👤 Logged in user ID:", loggedInUserId);

            // Works with both numeric and object forms
           const userGarden = gardenData.find(g => 
                Number(g.user) === Number(loggedInUserId) || 
                Number(g.user?.id) === Number(loggedInUserId)
            );


            if (!userGarden) {
                setError("No garden found for your account.");
                console.warn("No matching garden found for user:", loggedInUserId);
                return;
            }

            //Used emojis for testing so I could see erroe better
            const gardenId = userGarden.id;
            console.log("Found garden ID:", gardenId);
            console.log("✅ Matched garden:", userGarden);
            // Use the numeric id for PlantType
            const plantNumericId = PLANT_INFO[selectedPlantId]?.id_numeric;
            if (!plantNumericId) {
                setError(`Missing numeric ID for ${selectedPlantId}`);
                console.error("Missing id_numeric for plant:", selectedPlantId);
                return;
            }

            console.log(`Planting ${selectedPlantId} (ID ${plantNumericId}) at ${key}`);

            const response = await fetchWithAuth(
                `http://127.0.0.1:8000/api/gardens/${gardenId}/plants/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: plantNumericId,
                        position: key,
                        health: "Healthy",
                    }),
                }
            );

            if (!response.ok) {
                const errData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errData}`);
            }

            const savedPlant = await response.json();
            console.log("✅ Successfully saved plant to backend:", savedPlant);

            // ✅ Update grid instantly
            setPlacement(prev => ({ ...prev, [key]: selectedPlantId }));

        } catch (error) {
            console.error("❌ Save failed:", error);
            setError('Failed to save plant data: ' + error.message);
        }

        return;
    }

    if (mode === "inspect") {
        setSelectedCell(key);
        return;
    }
};




    if (loading) {
        return <div>Loading garden data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
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
                        {PLANT_CATEGORIES[category].map((plantId) => {
                            const info = PLANT_INFO[plantId]; // grab plant data
                            return (
                                <li
                                    key={plantId}
                                    className="gp-plant-item"
                                    onClick={() => {
                                        console.log("Selected ", plantId);
                                        setSelectedPlantId(plantId);
                                    }}
                                >
                                    {info.name}
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
                        <label htmlFor="cols">Length: </label>
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

            </div>

            <div className="gp-grid-title">Garden Planner Grid</div>
                    <GardenPlannerGridFlexbox
                        rows={rows}
                        cols={cols}
                        cell={cell}
                        placement={placement}
                        onCellClick={handleCellClick}
                        getPlantName={(id) => PLANT_INFO[id]?.name ?? id}
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