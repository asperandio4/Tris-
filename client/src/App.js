import Homepage from "./pages/Homepage";
import {Route, Routes} from "react-router-dom";
import Roompage from "./pages/Roompage";
import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";

const SERVER = "http://127.0.0.1:4001";

export default function App(props) {
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [onlineGames, setOnlineGames] = useState(0);
    const [playedGames, setPlayedGames] = useState(0);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameAborted, setGameAborted] = useState(false);

    useEffect(() => {
        const socket = socketIOClient(SERVER, {query: 'myId=' + props.myId});
        socket.on("online_users", data => {
            setOnlineUsers(data);
        });
        socket.on("online_games", data => {
            setOnlineGames(data);
        });
        socket.on("played_games", data => {
            setPlayedGames(data);
        });
        socket.on("room_list", data => {
            setAvailableRooms(data);
        });
        socket.on("game_started", () => {
            setGameStarted(true);
        });
        socket.on("game_aborted", () => {
            setGameAborted(true);
        });

        return () => socket.disconnect();
    }, []);


    return (
        <div className="container-fluid">
            <h1>Tris!</h1>

            <Routes>
                <Route path="/" exact
                       element={<Homepage myId={props.myId} server={SERVER} onlineUsers={onlineUsers}
                                          onlineGames={onlineGames}
                                          playedGames={playedGames} availableRooms={availableRooms}/>}/>
                <Route path="/room/:id"
                       element={<Roompage myId={props.myId} started={gameStarted} aborted={gameAborted}/>}/>
            </Routes>
        </div>
    );
}