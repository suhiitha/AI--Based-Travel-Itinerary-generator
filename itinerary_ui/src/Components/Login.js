import React, { useState, useContext } from 'react';
import './AllCss/Login.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import axiosInstance from '../api/axiosInstance';

function Login() {
  const { setUser } = useContext(UserContext);

  const [useremail, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!useremail || !password) {
      toast.error('Fill in all the required information');
      return;
    } else if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await axiosInstance.post("/ulogin", {
        useremail: useremail,
        password: password,
      });

      const data = response.data;
      // Store JWT token
      localStorage.setItem('token', data.token);
      // Store user info WITHOUT password
      const userInfo = {
        id: data.id,
        username: data.username,
        useremail: data.useremail,
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      toast.success("Login successful");
      setTimeout(() => navigate("/main"), 1000);
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Invalid email or password.");
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
        <div className="payana-auth__quote-sub">Sign in to start planning yours.</div>
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
          <span className="payana-auth__eyebrow-text">Welcome back</span>
        </div>

        <h1 className="payana-auth__title">Sign in</h1>
        <p className="payana-auth__subtitle">Plan your next Karnataka adventure.</p>

        {/* User / Admin toggle */}
        <div className="payana-auth__tabs">
          <button className="payana-auth__tab payana-auth__tab--active">User</button>
          <button
            className="payana-auth__tab"
            onClick={() => navigate('/AdminLogin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="payana-auth__field">
            <label className="payana-auth__label">Email</label>
            <input
              className="payana-auth__input"
              type="email"
              placeholder="you@example.com"
              value={useremail}
              onChange={(e) => setUsername(e.target.value)}
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
            <div className="payana-auth__forgot-password">
              Forgot password?
            </div>
          </div>

          <button className="payana-auth__submit" type="submit">
            Sign In →
          </button>
        </form>

        <p className="payana-auth__footer">
          No account?{' '}
          <span className="payana-auth__footer-link" onClick={() => navigate('/Register')}>
            Create one
          </span>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default Login;