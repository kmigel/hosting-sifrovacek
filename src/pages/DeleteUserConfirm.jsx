function DeleteUserConfirm({user, onCancel, onConfirm, error}) {
    return (
        <div className="window-backdrop" onClick={onCancel}>
          <div className="window" onClick={(e) => e.stopPropagation()}>
            <h3>Delete user?</h3>
            <p>
              Are you sure you want to delete <strong>{user.name}</strong>?
            </p>

            <div className="row">
              <button className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button className="delete-btn" onClick={onConfirm}>
                Delete
              </button>
            </div>

            {error !== "" && <p className="error">{error}</p>}
          </div>
        </div>
    );
}

export default DeleteUserConfirm;