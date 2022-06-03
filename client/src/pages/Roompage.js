import {useParams} from 'react-router-dom';
import React, {useState} from "react";
import axios from "axios";

export default function Roompage(props) {
    const {id} = useParams();

    const [name, setName] = useState('');

    axios.get("http://localhost:4001/room/" + id)
        .then(response => {
            setName(response.data.name);
        });

    function handleBtnHome() {
        axios.post("http://localhost:4001/room/leave/" + id, null)
            .then(r => window.location.href = "/");
    }

    return (
        <div className="container-fluid">
            <button onClick={handleBtnHome}>Leave</button>

            <h2>Room {name}</h2>
        </div>
    );
}