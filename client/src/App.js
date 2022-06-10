import Homepage from "./pages/Homepage";
import Roompage from "./pages/Roompage";
import Statspage from "./pages/Statspage";
import RoomFullpage from "./pages/RoomFullpage";
import NotFoundpage from "./pages/NotFoundpage";
import {Route, Routes} from "react-router-dom";
import React, {useCallback, useState} from "react";
import socketIOClient from "socket.io-client";
import "./style/App.css";

const SERVER = "http://127.0.0.1:4001";

export default function App(props) {
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [onlineGames, setOnlineGames] = useState(0);
    const [playedGames, setPlayedGames] = useState(0);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [gameName, setGameName] = useState('');
    const [gameFull, setGameFull] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [gameClosed, setGameClosed] = useState(false);
    const [gameAborted, setGameAborted] = useState(false);
    const [myName, setMyName] = useState('');
    const [myTurn, setMyTurn] = useState(false);
    const [gameValues, setGameValues] = useState([]);
    const [gameWinner, setGameWinner] = useState('');
    const [gameVictoryPos, setGameVictoryPos] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    const connectToSocket = useCallback(callback => {
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
            setMyName(data.myName);
            setMyTurn(data.myTurn);
            setGameName(data.name);
            setGameFull(data.full);
            setGameStarted(data.started);
            setGameFinished(data.finished);
            setGameClosed(data.closed);
            setGameAborted(data.aborted);
            setGameValues(data.values);
            setGameWinner(data.winner);
            setGameVictoryPos(data.victoryPos);
        });
        socket.on('chat_message', message => {
            setChatMessages(chatMessages => [...chatMessages, message]);
        });
        socket.on('connect', callback);

        return () => socket.disconnect();
    }, [props.myId]);

    return (
        <div className="container960">
            <header>
                <a href="/" id="logo_home_link"><img src="/logo512.png" alt="Tris!"/></a>
                <h1>Tris!</h1>
            </header>

            <Routes>
                <Route path="/" exact
                       element={<Homepage myId={props.myId} connectToSocket={connectToSocket} onlineUsers={onlineUsers}
                                          onlineGames={onlineGames}
                                          playedGames={playedGames} availableRooms={availableRooms}/>}/>
                <Route path="/room/:id"
                       element={<Roompage myId={props.myId} connectToSocket={connectToSocket} name={gameName}
                                          full={gameFull}
                                          started={gameStarted} finished={gameFinished} closed={gameClosed}
                                          aborted={gameAborted} myName={myName} myTurn={myTurn} values={gameValues}
                                          winner={gameWinner} victoryPos={gameVictoryPos} chat={chatMessages}/>}/>
                <Route path="/stats"
                       element={<Statspage/>}/>

                <Route path="room-full" element={<RoomFullpage/>}/>
                <Route path="not-found" element={<NotFoundpage/>}/>
                <Route path="*" element={<NotFoundpage/>}/>
            </Routes>

            <footer>
                <p>Developed by: Andrea Sperandio</p>
            </footer>
        </div>
    );
}