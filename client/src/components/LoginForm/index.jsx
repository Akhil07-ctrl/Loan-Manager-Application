import { useState } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import "./index.css"

const LoginForm = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        console.log('Login attempt with username:', username);

        try {
            let response = await axios.post('/api/login', {
                username: username,
                password: password
            })
            console.log('API response:', response);

            const { token, user } = response.data;
            console.log('Login successful:', { role: user.role });

            Cookies.set('jwtToken', token, { expires: 7 });
            // Redirect based on role
            if (user.role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/home");
            }
        }
        catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                alert("An error occurred");
            }
        }

    }

    return (
        <div className="login-form">
            <h1>Login Form</h1>
            <hr />
            <br />
            <p>Please enter your credentials to login:</p>
            <br />
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" required />
                <br />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
                <br />
                <button type="submit">Log In</button>
                {error && <p className="error" style={{ color: "red" }}>{error}</p>}
            </form>
            <br />
            <p>Don't have an account? <span className="link" onClick={() => navigate("/")}>Register here.</span></p>

        </div>
    )
}

export default LoginForm