function GameForm({
      formTitle,
      title,
      onTitleChange,
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
                placeholder="Game title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
  
              <div className="actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editing ? "Edit" : formTitle}
                </button>
              </div>
  
              {error != "" && <p className="error">{error}</p>}
            </form>
          </div>
      );
  }
  
  export default GameForm;