import React, {useState} from "react";
import AddRoom from "./AddRoom";
import axios from "axios";
import RoomList from "./RoomList";

export default function Home(props) {
    const [addRoom, setAddRoom] = useState(false);

    function onAdd(room) {
        axios.post("http://localhost:4001/rooms", room)
            .then(response => {
                onCancel();
            });
    }

    function onCancel() {
        setAddRoom(false);
    }

    return (
        <>
            {!addRoom && <button onClick={() => setAddRoom(!addRoom)}>Add a room</button>}
            {addRoom && <AddRoom onAdd={onAdd} onCancel={onCancel}/>}
            <RoomList server={props.server}/>
        </>
    );
}