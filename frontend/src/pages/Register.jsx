import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; // Import CSS

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validate the input
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    
    // Check if email is already registered
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.some(user => user.email === email);
    
    if (userExists) {
      setError("This email is already registered");
      return;
    }
    
    // Create a new user
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    
    // Save to both currentUser and users array
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Also add to the users array for admin dashboard
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Set current user
    localStorage.setItem('isLoggedIn', 'true');
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="auth-form" onSubmit={handleRegister}>
        <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Register;
