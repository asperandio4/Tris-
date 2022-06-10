import React, {useEffect} from "react";
import Home from "../components/Home";

export default function Homepage(props) {
    const connectToSocket = props.connectToSocket;
    useEffect(() => {
        connectToSocket(() => {});
    }, [connectToSocket]);

    return (
        <div id={"homepage"} className={"page"}>
            <div className={"nav"}>View: <a href="/stats">Stats</a></div>

            <h2>Homepage</h2>
            <div id="info">
                <p>
                    <span>Online users: <strong>{props.onlineUsers}</strong></span>&nbsp;|&nbsp;
                    <span>Online games: <strong>{props.onlineGames}</strong></span>
                    <span className={"desktop"}>&nbsp;|&nbsp;</span><br className={"mobile"}/>
                    <span>Played games: <strong>{props.playedGames}</strong></span>
                </p>

            </div>
            <Home myId={props.myId} availableRooms={props.availableRooms}/>
        </div>
    );
}