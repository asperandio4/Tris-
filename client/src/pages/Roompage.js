import {Link} from 'react-router-dom';
import React from "react";

export default function Roompage() {
    return (
        <div className="container-fluid">
            <Link to="/" className="nav-link">Home</Link>
            <h2>Room</h2>
        </div>
    );
}