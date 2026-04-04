import HintCard from "./HintCard";

function HintsPanel({
    name,
    hints,
    content,
    setContent,
    cost,
    setCost,
    onAdd,
    onDelete,
    onEdit,
    onClose,
    inputRef,
    error,
}) {
    return (
        <div className="window-backdrop" onClick={onClose}>
            <div
                className="window"
                style={{ width: "800px", maxHeight: "85vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Hints - {name}</h3>

                <div className="hint-grid">
                    {hints.length === 0 ? (
                        <p className="empty">No hints yet</p>
                    ) : (
                        hints.map(hint => (
                            <HintCard
                                key={hint.id}
                                hint={hint}
                                onDelete={onDelete}
                                onEdit={onEdit}
                            />
                        ))
                    )}
                </div>

                <div className="manage-hint">
                    <h4>Add hint</h4>

                    <textarea
                        placeholder="Hint content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        ref={inputRef}
                    />

                    <div className="row">
                        <input
                            type="number"
                            placeholder="Cost"
                            value={cost}
                            onChange={(e) => setCost(Number(e.target.value))}
                        />
                        <button className="submit-btn" onClick={onAdd}>
                            Add
                        </button>
                    </div>
                </div>

                <div className="actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

export default HintsPanel;