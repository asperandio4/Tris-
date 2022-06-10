import React from "react";

export default function NotFoundpage() {
    return (
        <div id={"notFoundpage"} className={"page"}>
            <div className={"nav"}>View: <a href="/">Home</a></div>
            <h2>Page not found!</h2>
            <p>Go back to the <a href="/">Home</a> :)</p>
        </div>
    );
}