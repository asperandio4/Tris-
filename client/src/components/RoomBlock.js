import React from "react";
import {Link} from "react-router-dom";

export default function RoomBlock(props) {
    const ME = 0;

    return (
        <div>
            <h3>{props.name}</h3>
            <p>Starting player: {props.player == ME ? 'Opponent' : 'Me'}</p>
            <Link to={"/room/" + props.id} className="button">Join!</Link>
        </div>
    );
}