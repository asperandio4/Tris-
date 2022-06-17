import React, {useState} from "react";
import AddRoom from "./AddRoom";
import axios from "axios";
import RoomList from "./RoomList";
import {useNavigate} from "react-router-dom";

export default function Home(props) {
    const [addRoom, setAddRoom] = useState(false);
    const navigate = useNavigate();

    /* On room creation send the user to the newly created room */
    function onAdd(room) {
        axios.post(props.SERVER + "/rooms", room)
            .then(response => {
                onCancel();
                navigate("/room/" + response.data._id);
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