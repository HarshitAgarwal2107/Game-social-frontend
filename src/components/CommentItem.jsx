import React from "react";

export default function CommentItem({
  comment,
  onReply,
  onToggleLike,
  onEdit,
  onDelete,
  depth = 0,
  currentUserId
}) {
  const isMine =
    String(comment.userId?._id || comment.userId) === String(currentUserId);

  const liked =
    Array.isArray(comment.likes) &&
    currentUserId &&
    comment.likes.some(id => String(id) === String(currentUserId));

  return (
    <div className="comment" style={{ marginLeft: depth * 20 }}>
      <div className="comment-meta">
        <strong>{comment.userId?.displayName || "User"}</strong>
        {comment.edited && <span className="edited"> • edited</span>}
      </div>

      <div className="comment-body">{comment.body}</div>

      <div className="comment-actions">
        <button type="button" onClick={() => onReply(comment._id)}>
          Reply
        </button>

        <button
          type="button"
          className={`like-btn ${liked ? "liked" : ""}`}
          onClick={() => onToggleLike(comment._id)}
        >
          {liked ? "💔 Unlike" : "❤️ Like"} {comment.likes?.length || 0}
        </button>

        {isMine && (
          <>
            <button type="button" onClick={() => onEdit(comment)}>
              ✏️ Edit
            </button>

            <button
              type="button"
              className="danger"
              onClick={() => onDelete(comment._id)}
            >
              🗑 Delete
            </button>
          </>
        )}
      </div>

      {comment.replies?.map(r => (
        <CommentItem
          key={r._id}
          comment={r}
          onReply={onReply}
          onToggleLike={onToggleLike}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
          currentUserId={currentUserId}
        />
      ))}

      <style jsx>{`
        .comment {
          margin-top: var(--space-4);
          padding: var(--space-4);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-secondary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .comment:hover {
          border-color: var(--color-border-primary);
          box-shadow: var(--shadow-sm);
        }

        .comment-meta {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          font-weight: var(--weight-medium);
          margin-bottom: var(--space-2);
        }

        .comment-meta strong {
          color: var(--color-text-primary);
          font-weight: var(--weight-semibold);
        }

        .edited {
          font-size: var(--text-xs);
          opacity: 0.7;
          margin-left: var(--space-1);
        }

        .comment-body {
          margin: var(--space-3) 0;
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
        }

        .comment-actions {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-top: var(--space-3);
        }

        button {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-primary);
          color: var(--color-text-secondary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        button:hover {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-focus);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(0);
        }

        button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }

        .like-btn.liked {
          background: rgba(248, 81, 73, 0.15);
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .like-btn.liked:hover {
          background: rgba(248, 81, 73, 0.25);
        }

        .danger {
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .danger:hover {
          background: var(--color-error-bg);
        }
      `}</style>
    </div>
  );
}
