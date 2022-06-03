import React from "react";
import Home from "../components/Home";

export default function Homepage(props) {
    return (
        <div className="container-fluid">
            <h2>Homepage</h2>
            <Home server={props.server}/>
        </div>
    );
}