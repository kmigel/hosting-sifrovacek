function TeamCard({team, onEdit, onDelete}) {
    return (
        <div className='card'>
            <h3 className="team-name">{team.name}</h3>

            <div className="data">
                <div className="row">
                    <span className="label">Login</span>
                    <span className="value">{team.login}</span>
                </div>
                <div className="row">
                    <span className="label">Password</span>
                    <span className="value monospace">{team.password}</span>
                </div>
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