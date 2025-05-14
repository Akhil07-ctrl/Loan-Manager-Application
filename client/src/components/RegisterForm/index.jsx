import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./index.css";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // toggle
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const url = isAdmin ? "/api/create-admin" : "/api/register";

    const payload = isAdmin
      ? { username, email, password, adminSecret }
      : { username, email, password };

    try {
      await axios.post(url, payload);
      setSuccess(isAdmin ? "Admin registered successfully!" : "User registered successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during registration.");
      }
    }
  };

  return (
    <div className="register-form">
      <h1>WELCOME TO <br /><span style={{ color: "#FF5733" }}>LOAN MANAGER</span></h1>
      <hr />
      <p>Register Here</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <br />

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '8px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="isUser"
              type="checkbox"
              checked={!isAdmin}
              onChange={(e) => setIsAdmin(!e.target.checked)}
            />

            <label htmlFor="isUser" style={{ fontSize: "14px", cursor: "pointer", marginTop: '-2px' }}>
              Register as User
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="isAdmin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />

            <label htmlFor="isAdmin" style={{ fontSize: "14px", cursor: "pointer", marginTop: '-2px' }}>
              Register as Admin
            </label>
          </div>

        </div>
        <br />

        {isAdmin && (
          <>
            <input
              type="text"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter Admin Secret"
              required
            />
            <br />
          </>
        )}

        <button type="submit">Register</button>
      </form>
      <br />
      <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Login here.</span></p>
      <br />
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default RegisterForm;
