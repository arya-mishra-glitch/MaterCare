import { useState } from "react";
import "./MaterCareLogin.css";

export default function MaterCareLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Login failed");
      }
    } catch {
      alert("Server not reachable");
    }
  };

  return (
    <div className="mc-root">
      {/* LEFT */}
      <div className="mc-left">
        <div className="mc-left-content">
          <h1 className="mc-logo">MaterCare</h1>

          <div className="mc-emoji">🤰</div>

          <h2 className="mc-title">
            Caring for You & <br />
            <span>Your Little One</span>
          </h2>

          <p className="mc-desc">
            Expert guidance, compassionate care, and support
            throughout your pregnancy journey.
          </p>

          <div className="mc-pills">
            <span>Secure & Private</span>
            <span>Expert Doctors</span>
            <span>24/7 Support</span>
            <span>12,000+ Mothers</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="mc-right">
        <div className="mc-card">
          <h2 className="mc-heading">Welcome Back !</h2>
          <p className="mc-sub">Sign in to your MaterCare account</p>

          <div className="mc-toggle">
            <button className="active">Sign In</button>
            <button>Create Account</button>
          </div>

          <label className="mc-label">Email or Username</label>
          <input
            className="mc-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mc-label">Password</label>
          <input
            type="password"
            className="mc-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mc-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <span className="mc-forgot">Forgot password?</span>
          </div>

          <button className="mc-btn" onClick={handleSubmit}>
            Sign In
          </button>

          <div className="mc-divider">or continue with</div>

          <div className="mc-social">
            <button>Google</button>
            <button>Apple</button>
          </div>
        </div>
      </div>
    </div>
  );
}