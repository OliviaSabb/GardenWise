import React, {useState, useMemo} from "react";
import "./GardenPlanner.css"
import GardenPlannerGridFlexbox from "../components/GardenPlannerGridFlexbox.jsx";

function GardenPlanner(){

    // Trying to verify the user is logged in to access garden planner page
    // const userLoggedIn = null;
    // if(!userLoggedIn) {
    //     return <p>You must be logged in to view this page!!!</p>
    //     or can render some sort of info page here instead with register login buttons
    // }

    // plants for testing purposes
    const PLANTS = [
        "Tomato",
        "Cucumber",
        "Pumpkin",
        "Carrot",
        "Lettuce",
        "Blackberry",
        "Strawberry",
        "Rosemary",
        "Mint",
        "Basil"
    ];

    const numberRows = 10;
    const numberCols = 10;
    const cellSize = 64; // pixels


    // handles how many rows/columns and cell size
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(10);
    const [cell, setCell] = useState(64);
    
    // build the grid based off rows and columns
    // const cells = useMemo(() => {
    //     return Array.from({ length: rows * cols }, (_, i) => {
    //     const r = Math.floor(i / cols);
    //     const c = i % cols;
    //     return { r, c, key: `${r}-${c}` };
    //     });
    // }, [rows, cols]);

    // select a plant
    const [selectedPlant, setSelectedPlant] = useState(null);


    // place a plant
    const [placement, setPlacement] = useState({}); 



    return (
        <main className="gp-planner">
            <div className="gp-layout">

                {/* Left panel: Plant list*/}
                <div className="gp-panel gp-panel-left">
                    <ul className="gp-plant-list">
                        {PLANTS.map((p) => (
                            <li 
                            className="gp-plant-item"
                            onClick={() => {
                                console.log("Selected ", p);
                                setSelectedPlant(p);
                            }}
                            >
                                {p}
                            </li>
                        ))}
                        {/* <li className="gp-plant-item">Tomato</li>
                        <li className="gp-plant-item">Cucumber</li>
                        <li className="gp-plant-item">Pumpkin</li>
                        <li className="gp-plant-item">Carrot</li>
                        <li className="gp-plant-item">Lettuce</li>
                        <li className="gp-plant-item">Blackberry</li>
                        <li className="gp-plant-item">Strawberry</li>
                        <li className="gp-plant-item">Rosemary</li>
                        <li className="gp-plant-item">Mint</li>
                        <li className="gp-plant-item">Basil</li> */}
                    </ul>
                </div>

                {/* Middle panel: Garden grid planner*/}
                <div className="gp-panel gp-panel-center">
                    <GardenPlannerGridFlexbox
                        selectedPlant={selectedPlant}
                    />
                </div>
                {/* <div className="gp-panel gp-panel-center">
                    <GardenPlannerGridSVG/>
                </div> */}


                {/* <div className="gp-panel gp-panel-center">
                    <div className="gp-grid-toolbar">
                        <div className="gp-tools">
                            <div>Save</div>
                            <div>Reset</div>
                            <div>Zoom In +</div>
                            <div>Zoom Out -</div>
                        </div>

                    </div>

                    <div className="gp-grid-title">Garden Planner Grid</div>

                    <div className="gp-grid-container">
                        <div
                            className="gp-grid" 
                            // data-cols={numberCols} 
                            // data-rows={numberRows} a
                            // data-cell-size={cellSize}
                            // style={{
                            //     //for dynaic changing grid
                            //     "--cols": numberCols,
                            //     "--rows": numberRows,
                            //     "--cell": `${cellSize}px`,
                            // }}
                        >
                            
                            {cells.map(({r, c, key}) => (
                                <div key={key} className="gp-cell" data-row={r} data-col={c}/>
                            ))}
                        </div>
                    </div>
                </div> */}
                
                {/* Right panel: Plant information*/}
                <div className="gp-panel gp-panel-right">
                    <div className="gp-details-hearder">
                        <h2>*selected plant*</h2>
                        <p>
                            Select a plant from the left or from grid to view details.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
    
}

export default GardenPlanner;