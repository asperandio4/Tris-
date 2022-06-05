import {useParams} from 'react-router-dom';
import React, {useEffect} from "react";
import axios from "axios";
import Game from "../components/Game";
import Chat from "../components/Chat";

export default function Roompage(props) {
    const {id} = useParams();

    const connectToSocket = props.connectToSocket;
    const myId = props.myId;
    useEffect(() => {
        connectToSocket(() => {
            axios.post("http://localhost:4001/room/join/" + id, {myId: myId})
                .then();
        })
    }, [connectToSocket, myId, id]);

    function handleBtnHome() {
        if (props.started && !props.finished && !props.aborted && !window.confirm("Are you sure you want to leave mid-game?")) {
            return;
        }

        axios.post("http://localhost:4001/room/leave/" + id, {myId: props.myId}).then();
        window.location.href = "/";
    }

    function handleBtnStart() {
        axios.post("http://localhost:4001/room/start/" + id, {myId: props.myId})
            .then();
    }

    function handleBtnRematch() {
        //TODO
    }

    function onSendMsg(msg) {
        axios.post("http://localhost:4001/room/msg/" + id, {msg: msg, from: props.myId})
            .then();
    }

    return (
        <div className="container-fluid">
            <button onClick={handleBtnHome}>Leave</button>
            {props.full && !props.started && <button onClick={handleBtnStart}>Start</button>}
            {props.finished && <p>Game over!</p>}
            {props.finished && !props.closed && <button onClick={handleBtnRematch}>Rematch</button>}
            {props.winner !== '' && <p>Winner: {props.winner}</p>}
            {props.victoryPos !== '' && <p>Victory position: {props.victoryPos}</p>}
            {props.aborted && <p>This game was cancelled!</p>}

            <h2>Room {props.name}</h2>
            <h3>Player {props.myName.replace('player', '')} - Sign {props.myName === 'player0' ? 'O' : 'X'}</h3>

            {(props.started || props.finished || props.closed) && !props.aborted &&
                <Game myId={props.myId} roomId={id}
                      myTurn={props.myTurn && !props.finished && !props.closed && !props.aborted}
                      values={props.values}/>}

            <Chat chat={props.chat} onSendMsg={onSendMsg}/>
        </div>
    );
}