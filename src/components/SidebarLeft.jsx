import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function SidebarLeft() {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/user`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(user => setAuthenticated(Boolean(user)))
      .catch(() => {});
  }, []);

  const links = [
    { to: "/", label: "Home", icon: "🏠" },
    authenticated
      ? { to: "/dashboard", label: "Dashboard", icon: "📊" }
      : { to: "/login", label: "Login", icon: "🔐" },
    { to: "/library", label: "Library", icon: "🎮" },
    { to: "/social", label: "Social", icon: "💬" },
  ];

  return (
    <div className="hover-rail">
      <div className="brand-vertical" onClick={() => navigate("/")}>
        GAMEVERSE
      </div>

      {links.map(l => (
        <NavLink key={l.to} to={l.to} className="hover-btn">
          <span className="icon">{l.icon}</span>
          <span className="label">{l.label}</span>
        </NavLink>
      ))}

      <style jsx>{`
        .hover-rail {
          position: fixed;
          left: 12px;
          top: 45%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          pointer-events: auto;
        }

        /* ───────── BRAND ───────── */
        .brand-vertical {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 16px;
          letter-spacing: 0.55em;
          font-weight: 900;
          color: #f1f5ff;
          text-shadow:
            0 0 10px rgba(120, 180, 255, 0.55),
            0 0 24px rgba(120, 180, 255, 0.35);
          margin-bottom: 46px;
          cursor: pointer;
          user-select: none;
        }

        /* ───────── BUTTON ───────── */
        .hover-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(20, 30, 45, 0.85);
          text-decoration: none;
          color: #cfe7f3;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          overflow: hidden;
          transition:
            width 0.25s ease,
            background 0.25s ease,
            border-radius 0.25s ease;
        }

        /* expand right only */
        .hover-btn:hover {
          width: 130px;
          border-radius: 999px;
          background: rgba(60, 120, 255, 0.18);
        }

        /* ICON — FIXED LEFT ANCHOR (NO CENTER SHIFT) */
        .icon {
          position: absolute;
          left: 22px;               /* center of 44px circle */
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          line-height: 1;
          pointer-events: none;
        }

        /* LABEL */
        .label {
          position: absolute;
          left: 52px;
          top: 50%;
          transform: translateY(-50%) translateX(-6px);
          white-space: nowrap;
          opacity: 0;
          transition: all 0.25s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .hover-btn:hover .label {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .hover-btn.active {
          background: rgba(90, 160, 255, 0.35);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
