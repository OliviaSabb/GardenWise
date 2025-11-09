import React, {useMemo, useRef, useState} from "react";


function GardenPlannerGridFlexbox({rows, cols, cell, placement, onCellClick, getPlantName, getPlantImage}) {

    const cells = useMemo(() => {
        return Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return { r, c, key: `${r}-${c}` };
        });
    }, [rows, cols]);

    

    return(
        <div>
  
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
                                onClick={() => onCellClick(r, c)}
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
    );
}

export default GardenPlannerGridFlexbox;