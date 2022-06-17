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
        <div id="chat">
            <h3>Chat</h3>

            <div id="msgContainer">
                {props.chat.map(message => (
                    <div key={message.timestamp}
                         className={'msg ' + (message.received ? 'left' : 'right')}>
                        <span className={'msgContent'}>
                            <span
                                className="date"><small>{new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}</small></span>
                            &nbsp;{message.msg}
                        </span>
                        <div className="clear"></div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <label>
                    <strong className={"medium"}>Message:&nbsp;</strong>
                    <input type="text" value={msg} onChange={handleMsgChange} required/>
                </label>
                <input type="submit" value="Send"/>
            </form>
        </div>
    );
}