import React, { useState, useRef, useEffect } from 'react'
import TeamCard from "./TeamCard";
import api from '../services/api';

function TeamsPanel({gameId}) {
    let [teams, setTeams] = useState([]);
    let [allTeams, setAllTeams] = useState([]);
    let [showAssign, setShowAssign] = useState(false);
    let [error, setError] = useState("");

    useEffect(() => {
        if(!showAssign) return;
        function handleKeyDown(e) {
            if(e.key === "Escape") {
                setShowAssign(false);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [showAssign]);
    
    useEffect(() => {
        getTeams();
        getAllTeams();
    }, []);

    async function getAllTeams() {
        try {
            let res;
            res = await api.get(`/team`);
            let data = res.data;
            setAllTeams(data);
        } catch(err) {
            console.error("Failed to get teams:", err);
        }
    }

    async function getTeams() {
        try {
            let res;
            res = await api.get(`/game/${gameId}/teams`);
            let data = res.data;
            setTeams(data);
        } catch(err) {
            console.error("Failed to get teams:", err);
        }
    }

    async function assignTeam(teamId) {
        try {
            await api.post(`/game/${gameId}/teams/${teamId}`);
            await getTeams();
        } catch(err) {
            console.error("Failed to assign team:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function removeTeam(teamId) {
        try {
            await api.delete(`/game/${gameId}/teams/${teamId}`);
            await getTeams();
        } catch(err) {
            console.error("Failed to remove team:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    let renderTeamRow = (team) => {
        let assigned = teams.some(t => t.id === team.id);
        return (
            <div key={team.id} className='assign-row'>
                <span>{team.name} ({team.login})</span>
                {assigned ? 
                    <button className='edit-btn' onClick={() => removeTeam(team.id)}>
                        Remove
                    </button>
                    :
                    <button onClick={() => assignTeam(team.id)}>
                        Add
                    </button>
                }
            </div>
        );
    }

    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Teams</h2>
                <div className='panel-actions'>
                    <button className='add-btn' onClick={() => setShowAssign(true)}>
                        Edit Teams
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <p className='empty'>No teams assigned to this game yet.</p>
                ) : (
                <div className='card-grid'>
                    {teams.map((team) => (
                        <TeamCard
                        key={team.id}
                        team={team}
                        onEdit={null}
                        onDelete={() => removeTeam(team.id)}
                        />
                    ))}
                </div>
            )}

            {showAssign && (
                <div className="window-backdrop" onClick={() => setShowAssign(false)}>
                    <div className="window assign-window" onClick={e => e.stopPropagation()}>
                        <h3>Assign or Remove Teams</h3>
                        <div className="assign-list">
                            {allTeams.map(renderTeamRow)}
                        </div>
                        <div className="actions">
                            <button className="cancel-btn" onClick={() => setShowAssign(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}


            {error && <p className="error">{error}</p>}
        </section>
    );
}

export default TeamsPanel;