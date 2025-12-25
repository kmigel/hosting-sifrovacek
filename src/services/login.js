export async function login(username, password) {
    try {
        const res = await fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({login: username, password})
        });

        let data = await res.json();
        if(!res.ok) {
            return {success: false, error: data.error || "Login failed"};
        }

        localStorage.setItem("token", data.access_token);
        return {success: true, token: data.access_token};
    } catch(err) {
        console.log(err);
        return {success: false, error: "Network error"};
    }
}