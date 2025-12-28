import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import TeamCard from "../components/TeamCard";
import UserForm from '../components/UserForm';
import DeleteConfirm from '../components/DeleteConfirm';
import api from '../services/api';

function TeamPage() {
    let inputRef = useRef(null);
    const navigate = useNavigate();
    let [teams, setTeams] = useState([]);
    let [addTeam, setAddTeam] = useState(false);
    let [editTeam, setEditTeam] = useState(null);
    let [deletedTeam, setDeletedTeam] = useState(null);

    let [newName, setNewName] = useState("");
    let [newLogin, setNewLogin] = useState("");
    let [newPassword, setNewPassword] = useState("");
    let [newMembers, setNewMembers] = useState([]);
    let [error, setError] = useState("");

    function cleanUpForm() {
        setNewName("");
        setNewLogin("");
        setNewPassword("");
        setNewMembers([]);
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
    
    useEffect(() => {
        getTeams();
    }, []);

    async function getTeams() {
        try {
            let res;
            res = await api.get('/team');
            let data = res.data;
            setTeams(data);
        } catch(err) {
            console.error("Failed to get teams:", err);
        }
    }

    async function createTeam() {
        try {
            await api.post('/team', {
                login: newLogin,
                password: newPassword,
                name: newName,
                members: newMembers || []
            });
            cleanUpForm();
            setAddTeam(false);
            await getTeams();
        } catch(err) {
            console.error("Failed to create team:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function updateTeam(id) {
        try {
            await api.put(`/team/${id}`, {
                name: newName || undefined,
                password: newPassword || undefined,
                members: newMembers || []
            });
            await getTeams();
            setEditTeam(null);
            cleanUpForm();
        } catch(err) {
            console.error(err);
            setError(err.response?.data?.error || err.message);
        }
    }

    function startEdit(team) {
        setNewLogin(team.login);
        setNewMembers(team.members)
        setEditTeam(team);
    }

    async function deleteTeam(id) {
        try {
            await api.delete(`/team/${id}`);
            setDeletedTeam(null);
            await getTeams();
        } catch(err) {
            console.error("Failed to delete team:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    return (
        <div className='page-wrapper'>
            <section className='header'>
                <h1>Manage Teams</h1>
                <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            </section>

            <section className='users'>
                <div className='users-header'>
                    <h2>Teams</h2>
                    <button className="add-btn" onClick={() => setAddTeam(true)}>
                        + Add Team
                    </button>
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
            </section>

            {addTeam && (
                <UserForm
                formTitle="Add Team"
                name={newName}
                login={newLogin}
                password={newPassword}
                members={newMembers}
                onNameChange={setNewName}
                onLoginChange={setNewLogin}
                onPasswordChange={setNewPassword}
                onMembersChange={setNewMembers}
                onClose={() => {
                    setAddTeam(false);
                    cleanUpForm();
                }}
                onSubmit={createTeam}
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
                    members={newMembers}
                    onNameChange={setNewName}
                    onLoginChange={setNewLogin}
                    onPasswordChange={setNewPassword}
                    onMembersChange={setNewMembers}
                    onClose={() => {
                        setEditTeam(null);
                        cleanUpForm();
                    }}
                    onSubmit={() => updateTeam(editTeam.id)}
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
        </div>
    );
}

export default TeamPage;