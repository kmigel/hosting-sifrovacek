function MainSidebar({section, onChange}) {
    return (
        <aside className='sidebar'>
          <button className={section === "teams" ? "active" : ""}
          onClick={() => onChange("teams")}
          >
            Teams
          </button>
          
          <button className={section === "ciphers" ? "active" : ""}
          onClick={() => onChange("ciphers")}
          >
            Ciphers
          </button>

          <button className={section === "settings" ? "active" : ""}
          onClick={() => onChange("settings")}
          >
            Settings
          </button>
        </aside>
    )
}

export default MainSidebar;