import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams} from "react-router-dom";
import './GameDetail.scss'

import MainSidebar from "../components/MainSidebar"
import TeamsPanel from '../components/TeamsPanel';

function GameDetail() {
  let { id } = useParams();
  let navigate = useNavigate();
  let [section, setSection] = useState("teams");

  return (
    <div className="page-wrapper">
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
    </div>
  );
}

export default GameDetail;
