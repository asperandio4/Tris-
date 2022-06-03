import {Link, useParams} from 'react-router-dom';
import React, {useState} from "react";
import axios from "axios";

export default function Roompage(props) {
    const {id} = useParams();

    const [name, setName] = useState('');

    axios.get("http://localhost:4001/room/" + id)
        .then(response => {
            setName(response.data.name);
        });

    return (
        <div className="container-fluid">
            <Link to="/" className="nav-link">Home</Link>

            <h2>Room {name}</h2>
        </div>
    );
}