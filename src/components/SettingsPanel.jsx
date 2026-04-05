import React, { useState, useRef, useEffect } from 'react'
import api from '../services/api';

function SettingsPanel({gameId}) {
    let [game, setGame] = useState(null);
    let [error, setError] = useState("");
    
    useEffect(() => {
        getGame();
    }, [gameId]);
    
    async function getGame() {
        try {
            let res = await api.get(`/game/${gameId}`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to get game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function startGame() {
        try {
            let res = await api.post(`/game/${gameId}/start`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to start game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function endGame() {
        try {
            let res = await api.post(`/game/${gameId}/end`);
            setGame(res.data);
        } catch(err) {
            console.error("Failed to end game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function toggleOrderedHints() {
        try {
            let res = await api.patch(`/game/${gameId}/hints`, {
                orderedHints: !game.ordered_hints
            });
            setGame(res.data);
        } catch(err) {
            console.error("Failed to update settings:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    if (!game) return null;
    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Settings</h2>
            </div>

            <div class='card-grid'>
                <div className='card'>
                    <h3>Game State</h3>
                    {game.state === "pending" && (
                        <button onClick={startGame}>Start game</button>
                    )}
                    {game.state === "active" && (
                        <div className='row'>
                            <span>Game is running</span>
                            <button className='delete-btn' onClick={endGame}>
                                End game
                            </button>
                        </div>
                    )}
                    {game.state === "finished" && (
                        <h3>Game finished</h3>
                    )}
                </div>

                <div className='card'>
                    <h3>Hints</h3>
                    <div className='row'>
                        <span>Unlock hints in order</span>
                        <button className="edit-btn" onClick={toggleOrderedHints}>
                            {game.ordered_hints ? "ON" : "OFF"}
                        </button>
                    </div>
                    <p className='empty'>
                        {game.ordered_hints
                            ? "Players must unlock hints sequentially."
                            : "Players can unlock hints in any order."}
                    </p>
                </div>
            </div>

            {error != "" && <p className="error">{error}</p>}
        </section>
    );
}

export default SettingsPanel;