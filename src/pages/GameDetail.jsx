import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams} from "react-router-dom";
import './GameDetail.scss'
import api from '../services/api';

import GameForm from '../components/GameForm';
import DeleteConfirm from '../components/DeleteConfirm';
import MainSidebar from "../components/MainSidebar"
import TeamsPanel from '../components/TeamsPanel';

function GameDetail() {
  let { id } = useParams();
  let inputRef = useRef(null);
  let navigate = useNavigate();
  let[game, setGame] = useState(null);
  let [section, setSection] = useState("teams");
  let[error, setError] = useState("");

  let [editGame, setEditGame] = useState(false);
  let [deletedGame, setDeletedGame] = useState(false);
  let [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    getGame();
  }, [id]);

  useEffect(() => {
      if(editGame && inputRef.current) {
        inputRef.current.focus();
      }
  }, [editGame]);

  useEffect(() => {
    if(!editGame && !deletedGame) return;

    function handleKeyDown(e) {
    if(e.key === "Escape") {
        setEditGame(false);
        setDeletedGame(false);
        cleanUp();
    }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
    window.removeEventListener("keydown", handleKeyDown);
    }
  }, [editGame, deletedGame]);

  function cleanUp() {
    setEditGame(false);
    setError("");
    setNewTitle("");
    setDeletedGame(false);
  }

  async function getGame() {
    try {
      let res = await api.get(`/game/${id}`);
      setGame(res.data);
    } catch(err) {
      console.error("Failed to get game:", err);
      navigate("/dashboard");
    }
  }

  async function updateGame() {
    try {
      await api.put(`/game/${id}`, {
        title: newTitle || undefined,
      });
      await getGame();
      cleanUp();
    } catch(err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    }
  }

  async function deleteGame() {
    try {
      await api.delete(`/game/${id}`);
      setDeletedGame(false);
      navigate("/dashboard");
    } catch(err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="page-wrapper">
      <header className='header'>
        <button className='back-btn' onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1>{game ? game.title : "Loading..."}</h1>
        <div className="actions">
          <button className='edit-btn' onClick={() => setEditGame(true)}>Edit</button>
          <button className='delete-btn' onClick={() => setDeletedGame(true)}>Delete</button>
        </div>
      </header>

      <div className='content'>
        <MainSidebar section={section} onChange={setSection}/>

        <main className='panel'>
          {section === "teams" && (
            <TeamsPanel
              gameId={id}
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

      {editGame && (
        <GameForm
          formTitle={"Edit game"}
          title={newTitle}
          onTitleChange={setNewTitle}
          onClose={() => {
            setEditGame(false);
            setError("")
          }}
          onSubmit={updateGame}
          inputRef={inputRef}
          error={error}
          editing={true}
        />
      )}

      {deletedGame && (
        <DeleteConfirm
          name={game.title}
          onCancel={cleanUp}
          onConfirm={deleteGame}
          error={error}
        />
      )}
    </div>
  );
}

export default GameDetail;
