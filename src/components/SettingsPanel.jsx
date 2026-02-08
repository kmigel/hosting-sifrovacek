import React, { useState, useRef, useEffect } from 'react'
import api from '../services/api';

function SettingsPanel({gameId}) {
    let[game, setGame] = useState(null);
    let[state, setState] = useState(null);
    
    useEffect(() => {
        getGame();
    }, [gameId]);

    useEffect(() => {
        if(game !== null) {
            setState(game.state);
        }
    }, [game]);

    async function getGame() {
        try {
            let res = await api.get(`/game/${gameId}`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to get game:", err);
        }
    }
    
    async function startGame() {
        try {
            let res = await api.post(`/game/${gameId}/start`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to start game:", err);
        }
    }

    async function endGame() {
        try {
            let res = await api.post(`/game/${gameId}/end`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to end game:", err);
        }
    }

    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Settings</h2>
            </div>

            <div class='settings'>
                {state === "pending" && (
                    <div className='row'>
                        <button className='delete' onClick={startGame}>Start game</button>
                    </div>
                )}

                {state === "active" && (
                    <div className='row'>
                        <h3>Game is running</h3>
                        <button className='delete' onClick={endGame}>End game</button>
                    </div>
                )}

                {state === "finished" && (
                    <h3>Game is already finished</h3>
                )}
            </div>
        </section>
    );
}

export default SettingsPanel;