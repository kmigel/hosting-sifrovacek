import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss'
import api from '../services/api'
import GameForm from './GameForm';

function Dashboard() {
  const navigate = useNavigate();
  let inputRef = useRef(null);
  let[games, setGames] = useState([]);

  let[addGame, setAddGame] = useState(false);
  let[newTitle, setNewTitle] = useState("");
  let[error, setError] = useState("");

  useEffect(() => {
    getGames();
  }, []);

  useEffect(() => {
    if(addGame && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addGame]);

  function cleanUp() {
    setNewTitle("");
    setError("");
  }

  async function getGames() {
    try {
        let res = await api.get('/game');
        let data = res.data;
        setGames(data);
    } catch(err) {
        console.error("Failed to get games:", err);
    }
  }

  async function createGame() {
    try {
      await api.post("/game", {
        title: newTitle
      });
      cleanUp();
      setAddGame(false);
      await getGames();
    } catch(err) {
      console.error("Failed to create admin", err);
      setError(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    if(!addGame) return;

    function handleKeyDown(e) {
      if(e.key === "Escape") {
        setAddGame(false);
        cleanUp();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }

  }, [addGame]);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div className='page-wrapper'>
      <section className='header'>
        <h1>Welcome, User!</h1>
        <div className='btn-container'>
          <button onClick={() => navigate("/admin")}>
            Manage Admins
          </button>
          <button className="logout-btn" onClick={() => logout()}>
              Log out
          </button>
        </div>
      </section>
      
      <section className='games'>
        <div className='games-header'>
          <h2>My games</h2>
          <button className="add-btn" onClick={() => setAddGame(true)}>
            + Add Game
          </button>
        </div>
        {games.length ? (
          <ul className='games-list'>
            {games.map(g => (
              <li key={g.id} onClick={() => navigate(`/game/${g.id}`)}>
                <div className='scroll-box'>
                  <p className='game-name'>{g.title}</p>
                </div>
              </li>
            ))}
          </ul>
        ) :
        (<p className='empty'>No games yet</p>)}
      </section>

      {addGame && (
        <GameForm
          formTitle={"Add game"}
          title={newTitle}
          onTitleChange={setNewTitle}
          onClose={() => {
            setAddGame(false);
            setError("")
          }}
          onSubmit={createGame}
          inputRef={inputRef}
          error={error}
          editing={false}
        />
      )}
    </div>
  );
}

export default Dashboard;