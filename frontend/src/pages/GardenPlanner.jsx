import React, {useState, useMemo} from "react";
import "./GardenPlanner.css"

function GardenPlanner(){

    // Trying to verify the user is logged in to access garden planner page
    const userLoggedIn = null;
    if(!userLoggedIn) {
        return <p>You must be logged in to view this page!!!</p>
    }



    const numberRows = 10;
    const numberCols = 10;
    const cellSize = 64; // pixels



    const [rows, setRows] = useState(100);
    const [cols, setCols] = useState(10);
    const [cell, setCell] = useState(64);
    

  const cells = useMemo(() => {
    return Array.from({ length: rows * cols }, (_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return { r, c, key: `${r}-${c}` };
    });
  }, [rows, cols]);



    return (
        <main className="gp-planner">
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
                            {/*cells will be here */}
                            {cells.map(({r, c, key}) => (
                                <div key={key} className="gp-cell" data-row={r} data-col={c}/>
                            ))}
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