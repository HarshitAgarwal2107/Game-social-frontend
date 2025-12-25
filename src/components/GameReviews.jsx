// src/components/GameReviews.jsx
import React from "react";
import ReviewComments from "./ReviewComments";
import TagSelector from "./TagSelector";
import { PRO_TAGS, CON_TAGS } from "../shared/reviewTags";
import MentionInput from "../MentionInput";

const VERDICTS = {
  awful_fun: { label: "A disaster, but kind of funny", emoji: "🤡", color: "#f85149" },
  subpar: { label: "Subpar slop", emoji: "🥱", color: "#d29922" },
  almost_good: { label: "Almost had something", emoji: "😬", color: "#58a6ff" },
  perfection: { label: "Perfection", emoji: "👑", color: "#2ea043" }
};

export default function GameReviews({
  gameId,
  reviews,
  setReviews,
  owned,
  myReview,
  setMyReview,
  reviewLoading,
  currentUserId
}) {
  const [editingReviewId, setEditingReviewId] = React.useState(null);

  const isMine = r => String(r.userId) === String(currentUserId);
  const isLikedByMe = r =>
    Array.isArray(r.likes) &&
    currentUserId &&
    r.likes.some(id => String(id) === String(currentUserId));

  const submitReview = async () => {
    const isEdit = Boolean(editingReviewId);
    const url = isEdit
      ? `${import.meta.env.VITE_API_URL}/api/reviews/${editingReviewId}`
      : `${import.meta.env.VITE_API_URL}/api/reviews/${gameId}`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(myReview)
    });

    const saved = await res.json();

    if (isEdit) {
      setReviews(prev =>
        prev.map(r => (r._id === saved._id ? saved : r))
      );
    } else {
      setReviews(prev => [saved, ...prev]);
    }

    setEditingReviewId(null);
    setMyReview({});
  };

  return (
    <div className="review-section">
      <h2>Community Reviews</h2>

      <div className="review-count">
        {reviews.length} community review{reviews.length !== 1 && "s"}
      </div>

      <div className="review-list">
        {reviews.map(r => (
          <div key={r._id} className="review-card">
            <div
              className="verdict-pill"
              style={{ background: VERDICTS[r.verdict].color }}
            >
              {VERDICTS[r.verdict].emoji} {VERDICTS[r.verdict].label}
            </div>

            <div className="review-meta">
              Played {r.playtimeHours ?? "?"} hrs {r.completed && " • Completed"}
            </div>

            {r.title && <h4>{r.title}</h4>}
            {r.body && <p>{r.body}</p>}

            <button
              className={`like-btn ${isLikedByMe(r) ? "liked" : ""}`}
              onClick={async () => {
                const liked = isLikedByMe(r);

                await fetch(
                  `${import.meta.env.VITE_API_URL}/api/reviews/${r._id}/${liked ? "unlike" : "like"}`,
                  { method: "POST", credentials: "include" }
                );

                setReviews(prev =>
                  prev.map(rv =>
                    rv._id === r._id
                      ? {
                          ...rv,
                          likes: liked
                            ? rv.likes.filter(
                                id => String(id) !== String(currentUserId)
                              )
                            : [...(rv.likes || []), currentUserId]
                        }
                      : rv
                  )
                );
              }}
            >
              {isLikedByMe(r) ? "💔 Unlike" : "❤️ Like"} {r.likes.length}
            </button>

            {isMine(r) && (
              <div className="review-actions">
                <button
                  onClick={() => {
                    setEditingReviewId(r._id);
                    setMyReview({
                      title: r.title || "",
                      body: r.body || "",
                      pros: r.pros || [],
                      cons: r.cons || [],
                      verdict: r.verdict,
                      completed: r.completed || false
                    });
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={async () => {
                    if (!window.confirm("Delete this review?")) return;

                    await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${r._id}`, {
                      method: "DELETE",
                      credentials: "include"
                    });

                    setReviews(prev =>
                      prev.filter(rv => rv._id !== r._id)
                    );
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            )}

            <ReviewComments
              reviewId={r._id}
              currentUserId={currentUserId}
            />
          </div>
        ))}
      </div>

      {owned && (
        <div className="write-review">
          <h3>{editingReviewId ? "Edit your review" : "Write your review"}</h3>

          <MentionInput
            value={myReview.title || ""}
            onChange={v => setMyReview({ ...myReview, title: v })}
            placeholder="Title (optional)"
            rows={1}
          />

          <MentionInput
            value={myReview.body || ""}
            onChange={v => setMyReview({ ...myReview, body: v })}
            placeholder="Your thoughts..."
            rows={4}
          />

          <TagSelector
            tags={PRO_TAGS}
            selected={myReview.pros || []}
            onChange={v => setMyReview({ ...myReview, pros: v })}
          />

          <TagSelector
            tags={CON_TAGS}
            selected={myReview.cons || []}
            onChange={v => setMyReview({ ...myReview, cons: v })}
          />

          <div className="verdict-picker">
            {Object.entries(VERDICTS).map(([key, v]) => (
              <button
                key={key}
                onClick={() =>
                  setMyReview({ ...myReview, verdict: key })
                }
                className={myReview.verdict === key ? "active" : ""}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={submitReview}
            disabled={reviewLoading || !myReview.verdict}
          >
            {editingReviewId ? "Update Review" : "Submit Review"}
          </button>

          {editingReviewId && (
            <button
              onClick={() => {
                setEditingReviewId(null);
                setMyReview({});
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      )}


      <style jsx>{`
        .tag-selector {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .tag-selector button {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-tertiary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        .tag-selector button:hover {
          border-color: var(--color-border-focus);
          color: var(--color-text-secondary);
          transform: translateY(-1px);
        }

        .tag-selector button.active {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
          box-shadow: 0 0 12px rgba(46, 160, 67, 0.3);
        }

        .tag-selector button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }

        .review-section {
          margin-top: var(--space-12);
        }

        .review-section h2 {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-4) 0;
          color: var(--color-text-primary);
        }

        .review-count {
          margin-bottom: var(--space-5);
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
        }

        .review-list {
          display: grid;
          gap: var(--space-4);
        }

        .review-card {
          background: var(--color-bg-elevated);
          padding: var(--space-6);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--color-border-primary);
          box-shadow: var(--shadow-lg);
          transition: all var(--transition-base);
        }

        .review-card:hover {
          border-color: var(--color-border-secondary);
          box-shadow: var(--shadow-xl);
          transform: translateY(-2px);
        }

        .verdict-pill {
          display: inline-block;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          margin-bottom: var(--space-2);
          letter-spacing: 0.025em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .review-meta {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          margin: var(--space-2) 0;
          font-weight: var(--weight-medium);
        }

        .review-card h4 {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          margin: var(--space-3) 0 var(--space-2) 0;
          color: var(--color-text-primary);
        }

        .review-card p {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          margin: var(--space-2) 0;
        }

        .pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .pros-cons ul {
          margin: var(--space-2) 0 0;
          padding-left: var(--space-5);
        }

        .review-footer {
          margin-top: var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
        }

        .like-btn {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-secondary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
          margin-top: var(--space-3);
        }

        .like-btn:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border-focus);
          transform: scale(1.05);
        }

        .like-btn.liked {
          background: rgba(248, 81, 73, 0.15);
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .like-btn:active {
          transform: scale(0.98);
        }

        .review-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
          flex-wrap: wrap;
        }

        .review-actions button {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-secondary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        .review-actions button:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border-focus);
          transform: translateY(-1px);
        }

        .review-actions button.danger {
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .review-actions button.danger:hover {
          background: var(--color-error-bg);
        }

        .write-review {
          margin-top: var(--space-8);
          padding: var(--space-6);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--color-border-primary);
          box-shadow: var(--shadow-lg);
        }

        .write-review h3 {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-5) 0;
          color: var(--color-text-primary);
        }

        .write-review input,
        .write-review textarea {
          width: 100%;
          margin-bottom: var(--space-4);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-primary);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          transition: all var(--transition-base);
        }

        .write-review input:focus,
        .write-review textarea:focus {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .verdict-picker {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .verdict-picker button {
          background: var(--color-bg-secondary);
          border: 2px solid var(--color-border-primary);
          color: var(--color-text-primary);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          cursor: pointer;
          text-align: left;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        .verdict-picker button:hover {
          border-color: var(--color-border-focus);
          background: var(--color-bg-tertiary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .verdict-picker button.active {
          border-color: currentColor;
          box-shadow: 0 0 0 2px currentColor, var(--shadow-md);
          transform: translateY(-2px);
        }

        .verdict-picker button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }

        .write-review button[type="button"],
        .write-review button:not(.verdict-picker button) {
          background: var(--color-success);
          border: none;
          color: white;
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
          margin-right: var(--space-2);
          margin-top: var(--space-2);
        }

        .write-review button[type="button"]:hover:not(:disabled),
        .write-review button:not(.verdict-picker button):hover:not(:disabled) {
          background: #238636;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(46, 160, 67, 0.3);
        }

        .write-review button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .write-review button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}