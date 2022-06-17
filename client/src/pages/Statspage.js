import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";

export default function Statspage(props) {
    const [playedGames, setPlayedGames] = useState(0);
    const [abortedGames, setAbortedGames] = useState(0);
    const [meanMoves, setMeanMoves] = useState(0);
    const [meanRematches, setMeanRematches] = useState(0);
    const [starterWins, setStarterWins] = useState(0);
    const [opponentWins, setOpponentWins] = useState(0);
    const [victoryPosition, setVictoryPosition] = useState('');
    const [loaded, setLoaded] = useState(false);

    //on first render asks stats data to the server
    useEffect(() => {
        axios.get(props.SERVER + "/read-stats").then(stats => {
            setPlayedGames(stats.data.playedGames);
            setAbortedGames(stats.data.abortedGames);
            setMeanMoves(stats.data.meanMoves);
            setMeanRematches(stats.data.meanRematches);
            setStarterWins(stats.data.winningPlayer.starter);
            setOpponentWins(stats.data.winningPlayer.opponent);
            setVictoryPosition(stats.data.victoryPosition);
            setLoaded(true);
        });
    }, [props.SERVER]);

    return (
        <div id={"statspage"} className={"page"}>
            <div className={"nav"}>View: <Link to="/">Home</Link></div>
            <h2>Stats</h2>

            {loaded ?
                <div>
                    <span>Played games: <strong>{playedGames}</strong></span><br/>
                    <span>Aborted games: <strong>{abortedGames}</strong></span><br/>
                    <span>Mean moves per game: <strong>{meanMoves.toFixed(2)}</strong></span><br/>
                    <span>Mean rematches per game: <strong>{meanRematches.toFixed(2)}</strong></span><br/>
                    <span>Most winning player: <strong>{starterWins > opponentWins ? "Starter" : "Opponent"}</strong></span>&nbsp;(<small>
                    <span>Starter: <strong>{starterWins}</strong></span>&nbsp;-&nbsp;
                    <span>Opponent: <strong>{opponentWins}</strong></span></small>)<br/>
                    <span>Most winning position: <strong>{victoryPosition}</strong></span><br/>
                </div>
                : ''}
        </div>
    );
}