import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GameDetail from "./pages/GameDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:id" element={<GameDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
