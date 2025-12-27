function DeleteTeamConfirm({team, onCancel, onConfirm}) {
    return (
        <div className="window-backdrop" onClick={onCancel}>
          <div className="window" onClick={(e) => e.stopPropagation()}>
            <h3>Delete team?</h3>
            <p>
              Are you sure you want to delete <strong>{team.name}</strong>?
            </p>

            <div className="row">
              <button className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button className="delete-btn" onClick={onConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
    );
}

export default DeleteTeamConfirm;