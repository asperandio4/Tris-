import React from "react";

export default function RoomBlock(props) {
    const ME = false;

    function handleBtnJoin() {
        window.location.href = "/room/" + props.room._id;
    }

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