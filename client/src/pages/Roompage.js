import {useParams} from 'react-router-dom';
import React, {useState} from "react";
import axios from "axios";

export default function Roompage(props) {
    const {id} = useParams();
    const FULL = 1;

    const [name, setName] = useState('');
    const [roomFull, setRoomFull] = useState(false);

    //Everytime a player joins this is called
    axios.get("http://localhost:4001/room/" + id)
        .then(response => {
            setName(response.data.name);
            setRoomFull(response.data.status == FULL);
        });

    function handleBtnHome() {
        axios.post("http://localhost:4001/room/leave/" + id, {myId: props.myId})
            .then(() => window.location.href = "/");
    }

    function handleBtnStart() {
        axios.post("http://localhost:4001/room/start/" + id, {myId: props.myId})
            .then();
    }

    return (
        <div className="container-fluid">
            <button onClick={handleBtnHome}>Leave</button>
            {roomFull && !props.started && <button onClick={handleBtnStart}>Start</button>}
            {props.aborted && <p>This game was cancelled!</p>}

            <h2>Room {name}</h2>
        </div>
    );
}