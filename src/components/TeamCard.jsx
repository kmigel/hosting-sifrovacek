import React, {useState} from "react";

function TeamCard({team, onEdit, onDelete}) {
    let[showMembers, setShowMembers] = useState(false);

    return (
        <div className='card'>
            <h3 className="team-name">{team.name}</h3>

            <div className="data">
                <div className="row">
                    <span className="label">Login</span>
                    <span className="value">{team.login}</span>
                </div>
                {team.members && team.members.length > 0 && (
                    <div>
                        <div className="row">
                            <span className="label">Members:</span>
                            <button
                                type="button"
                                className="edit-btn"
                                onClick={() => setShowMembers(!showMembers)}
                            >
                                {showMembers ? "Hide" : "Show"}
                            </button>
                        </div>
                        {showMembers && (
                            <ul className="members-list">
                                {team.members.map((m, i) => (
                                <li key={i}>{i + 1 < team.members.length ? `${m}, ` : m}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className='actions'>
            <button className='edit-btn' onClick={() => onEdit(team)}>
                Edit
            </button>
            <button className='delete-btn' onClick={() => onDelete(team)}>
                Delete
            </button>
            </div>
        </div>
    );
}

export default TeamCard;