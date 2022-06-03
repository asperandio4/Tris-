import React, {useState} from "react";
import AddRoom from "./AddRoom";

export default function Home() {
    const [addRoom, setAddRoom] = useState(true); //TODO false

    function onAdd(room) {
        console.log("room added " + room.name + " - " + room.player)
    }

    function onCancel() {
        setAddRoom(false);
    }

    return (
        <>
            {!addRoom && <button onClick={() => setAddRoom(!addRoom)}>Add a room</button>}
            {addRoom && <AddRoom onAdd={onAdd} onCancel={onCancel}/>}
        </>
    );
}