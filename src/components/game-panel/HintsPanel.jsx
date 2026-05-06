import { useState, useEffect } from "react";
import {DndContext, closestCenter, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, rectSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import {restrictToParentElement} from "@dnd-kit/modifiers";
import api from "../../services/api";
import HintCard from '../cards/HintCard';

function HintsPanel({
    cipherId,
    name,
    onClose,
    inputRef,
}) {
    let [hints, setHints] = useState([]);
    let [content, setContent] = useState("");
    let [cost, setCost] = useState(0);
    
    let [error, setError] = useState("");

    useEffect(() => {
        getHints(cipherId);
    }, [cipherId]);

    function cleanUp() {
        setContent("");
        setCost(0);
        setError("");
    }

    async function getHints(cipherId) {
        try {
            let res = await api.get(`/cipher/${cipherId}/hints`);
            setHints(res.data);
        } catch(err) {
            console.error("Failed to get hints: ", err);
        }
    }

    async function createHint() {
        try {
            await api.post(`/cipher/${cipherId}/hints`, {
                content, cost
            });

            await getHints(cipherId);
            cleanUp();
        } catch(err) {
            console.error("Failed to create hint", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function updateHint(id, data) {
        try {
            await api.patch(`/cipher/hints/${id}`, data);
            await getHints(cipherId);
        } catch(err) {
            console.error("Failed to update hint:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function deleteHint(id) {
        try {
            await api.delete(`/cipher/hints/${id}`);
            getHints(cipherId);
        } catch(err) {
            console.log("Failed to delete hint:", err);
            setError(err.response?.data?.error || err.message);
        }
    }


    let sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6
            }
        })
    );

    async function handleDragEnd(result) {
        let {active, over} = result;
        if(!over || active.id === over.id) return;

        let oldIndex = hints.findIndex(h => h.id === active.id);
        let newIndex = hints.findIndex(h => h.id === over.id);
        let reordered = arrayMove(hints, oldIndex, newIndex);
        
        setHints(
            reordered.map((h, index) => ({
                ...h,
                position: index + 1
            }))
        );

        try {
            await api.patch(`/cipher/${cipherId}/hints`, {
                order: reordered.map((h, index) => ({
                    id: h.id,
                    position: index + 1
                }))
            });
        } catch(err) {
            console.error("Failed to reorder:", err);
            getHints();
        }
    }

    return (
        <div className="window-backdrop" onClick={onClose}>
            <div
                className="window"
                style={{ width: "800px", maxHeight: "85vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Hints - {name}</h3>

                {hints.length === 0 ? (
                        <p className="empty">No hints yet</p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        measuring={{ droppable: { strategy: "always" } }}
                        modifiers={[restrictToParentElement]}
                    >
                        <SortableContext
                            items={hints.map(h => h.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="hint-grid">
                                {hints.map(hint => (
                                    <HintCard
                                        key={hint.id}
                                        hint={hint}
                                        onDelete={deleteHint}
                                        onEdit={updateHint}
                                    />
                                ))}
                        </div>

                        </SortableContext>
                    </DndContext>
                )}

                <div className="manage-hint">
                    <h4>Add hint</h4>

                    <textarea
                        placeholder="Hint content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        ref={inputRef}
                    />

                    <div className="row">
                        <input
                            type="number"
                            placeholder="Cost"
                            value={cost}
                            onChange={(e) => setCost(Number(e.target.value))}
                        />
                        <button className="submit-btn" onClick={createHint}>
                            Add
                        </button>
                    </div>
                </div>

                <div className="actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>

                {(error != "") && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

export default HintsPanel;