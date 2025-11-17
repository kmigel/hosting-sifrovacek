import React, { useState } from 'react'
import './Login.scss'

function Login() {
    let[username, setUsername] = useState("");
    let[password, setPassword] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Login attempt:", username, password);
        // later: call login API
    }

    return (
        <div className='page-wrapper'>
            <form className='form-wrapper' onSubmit={handleSubmit}>
                <h1>Login</h1>

                <input
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

                <button type='submit'>Log In</button>
            </form>
        </div>
    )
}

export default Login;