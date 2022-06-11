import React from "react";
import axios from "axios";

export default function Game(props) {
    const ELEMENTS_PER_ROW = 3;

    const valuesToPrint = [];
    let row = -1;
    props.values.forEach((v, i) => {  //fill the valuesToPrint bi-dimensional array
        if (i % ELEMENTS_PER_ROW === 0) {
            row++;
            valuesToPrint[row] = [];
        }
        valuesToPrint[row].push(v);
    })

    function handleBtnMark(i, j, val) {
        if (props.started && !props.finished && props.myTurn && val === 2) { //only if it's a valid in-game move
            let index = i * ELEMENTS_PER_ROW + j;
            axios.post("http://localhost:4001/room/action/" + props.roomId,
                {myId: props.myId, index: index})
                .then();
        }
    }

    /* Determines if the button to paint is one of those that led a player to victory*/
    function determineIfWinningPos(i, j) {
        const row = 'Row ';
        const column = 'Column ';
        const mainDiag = 'Main Diagonal';
        const secondDiag = 'Secondary Diagonal';

        if (props.victoryPos.startsWith(row)) {
            return i + 1 === parseInt(props.victoryPos.substring(row.length));  // 1 based
        } else if (props.victoryPos.startsWith(column)) {
            return j + 1 === parseInt(props.victoryPos.substring(column.length));  // 1 based
        } else if (props.victoryPos === mainDiag) {
            return i === j;
        } else if (props.victoryPos === secondDiag) {
            return i + j === ELEMENTS_PER_ROW - 1;
        }
    }

    return (
        <div id={"game"}>
            {props.started && !props.finished &&
                (props.myTurn ? <p className={"myTurn"}>It's your turn!</p> :
                    <p className={"opponentTurn"}>It's the opponent's turn!</p>)
            }

            <table className={props.started && props.myTurn && !props.finished ? props.myName : ''}>
                <tbody>
                {valuesToPrint.map((row, i) => (
                    <tr key={i}>
                        {Object.values(row).map((val, j) => (
                            <td key={i + '' + j}>
                                <button onClick={() => handleBtnMark(i, j, val)}
                                        className={(val === 2 ? 'empty' : ('player' + val)) + (determineIfWinningPos(i, j) ? ' highlighted' : '')}></button>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}