import React, {useState} from "react";

export default function AddRoom(props) {
    const EMPTY_NAME = '';
    const ME = 0;
    const OPPONENT = 1;
    const [name, setName] = useState(EMPTY_NAME);
    const [player, setPlayer] = useState(ME);

    function handleNameChange(event) {
        setName(event.target.value);
    }

    function handlePlayerChange(event) {
        setPlayer(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const formData = {
            name: name,
            player: player
        }
        props.onAdd(formData);
        clearForm();
    }

    function handleCancel(event) {
        event.preventDefault();
        props.onCancel();
        clearForm();
    }

    function clearForm() {
        setName(EMPTY_NAME);
    }

    function handleAddRoomClick(e) {
        if (e.currentTarget === e.target) {  //addRoomClicked, but not the form
            handleCancel(e);
        }
    }

    return (
        <div id={"addRoom"} onClick={handleAddRoomClick}>
            <form onSubmit={handleSubmit}>
                <h3>Create a room</h3>
                <div className="name">
                    <label>
                        <strong className={"medium"}>Name:&nbsp;</strong>
                        <input autoFocus type="text" value={name} onChange={handleNameChange} required/>
                    </label>
                </div>
                <div className="player">
                    <strong className={"medium"}>First player:&nbsp;</strong>
                    <label>
                        Me
                        <input type="radio" name="player" value={ME} defaultChecked={player === ME}
                               onChange={handlePlayerChange}/>
                    </label>
                    &nbsp;-&nbsp;
                    <label>
                        Opponent
                        <input type="radio" name="player" value={OPPONENT}
                               defaultChecked={player === OPPONENT} onChange={handlePlayerChange}/>
                    </label>
                </div>
                <div className={"buttonContainer"}>
                    <input type="submit" value="Submit" className={"start"}/>
                    <input type="button" value="Cancel" onClick={handleCancel} className={"cancel"}/>
                </div>
            </form>
        </div>
    );
}