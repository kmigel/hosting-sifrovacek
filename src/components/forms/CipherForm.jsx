function CipherForm({
    formTitle,
    name,
    setName,
    solution,
    setSolution,
    points,
    setPoints,
    pdf,
    setPdf,
    onClose,
    onSubmit,
    inputRef,
    error,
    editing
}) {
    return (
        <div className="window-backdrop" onClick={onClose}>
            <form
                className="window"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
                }}
            >
                <h3>{formTitle}</h3>

                {editing && (
                    <p className="empty">Leave field empty to keep the current one</p>
                )}

                <input
                    ref={inputRef}
                    placeholder="Cipher name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    placeholder="Solution"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                />

                <input
                    placeholder="Points"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                />

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdf(e.target.files[0])}
                />

                <div className="actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        {editing ? "Edit" : "Add"}
                    </button>
                </div>

                {error != "" && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

export default CipherForm;