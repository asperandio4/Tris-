import Homepage from "./pages/Homepage";
import {Route, Routes} from "react-router-dom";
import Roompage from "./pages/Roompage";
import React from "react";

export default function App() {
    return (
        <div className="container-fluid">
            <h1>Tris!</h1>
            
            <Routes>
                <Route path="/" exact element={<Homepage/>}/>
                <Route path="/room" element={<Roompage/>}/>
            </Routes>
        </div>
    );
}