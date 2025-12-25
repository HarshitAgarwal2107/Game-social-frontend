import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameChat from "../components/GameChat";
import GameReviews from "../components/GameReviews";

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [playerSummary, setPlayerSummary] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievementRarity, setAchievementRarity] = useState(null);
  const [steamPrivate, setSteamPrivate] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [showFullDesc, setShowFullDesc] = useState(false);

  const [myReview, setMyReview] = useState({
    verdict: null,
    title: "",
    body: "",
    pros: [],
    cons: [],
    completed: false
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    fetch("${import.meta.env.VITE_API_URL}/auth/user", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(me => me?._id && setCurrentUserId(String(me._id)));
  }, []);

  /* ================= GAME DATA ================= */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setSteamPrivate(false);

        const g = await fetch(`${import.meta.env.VITE_API_URL}/api/gameLookup/${id}`);
        if (!g.ok) throw new Error("Failed to load game");
        const gameJson = await g.json();
        if (!cancelled) setGame(gameJson);

        const owns = await fetch(`${import.meta.env.VITE_API_URL}/api/me/owns/${id}`, { credentials: "include" });
        const ownsJson = owns.ok ? await owns.json() : {};
        const isOwned = Boolean(ownsJson.owned);
        if (!cancelled) setOwned(isOwned);

        if (!isOwned) return;

        const [summary, ach, statsRes, rarity] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/me/game/${id}/summary`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/api/me/game/${id}/achievements`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/api/me/game/${id}/stats`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/api/game/${id}/achievement-rarity`)
        ]);

        const summaryJson = summary.ok ? await summary.json() : null;
        const achJson = ach.ok ? await ach.json() : null;
        const statsJson = statsRes.ok ? await statsRes.json() : null;

        if (summaryJson?.playtimeForever) setPlayerSummary(summaryJson);
        if (achJson?.total) setAchievements(achJson);
        if (Array.isArray(statsJson) && statsJson.length) setStats(statsJson);
        if (rarity.ok) setAchievementRarity(await rarity.json());

        if (
          summaryJson &&
          !achJson?.total &&
          (!statsJson || !statsJson.length)
        ) setSteamPrivate(true);

      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => cancelled = true;
  }, [id]);

  /* ================= REVIEWS ================= */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/reviews/game/${id}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(j => Array.isArray(j) && setReviews(j));
  }, [id]);

  async function submitReview() {
    if (!myReview.verdict) return alert("Pick a verdict first");
    setReviewLoading(true);

    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(myReview)
      });
      if (!r.ok) throw new Error();
      const saved = await r.json();
      setReviews(p => [saved, ...p]);
      setMyReview({ verdict: null, title: "", body: "", pros: [], cons: [], completed: false });
    } catch {
      alert("Could not submit review");
    } finally {
      setReviewLoading(false);
    }
  }

  /* ================= RENDER ================= */
  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page error">{error}</div>;
  if (!game) return <div className="page">Game not found</div>;

  return (
    <div className="game-details-container">

      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="game-header">
        <img className="game-cover" src={game.background_image} alt={game.name} />

        <div className="game-info">
          <div className="title-row">
            <h1 className="game-title">{game.name}</h1>
            <span className={owned ? "owned-badge" : "unowned-badge"}>
              {owned ? "Owned" : "Unowned"}
            </span>
          </div>

          <div
            className={`game-description ${showFullDesc ? "open" : ""}`}
            dangerouslySetInnerHTML={{ __html: game.description }}
          />

          <button className="desc-toggle" onClick={() => setShowFullDesc(v => !v)}>
            {showFullDesc ? "Show less" : "Read more"}
          </button>
        </div>
      </div>

      {owned && (
        <div className="section">
          <h2>Your Game Data</h2>

          {steamPrivate && (
            <div className="player-card privacy">
              Steam profile is private
            </div>
          )}

          {!steamPrivate && (
            <div className="player-grid">
              {playerSummary && (
                <div className="player-card">
                  <h3>Playtime</h3>
                  <div>Total: {(playerSummary.playtimeForever / 60).toFixed(1)} hrs</div>
                  <div>Last 2 weeks: {(playerSummary.playtime2Weeks / 60).toFixed(1)} hrs</div>
                </div>
              )}

              {achievements && (
                <div className="player-card">
                  <h3>Achievements</h3>
                  <div>
                    {achievements.unlocked}/{achievements.total} unlocked
                  </div>
                </div>
              )}

              {stats && (
                <div className="player-card">
                  <h3>Stats</h3>
                  <ul>
                    {stats.map(s => (
                      <li key={s.name}>{s.label}: {s.value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="section">
        <GameReviews
          gameId={id}
          reviews={reviews}
          setReviews={setReviews}
          owned={owned}
          myReview={myReview}
          setMyReview={setMyReview}
          submitReview={submitReview}
          reviewLoading={reviewLoading}
          currentUserId={currentUserId}
        />
      </div>

      <div className="section">
        <GameChat gameId={id} />
      </div>

      <style jsx>{`
        .game-details-container {
          max-width: 1200px;
          margin: auto;
          padding: 24px;
          color: var(--color-text-primary);
        }

        .back-button {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-secondary);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-6);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        .back-button:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border-focus);
          color: var(--color-text-primary);
          transform: translateX(-2px);
        }

        .back-button:active {
          transform: translateX(0);
        }

        .back-button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }

        .game-header {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 32px;
          margin-bottom: var(--space-8);
        }

        .game-cover {
          width: 100%;
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          transition: transform var(--transition-slow);
        }

        .game-cover:hover {
          transform: scale(1.02);
        }

        .game-title {
          font-size: var(--text-4xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-4) 0;
          line-height: var(--leading-tight);
          color: var(--color-text-primary);
        }

        .title-row {
          display: flex;
          gap: var(--space-3);
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: var(--space-4);
        }

        .owned-badge, .unowned-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          letter-spacing: 0.025em;
          transition: all var(--transition-base);
        }

        .owned-badge {
          background: var(--color-success);
          color: white;
          box-shadow: 0 0 12px rgba(46, 160, 67, 0.3);
        }

        .unowned-badge {
          background: var(--color-error);
          color: white;
          box-shadow: 0 0 12px rgba(248, 81, 73, 0.3);
        }

        .game-description {
          max-height: 220px;
          overflow: hidden;
          margin-top: var(--space-4);
          line-height: var(--leading-relaxed);
          color: var(--color-text-secondary);
          font-size: var(--text-base);
          transition: max-height var(--transition-slow);
        }

        .game-description.open {
          max-height: none;
        }

        .game-description :global(p) {
          margin-bottom: var(--space-3);
        }

        .desc-toggle {
          background: none;
          border: none;
          color: var(--color-accent-primary);
          margin-top: var(--space-2);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          padding: var(--space-1) 0;
          transition: all var(--transition-base);
        }

        .desc-toggle:hover {
          color: var(--color-accent-primary-hover);
          text-decoration: underline;
        }

        .desc-toggle:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        .section {
          margin-top: var(--space-12);
          background: var(--color-bg-elevated);
          padding: var(--space-6);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--color-border-primary);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(16px);
        }

        .section h2 {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-6) 0;
          color: var(--color-text-primary);
        }

        .player-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-4);
        }

        .player-card {
          background: var(--color-bg-secondary);
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-secondary);
          transition: all var(--transition-base);
        }

        .player-card:hover {
          border-color: var(--color-border-primary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .player-card h3 {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          margin: 0 0 var(--space-3) 0;
          color: var(--color-text-primary);
        }

        .player-card div {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-2);
        }

        .player-card ul {
          margin: var(--space-2) 0 0 0;
          padding-left: var(--space-5);
          list-style: none;
        }

        .player-card li {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
          position: relative;
        }

        .player-card li::before {
          content: "•";
          position: absolute;
          left: -16px;
          color: var(--color-accent-primary);
        }

        .player-card.privacy {
          background: var(--color-warning-bg);
          border-color: rgba(210, 153, 34, 0.3);
          color: var(--color-warning);
          text-align: center;
          padding: var(--space-6);
          font-size: var(--text-sm);
        }

        @media (max-width: 900px) {
          .game-header {
            grid-template-columns: 1fr;
          }
          .game-title {
            font-size: var(--text-3xl);
          }
          .section {
            padding: var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}