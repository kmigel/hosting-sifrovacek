import TeamCard from "./TeamCard";

function TeamsPanel({teams, onAdd, onEdit, onDelete}) {
    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Teams</h2>
                <div className='panel-actions'>
                    <button className='add-btn' onClick={onAdd}>
                    + Add Team
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <p className='empty'>No teams yet — add your first team.</p>
                ) : (
                <div className='card-grid'>
                    {teams.map((t) => (
                        <TeamCard
                        key={t.id}
                        team={t}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default TeamsPanel;