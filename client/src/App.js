import Homepage from "./pages/Homepage";
import {Route, Routes} from "react-router-dom";
import Roompage from "./pages/Roompage";
import React from "react";

const SERVER = "http://127.0.0.1:4001";

export default function App() {
    return (
        <div className="container-fluid">
            <h1>Tris!</h1>

            <Routes>
                <Route path="/" exact element={<Homepage server={SERVER}/>}/>
                <Route path="/room/:id" element={<Roompage/>}/>
            </Routes>
        </div>
    );
}