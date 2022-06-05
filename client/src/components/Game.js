import React from "react";
import axios from "axios";

export default function Game(props) {
    const ELEMENTS_PER_ROW = 3;

    const valuesToPrint = [];
    let row = -1;
    props.values.forEach((v, i) => {
        if (i % ELEMENTS_PER_ROW === 0) {
            row++;
            valuesToPrint[row] = [];
        }
        valuesToPrint[row].push(v);
    })

    function handleBtnMark(i, j, val) {
        if (props.myTurn && val === 2) {
            let index = i * ELEMENTS_PER_ROW + j;
            axios.post("http://localhost:4001/room/action/" + props.roomId,
                {myId: props.myId, index: index})
                .then();
        }
    }

    return (
        <>
            {props.myTurn && <p>It's your turn!</p>}
            <table>
                <tbody>
                {valuesToPrint.map((row, i) => (
                    <tr key={i}>
                        {Object.values(row).map((val, j) => (
                            <td key={i + '' + j}>
                                <button onClick={() => handleBtnMark(i, j, val)}>{val === 2 ? '-' : val}</button>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
}