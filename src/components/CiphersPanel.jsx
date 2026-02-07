import React, { useState, useRef, useEffect } from 'react'
import {DndContext, closestCenter, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, rectSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import {restrictToParentElement} from "@dnd-kit/modifiers";
import api from '../services/api';
import CipherCard from './CipherCard';
import CipherForm from './CipherForm';

function CiphersPanel({gameId}) {
    let inputRef = useRef(null);
    let [ciphers, setCiphers] = useState([]);
    let [solutions, setSolutions] = useState({});
    let [visible, setVisible] = useState({});

    let [addCipher, setAddCipher] = useState(false);
    let [editCipher, setEditCipher] = useState(null);
    let [deletedCipher, setDeletedCipher] = useState(null);

    let [name, setName] = useState("");
    let [solution, setSolution] = useState("");
    let [pdf, setPdf] = useState(null);

    let [error, setError] = useState("");

    useEffect(() => {
        getCiphers();
    }, [gameId]);

    useEffect(() => {
        if((addCipher || editCipher) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addCipher, editCipher]);

    function cleanUp() {
        setAddCipher(false);
        setEditCipher(null);
        setDeletedCipher(null);
        setError("");
        setName("");
        setSolution("");
        setPdf(null);
    }

    useEffect(() => {
        if(!addCipher && !editCipher && !deletedCipher) return;
    
        function handleKeyDown(e) {
            if(e.key === "Escape") {
                cleanUp();
            }
        }
    
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [addCipher, editCipher, deletedCipher]);

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
            await api.put(`/cipher/${gameId}/reorder`, {
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

    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Ciphers</h2>
                <span className='empty'>Drag and drop to reorder ciphers</span>
                <div className='panel-actions'>
                    <button className='add-btn' onClick={() => {setError(""); setAddCipher(true)}}>
                        Add Cipher
                    </button>
                </div>
            </div>

            {ciphers.length === 0 ? (
                <p className='empty'>No ciphers added to this game yet.</p>
            ) : (
                <DndContext
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

            {(error != "" && !addCipher) && <p className="error">{error}</p>}
        </section>
    );
}

export default CiphersPanel;