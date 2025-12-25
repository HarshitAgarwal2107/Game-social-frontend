import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/user`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("User not logged in");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() =>
        setError("Failed to load user. Please try logging in again.")
      );
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) window.location.href = "/";
      else setError("Logout failed");
    } catch {
      setError("Logout failed");
    }
  };

  const handleConnect = provider => {
    window.location.href = `${process.env.VITE_API_URL}/auth/${provider}`;
  };

  const isConnected = provider =>
    user?.linkedAccounts?.some(acc => acc.provider === provider);

  return (
    <div className="dash-root">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your profile & linked gaming accounts</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="dash-error">{error}</div>}

      {!user ? (
        <div className="dash-loading">Loading profile…</div>
      ) : (
        <div className="dash-grid">
          {/* PROFILE */}
          <section className="dash-card profile-card">
            <div className="profile-main">
              <div className="avatar-glow">
                {user.displayName?.[0] || "U"}
              </div>

              <div className="profile-info">
                <h2>{user.displayName || "Unknown User"}</h2>
                <span>{user.username || "No username"}</span>
                <span>{user.email || "No email"}</span>
              </div>
            </div>
          </section>

          {/* ACCOUNTS */}
          <section className="dash-card accounts-card">
            <h3>Connected Accounts</h3>

            <div className="accounts-list">
              {["google", "steam", "epic", "riot"].map(provider => (
                <div key={provider} className="account-row">
                  <span className="provider">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </span>

                  {isConnected(provider) ? (
                    <span className="status connected">Connected</span>
                  ) : (
                    <button
                      className="connect-btn"
                      onClick={() => handleConnect(provider)}
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .dash-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 0 64px;
          color: var(--color-text-primary);
        }

        /* HEADER */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          gap: 24px;
        }

        .dash-header h1 {
          font-size: var(--text-3xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-2) 0;
          line-height: var(--leading-tight);
          color: var(--color-text-primary);
        }

        .dash-header p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          line-height: var(--leading-relaxed);
        }

        /* GRID LAYOUT */
        .dash-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 28px;
          align-items: start;
        }

        /* CARD */
        .dash-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-2xl);
          padding: 28px;
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow-lg);
          transition: all var(--transition-base);
        }

        .dash-card:hover {
          border-color: var(--color-border-secondary);
          box-shadow: var(--shadow-xl);
          transform: translateY(-2px);
        }

        /* PROFILE */
        .profile-main {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-glow {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 28px;
          font-weight: var(--weight-bold);
          background: radial-gradient(
            circle at top,
            rgba(124, 247, 255, 0.95),
            rgba(96, 165, 250, 0.5)
          );
          color: #020617;
          box-shadow: 0 0 20px rgba(124, 247, 255, 0.4);
          transition: transform var(--transition-base);
        }

        .avatar-glow:hover {
          transform: scale(1.05);
        }

        .profile-info h2 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: var(--color-text-primary);
        }

        .profile-info span {
          display: block;
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          margin-top: var(--space-1);
          line-height: var(--leading-normal);
        }

        /* ACCOUNTS */
        .accounts-card h3 {
          margin: 0 0 var(--space-5) 0;
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
        }

        .accounts-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .account-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border-secondary);
          transition: all var(--transition-base);
        }

        .account-row:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--color-border-primary);
          transform: translateX(4px);
        }

        .provider {
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          text-transform: capitalize;
          color: var(--color-text-primary);
        }

        .status.connected {
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--color-accent-secondary);
          padding: var(--space-1) var(--space-3);
          background: rgba(124, 247, 255, 0.1);
          border-radius: var(--radius-full);
        }

        .connect-btn {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          border-radius: var(--radius-full);
          border: 1px solid rgba(124, 247, 255, 0.6);
          background: rgba(124, 247, 255, 0.12);
          color: #e0f2fe;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .connect-btn:hover {
          background: rgba(124, 247, 255, 0.22);
          border-color: rgba(124, 247, 255, 0.8);
          transform: scale(1.05);
        }

        .connect-btn:active {
          transform: scale(0.98);
        }

        .connect-btn:focus-visible {
          outline: 2px solid var(--color-accent-secondary);
          outline-offset: 2px;
        }

        /* LOGOUT */
        .logout-btn {
          padding: var(--space-2) var(--space-5);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          border-radius: var(--radius-full);
          border: 1px solid rgba(248, 113, 113, 0.55);
          background: rgba(248, 113, 113, 0.18);
          color: #fecaca;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .logout-btn:hover {
          background: rgba(248, 113, 113, 0.28);
          border-color: rgba(248, 113, 113, 0.75);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        .logout-btn:focus-visible {
          outline: 2px solid rgba(248, 113, 113, 0.6);
          outline-offset: 2px;
        }

        /* STATES */
        .dash-loading {
          color: var(--color-text-tertiary);
          font-size: var(--text-base);
          padding: var(--space-8);
          text-align: center;
        }

        .dash-error {
          margin-bottom: var(--space-5);
          padding: var(--space-4) var(--space-5);
          background: var(--color-error-bg);
          border: 1px solid rgba(248, 81, 73, 0.3);
          border-radius: var(--radius-lg);
          color: var(--color-error);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
        }

        @media (max-width: 900px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }

          .dash-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
