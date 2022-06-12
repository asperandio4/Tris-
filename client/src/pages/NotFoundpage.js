import React from "react";
import {Link} from "react-router-dom";

export default function NotFoundpage() {
    return (
        <div id={"notFoundpage"} className={"page"}>
            <div className={"nav"}>View: <Link to="/">Home</Link> | <Link to="/stats">Stats</Link></div>
            <h2>Page not found!</h2>
            <p>Go back to the <Link to="/">Home</Link> :)</p>
        </div>
    );
}