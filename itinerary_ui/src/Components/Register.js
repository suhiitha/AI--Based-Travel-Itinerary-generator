import React, { useState } from 'react';
import './AllCss/Register.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username || !password || !email) {
      toast.error('Fill in all the required information');
      return;
    } else if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await axiosInstance.post("/api/registor/PostR", {
        username: username,
        useremail: email,
        password: password,
      });

      toast.success("Registration successful");
      setTimeout(() => navigate("/Login"), 1200);
    } catch (error) {
      console.error("Error during registration:", error);
      if (error.response && error.response.status === 409) {
        toast.warning("Email already registered. Please login.");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="payana-auth">

      <div className="payana-auth__overlay"></div>

      <div className="payana-auth__quote-block">
        <div className="payana-auth__logo">Payana.</div>
        <div className="payana-auth__quote-rule"></div>
        <div className="payana-auth__quote-text">Some journeys begin with a dream</div>
        <div className="payana-auth__quote-sub">Join us to start planning yours.</div>
      </div>
      <div className="payana-auth__carousel-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>

      <div className="payana-auth__form-box">
        <button className="payana-auth__back" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <div className="payana-auth__eyebrow">
          <span className="payana-auth__eyebrow-line" />
          <span className="payana-auth__eyebrow-text">Join Payana</span>
        </div>

        <h1 className="payana-auth__title">Create account</h1>
        <p className="payana-auth__subtitle">Start exploring Karnataka today.</p>

        <form onSubmit={handleRegister}>
          <div className="payana-auth__field">
            <label className="payana-auth__label">Username</label>
            <input
              className="payana-auth__input"
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="payana-auth__field">
            <label className="payana-auth__label">Email</label>
            <input
              className="payana-auth__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="payana-auth__field">
            <label className="payana-auth__label">Password</label>
            <input
              className="payana-auth__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="payana-auth__submit" type="submit">
            Create Account →
          </button>
        </form>

        <p className="payana-auth__footer">
          Already have an account?{' '}
          <span className="payana-auth__footer-link" onClick={() => navigate('/Login')}>
            Sign in
          </span>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default Register;