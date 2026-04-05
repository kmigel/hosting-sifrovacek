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
            setError("");
        } catch(err) {
            console.error("Failed to get game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function startGame() {
        try {
            let res = await api.post(`/game/${gameId}/start`);
            setGame(res.data);
            setError("");
        } catch(err) {
            console.error("Failed to start game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function endGame() {
        try {
            let res = await api.post(`/game/${gameId}/end`);
            setGame(res.data);
            setError("");
        } catch(err) {
            console.error("Failed to end game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function restartGame() {
        if(!window.confirm("Restart game? All progress will be lost.")) return;

        try {
            let res = await api.post(`/game/${gameId}/start?reset=true`);
            setGame(res.data);
            setError("");
        } catch(err) {
            console.error("Failed to restart game:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function toggleOrderedHints() {
        try {
            let res = await api.patch(`/game/${gameId}/hints`, {
                orderedHints: !game.ordered_hints
            });
            setGame(res.data);
            setError("");
        } catch(err) {
            console.error("Failed to update settings:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function toggleLeaderboard() {
        try {
            let res = await api.patch(`/game/${gameId}/leaderboard`, {
                show: !game.show_leaderboard
            });
            setGame(res.data);
            setError("");
        } catch(err) {
            console.error("Failed to update settings:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function toggleTimeOrder() {
        try {
            let res = await api.patch(`/game/${gameId}/time-order`, {
                enabled: !game.time_order
            });
            setGame(res.data);
            setError("");
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

            <div className='card-grid'>
                <div className='card'>
                    <h3>Game State</h3>
                    {game.state === "pending" && (
                        <button onClick={startGame}>Start game</button>
                    )}
                    {game.state === "active" && (
                        <div>
                            <p>Game is running</p>
                            <button className='delete-btn' onClick={endGame}>
                                End game
                            </button>
                        </div>
                    )}
                    {game.state === "finished" && (
                        <p>Game finished</p>
                    )}

                    {game.state !== "pending" && (
                        <div className='row'>
                            <button className='delete' onClick={restartGame}>
                                Restart game
                            </button>
                        </div>
                    )}
                </div>

                <div className='card'>
                    <h3>Hints</h3>
                    <div className='row'>
                        <p>Unlock hints in order</p>
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
                
                <div className='card'>
                    <h3>Leaderboard</h3>
                    <div className='row'>
                        <p>Make leaderboard public</p>
                        <button className="edit-btn" onClick={toggleLeaderboard}>
                            {game.show_leaderboard ? "ON" : "OFF"}
                        </button>
                    </div>
                </div>

                <div className='card'>
                    <h3>Order</h3>
                    <div className='row'>
                        <p>Order teams secondary by their time of submission</p>
                        <button className="edit-btn" onClick={toggleTimeOrder}>
                            {game.time_order ? "ON" : "OFF"}
                        </button>
                    </div>
                    <p className='empty'>
                        {game.time_order
                            ? "Teams with same points will be on same place."
                            : "Teams will be ordered by points and their time."}
                    </p>
                </div>
            </div>

            {error != "" && <p className="error">{error}</p>}
        </section>
    );
}

export default SettingsPanel;