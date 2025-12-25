import React, { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import MentionInput from "../MentionInput";

function updateLikesRecursive(list, commentId, userId, liked) {
  return list.map(c => {
    if (String(c._id) === String(commentId)) {
      return {
        ...c,
        likes: liked
          ? [...(c.likes || []), userId]
          : (c.likes || []).filter(id => String(id) !== String(userId))
      };
    }
    if (c.replies?.length) {
      return { ...c, replies: updateLikesRecursive(c.replies, commentId, userId, liked) };
    }
    return c;
  });
}

function updateCommentRecursive(list, id, body) {
  return list.map(c => {
    if (String(c._id) === String(id)) {
      return { ...c, body, edited: true };
    }
    if (c.replies?.length) {
      return { ...c, replies: updateCommentRecursive(c.replies, id, body) };
    }
    return c;
  });
}

function deleteCommentRecursive(list, id) {
  return list
    .filter(c => String(c._id) !== String(id))
    .map(c =>
      c.replies ? { ...c, replies: deleteCommentRecursive(c.replies, id) } : c
    );
}

function buildTree(comments) {
  const map = {};
  const roots = [];

  comments.forEach(c => {
    map[c._id] = { ...c, replies: [] };
  });

  comments.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });

  return roots;
}

export default function ReviewComments({ reviewId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`, { credentials: "include" })
      .then(r => r.json())
      .then(setComments)
      .catch(() => {});
  }, [reviewId]);

  async function toggleLike(commentId) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/comments/${commentId}/like`, {
      method: "POST",
      credentials: "include"
    });
    const json = await res.json();
    if (typeof json.liked !== "boolean") return;

    setComments(prev =>
      updateLikesRecursive(prev, commentId, currentUserId, json.liked)
    );
  }

  async function submitEdit() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/comments/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: editText })
    });

    const updated = await res.json();

    setComments(prev =>
      updateCommentRecursive(prev, updated._id, updated.body)
    );

    setEditingId(null);
    setEditText("");
  }

  async function deleteComment(id) {
    if (!window.confirm("Delete this comment and its replies?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/comments/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    setComments(prev => deleteCommentRecursive(prev, id));
  }

  async function submit() {
    if (!text.trim()) return;

    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: text, parentId: replyTo })
    });

    const saved = await res.json();
    setComments(prev => [...prev, saved]);
    setText("");
    setReplyTo(null);
    setLoading(false);
  }

  const tree = buildTree(comments);

  return (
    <div className="review-comments">
      {tree.map(c => (
        <CommentItem
          key={c._id}
          comment={c}
          onReply={setReplyTo}
          onToggleLike={toggleLike}
          onEdit={(comment) => {
            setEditingId(comment._id);
            setEditText(comment.body);
          }}
          onDelete={deleteComment}
          currentUserId={currentUserId}
        />
      ))}

      {editingId && (
        <>
          <MentionInput value={editText} onChange={setEditText} rows={3} />
          <button onClick={submitEdit}>Update</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </>
      )}

      <MentionInput
        value={text}
        onChange={setText}
        placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
        rows={3}
      />

      <button onClick={submit} disabled={loading}>
        {replyTo ? "Reply" : "Comment"}
      </button>
    
      <style jsx>{`
        .review-comments {
          margin-top: var(--space-5);
          border-top: 1px solid var(--color-border-primary);
          padding-top: var(--space-5);
        }

        textarea {
          width: 100%;
          margin-top: var(--space-3);
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-sm);
          font-family: inherit;
          line-height: var(--leading-relaxed);
          transition: all var(--transition-base);
          resize: vertical;
        }

        textarea:focus {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        textarea::placeholder {
          color: var(--color-text-muted);
        }

        button {
          margin-top: var(--space-3);
          margin-right: var(--space-2);
          background: var(--color-success);
          border: none;
          color: white;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        button:hover:not(:disabled) {
          background: #238636;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(46, 160, 67, 0.3);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
