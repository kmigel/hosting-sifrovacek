function generatePassword(len = 5) {
  return Math.random().toString(36).slice(-len);
}

function UserForm({
    formTitle,
    name,
    login,
    password,
    onNameChange,
    onLoginChange,
    onPasswordChange,
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

            {!editing && 
              <input
              ref={inputRef}
                placeholder="Login"
                value={login}
                onChange={(e) => onLoginChange(e.target.value)}
              />
            }

            <input
              ref={editing ? inputRef : null}
              placeholder="Name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />

            <div className="row">
              <input
                placeholder="Password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
              <button
                type="button"
                onClick={() => onPasswordChange(generatePassword())}
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
                {editing ? "Edit" : formTitle}
              </button>
            </div>

            {error != "" && <p className="error">{error}</p>}
          </form>
        </div>
    );
}

export default UserForm;