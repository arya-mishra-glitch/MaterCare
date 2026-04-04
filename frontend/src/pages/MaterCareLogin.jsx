import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MaterCareLogin.css";

export default function MaterCareLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();

      console.log("Login response:", data);

      alert("Login successful");

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      alert("Cannot connect to server. Make sure backend is running.");

    } finally {
      setLoading(false);
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
          <h2 className="mc-heading">Welcome Back!</h2>
          <p className="mc-sub">Sign in to your MaterCare account</p>

          <div className="mc-toggle">
            <button className="active">Sign In</button>
            <button disabled>Create Account</button>
          </div>

          <label className="mc-label">Email</label>
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

          <button
            className="mc-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
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