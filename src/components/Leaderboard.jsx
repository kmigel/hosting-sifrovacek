import { useState, useEffect } from "react";
import api from "../services/api";

function Leaderboard({gameId}) {
    let [teams, setTeams] = useState([]);
    let [autoRefresh, setAutoRefresh] = useState(true);
    let [error, setError] = useState("");

    useEffect(() => {
        getTeams();
    }, [gameId]);

    useEffect(() => {
        if(!autoRefresh) return;
        let interval = setInterval(getTeams, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, gameId]);

    async function getTeams() {
        try {
            let res = await api.get(`/game/${gameId}/leaderboard`);
            setTeams(res.data);
        } catch(err) {
            console.error("Failed to load leaderboard", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    return (
        <section className='panel-teams'>
            <div className='leaderboard-header'>
                <h2>Leaderboard</h2>
                <div>
                    <span>Auto-refresh: </span>
                    <button className="edit-btn" onClick={() => setAutoRefresh(e => !e)}>
                        {autoRefresh ? "ON" : "OFF"}
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <p className="empty">No teams</p>
            ) : (
                <div className="leaderboard">
                    {teams.map(team => (
                        <div key={team.id} className="row">
                            <span>{team.rank}.</span>
                            <span>{team.name}</span>
                            <span>{team.score}</span>
                        </div>
                    ))}
                </div>
            )}

            {error != "" && <p className="error">{error}</p>}
        </section>
    );
}

export default Leaderboard;