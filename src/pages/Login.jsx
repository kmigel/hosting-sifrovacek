import React, { useEffect, useState, useRef } from 'react'
import './Login.scss'
import {login} from "../services/api"
import { useNavigate } from "react-router-dom";

function Login() {
    let[username, setUsername] = useState("");
    let[password, setPassword] = useState("");
    let[errorMsg, setErrorMsg] = useState("");
    let[loading, setLoading] = useState(false);

    const navigate = useNavigate();
    
    let inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
    }, []);

    async function handleSubmit(e) {
        setErrorMsg("");
        e.preventDefault();
        
        if(!username || !password) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        setLoading(true);
        let res = await login(username, password);
        setLoading(false);

        if(!res.success) {
            setErrorMsg(res.error);
            return;
        }

        console.log("logged in");
        navigate("/dashboard");
    }

    return (
        <div className='login-wrapper'>
            <form className='form-wrapper' onSubmit={handleSubmit}>
                <h1>Login</h1>

                <input
                    ref={inputRef}
                    type='text'
                    placeholder='Username:'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type='password'
                    placeholder='Password:'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMsg != "" && <p className='error'>{errorMsg}</p>}
                
                <button type='submit' disabled={loading}>
                    {loading ? "Loading..." : "Log In"}
                </button>
            </form>
        </div>
    )
}

export default Login;