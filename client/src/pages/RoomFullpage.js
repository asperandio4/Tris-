import React from "react";

export default function RoomFullpage() {
    return (
        <div id={"roomFullpage"} className={"page"}>
            <div className={"nav"}>View: <a href="/">Home</a></div>
            <h2>The room you're trying to join is full already!</h2>
            <p>Go back to the <a href="/">Home</a> :)</p>
        </div>
    );
}