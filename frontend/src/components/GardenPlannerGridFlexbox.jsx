import React, {useMemo, useRef, useState} from "react";


function GardenPlannerGridFlexbox() {

        //const numberRows = 10;
        //const numberCols = 10;
        const cellSize = 64; // pixels
    
    
    
        const [rows, setRows] = useState(2);
        const [cols, setCols] = useState(8);
        const [cell, setCell] = useState(64);
        
    
      const cells = useMemo(() => {
        return Array.from({ length: rows * cols }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          return { r, c, key: `${r}-${c}` };
        });
      }, [rows, cols]);

    return(
        <div>
            <div className="gp-grid-toolbar">
                <div className="gp-tools">
                    <div>Save</div>
                    <div>Reset</div>
                    <div>Zoom In +</div>
                    <div>Zoom Out -</div>
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

            <div className="gp-grid-container">
                <div
                    className="gp-grid" 
                    style={{
                        //for dynaic changing grid
                        "--cols": cols,
                        "--rows": rows,
                        "--cellSize": `${cellSize}px` //maybe allow cell size changes
                    }}
                >
                    {/*cells will be here */}
                    {cells.map(({r, c, key}) => (
                        <div key={key} className="gp-cell" data-row={r} data-col={c}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GardenPlannerGridFlexbox;