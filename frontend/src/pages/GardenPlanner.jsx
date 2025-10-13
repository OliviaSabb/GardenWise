import React from "react";
import "./GardenPlanner.css"

function GardenPlanner(){
    return (
        <main>
            <div className="gp-layout">

                {/* Left panel: Plant list*/}
                <div className="gp-panel gp-panel-left">
                    <ul className="gp-plant-list">
                        <li className="gp-plant-item">Tomato</li>
                        <li className="gp-plant-item">Basil</li>
                        <li className="gp-plant-item">Cucumber</li>
                        <li className="gp-plant-item">Carrot</li>
                        <li className="gp-plant-item">Lettuce</li>
                        <li className="gp-plant-item">Pepper</li>
                        <li className="gp-plant-item">Strawberry</li>
                        <li className="gp-plant-item">Rosemary</li>
                        <li className="gp-plant-item">Mint</li>
                        <li className="gp-plant-item">Pumpkin</li>
                    </ul>
                </div>

                {/* Middle panel: Garden grid planner*/}
                <div className="gp-panel gp-panel-center">
                    <div className="gp-toolbar"> Toolbar </div>

                    <div className="gp-grid-title">Garden Planner Grid</div>

                    <div className="gp-grid-container">
                        <div
                            className="gp-grid" 
                            data-cols="10" 
                            data-rows="10" 
                            data-cell-size="64"
                        >
                            {/*cells will be here */}
                            <div className="gp-cell" tabIndex={0} data-col="1" data-row="1">cell1</div>
                        </div>
                    </div>
                </div>
                
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