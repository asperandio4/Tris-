import Homepage from "./pages/Homepage";
import {Route, Routes} from "react-router-dom";
import Roompage from "./pages/Roompage";
import React, {useCallback, useState} from "react";
import socketIOClient from "socket.io-client";

const SERVER = "http://127.0.0.1:4001";

export default function App(props) {
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [onlineGames, setOnlineGames] = useState(0);
    const [playedGames, setPlayedGames] = useState(0);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [gameFull, setGameFull] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [gameAborted, setGameAborted] = useState(false);
    const [myName, setMyName] = useState('');
    const [myTurn, setMyTurn] = useState(false);
    const [gameValues, setGameValues] = useState([]);
    const [gameWinner, setGameWinner] = useState('');
    const [gameVictoryPos, setGameVictoryPos] = useState('');

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
        socket.on("game_full", data => {
            setGameFull(data);
        });
        socket.on("game_started", data => {
            setGameStarted(data);
        });
        socket.on("game_finished", data => {
            setGameFinished(data);
        });
        socket.on("game_aborted", data => {
            setGameAborted(data);
        });
        socket.on("my_name", data => {
            setMyName(data);
        });
        socket.on("my_turn", data => {
            setMyTurn(data);
        });
        socket.on("game_values", data => {
            setGameValues(data);
        });
        socket.on("game_winner", data => {
            setGameWinner(data);
        });
        socket.on("game_victory_pos", data => {
            setGameVictoryPos(data);
        });
        socket.on('connect', callback);

        return () => socket.disconnect();
    }, []);

    //TODO to call
    function resetGame() {
        setGameFull(false);
        setGameStarted(false);
        setGameFinished(false);
        setGameAborted(false);
        setMyName('');
        setMyTurn(false);
        setGameValues([]);
        setGameWinner('');
        setGameVictoryPos('');
    }

    return (
        <div className="container-fluid">
            <h1>Tris!</h1>

            <Routes>
                <Route path="/" exact
                       element={<Homepage myId={props.myId} connectToSocket={connectToSocket} onlineUsers={onlineUsers}
                                          onlineGames={onlineGames}
                                          playedGames={playedGames} availableRooms={availableRooms}/>}/>
                <Route path="/room/:id"
                       element={<Roompage myId={props.myId} connectToSocket={connectToSocket} full={gameFull}
                                          started={gameStarted} finished={gameFinished}
                                          aborted={gameAborted} myName={myName} myTurn={myTurn} values={gameValues}
                                          winner={gameWinner} victoryPos={gameVictoryPos}/>}/>
            </Routes>
        </div>
    );
}