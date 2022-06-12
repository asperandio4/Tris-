import React from "react";
import {useNavigate} from "react-router-dom";

export default function RoomBlock(props) {
    const navigate = useNavigate();
    const ME = false;

    function handleBtnJoin() {
        navigate("/room/" + props.room._id);
    }

    /* Determines the starting player based on the room starting position and the room empty spot */
    function getStartingPlayer() {
        let startingPlayer;
        if (props.room.player === ME) {
            startingPlayer = props.room.player0 !== '' ? 'Opponent' : 'Me';
        } else {
            startingPlayer = props.room.player0 !== '' ? 'Me' : 'Opponent';
        }
        return startingPlayer;
    }


    return (
        <div className={"roomBlock"}>
            <h4>{props.room.name}</h4>
            <p>Starting player: {getStartingPlayer()}</p>
            {props.room.playerCount === 1 && <button onClick={handleBtnJoin}>Join!</button>}
        </div>
    );
}