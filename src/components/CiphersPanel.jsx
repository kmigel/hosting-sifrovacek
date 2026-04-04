import React, { useState, useRef, useEffect } from 'react'
import {DndContext, closestCenter, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, rectSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import {restrictToParentElement} from "@dnd-kit/modifiers";
import api from '../services/api';
import CipherCard from './CipherCard';
import CipherForm from './CipherForm';
import DeleteConfirm from './DeleteConfirm';
import HintsPanel from './HintsPanel';

function CiphersPanel({gameId}) {
    let inputRef = useRef(null);
    let [state, setState] = useState(null);
    let [ciphers, setCiphers] = useState([]);
    let [solutions, setSolutions] = useState({});
    let [visible, setVisible] = useState({});

    let [addCipher, setAddCipher] = useState(false);
    let [editCipher, setEditCipher] = useState(null);
    let [deletedCipher, setDeletedCipher] = useState(null);

    let [name, setName] = useState("");
    let [solution, setSolution] = useState("");
    let [pdf, setPdf] = useState(null);

    let [selectedCipher, setSelectedCipher] = useState(null);
    let [hints, setHints] = useState([]);
    let [content, setContent] = useState("");
    let [cost, setCost] = useState(0);

    let [error, setError] = useState("");

    useEffect(() => {
        getCiphers();
        getGameState();
    }, [gameId]);

    useEffect(() => {
        if((addCipher || editCipher || selectedCipher) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addCipher, editCipher, selectedCipher]);

    function cleanUp() {
        setAddCipher(false);
        setEditCipher(null);
        setDeletedCipher(null);
        setError("");
        setName("");
        setSolution("");
        setPdf(null);
        setSelectedCipher(null);
    }

    function cleanHints() {
        setContent("");
        setCost(0);
    }

    useEffect(() => {
        if(!addCipher && !editCipher && !deletedCipher && !selectedCipher) return;
    
        function handleKeyDown(e) {
            if(e.key === "Escape") {
                cleanUp();
            }
        }
    
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [addCipher, editCipher, deletedCipher, selectedCipher]);

    async function getGameState() {
        try {
            let res = await api.get(`/game/${gameId}`);
            setState(res.data.state);
        } catch(err) {
            console.error("Failed to get game:", err);
        }
    }

    async function getCiphers() {
        try {
            let res = await api.get(`/cipher/game/${gameId}`)
            let data = res.data;
            setCiphers(data);
        } catch(err) {
            console.error("Failed to get ciphers: ", err);
        }
    }

    async function toggleSolution(cipherId) {
        if(visible[cipherId]) {
            setVisible(s => ({...s, [cipherId]: false}));
            return;
        }

        if(!solutions[cipherId]) {
            try {
                let res = await api.get(`/cipher/${cipherId}/solution`);
                setSolutions(s => ({
                    ...s, [cipherId]: res.data.solution
                }));
            } catch(err) {
                console.error("Failed to get solution", err);
                return;
            }
        }
        setVisible(s => ({...s, [cipherId]: true}));
    }

    async function createCipher() {
        try {
            let formData = new FormData;
            formData.append("name", name);
            formData.append("solution", solution);
            formData.append("pdf", pdf);
            
            await api.post(`/cipher/${gameId}`, formData, {
                headers: {"Content-Type": "multipart/form-data"}
            });

            await getCiphers();
            cleanUp();
        } catch(err) {
            console.error("Failed to create cipher", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function deleteCipher(id) {
        try {
            await api.delete(`/cipher/${id}`);
            getCiphers();
            cleanUp();
        } catch(err) {
            console.log("Failed to delete cipher:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function updateCipher(id) {
        try {
            let formData = new FormData();
            if(name) formData.append("name", name);
            if(solution) formData.append("solution", solution);
            if(pdf) formData.append("pdf", pdf);

            let res = await api.patch(`/cipher/${id}`, formData, {
                headers: {"Content-Type": "multipart/form-data"}
            });
            
            setSolutions(s => ({ ...s, [id]: res.data.solution }));
            setVisible(s => ({ ...s, [id]: false }))

            await getCiphers();
            cleanUp();
        } catch(err) {
            console.log("Failed to update cipher:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function previewPdf(id) {
        try {
            let res = await api.get(`/cipher/${id}/pdf`, {responseType: "blob"});

            let blob = new Blob([res.data], {type: "application/pdf"});
            let url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch(err) {
            console.error("Failed to preview PDF", err);
            setError("Failed to open PDF");
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
        if(state !== "pending") return;
        let {active, over} = result;
        if(!over || active.id === over.id) return;

        let oldIndex = ciphers.findIndex(c => c.id === active.id);
        let newIndex = ciphers.findIndex(c => c.id === over.id);
        let reordered = arrayMove(ciphers, oldIndex, newIndex);
        
        setCiphers(
            reordered.map((c, index) => ({
                ...c,
                position: index + 1
            }))
        );

        try {
            await api.patch(`/game/${gameId}/cipher`, {
                order: reordered.map((c, index) => ({
                    id: c.id,
                    position: index + 1
                }))
            });
        } catch(err) {
            console.error("Failed to reorder:", err);
            getCiphers();
        }
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
            await api.post(`/cipher/${selectedCipher.id}/hints`, {
                content, cost
            });

            await getHints(selectedCipher.id);
            cleanHints();
        } catch(err) {
            console.error("Failed to create hint", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function updateHint(id, data) {
        try {
            await api.patch(`/cipher/hints/${id}`, data);
            await getHints(selectedCipher.id);
        } catch(err) {
            console.error("Failed to update hint:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function deleteHint(id) {
        try {
            await api.delete(`/cipher/hints/${id}`);
            getHints(selectedCipher.id);
        } catch(err) {
            console.log("Failed to delete hint:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Ciphers</h2>
                <span className='empty'>Drag and drop to reorder ciphers</span>
                <div className='panel-actions'>
                    <button disabled={state !== "pending"} className='add-btn' onClick={() => {setError(""); setAddCipher(true)}}>
                        Add Cipher
                    </button>
                </div>
            </div>

            {ciphers.length === 0 ? (
                <p className='empty'>No ciphers added to this game yet.</p>
            ) : (
                <DndContext
                    key={state}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    measuring={{ droppable: { strategy: "always" } }}
                    modifiers={[restrictToParentElement]}
                >
                    <SortableContext
                        items={ciphers.map(c => c.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className='card-grid'>
                            {ciphers.map(cipher => (
                                <CipherCard
                                key={cipher.id}
                                cipher={cipher}
                                solution={solutions[cipher.id]}
                                showSolution={!!visible[cipher.id]}
                                onToggleSolution={toggleSolution}
                                onPreview={() => previewPdf(cipher.id)}
                                onDelete={() => setDeletedCipher(cipher)}
                                onEdit={() => setEditCipher(cipher)}
                                onManageHints={async (cipher) => {
                                    await getHints(cipher.id);
                                    setSelectedCipher(cipher);
                                }}
                                state={state}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {addCipher && (
                <CipherForm
                    formTitle={"Add Cipher"}
                    name={name}
                    setName={setName}
                    solution={solution}
                    setSolution={setSolution}
                    pdf={pdf}
                    setPdf={setPdf}
                    onClose={cleanUp}
                    onSubmit={createCipher}
                    inputRef={inputRef}
                    error={error}
                    editing={false}
                />
            )}

            {editCipher && (
                <CipherForm
                formTitle={`Edit ${editCipher.name}`}
                name={name}
                setName={setName}
                solution={solution}
                setSolution={setSolution}
                pdf={pdf}
                setPdf={setPdf}
                onClose={cleanUp}
                onSubmit={() => updateCipher(editCipher.id)}
                inputRef={inputRef}
                error={error}
                editing={true}
            />
            )}

            {deletedCipher && (
                <DeleteConfirm
                    name={deletedCipher.name}
                    onCancel={() => cleanUp()}
                    onConfirm={() => deleteCipher(deletedCipher.id)}
                    error={error}
                />
            )}

            {selectedCipher && (
                <HintsPanel
                    name={selectedCipher.name}
                    hints={hints}
                    content={content}
                    setContent={setContent}
                    cost={cost}
                    setCost={setCost}
                    onAdd={createHint}
                    onDelete={deleteHint}
                    onEdit={updateHint}
                    onClose={() => {cleanUp(); setSelectedCipher(null)}}
                    inputRef={inputRef}
                    error={error}
                />
            )}

            {(error != "" && !addCipher && !deletedCipher && !editCipher && !selectedCipher)
                && <p className="error">{error}</p>}
        </section>
    );
}

export default CiphersPanel;