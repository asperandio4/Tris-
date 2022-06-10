import React from "react";
import RoomBlock from "./RoomBlock";

export default function RoomList(props) {
    return (
        <div id={"roomList"}>
            <h3>Available rooms: <span>{props.availableRooms.length}</span></h3>

            {props.availableRooms.length > 0 &&
                <div id={"roomContainer"}>
                    {props.availableRooms.map(item => (
                        <RoomBlock key={item._id} room={item} myId={props.myId}/>))}
                </div>
            }
            {!props.availableRooms.length && <p>No rooms found, create one to start a game!</p>}
        </div>
    );
}