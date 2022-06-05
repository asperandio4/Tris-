import React, {useState} from "react";

export default function Chat(props) {
    const EMPTY_MSG = '';
    const [msg, setMsg] = useState(EMPTY_MSG);

    function handleMsgChange(event) {
        setMsg(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        props.onSendMsg(msg);
        clearForm();
    }

    function clearForm() {
        setMsg(EMPTY_MSG);
    }

    return (
        <div>
            {props.chat.map(message => (
                <p key={message.timestamp}
                   className={message.received ? 'left' : 'right'}>{new Date(message.timestamp).toLocaleTimeString()}
                    &nbsp;{message.received ? '<-' : '->'}&nbsp;{message.msg}</p>
            ))}

            <form onSubmit={handleSubmit}>
                <label>
                    Message:
                    <input type="text" value={msg} onChange={handleMsgChange} required/>
                </label>
                <br/>
                <input type="submit" value="Submit"/>
            </form>
        </div>
    );
}