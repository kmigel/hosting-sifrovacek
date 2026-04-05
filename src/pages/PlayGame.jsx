import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useOutletContext} from "react-router-dom";
import api from '../services/api';

function PlayGame() {
    const {user} = useOutletContext();
    let inputRef = useRef(null);
    let teamId = user.id;
    let { gameId } = useParams();
    let navigate = useNavigate();

    let[status, setStatus] = useState("loading");
    let[game, setGame] = useState(null);
    let[cipher, setCipher] = useState(null);
    let[index, setIndex] = useState(0);
    let[total, setTotal] = useState(null);

    let [answer, setAnswer] = useState("");
    let [hints, setHints] = useState([]);
    let [score, setScore] = useState(0);
    let [points, setPoints] = useState(0);
    let [orderedHints, setOrderedHints] = useState(null);

    let[error, setError] = useState("");

    useEffect(() => {
        getGame();
        getCurrent();
    }, [gameId]);

    useEffect(() => {
        if(cipher && inputRef.current) {
            inputRef.current.focus();
        }
    }, [cipher])

    async function getGame() {
        try {
            let res = await api.get(`/game/${gameId}`);
            setGame(res.data);
            setOrderedHints(res.data.ordered_hints);
        } catch(err) {
            console.error("Failed to get game:", err);
            navigate("/dashboard");
        }
    }

    async function getCurrent() {
        try {
            setStatus("loading");

            let totalCiphers = total;
            if(totalCiphers === null) {
                let res = await api.get(`/cipher/${gameId}/total`);
                totalCiphers = res.data.total;
                setTotal(totalCiphers);
            }

            let res = await api.get(`/game/${gameId}/team/${teamId}/current`);
            let cur = res.data.current;
            setIndex(cur);
            if(cur > totalCiphers) {
                setCipher(null);
                setStatus("done");
            }
            else {
                setCipher(res.data);
                setHints(res.data.hints || []);
                setStatus("playing");

                let maxPoints = res.data.points;
                for(let hint of res.data.hints) {
                    if(hint.unlocked) {
                        maxPoints -= hint.cost;
                    }
                }
                setPoints(maxPoints);
            }
        } catch(err) {
            console.error("Failed to get cipher:", err);
        }
    }

    async function previewPdf() {
        try {
            let res = await api.get(`/cipher/${cipher.id}/pdf`, {responseType: "blob"});
            let blob = new Blob([res.data], {type: "application/pdf"});
            let url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch(err) {    
            console.error("Failed to preview PDF", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function submitAnswer() {
        if(!answer) return;
        try {
            await api.post(`/game/${gameId}/team/${teamId}/answer`, {answer});
            setAnswer("");
            setError("");
            await getCurrent();
        } catch(err) {
            console.error("Failed to submit answer", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function unlockHint(hintId) {
        try {
            await api.post(`/game/${gameId}/team/${teamId}/hint/${hintId}`);
            await getCurrent();
        } catch(err) {
            console.error("Failed to unlock hint", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    return (
        <div className="page-wrapper">
            <header className='header'>
                <button className='back-btn' onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>
                <h1>{game ? game.title : "Loading..."}</h1>
                {cipher && <p>Cipher {index} of {total}</p>}
            </header>

            <section className='window-backdrop play-panel'>
                {(game?.state === "pending") ? (
                    <h3>Game hasn't started yet</h3>
                ) : (game?.state === "finished") ? (
                    <h3>Game has ended</h3>
                ) : status === "done" ? (
                    <h3>You solved everything!</h3>
                ) : status === "loading" ? (
                    <h3>Loading...</h3>
                ) : (
                    <div className='window'>
                        <h2>{cipher.name}</h2>
                        <span>
                            Points for solving: {points} / {cipher.points}
                        </span>
                        <button className='cancel-btn' onClick={() => previewPdf()}> View PDF</button>
                        
                        <input
                            ref={inputRef}
                            placeholder="Your answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <button type='submit' onClick={submitAnswer}>Submit</button>
                        {error != "" && <p className="error">{error}</p>}

                        <div className='hints-section'>
                            {console.log(hints[0])}
                            <h2>Hints:</h2>
                            {hints.length === 0 && <p>No hints available</p>}
                            {hints.map((hint, pos) => {
                                let prev = pos === 0 || hints[pos - 1].unlocked;
                                let canUnlock = !orderedHints || prev;

                                return (
                                    <div key={hint.id} className='hint-card'>
                                        <h3>Hint {pos + 1}</h3>
                                        <p>{hint.content}</p>
                                        <p>Cost: {hint.cost}</p>
                                        {!hint.unlocked && (
                                            <button
                                                disabled={!canUnlock}
                                                title={!canUnlock ? "Unlock previous hint first" : ""}
                                                onClick={() => unlockHint(hint.id)}
                                            >
                                                Unlock Hint
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default PlayGame;