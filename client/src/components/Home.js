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
                axios.post("http://localhost:4001/room/join/" + response.data._id, {myId: props.myId})
                    .then(r => window.location.href = "/room/" + response.data._id);
            });
    }

    function onCancel() {
        setAddRoom(false);
    }

    return (
        <>
            {!addRoom && <button onClick={() => setAddRoom(!addRoom)}>Create room</button>}
            {addRoom && <AddRoom onAdd={onAdd} onCancel={onCancel}/>}
            <RoomList myId={props.myId} availableRooms={props.availableRooms}/>
        </>
    );
}