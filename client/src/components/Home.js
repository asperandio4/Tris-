import React, {useState} from "react";
import AddRoom from "./AddRoom";
import axios from "axios";
import RoomList from "./RoomList";

export default function Home(props) {
    const [addRoom, setAddRoom] = useState(false);

    /* On room creation send the user to the newly created room */
    function onAdd(room) {
        axios.post("http://localhost:4001/rooms", room)
            .then(response => {
                onCancel();
                window.location.href = "/room/" + response.data._id;
            });
    }

    function onCancel() {
        setAddRoom(false);
        document.body.style.overflow = "auto";
    }

    function handleBtnCreate() {
        document.body.style.overflow = "hidden";
        setAddRoom(true);
    }

    return (
        <div id={"home"}>
            <button onClick={handleBtnCreate}>Create room</button>
            {addRoom && <AddRoom onAdd={onAdd} onCancel={onCancel}/>}
            <RoomList myId={props.myId} availableRooms={props.availableRooms}/>
        </div>
    );
}