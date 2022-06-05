import React, {useEffect} from "react";
import Home from "../components/Home";

export default function Homepage(props) {
    const connectToSocket = props.connectToSocket;
    useEffect(() => {
        connectToSocket(() => {});
    }, [connectToSocket]);

    return (
        <div className="container-fluid">
            <h2>Homepage</h2>
            <div id="info">
                <p>
                    <span>Online users: <strong>{props.onlineUsers}</strong></span>&nbsp;|&nbsp;
                    <span>Online games: <strong>{props.onlineGames}</strong></span>&nbsp;|&nbsp;
                    <span>Played games: <strong>{props.playedGames}</strong></span>
                </p>

            </div>
            <Home myId={props.myId} availableRooms={props.availableRooms}/>
        </div>
    );
}