import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './AdminPage.scss';
import api from '../services/api'
import UserForm from '../components/UserForm'
import DeleteConfirm from '../components/DeleteConfirm';

function AdminPage() {
    let inputRef = useRef(null);
    const navigate = useNavigate();
    let [admins, setAdmins] = useState([]);

    let [addAdmin, setAddAdmin] = useState(false);
    let [editAdmin, setEditAdmin] = useState(null);
    let [deletedAdmin, setDeletedAdmin] = useState(null);

    let [newName, setNewName] = useState("");
    let [newLogin, setNewLogin] = useState("");
    let [newPassword, setNewPassword] = useState("");
    let [error, setError] = useState("");

    useEffect(() => {
        getAdmins();
    }, []);

    function cleanUpForm() {
        setNewName("");
        setNewLogin("");
        setNewPassword("");
        setError("");
    }
    
    useEffect(() => {
        if ((addAdmin || editAdmin) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addAdmin, editAdmin]);

    useEffect(() => {
        if(!addAdmin && !editAdmin && !deletedAdmin) return;
    
        function handleKeyDown(e) {
        if(e.key === "Escape") {
            setAddAdmin(false);
            setEditAdmin(null);
            setDeletedAdmin(null);
            cleanUpForm();
        }
        }
    
        window.addEventListener("keydown", handleKeyDown);
        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        }
    }, [addAdmin, editAdmin, deletedAdmin]);

    async function getAdmins() {
        try {
            let res = await api.get('/admin');
            let data = res.data;
            setAdmins(data);
        } catch(err) {
            console.error("Failed to get admins:", err);
        }
    }

    async function createAdmin() {
        try {
            await api.post('/admin', {
                login: newLogin,
                password: newPassword,
                name: newName
            });
            cleanUpForm();
            setAddAdmin(false);
            await getAdmins();
        } catch(err) {
            console.error("Failed to create admin:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    function startEdit(admin) {
        setNewLogin(admin.login);
        setEditAdmin(admin);
    }

    async function updateAdmin(id) {
        try {
            await api.put(`/admin/${id}`, {
                name: newName || undefined,
                password: newPassword || undefined
            });
            await getAdmins();
            setEditAdmin(null);
            cleanUpForm();
        } catch(err) {
            console.error(err);
            setError(err.response?.data?.error || err.message);
        }
    }

    async function deleteAdmin(id) {
        try {
            await api.delete(`/admin/${id}`);
            setDeletedAdmin(null);
            await getAdmins();
        } catch(err) {
            console.error("Failed to delete admin:", err);
            setError(err.response?.data?.error || err.message);
        }
    }

    return (
    <div className='page-wrapper'>
        <section className='header'>
            <h1>Manage Admins</h1>
            <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </section>
      
        <section className='admins'>
            <div className='admins-header'>
                <h2>Admins</h2>
                <button className="add-btn" onClick={() => setAddAdmin(true)}>
                    + Add Admin
                </button>
            </div>
            <ul className='card-grid'>
                {admins.map(admin => (
                    <li className='card' key={admin.id}>
                        <h3 className="team-name">{admin.name}</h3>
                        <div className="data">
                            <div className="row">
                                <span className="label">Login</span>
                                <span className="value">{admin.login}</span>
                            </div>
                        </div>

                        <div className='actions'>
                        <button className='edit-btn' onClick={() => startEdit(admin)}>
                            Edit
                        </button>
                        <button className='delete-btn' onClick={() => setDeletedAdmin(admin)}>
                            Delete
                        </button>
                        </div>
                    </li>                    
                ))}
            </ul>
        </section>

        {addAdmin && (
            <UserForm
            formTitle="Add Admin"
            name={newName}
            login={newLogin}
            password={newPassword}
            onNameChange={setNewName}
            onLoginChange={setNewLogin}
            onPasswordChange={setNewPassword}
            onClose={() => {
                setAddAdmin(false);
                cleanUpForm();
            }}
            onSubmit={createAdmin}
            inputRef={inputRef}
            error={error}
            editing={false}
            />
        )}

        {editAdmin && (
            <UserForm
            formTitle={`Edit ${editAdmin.name}`}
            name={newName}
            login={newLogin}
            password={newPassword}
            onNameChange={setNewName}
            onLoginChange={setNewLogin}
            onPasswordChange={setNewPassword}
            onClose={() => {
                setEditAdmin(null);
                cleanUpForm();
            }}
            onSubmit={() => updateAdmin(editAdmin.id)}
            inputRef={inputRef}
            error={error}
            editing={true}
            />
        )}

        {deletedAdmin && (
            <DeleteConfirm
                name={deletedAdmin.name}
                onCancel={() => {
                    setDeletedAdmin(null);
                    cleanUpForm();
                }}
                onConfirm={() => deleteAdmin(deletedAdmin.id)}
                error={error}
            />
        )}
    </div>
    );
}

export default AdminPage;