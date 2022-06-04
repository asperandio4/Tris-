import React from "react";
import axios from "axios";

export default function RoomBlock(props) {
    const ME = 0;

    function handleBtnJoin() {
        axios.post("http://localhost:4001/room/join/" + props.room._id, {myId: props.myId})
            .then(() => window.location.href = "/room/" + props.room._id);
    }

    let startingPlayer;
    if (props.room.player == ME) {
        startingPlayer = props.room.player0 != '' ? 'Opponent' : 'Me';
    } else {
        startingPlayer = props.room.player0 != '' ? 'Me' : 'Opponent';
    }

    return (
        <div>
            <h3>{props.room.name}</h3>
            <p>Starting player: {startingPlayer}</p>
            {props.room.playerCount == 1 && <button onClick={handleBtnJoin}>Join!</button>}
        </div>
    );
}