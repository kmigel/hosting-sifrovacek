function CipherCard({
    cipher,
    solution,
    showSolution,
    onToggleSolution,
    onPreview,
    onDelete,
    onEdit
}) {
    return (
        <div className="card">
            <h3 className="name">
                {cipher.position}. {cipher.name}
            </h3>

            <div className="data">
                <div className="row">
                    <span className="label">Solution:</span>
                    <button onClick={() => onToggleSolution(cipher.id)}>
                        {showSolution ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <div className="data">
                <span className="value monospace">
                    {showSolution ? solution : "???"}
                </span>
            </div>

            <div className="actions">
                
                <button onClick={() => onPreview(cipher.id)}>
                    Preview PDF
                </button>
            </div>
            <div className="actions">
                <button className="edit-btn" onClick={() => onEdit(cipher)}>
                    Edit
                </button>
                <button className="delete-btn" onClick={() => onDelete(cipher.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
}

export default CipherCard;