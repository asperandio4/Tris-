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

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" value={name} onChange={handleNameChange} required/>
            </label>
            <br/>First player:
            <label>
                Me
                <input type="radio" name="player" value={ME} defaultChecked={player === ME}
                       onChange={handlePlayerChange}/>
            </label>
            <label>
                Opponent
                <input type="radio" name="player" value={OPPONENT}
                       defaultChecked={player === OPPONENT} onChange={handlePlayerChange}/>
            </label>
            <br/>
            <input type="submit" value="Submit"/>
            <input type="button" value="Cancel" onClick={handleCancel}/>
        </form>
    );
}