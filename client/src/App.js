import Homepage from "./pages/Homepage";
import {Route, Routes} from "react-router-dom";
import Roompage from "./pages/Roompage";
import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";

const SERVER = "http://127.0.0.1:4001";

export default function App() {
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [onlineGames, setOnlineGames] = useState(0);
    const [playedGames, setPlayedGames] = useState(0);
    const [availableRooms, setAvailableRooms] = useState([]);

    useEffect(() => {
        const socket = socketIOClient(SERVER);
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

        return () => socket.disconnect();
    }, []);


    return (
        <div className="container-fluid">
            <h1>Tris!</h1>

            <Routes>
                <Route path="/" exact
                       element={<Homepage server={SERVER} onlineUsers={onlineUsers} onlineGames={onlineGames}
                                          playedGames={playedGames} availableRooms={availableRooms}/>}/>
                <Route path="/room/:id" element={<Roompage/>}/>
            </Routes>
        </div>
    );
}