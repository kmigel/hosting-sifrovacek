import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GameDetail from "./pages/GameDetail";
import AdminPage from './pages/AdminPage';
import TeamPage from './pages/TeamPage'
import PlayGame from './pages/PlayGame'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<RequireAuth roles={["admin"]}/>}>
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/admin" element={<AdminPage/>} />
            <Route path="/team" element={<TeamPage/>} />
          </Route>
          <Route element={<RequireAuth roles={["team"]}/>}>
            <Route path="/play/game/:id" element={<PlayGame/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
