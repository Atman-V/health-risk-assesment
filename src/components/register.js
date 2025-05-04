import React, { useState } from 'react';
import axios from 'axios';

function Register({ setPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');

  const handleRegister = async () => {
    if (password !== repassword) {
      alert('⚠️ Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('https://health-risk-backend.onrender.com/api/register', {
        username,
        password,
      });

      console.log('✅ Registration successful:', response.data);
      alert('✅ Registered successfully! Please log in.');
      setPage('login'); // ✅ Go to login instead of dashboard
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data || err.message);
      alert(err.response?.data?.message || '❌ Registration failed');
    }
  };

  return (
    <div className="bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4">
      <h2 className="text-2xl font-bold text-medicalTeal text-center">Register</h2>
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
      <input
        type="password"
        placeholder="Re-enter Password"
        value={repassword}
        onChange={(e) => setRepassword(e.target.value)}
        className="w-full border px-4 py-2 rounded-md"
      />
      <button
        onClick={handleRegister}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
      >
        Register
      </button>
      <p
        className="text-sm text-center text-hospitalBlue cursor-pointer"
        onClick={() => setPage('login')}
      >
        Already have an account? Login
      </p>
    </div>
  );
}

export default Register;
