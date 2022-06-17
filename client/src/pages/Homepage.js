import React, {useEffect} from "react";
import Home from "../components/Home";
import {Link} from "react-router-dom";
import axios from "axios";

export default function Homepage(props) {
    useEffect(() => {
        // Retrieve the updated room list from the server
        axios.get(props.SERVER + "/rooms").then();
    }, [props.SERVER]);

    return (
        <div id={"homepage"} className={"page"}>
            <div className={"nav"}>View: <Link to="/stats">Stats</Link></div>

            <h2>Homepage</h2>
            <div id="info">
                <p>
                    <span>Online users: <strong>{props.onlineUsers}</strong></span>&nbsp;|&nbsp;
                    <span>Online games: <strong>{props.onlineGames}</strong></span>
                    <span className={"desktop"}>&nbsp;|&nbsp;</span><br className={"mobile"}/>
                    <span>Played games: <strong>{props.playedGames}</strong></span>
                </p>

            </div>
            <Home SERVER={props.SERVER} myId={props.myId} availableRooms={props.availableRooms}/>
        </div>
    );
}