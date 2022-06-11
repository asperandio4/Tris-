import {useParams} from 'react-router-dom';
import React, {useCallback, useEffect} from "react";
import axios from "axios";
import Game from "../components/Game";
import Chat from "../components/Chat";

export default function Roompage(props) {
    const {id} = useParams();

    const connectToSocket = props.connectToSocket;
    const myId = props.myId;
    useEffect(() => {
        connectToSocket(() => {  // on connection asks the server to join the room id
            axios.post("http://localhost:4001/room/join/" + id, {myId: myId})
                .then(response => {
                    if (response.data === "roomNotFound") {
                        window.location.href = "/not-found";
                    } else if (response.data === "roomFull") {
                        window.location.href = "/room-full";
                    }
                });
        });
    }, [connectToSocket, myId, id]);

    // Used to prevent the user to leave mid-game unintentionally
    const handleBtnHome = useCallback(() => {
        if (props.started && !props.finished && !props.aborted && !window.confirm("Are you sure you want to leave mid-game?")) {
            return;
        }

        window.location.href = "/";
    }, [props.started, props.finished, props.aborted]);

    useEffect(() => {
        document.getElementById("logo_home_link").onclick = function (e) {
            e.preventDefault();
            handleBtnHome();
        };
    }, [handleBtnHome]);


    function handleBtnStart() {
        axios.post("http://localhost:4001/room/start/" + id, {myId: props.myId})
            .then();
    }

    function handleBtnRematch() {
        axios.post("http://localhost:4001/room/rematch/" + id, {myId: props.myId})
            .then();
    }

    function onSendMsg(msg) {
        axios.post("http://localhost:4001/room/msg/" + id, {msg: msg, from: props.myId})
            .then();
    }

    return (
        <div id={"roompage"} className={"page"}>
            <button onClick={handleBtnHome} className={"cancel"}>Leave</button>

            <h2>Room {props.name}</h2>
            <h3>Player {props.myName.replace('player', '')} - Sign <span className={props.myName}></span></h3>

            <div className="columnContainer">
                <div className="columnLeft">
                    <div className="actionBar">
                        {!props.full && !props.started && !props.finished && !props.closed && !props.aborted &&
                            <p>Waiting for an opponent!</p>}
                        {props.full && !props.started &&
                            <button onClick={handleBtnStart} className={"start"}>Start</button>}
                        {(props.finished || props.closed) && props.winner === '' &&
                            <p>Game over: there is no winning!</p>}
                        {props.winner !== '' && <p>{props.winner === props.myName ? "You won! :D" : "You lost :/"}</p>}
                        {props.finished && !props.closed &&
                            <button onClick={handleBtnRematch} className={"rematch"}>Rematch</button>}
                        {props.aborted && <p>This game was cancelled!</p>}
                    </div>


                    <Game myId={props.myId} roomId={id}
                          myTurn={props.myTurn}
                          values={props.values} myName={props.myName} victoryPos={props.victoryPos}
                          started={props.started}
                          finished={props.finished || props.closed || props.aborted}/>
                </div>
                <div className="columnRight">
                    <Chat chat={props.chat} onSendMsg={onSendMsg}/>
                </div>
            </div>
        </div>
    );
}