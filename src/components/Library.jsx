import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/me/library`, { credentials: "include" })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load library");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="library-state">Loading your library…</div>;
  if (error) return <div className="library-state error">{error}</div>;

  if (!data?.linked) {
    return (
      <div className="library-state">
        <h2>No Steam Library</h2>
        <p>Link your Steam account to see your games here.</p>
      </div>
    );
  }

  return (
    <div className="library">
      <div className="library-header">
        <h2>My Library</h2>
        <span>
          {data.gameCount} games • Last synced{" "}
          {new Date(data.lastSyncedAt).toLocaleString()}
        </span>
      </div>

      <div className="library-grid">
        {data.games.map(({ steam, rawg }) => {
          const rawgId = rawg?.rawg_id;
          const clickable = Boolean(rawgId);

          return (
            <div
              key={steam.appid}
              className={`game-card ${clickable ? "clickable" : "disabled"}`}
              onClick={() => rawgId && navigate(`/game/${rawgId}`)}
            >
              <img
                src={`https://media.steampowered.com/steamcommunity/public/images/apps/${steam.appid}/${steam.imgIconUrl}.jpg`}
                alt={steam.name}
                loading="lazy"
              />

              <div className="game-name">{steam.name}</div>

              <div className="game-time">
                {(steam.playtimeForever / 60).toFixed(1)} hrs played
              </div>

              {!rawgId && (
                <div className="rawg-missing">No RAWG data</div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .library {
          padding: var(--space-6);
          color: var(--color-text-primary);
        }

        .library-header {
          margin-bottom: var(--space-6);
        }

        .library-header h2 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          color: var(--color-text-primary);
        }

        .library-header span {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          font-weight: var(--weight-medium);
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-4);
        }

        .game-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          transition: all var(--transition-base);
          backdrop-filter: blur(16px);
        }

        .game-card img {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          object-fit: cover;
          box-shadow: var(--shadow-md);
          transition: transform var(--transition-base);
        }

        .game-card.clickable {
          cursor: pointer;
        }

        .game-card.clickable:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border-focus);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .game-card.clickable:hover img {
          transform: scale(1.05);
        }

        .game-card.clickable:active {
          transform: translateY(-2px);
        }

        .game-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.3);
        }

        .game-card.disabled:hover {
          transform: none;
          border-color: var(--color-border-primary);
        }

        .game-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          line-height: var(--leading-tight);
          color: var(--color-text-primary);
          margin: 0;
        }

        .game-time {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          font-weight: var(--weight-medium);
        }

        .rawg-missing {
          font-size: var(--text-xs);
          color: var(--color-warning);
          font-style: italic;
          padding: var(--space-1) var(--space-2);
          background: var(--color-warning-bg);
          border-radius: var(--radius-sm);
          display: inline-block;
          margin-top: var(--space-1);
        }

        .library-state {
          padding: var(--space-12);
          color: var(--color-text-tertiary);
          text-align: center;
          font-size: var(--text-base);
        }

        .library-state h2 {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin-bottom: var(--space-3);
          color: var(--color-text-primary);
        }

        .library-state p {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
        }

        .library-state.error {
          color: var(--color-error);
          background: var(--color-error-bg);
          border: 1px solid rgba(248, 81, 73, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
      `}</style>
    </div>
  );
}
