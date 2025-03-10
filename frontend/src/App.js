import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"

function App() {
    const [pdbId, setPdbId] = useState("");
    const stageRef = useRef(null);
    const [file, setFile] = useState(null);
    const selectedAtoms = useRef([]);
    const [transparentBg, setTransparentBg] = useState(true); // ✅ Default: Transparent background



   

    useEffect(() => {
if (!stageRef.current) {
        const viewportElement = document.getElementById("viewport");
        
        if (!viewportElement) {
            console.error("❌ #viewport div is missing!");
            return;
        }
        
    
        stageRef.current = new window.NGL.Stage("viewport");

        // Click to Select Atoms for Distance Measurement
        stageRef.current.mouseControls.add("click", (event) => {
            const pickingProxy = stageRef.current.pickingControls.pick(event);
            if (pickingProxy && pickingProxy.atom) {
                selectedAtoms.current.push(pickingProxy.atom);
                }
            })
        }}
, []);





    const fetchPDB = async () => {
    console.log("Fetch button clicked!");
    console.log("PDB ID:", pdbId);
    console.log("Stage initialized:", !!stageRef.current);

    if (!pdbId || !stageRef.current) {
        console.error("Missing PDB ID or Stage not initialized");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/fetch_pdb/${pdbId}`);
        const data = await response.json();
        
        console.log("PDB Data Received:", data.pdb_data?.slice(0, 100)); // Show first 100 chars
        
        if (data.pdb_data) {
            const blob = new Blob([data.pdb_data], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            console.log("Generated Blob URL:", url); // Debug Blob URL

            stageRef.current.removeAllComponents();
            stageRef.current.loadFile(url, { ext: "pdb" }).then(component => {
                component.addRepresentation("cartoon");
component.addRepresentation("contact", { 
    colorScheme: "hydrophobicity", 
    opacity: 1.0
});
component.addRepresentation("cartoon", {
    colorScheme: "residueindex", 
    opacity: 1.0
});

                stageRef.current.autoView();
                console.log("Protein loaded successfully!");
            });
        } else {
            console.error("No PDB data received!");
        }
    } catch (error) {
        console.error("Error fetching PDB data:", error);
    }
};

const uploadPDB = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:5000/upload_pdb', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

        
        console.log("PDB Data Received:", data.pdb_data?.slice(0, 100)); // Show first 100 chars
        
        if (data.pdb_data) {
            const blob = new Blob([data.pdb_data], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            console.log("Generated Blob URL:", url); // Debug Blob URL

            stageRef.current.removeAllComponents();
            stageRef.current.loadFile(url, { ext: "pdb" }).then(component => {
                component.addRepresentation("cartoon");
component.addRepresentation("contact", { 
    colorScheme: "hydrophobicity", 
    opacity: 1.0
});
component.addRepresentation("cartoon", {
    colorScheme: "residueindex", 
    opacity: 1.0
});
                stageRef.current.autoView();
                console.log("Protein loaded successfully!");
            });
        } else {
            console.error("No PDB data received!");
        }
    } catch (error) {
        console.error("Error fetching PDB data:", error);
    }

};
const downloadImage = () => {
    if (!stageRef.current) return;
    
    stageRef.current.makeImage({ 
        factor: 2, 
        antialias: true, 
        transparent: transparentBg // ✅ Toggle transparency
    }).then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${pdbId || "protein"}.png`;
        a.click();
    });
};

    return (

        <div className="container page">
<div className="logo-cont">
<img src='favicon.ico' alt='logo' className='logo' />
<h1 className='head'>PROVIZ (The Protein Visualization Tool)</h1>
</div>
<div className='bottom-part mt-3'>
<div>

           <label htmlFor="search" className='label'>Enter PDB ID:</label> 
<div className='cont-1'>
            <input
    type="text"
    className="form-control inp"
    placeholder="Enter PDB ID (e.g., 1CRN)"
    value={pdbId}
id='search'
    onChange={(e) => setPdbId(e.target.value.trim())}  // Trim whitespace
/>

            <button className="btn btn-primary button" onClick={() => {
    console.log("Button clicked! Triggering fetchPDB()");
    fetchPDB();
}}>
    Load Protein
</button></div>
<p className='para'>or</p>
 
<label htmlFor="fileUpload" className='label'>Upload PDB File:</label>
<div className="form-group cont-2">
        <input
          type="file"
          className="form-control upload"
          id="fileUpload"
          accept=".pdb"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn btn-primary button" onClick={uploadPDB}>
          Upload PDB
        </button>
      </div></div>
<div class="vr d-none d-lg-block"></div>
<div className='picture-part'>
<div>
    <label className='para'>
        <input 
            type="checkbox" 
	    className='checkbox'
            checked={transparentBg} 
            onChange={() => setTransparentBg(!transparentBg)} 
        />
        Transparent
    </label>

<button onClick={downloadImage} className='btn btn-secondary mb-3 mt-4 button'>Download Image </button></div>
       <div id="viewport" className='output' style={{ 
    border: "1px solid black",
}}></div>


</div>
        </div>
</div>
    );


}

export default App;
