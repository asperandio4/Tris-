import {useParams} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import axios from "axios";
import Game from "../components/Game";

export default function Roompage(props) {
    const {id} = useParams();

    const [name, setName] = useState('');

    useEffect(() => {
        props.connectToSocket(() => {
            axios.post("http://localhost:4001/room/getData/" + id, {myId: props.myId})
                .then(response => {
                    setName(response.data.name);
                });
        })
    }, []);

    function handleBtnHome() {
        if (props.started && !props.finished && !props.aborted && !window.confirm("Are you sure you want to leave mid-game?")) {
            return;
        }

        axios.post("http://localhost:4001/room/leave/" + id, {myId: props.myId})
            .then(() => window.location.href = "/");
    }

    function handleBtnStart() {
        axios.post("http://localhost:4001/room/start/" + id, {myId: props.myId})
            .then();
    }

    return (
        <div className="container-fluid">
            <button onClick={handleBtnHome}>Leave</button>
            {props.full && !props.started && <button onClick={handleBtnStart}>Start</button>}
            {props.finished && <p>Game over!</p>}
            {props.winner != '' && <p>Winner: {props.winner}</p>}
            {props.victoryPos != '' && <p>Victory position: {props.victoryPos}</p>}
            {props.aborted && <p>This game was cancelled!</p>}

            <h2>Room {name}</h2>
            <h3>Player {props.myName.replace('player', '')} - Sign {props.myName == 'player0' ? 'O' : 'X'}</h3>

            {props.started && !props.aborted &&
                <Game myId={props.myId} roomId={id} myTurn={props.myTurn && !props.finished} values={props.values}/>}
        </div>
    );
}