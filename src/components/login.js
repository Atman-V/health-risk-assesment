import React, { useState } from 'react';
import axios from 'axios';

function Login({ setPage, goToMain }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert("⚠️ Please enter both username and password");
      return;
    }

    try {
      const response = await axios.post('https://health-risk-backend.onrender.com/auth/login', {
        username,
        password,
      });

      console.log('✅ Login successful:', response.data);
      alert('✅ Login successful!');
      
      // Optionally store token in localStorage
      // localStorage.setItem("token", response.data.token);

      goToMain(); // 🚀 Redirect to dashboard
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      alert(err.response?.data?.message || '❌ Login failed');
    }
  };

  return (
    <div className="bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4">
      <h2 className="text-2xl font-bold text-hospitalBlue text-center">Login</h2>
      
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border px-4 py-2 rounded-md"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-4 py-2 rounded-md"
      />
      
      <button
        onClick={handleLogin}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
      >
        Login
      </button>

      <p
        className="text-sm text-center text-hospitalBlue cursor-pointer"
        onClick={() => setPage('register')}
      >
        Don’t have an account? Register
      </p>
    </div>
  );
}

export default Login;
