import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss'

let initialGames = [
  {id: 1, name: "Podzimní soustředění"},
  {id: 2, name: "Zkratka"},
  {id: 3, name: "Tmou"},
  {id: 4, name: "SuperDlouhéJménoJakoFaktCoSemMámPsátAaaA"},
]

function Dashboard() {
  let inputRef = useRef(null);
  const navigate = useNavigate();
  let [games, setGames] = useState(initialGames);
  let [addWindow, setAddWindow] = useState(false);
  let [newGameName, setNewGameName] = useState("");

  function handleAddGame() {
    let newName = newGameName.trim();
    if(newName === "") return;
    let newId = games[games.length - 1].id + 1;
    let newGame = {
      id: newId,
      name: newName,
    };
    setGames([...games, newGame]);
    setNewGameName("");
    setAddWindow(false);
  }

  useEffect(() => {
    if(addWindow && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addWindow]);

  useEffect(() => {
    if(!addWindow) return;

    function handleKeyDown(e) {
      if(e.key === "Escape") {
        setAddWindow(false);
        setNewGameName("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }

  }, [addWindow]);

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
          <button className="add-btn" onClick={() => setAddWindow(true)}>
            + Add Game
          </button>
        </div>
        {games.length ? (
          <ul className='games-list'>
            {games.map(g => (
              <li key={g.id} onClick={() => navigate(`/game/${g.id}`)}>
                <div className='scroll-box'>
                  <p className='game-name'>{g.name}</p>
                </div>
              </li>
            ))}
          </ul>
        ) :
        (<p>No games yet</p>)}
      </section>

      {addWindow && (
        <section className='window-backdrop' onClick={() => setAddWindow(false)}>
          <form className='window'
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {e.preventDefault(); handleAddGame();}}>
            <h3>Add new game</h3>
            <input
              ref={inputRef}
              type='text'
              placeholder='New game name:'
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
            />
            <div className='row'>
              <button className='cancel-btn' type='button' onClick={() => {setAddWindow(false); setNewGameName("")}}>
                Cancel
              </button>
              <button className='submit-btn' type='submit'>
                Submit
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default Dashboard;