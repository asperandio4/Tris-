import React from "react";
import axios from "axios";

export default function RoomBlock(props) {
    const ME = 0;

    function handleBtnJoin() {
        axios.post("http://localhost:4001/room/join/" + props.room._id, null)
            .then(r => window.location.href = "/room/" + props.room._id);
    }

    return (
        <div>
            <h3>{props.room.name}</h3>
            <p>Starting player: {props.room.player == ME ? 'Opponent' : 'Me'}</p>
            {props.room.playerCount == 1 && <button onClick={handleBtnJoin}>Join!</button>}
        </div>
    );
}