import {Link, UNSAFE_NavigationContext, useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import Game from "../components/Game";
import Chat from "../components/Chat";

export default function Roompage(props) {
    const [roomFull, setRoomFull] = useState(false);

    const navigate = useNavigate();
    const {id} = useParams();
    const myId = props.myId;
    const gameInfo = props.gameInfo;
    const onGameLeaving = props.onGameLeaving;

    useEffect(() => {
        // Asks the server to join the room id
        axios.post(props.SERVER + "/room/join/" + id, {myId: myId})
            .then(response => {
                if (response.data === "roomNotFound") {
                    navigate("/not-found");
                } else if (response.data === "roomFull") {
                    setRoomFull(true);
                }
            });
    }, [props.SERVER, myId, id, navigate]);

    // Used to prevent the user to leave mid-game unintentionally
    const handleBtnHome = useCallback((question) => {
        if (gameInfo.started && !gameInfo.finished && !gameInfo.aborted &&
            (!question || !window.confirm("Are you sure you want to leave mid-game?"))) {
            return;
        }

        axios.post(props.SERVER + "/room/leave/" + id, {myId: myId})
            .then(() => {
                onGameLeaving();
                navigate("/");
            });
    }, [props.SERVER, gameInfo.started, gameInfo.finished, gameInfo.aborted, id, myId, navigate, onGameLeaving]);

    useEffect(() => {
        const logoHomeLink = document.getElementById("logo_home_link");
        logoHomeLink.onclick = (e) => {
            e.preventDefault();
            handleBtnHome(true)
        };
        return () => {
            logoHomeLink.onclick = (e) => {
                e.defaultPrevented = false;
                return true;
            };
        };
    }, [handleBtnHome]);

    // Used to force game leaving on browser back button pressed
    const navigator = useContext(UNSAFE_NavigationContext).navigator;
    useEffect(() => {
        const listener = ({action}) => {
            if (action === "POP") {
                handleBtnHome(false)
            }
        };
        return navigator.listen(listener);
    }, [navigator, handleBtnHome]);

    function handleBtnStart() {
        axios.post(props.SERVER + "/room/start/" + id, {myId: myId})
            .then();
    }

    function handleBtnRematch() {
        axios.post(props.SERVER + "/room/rematch/" + id, {myId: myId})
            .then();
    }

    function onSendMsg(msg) {
        axios.post(props.SERVER + "/room/msg/" + id, {msg: msg, from: myId})
            .then();
    }

    return (
        <div id={"roompage"} className={"page"}>
            {roomFull ?
                <>
                    <div className={"nav"}>View: <Link to="/">Home</Link> | <Link to="/stats">Stats</Link></div>
                    <h2>The room you're trying to join is full already!</h2>
                    <p>Go back to the <Link to="/">Home</Link> :)</p>
                </>
                :
                <>
                    <button onClick={() => {handleBtnHome(true);}} className={"cancel"}>Leave</button>

                    {Object.keys(gameInfo).length > 0 ?
                        <>
                            <h2>Room {gameInfo.name}</h2>
                            <h3>Player {gameInfo.myName.replace('player', '')} - Sign <span
                                className={gameInfo.myName}></span></h3>

                            <div className="columnContainer">
                                <div className="columnLeft">
                                    <div className="actionBar">
                                        {!gameInfo.full && !gameInfo.started && !gameInfo.finished && !gameInfo.closed && !gameInfo.aborted &&
                                            <p>Waiting for an opponent!</p>}
                                        {gameInfo.full && !gameInfo.started &&
                                            <button onClick={handleBtnStart} className={"start"}>Start</button>}
                                        {(gameInfo.finished || gameInfo.closed) && gameInfo.winner === '' &&
                                            <p>Game over: there is no winning!</p>}
                                        {gameInfo.winner !== '' &&
                                            <p>{gameInfo.winner === gameInfo.myName ? "You won! :D" : "You lost :/"}</p>}
                                        {gameInfo.finished && !gameInfo.closed &&
                                            <button onClick={handleBtnRematch} className={"rematch"}>Rematch</button>}
                                        {gameInfo.aborted && <p>This game was cancelled!</p>}
                                    </div>


                                    <Game SERVER={props.SERVER} myId={myId} roomId={id}
                                          myTurn={gameInfo.myTurn}
                                          values={gameInfo.values} myName={gameInfo.myName}
                                          victoryPos={gameInfo.victoryPos}
                                          started={gameInfo.started}
                                          finished={gameInfo.finished || gameInfo.closed || gameInfo.aborted}/>
                                </div>
                                <div className="columnRight">
                                    <Chat chat={props.chat} onSendMsg={onSendMsg}/>
                                </div>
                            </div>
                        </>
                        : ''}
                </>
            }
        </div>
    );
}