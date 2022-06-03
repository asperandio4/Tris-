import React from "react";
import RoomBlock from "./RoomBlock";

export default function RoomList(props) {
    return (
        <div>
            <h3>Available rooms: {props.availableRooms.length}</h3>
            {props.availableRooms.length > 0 && props.availableRooms.map(item => (
                <RoomBlock key={item._id} room={item}/>))}
            {!props.availableRooms.length && <p>No rooms found, create one to start a game!</p>}
        </div>
    );
}