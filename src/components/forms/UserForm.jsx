function generatePassword(len = 5) {
  return Math.random().toString(36).slice(-len);
}

function UserForm({
    formTitle,
    name,
    login,
    password,
    members = [],
    onNameChange,
    onLoginChange,
    onPasswordChange,
    onMembersChange,
    onClose,
    onSubmit,
    inputRef,
    error,
    editing
}) {
    function addMember() {
      onMembersChange([...members, ""]);
    }

    function updateMember(index, value) {
      let newMembers = [...members];
      newMembers[index] = value;
      onMembersChange(newMembers);
    }

    function removeMember(index) {
      const newMembers = [...members];
      newMembers.splice(index, 1);
      onMembersChange(newMembers);
    }

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

            {members && (
              <div className="members-section">
                <h4>Members</h4>
                {members.map((m, ind) => (
                  <div className="row" key={ind}>
                    <input
                      placeholder={`Member ${ind + 1}`}
                      value={m}
                      onChange={(e) => updateMember(ind, e.target.value)}
                    />
                    <button type="button" onClick={() => removeMember(ind)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addMember}>
                  + Add Member
                </button>
              </div>
            )}

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