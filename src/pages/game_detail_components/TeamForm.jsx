function TeamForm({
    formTitle,
    name,
    login,
    password,
    onNameChange,
    onLoginChange,
    onPasswordChange,
    onGeneratePassword,
    onClose,
    onSubmit,
    inputRef
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

            <input
              ref={inputRef}
              placeholder="Team name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />

            <input
              placeholder="Team login (optional)"
              value={login}
              onChange={(e) => onLoginChange(e.target.value)}
            />

            <div className="row">
              <input
                placeholder="Password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
              <button
                type="button"
                onClick={onGeneratePassword}
                className="gen-btn"
              >
                Generate
              </button>
            </div>

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {formTitle}
              </button>
            </div>
          </form>
        </div>
    );
}

export default TeamForm;