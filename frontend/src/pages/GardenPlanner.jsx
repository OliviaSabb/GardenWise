import React, {useState, useMemo} from "react";
import "./GardenPlanner.css"
import GardenPlannerGridFlexbox from "../components/GardenPlannerGridFlexbox.jsx";
import GridInfoPanel from "../components/GridInfoPanel.jsx"

const PLANT_CATEGORIES = {
    Vegetables: ["tomato", "cucumber", "pumpkin", "carrot", "lettuce"],
    Herbs: ["rosemary", "mint", "basil"],
    Fruits: ["blackberry", "strawberry",]
};

const PLANT_INFO = {
    tomato: {
        id: "tomato",
        name: "Tomato",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 18,
        water: "Moderate",
        notes: "Thrives in warm temperatures; stake or cage to support growth."
    },
    cucumber: {
        id: "cucumber",
        name: "Cucumber",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 12,
        water: "High",
        notes: "Prefers rich, moist soil and consistent watering for crisp fruit."
    },
    pumpkin: {
        id: "pumpkin",
        name: "Pumpkin",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 36,
        water: "Moderate",
        notes: "Requires plenty of space; plant in mounds for better drainage."
    },
    carrot: {
        id: "carrot",
        name: "Carrot",
        type: "Vegetable",
        sunlight: "Full Sun",
        spacing: 3,
        water: "Moderate",
        notes: "Loose, sandy soil promotes straight roots; keep evenly moist."
    },
    lettuce: {
        id: "lettuce",
        name: "Lettuce",
        type: "Vegetable",
        sunlight: "Partial Sun",
        spacing: 8,
        water: "High",
        notes: "Prefers cool weather; plant successive rows for continuous harvest."
    },

    rosemary: {
        id: "rosemary",
        name: "Rosemary",
        type: "Herb",
        sunlight: "Full Sun",
        spacing: 12,
        water: "Low",
        notes: "Tolerates dry soil; aromatic leaves used for cooking and decoration."
    },
    mint: {
        id: "mint",
        name: "Mint",
        type: "Herb",
        sunlight: "Partial Sun",
        spacing: 12,
        water: "High",
        notes: "Spreads quickly; grow in containers to prevent invasion."
    },
    basil: {
        id: "basil",
        name: "Basil",
        type: "Herb",
        sunlight: "Full Sun",
        spacing: 10,
        water: "Regular",
        notes: "Pinch off flowers to encourage leafy growth; companion to tomatoes."
    },

    blackberry: {
        id: "blackberry",
        name: "Blackberry",
        type: "Fruit",
        sunlight: "Full Sun",
        spacing: 36,
        water: "Moderate",
        notes: "Prefers trellis or support; prune canes after fruiting."
    },
    strawberry: {
        id: "strawberry",
        name: "Strawberry",
        type: "Fruit",
        sunlight: "Full Sun",
        spacing: 8,
        water: "High",
        notes: "Mulch to retain moisture and protect fruit from soil contact."
    }
};


function GardenPlanner(){

    // Trying to verify the user is logged in to access garden planner page
    const userLoggedIn = localStorage.getItem("access");
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

    // vars
    const inspectedPlantId = selectedCell ? placement[selectedCell] : null;
    const plantInfo = inspectedPlantId ? PLANT_INFO[inspectedPlantId] : null;

    const isInspectMode = mode === "inspect";
    const isEmptyCell = isInspectMode && (!selectedCell || !inspectedPlantId); 

    // if we have a plant, plant it
    const handleCellClick = (r, c) => {
        
        const key = `${r}-${c}`;

        if(mode === "plant") {
            if(!selectedPlantId) return;
            setPlacement(prev => ({ ...prev, [key]: selectedPlantId }));
            return;
        }

        if(mode === "inspect") {
            setSelectedCell(key);
            return;
        }
    };

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