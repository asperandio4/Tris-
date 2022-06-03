import React from "react";
import Home from "../components/Home";
import {Link} from "react-router-dom";

export default function Homepage() {
    return (
        <div className="container-fluid">
            <Link to="/room" className="nav-link">Room</Link>
            <h2>Homepage</h2>
            <Home/>
        </div>
    );
}