import Homepage from "./pages/Homepage";
import Roompage from "./pages/Roompage";
import Statspage from "./pages/Statspage";
import NotFoundpage from "./pages/NotFoundpage";
import {Link, Route, Routes} from "react-router-dom";
import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";
import "./style/App.css";

const SERVER = "http://127.0.0.1:4001";  //server ip:port

export default function App(props) {
    const [socketConnected, setSocketConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [onlineGames, setOnlineGames] = useState(0);
    const [playedGames, setPlayedGames] = useState(0);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [gameInfo, setGameInfo] = useState({});
    const [chatMessages, setChatMessages] = useState([]);

    /* On first rendering it connects to a socket on the server to receive update data.
    * shouldConnect is used in case the user presses the refresh button: myId doesn't change but the connection gets
    * closed automatically, so it ensures the reconnection on the subsequent rendering */
    const shouldConnect = null;
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
        socket.on("game_status", data => {
            setGameInfo(data);
        });
        socket.on('chat_message', message => {
            setChatMessages(chatMessages => [...chatMessages, message]);  //append the new message to the list
        });
        socket.on('connect', () => {setSocketConnected(true) });

        return () => {
            setSocketConnected(false);
            socket.disconnect();
        }  //disconnect on navigation end
    }, [props.myId, shouldConnect]);

    /* Clears the game info when the user leaves the page */
    function onGameLeaving() {
        setGameInfo({});
        setChatMessages([]);
    }

    return (
        <div className="container960">
            <header>
                <Link to="/" id="logo_home_link"><img src="/logo512.png" alt="Tris!"/></Link>
                <h1>Tris!</h1>
            </header>

            {socketConnected ?
                <Routes>
                    <Route path="/" exact
                           element={<Homepage SERVER={SERVER} myId={props.myId} onlineUsers={onlineUsers}
                                              onlineGames={onlineGames} playedGames={playedGames}
                                              availableRooms={availableRooms}/>}/>
                    <Route path="/room/:id"
                           element={<Roompage SERVER={SERVER} myId={props.myId} gameInfo={gameInfo} chat={chatMessages}
                                              onGameLeaving={onGameLeaving}/>}/>
                    <Route path="/stats"
                           element={<Statspage SERVER={SERVER}/>}/>

                    <Route path="not-found" element={<NotFoundpage/>}/>
                    <Route path="*" element={<NotFoundpage/>}/>
                </Routes>
                : ''
            }

            <footer>
                <p>Developed by: Andrea Sperandio</p>
            </footer>
        </div>
    );
}