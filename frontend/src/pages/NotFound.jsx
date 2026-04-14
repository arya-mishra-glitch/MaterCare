import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg, #f8f9fb)", color: "var(--foreground, #111827)", fontFamily: "'DM Sans', system-ui, sans-serif", textAlign: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      <div style={{ fontSize: 100, fontWeight: 800, color: "var(--primary, #e879a0)", lineHeight: 1, marginBottom: 10 }}>404</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px" }}>Oops! Page not found</h1>
      <p style={{ fontSize: 15, color: "var(--muted-foreground, #6b7280)", maxWidth: 400, margin: "0 0 32px", lineHeight: 1.5 }}>
        Looks like you've wandered off the path. The page you're looking for doesn't exist or has been moved.
      </p>
      
      <button 
        onClick={() => navigate("/dashboard", { replace: true })}
        style={{ background: "var(--primary, #e879a0)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
        onMouseOut={e => e.currentTarget.style.opacity = 1}
      >
        Return to Dashboard
      </button>
    </div>
  );
}
