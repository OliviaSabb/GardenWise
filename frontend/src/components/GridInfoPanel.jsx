import React, {useState, useMemo} from "react";

function GridInfoPanel ({plantInfo, isEmptyCell, isInspectMode}) {
    return (
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

            {plantInfo ? (
                <div>
                    <dl className="gp-details-list">
                        <div className="gp-detail-row">
                            <dt>Name</dt>
                            <dd>{plantInfo.name}</dd>
                        </div>
                        <div className="gp-detail-row">
                            <dt>Type</dt>
                            <dd>{plantInfo.type}</dd>
                        </div>
                        <div className="gp-detail-row">
                            <dt>Sunlight</dt>
                            <dd>{plantInfo.sunlight}</dd>
                        </div>
                        <div className="gp-detail-row">
                            <dt>Spacing</dt>
                            <dd>{plantInfo.spacing} inches</dd>
                        </div>
                        <div className="gp-detail-row">
                            <dt>Water</dt>
                            <dd>{plantInfo.water}</dd>
                        </div>
                        <div className="gp-detail-row">
                            <dt>Notes</dt>
                            <dd>{plantInfo.notes}</dd>
                        </div>
                    </dl>
                </div>
            ) : (
                <div>
                    <div className="gp-skel-line" style={{ width: "60%" }} />
                    <div className="gp-skel-line" style={{ width: "40%" }} />
                    <div className="gp-skel-line" style={{ width: "75%" }} />
                    <div className="gp-skel-line" style={{ width: "55%" }} />
                </div>
            )}
        </div>
    )
}

export default GridInfoPanel;