import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function HintCard({ hint, onDelete, onEdit }) {
    let {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({ id: hint.id });

    let style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab"
    };

    let [editing, setEditing] = useState(false);
    let [content, setContent] = useState(hint.content);
    let [cost, setCost] = useState(hint.cost);

    return (
        <div
            className="card hint"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <h3 className="name">
                Hint {hint.position}
            </h3>

            <div className="data">
                <div className="row">
                    <span className="label">Cost:</span>
                    <span>{hint.cost}</span>
                </div>
            </div>

            <div className="data">
                {editing ? (
                    <>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(Number(e.target.value))}
                        />
                    </>
                ) : (
                    <span className="value">
                        {hint.content}
                    </span>
                )}
            </div>

            <div className="actions">
                {editing ? (
                    <>
                        <button onClick={async () => {
                            await onEdit(hint.id, {content, cost});
                            setEditing(false);
                        }}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="edit-btn"
                            onClick={() => setEditing(true)}
                        >
                            Edit
                        </button>
                        <button
                            className="delete-btn"
                            onClick={() => onDelete(hint.id)}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default HintCard;