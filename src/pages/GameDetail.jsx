import React, { useState } from 'react'
import { useNavigate, useParams} from "react-router-dom";
import './GameDetail.scss'

function GameDetail() {
  const { id } = useParams();

  return (
    <div className="game-detail-wrapper">
      <h1>Game #{id}</h1>
    </div>
  );
}

export default GameDetail;
