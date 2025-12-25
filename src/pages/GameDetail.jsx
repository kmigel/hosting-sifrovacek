import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams} from "react-router-dom";
import './GameDetail.scss'

import MainSidebar from "./game_detail_components/MainSidebar"
import TeamsPanel from './game_detail_components/TeamsPanel';
import TeamForm from './game_detail_components/TeamForm';
import DeleteTeamConfirm from './game_detail_components/DeleteTeamConfirm';

function generatePassword(len = 5) {
  return Math.random().toString(36).slice(-len);
}

let initialTeams = [
  {id: 1, name: "Red team", login: "red", password: generatePassword() },
  {id: 2, name: "Yellow team", login: "yellow", password: generatePassword() },
]

function GameDetail() {
  let { id } = useParams();
  let navigate = useNavigate();
  let inputRef = useRef(null);

  let [section, setSection] = useState("teams");
  let [teams, setTeams] = useState(initialTeams);

  let [addTeam, setAddTeam] = useState(false);
  let [editTeam, setEditTeam] = useState(null);
  let [deletedTeam, setDeletedTeam] = useState(null);
  
  let [newName, setNewName] = useState("");
  let [newLogin, setNewLogin] = useState("");
  let [newPassword, setNewPassword] = useState("");


  function cleanUpForm() {
    setNewName("");
    setNewLogin("");
    setNewPassword("");
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
  }

  return (
    <div className="game-detail-wrapper">
      <header className='header'>
        <button className='back-btn' onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Game #{id}</h1>
      </header>

      <div className='content'>
        <MainSidebar section={section} onChange={setSection}/>

        <main className='panel'>
          {section === "teams" && (
            <TeamsPanel
              teams={teams}
              onAdd={() => setAddTeam(true)}
              onEdit={startEdit}
              onDelete={setDeletedTeam}
            />
          )}

          {section === "pdfs" && (
            <section>
              PDFs section
            </section>
          )}

          {section === "settings" && (
            <section>
              Settings section
            </section>
          )}
        </main>
      </div>

      {addTeam && (
        <TeamForm
          formTitle="Add Team"
          name={newName}
          login={newLogin}
          password={newPassword}
          onNameChange={setNewName}
          onLoginChange={setNewLogin}
          onPasswordChange={setNewPassword}
          onGeneratePassword={() => setNewPassword(generatePassword())}
          onClose={() => {
            setAddTeam(false);
            cleanUpForm();
          }}
          onSubmit={submitAdd}
          inputRef={inputRef}
        />
      )}

      {editTeam && (
        <TeamForm
          formTitle="Edit Team"
          name={newName}
          login={newLogin}
          password={newPassword}
          onNameChange={setNewName}
          onLoginChange={setNewLogin}
          onPasswordChange={setNewPassword}
          onGeneratePassword={() => setNewPassword(generatePassword())}
          onClose={() => {
            setEditTeam(null);
            cleanUpForm();
          }}
          onSubmit={submitEdit}
          inputRef={inputRef}
        />
      )}

      {deletedTeam && (
        <DeleteTeamConfirm
          team={deletedTeam}
          onCancel={() => setDeletedTeam(null)}
          onConfirm={() => deleteTeam(deletedTeam.id)}
        />
      )}
    </div>
  );
}

export default GameDetail;
