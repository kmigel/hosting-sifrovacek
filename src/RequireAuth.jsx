import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function RequireAuth({roles}) {
    let token = localStorage.getItem("token");
    if(!token) {
        return <Navigate to="/" replace/>;
    }

    try {
        let user = jwtDecode(token);
        if(roles && !roles.includes(user.role)) {
            return <Navigate to="/dashboard" replace/>;
        }

        return <Outlet context={{user}}/>;
    } catch(err) {
        localStorage.removeItem("token");
        return <Navigate to="/" replace/>;
    }
}

export default RequireAuth;