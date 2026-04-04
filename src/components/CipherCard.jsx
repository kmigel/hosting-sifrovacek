import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
function CipherCard({
    cipher,
    solution,
    showSolution,
    onToggleSolution,
    onPreview,
    onDelete,
    onEdit,
    onManageHints,
    state
}) {
    let {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({id: cipher.id});

    let style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab"
    };

    return (
        <div
            className="card"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <h3 className="name">
                {cipher.position}. {cipher.name}
            </h3>

            <div className="data">
                <div className="row monospace">
                    <span className="label">Points:</span>
                    <span>{cipher.points}</span>
                </div>
            </div>

            <div className="data">
                <div className="row">
                    <span className="label">Solution:</span>
                    <button onClick={(e) => {e.stopPropagation(); onToggleSolution(cipher.id)}}>
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
                <button onClick={(e) => {e.stopPropagation(); onPreview()}}>
                    Preview
                </button>
                <button disabled={state !== "pending"}
                    onClick={(e) => {e.stopPropagation(); onManageHints(cipher)}}>
                    Hints
                </button>
            </div>
            <div className="actions">
                <button className="edit-btn" onClick={(e) => {e.stopPropagation(); onEdit(cipher)}}>
                    Edit
                </button>
                <button disabled={state !== "pending"} className="delete-btn" onClick={(e) => {e.stopPropagation(); onDelete(cipher.id)}}>
                    Delete
                </button>
            </div>
        </div>
    );
}

export default CipherCard;