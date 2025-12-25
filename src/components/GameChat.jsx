// src/components/GameChat.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useTextChat } from "../hooks/useTextChat";
// import { useVoiceChat } from "../hooks/useVoiceChat";  // ← Removed

export default function GameChat({ gameId }) {
  const navigate = useNavigate();

  /* ───────────── Auth ───────────── */
  const {
    currentUser,
    isAuthenticated,
    authChecked,
    loginPrompt,
    setLoginPrompt,
    requireLogin,
  } = useAuth();

  /* ───────────── Socket ───────────── */
  const { socket, connected } = useSocket(
    authChecked,
    isAuthenticated,
    currentUser
  );

  /* ───────────── Text Chat ───────────── */
  const roomTextId = `game:${gameId}`;
  const {
    joined: chatJoined,
    messages,
    input: msgText,
    setInput: setMsgText,
    join: joinChat,
    leave: leaveChat,
    send: sendMessage,
  } = useTextChat(socket, connected, roomTextId, currentUser, requireLogin);

  return (
    <div className="game-chat-container">
      {/* ───────── Login Prompt ───────── */}
      {loginPrompt && (
        <div className="game-chat-login-prompt">
          {loginPrompt}{" "}
          <button onClick={() => navigate("/login")} className="game-chat-link-btn">
            Login
          </button>
          <button onClick={() => setLoginPrompt(null)} className="game-chat-link-btn">
            Dismiss
          </button>
        </div>
      )}

      {/* ───────── Top Controls ───────── */}
      <div className="game-chat-controls">
        {!chatJoined ? (
          <button
            onClick={joinChat}
            disabled={!isAuthenticated || !connected}
            className="game-chat-btn game-chat-btn-primary"
          >
            {connected ? "Open Chat" : "Connecting..."}
          </button>
        ) : (
          <button
            onClick={leaveChat}
            className="game-chat-btn game-chat-btn-secondary"
          >
            Close Chat
          </button>
        )}
      </div>

      {/* ───────── Main Layout ───────── */}
      {chatJoined && (
        <div className="game-chat-layout">
          {/* ───────── Text Chat Panel ───────── */}
          <div className="game-chat-panel">
            <h3 className="game-chat-panel-title">Game Chat</h3>

            <div className="game-chat-messages">
              {messages.length === 0 ? (
                <p className="game-chat-empty">
                  No messages yet. Say something!
                </p>
              ) : (
                messages.map((m, idx) => (
                  <div key={m.ts + "-" + idx} className="game-chat-message">
                    <span className="game-chat-message-author">
                      {m.from}:
                    </span>{" "}
                    <span>{m.text}</span>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(e);
              }}
              className="game-chat-form"
            >
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Type a message..."
                className="game-chat-input"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!msgText.trim()}
                className="game-chat-send-btn"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .game-chat-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-6);
          color: var(--color-text-primary);
        }

        .game-chat-login-prompt {
          background: var(--color-warning-bg);
          border: 1px solid rgba(210, 153, 34, 0.3);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          text-align: center;
          color: var(--color-warning);
          font-size: var(--text-sm);
        }

        .game-chat-link-btn {
          background: none;
          border: none;
          color: var(--color-accent-primary);
          cursor: pointer;
          text-decoration: underline;
          font-size: var(--text-sm);
          margin: 0 var(--space-2);
          transition: color var(--transition-base);
        }

        .game-chat-link-btn:hover {
          color: var(--color-accent-primary-hover);
        }

        .game-chat-controls {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-6);
        }

        .game-chat-btn {
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-md);
          border: none;
          color: white;
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .game-chat-btn-primary {
          background: var(--color-accent-primary);
        }

        .game-chat-btn-primary:hover:not(:disabled) {
          background: var(--color-accent-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
        }

        .game-chat-btn-secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-primary);
        }

        .game-chat-btn-secondary:hover {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-focus);
        }

        .game-chat-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .game-chat-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .game-chat-btn:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }

        .game-chat-layout {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 800px;
          margin: 0 auto;
          gap: var(--space-6);
        }

        .game-chat-panel {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          border: 1px solid var(--color-border-primary);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(16px);
        }

        .game-chat-panel-title {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-4) 0;
          color: var(--color-text-primary);
          text-align: center;
        }

        .game-chat-messages {
          height: 400px;
          overflow-y: auto;
          background: var(--color-bg-secondary);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .game-chat-message {
          margin-bottom: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          word-break: break-word;
        }

        .game-chat-message-author {
          font-weight: var(--weight-semibold);
          color: var(--color-accent-primary);
        }

        .game-chat-form {
          display: flex;
          gap: 0;
        }

        .game-chat-input {
          flex: 1;
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-md) 0 0 var(--radius-md);
          font-size: var(--text-sm);
          transition: all var(--transition-base);
        }

        .game-chat-input:focus {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .game-chat-input::placeholder {
          color: var(--color-text-muted);
        }

        .game-chat-send-btn {
          background: var(--color-accent-primary);
          border: none;
          color: white;
          padding: var(--space-2) var(--space-4);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          transition: all var(--transition-base);
        }

        .game-chat-send-btn:hover:not(:disabled) {
          background: var(--color-accent-primary-hover);
        }

        .game-chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .game-chat-empty {
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          text-align: center;
          padding: var(--space-8);
        }
      `}</style>
    </div>
  );
}