import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams} from "react-router-dom";
import './GameDetail.scss'

import MainSidebar from "./game_detail_components/MainSidebar"

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
  let inputRef = React.useRef(null);

  let [section, setSection] = useState("teams");
  let [teams, setTeams] = useState(initialTeams);

  let [deletedTeam, setDeletedTeam] = useState(null);
  
  let [addTeam, setAddTeam] = useState(false);
  let [newName, setNewName] = useState("");
  let [newLogin, setNewLogin] = useState("");
  let [newPassword, setNewPassword] = useState("");

  let [editTeam, setEditTeam] = useState(null);

  function cleanUp() {
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
      if(!addTeam && editTeam === null && deletedTeam === null) return;
  
      function handleKeyDown(e) {
        if(e.key === "Escape") {
          if(deletedTeam != null) {
            setDeletedTeam(null);
          }
          if(addTeam || editTeam) {
            cleanUp();
            setAddTeam(false);
            setEditTeam(null);
          }
        }
      }
  
      window.addEventListener("keydown", handleKeyDown);
  
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      }
  
    }, [addTeam, deletedTeam, editTeam]);
  

  function handleStartEdit(t) {
    setNewName(t.name);
    setNewLogin(t.login);
    setNewPassword(t.password);
    setEditTeam(t);
  }

  function handleSubmitEdit(team) {
    let name = newName.trim();
    let login = newLogin.trim();
    if(login === "") login = name.toLocaleLowerCase().replace(/\s+/g, "_");
    let password = newPassword || generatePassword();
    
    if(!name) return;
    setTeams((s) =>
      s.map((t) => t.id !== team.id ? t : {id: team.id, name, login, password})
    );

    cleanUp();
    setEditTeam(null);
  }

  function handleAddTeam() {
    let newId = 1;
    if(teams.length > 0) newId = teams[teams.length - 1].id + 1;
    
    let name = newName.trim();
    let login = newLogin.trim();
    if(login === "") login = name.toLocaleLowerCase().replace(/\s+/g, "_");
    let password = newPassword || generatePassword();
    
    if(!name) return;
    setTeams((s) => [...s, {id: newId, name, login, password}]);
    cleanUp();
    setAddTeam(false);
  }

  function handleDeleteTeam(id) {
    setTeams((s) => 
      s.filter((t) => t.id !== id)
    );
    setDeletedTeam(null);
  }

  return (
    <div className="game-detail-wrapper">
      <header className='header'>
        <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>
        <h1>Game #{id}</h1>
      </header>
      <div className='content'>
        <MainSidebar section={section} onChange={setSection}/>

        <main className='panel'>
          {section === "teams" && (
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
                <div className='team-grid'>
                  {teams.map((t) => (
                    <div className='team-card' key={t.id}>
                      <h3 className="team-name">{t.name}</h3>
                      <div className="data">
                        <div className="row">
                          <span className="label">Login</span>
                          <span className="value">{t.login}</span>
                        </div>
                        <div className="row">
                          <span className="label">Password</span>
                          <span className="value monospace">{t.password}</span>
                        </div>
                      </div>

                      <div className='card-actions'>
                        <button className='edit'  onClick={() => handleStartEdit(t)}>
                          Edit
                        </button>
                        <button className='delete' onClick={() => setDeletedTeam(t)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                
              )}
            </section>
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

      {editTeam !== null && (
        <div className="window-backdrop" onClick={() => {setEditTeam(null); cleanUp()}}>
          <form
            className="window"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitEdit(editTeam);
            }}
          >
            <h3>Edit Team</h3>

            <input
              ref={inputRef}
              placeholder="Team name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              placeholder="Team login (optional)"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
            />

            <div className="password-row">
              <input
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setNewPassword(generatePassword())}
                className="gen"
              >
                Generate
              </button>
            </div>

            <div className="window-actions">
              <button type="button" className="cancel" onClick={() => {setEditTeam(null); cleanUp()}}>
                Cancel
              </button>
              <button type="submit">
                Edit Team
              </button>
            </div>
          </form>
        </div>
      )}

      {addTeam && (
        <div className="window-backdrop" onClick={() => {setAddTeam(false); cleanUp()}}>
          <form
            className="window"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              handleAddTeam();
            }}
          >
            <h3>Add Team</h3>

            <input
              ref={inputRef}
              placeholder="Team name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              placeholder="Team login (optional)"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
            />

            <div className="password-row">
              <input
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setNewPassword(generatePassword())}
                className="gen"
              >
                Generate
              </button>
            </div>

            <div className="window-actions">
              <button type="button" className="cancel" onClick={() => {setAddTeam(false); cleanUp()}}>
                Cancel
              </button>
              <button type="submit" className="confirm">
                Add Team
              </button>
            </div>
          </form>
        </div>
      )}

      {deletedTeam !== null && (
        <div className="window-backdrop" onClick={() => setDeletedTeam(null)}>
          <div className="window" onClick={(e) => e.stopPropagation()}>
            <h3>Delete team?</h3>
            <p>
              Are you sure you want to delete <strong>{deletedTeam.name}</strong>?
            </p>

            <div className="window-actions">
              <button className="cancel" onClick={() => setDeletedTeam(null)}>
                Cancel
              </button>
              <button
                className="delete"
                onClick={() => handleDeleteTeam(deletedTeam.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameDetail;
