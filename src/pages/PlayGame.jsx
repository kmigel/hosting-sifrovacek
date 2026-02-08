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

    let[answer, setAnswer] = useState("");

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
                setStatus("playing");
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

    return (
        <div className="page-wrapper">
            <header className='header'>
                <button className='back-btn' onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>
                <h1>{game ? game.title : "Loading..."}</h1>
                <h1>{index}</h1>
            </header>

            <section className='window-backdrop play-panel'>
                {(game != null && game.state === "pending") ? (
                    <h3>Game hasn't started yet</h3>
                ) : (game != null && game.state === "finished") ? (
                    <h3>Game has ended</h3>
                ) : status === "done" ? (
                    <h3>You solved everything!</h3>
                ) : status === "loading" ? (
                    <h3>Loading...</h3>
                ) : (
                    <div className='window'>
                        <h3>{cipher.name}</h3>
                        <button className='cancel-btn' onClick={() => previewPdf()}> View PDF</button>
                        <input
                            ref={inputRef}
                            placeholder="Your answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <button type='submit' onClick={submitAnswer}>Submit</button>
                        {error != "" && <p className="error">{error}</p>}
                    </div>
                )}
            </section>
        </div>
    );
}

export default PlayGame;