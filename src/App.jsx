import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GameDetail from "./pages/GameDetail";
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/admin" element={<AdminPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
