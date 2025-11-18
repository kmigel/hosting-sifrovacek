export async function login(username, password) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if(username === "admin" && password === "admin") {
        return {
            success: true,
        };
    }

    return {
        success: false,
        error: "Invalid username or password",
    };
}