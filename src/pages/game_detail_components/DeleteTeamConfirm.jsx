function DeleteTeamConfirm({team, onCancel, onConfirm}) {
    return (
        <div className="window-backdrop" onClick={onCancel}>
          <div className="window" onClick={(e) => e.stopPropagation()}>
            <h3>Delete team?</h3>
            <p>
              Are you sure you want to delete <strong>{team.name}</strong>?
            </p>

            <div className="window-actions">
              <button className="cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="delete" onClick={onConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
    );
}

export default DeleteTeamConfirm;