import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";
import RoomBlock from "./RoomBlock";

export default function RoomList(props) {
    const [response, setResponse] = useState([]);

    useEffect(() => {
        const socket = socketIOClient(props.server);
        socket.on("room_list", data => {
            console.log(data);
            setResponse(data);
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div>
            {response.map(item => (<RoomBlock key={item._id} id={item._id} name={item.name} player={item.player}/>))}
        </div>
    );
}