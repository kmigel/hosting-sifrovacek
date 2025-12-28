import React, { useState, useRef, useEffect } from 'react'
import TeamCard from "./TeamCard";
import UserForm from './UserForm';
import DeleteConfirm from './DeleteConfirm';

function generatePassword(len = 5) {
    return Math.random().toString(36).slice(-len);
}

let initialTeams = [
    {id: 1, name: "Red team", login: "red", password: generatePassword() },
    {id: 2, name: "Yellow team", login: "yellow", password: generatePassword() },
]

function TeamsPanel({gameId}) {
    let inputRef = useRef(null);
    let [teams, setTeams] = useState(initialTeams);
    let [addTeam, setAddTeam] = useState(false);
    let [editTeam, setEditTeam] = useState(null);
    let [deletedTeam, setDeletedTeam] = useState(null);

    let [newName, setNewName] = useState("");
    let [newLogin, setNewLogin] = useState("");
    let [newPassword, setNewPassword] = useState("");
    let [error, setError] = useState("");

    function cleanUpForm() {
        setNewName("");
        setNewLogin("");
        setNewPassword("");
        setError("");
    }

    useEffect(() => {
    if(addTeam || editTeam) {
        inputRef.current.focus();
    }
    }, [addTeam, editTeam]);

    useEffect(() => {
        if(!addTeam && !editTeam && !deletedTeam) return;
    
        function handleKeyDown(e) {
        if(e.key === "Escape") {
            setAddTeam(false);
            setEditTeam(null);
            setDeletedTeam(null);
            cleanUpForm();
        }
        }
    
        window.addEventListener("keydown", handleKeyDown);
        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        }
    }, [addTeam, editTeam, deletedTeam]);
    

    function startEdit(t) {
        setNewName(t.name);
        setNewLogin(t.login);
        setNewPassword(t.password);
        setEditTeam(t);
    }

    function submitEdit() {
        let name = newName.trim();
        if(!name) return;
        let login = newLogin.trim();
        if(login === "") login = name.toLocaleLowerCase().replace(/\s+/g, "_");
        let password = newPassword || generatePassword();
        
        setTeams((s) =>
            s.map((t) => t.id !== editTeam.id ? t : {...t, name, login, password})
        );

        cleanUpForm();
        setEditTeam(null);
    }

    function submitAdd() {    
        let name = newName.trim();
        if(!name) return;
        let login = newLogin.trim();
        if(login === "") login = name.toLocaleLowerCase().replace(/\s+/g, "_");
        let password = newPassword || generatePassword();
        let newId = teams.length > 0 ? teams[teams.length - 1].id + 1 : 1;
        
        setTeams((s) => [...s, {id: newId, name, login, password}]);
        cleanUpForm();
        setAddTeam(false);
    }

    function deleteTeam(id) {
        setTeams((s) => 
            s.filter((t) => t.id !== id)
        );
        setDeletedTeam(null);
        cleanUpForm();
    }

    return (
        <section className='panel-teams'>
            <div className='panel-header'>
                <h2>Teams</h2>
                <div className='panel-actions'>
                    <button className='add-btn' onClick={() => setAddTeam(true)}>
                    + Add Team
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <p className='empty'>No teams yet — add your first team.</p>
                ) : (
                <div className='card-grid'>
                    {teams.map((t) => (
                        <TeamCard
                        key={t.id}
                        team={t}
                        onEdit={startEdit}
                        onDelete={setDeletedTeam}
                        />
                    ))}
                </div>
            )}

        {addTeam && (
            <UserForm
            formTitle="Add Team"
            name={newName}
            login={newLogin}
            password={newPassword}
            onNameChange={setNewName}
            onLoginChange={setNewLogin}
            onPasswordChange={setNewPassword}
            onClose={() => {
            setAddTeam(false);
            cleanUpForm();
            }}
            onSubmit={submitAdd}
            inputRef={inputRef}
            error={error}
            editing={false}
            />
        )}

        {editTeam && (
            <UserForm
                formTitle={`Edit ${editTeam.name}`}
                name={newName}
                login={newLogin}
                password={newPassword}
                onNameChange={setNewName}
                onLoginChange={setNewLogin}
                onPasswordChange={setNewPassword}
                onClose={() => {
                    setEditTeam(null);
                    cleanUpForm();
                }}
                onSubmit={submitEdit}
                inputRef={inputRef}
                error={error}
                editing={true}
            />
        )}

        {deletedTeam && (
            <DeleteConfirm
            name={deletedTeam.name}
            onCancel={() => {
                setDeletedTeam(null);
                cleanUpForm();
            }}
            onConfirm={() => deleteTeam(deletedTeam.id)}
            error={error}
            />
        )}
        </section>
    );
}

export default TeamsPanel;