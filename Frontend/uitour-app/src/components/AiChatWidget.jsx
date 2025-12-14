import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import "./AiChatWidget.css";

/**
 * Floating AI Chat widget shown in the bottom-right corner of the screen.
 * - Always visible FAB button.
 * - When opened, shows a small chat dialog above the button.
 * - All behavior is implemented with plain React (no external libraries).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CHATBOT_ENDPOINT = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/$/, "")}/api/chatbot`
  : "/api/chatbot";

function AiChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "initial-ai-message",
      author: "AI",
      text: "Hi there! How can I help you explore UiTour today?",
      side: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // Hide chatbot on login and signup pages
  const shouldHide = location.pathname === "/login" || location.pathname === "/signup";
  
  // Check if user is logged in
  const isLoggedIn = !!(user && token);

  const fabRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  const openChat = () => {
    if (isOpen) return;
    setIsOpen(true);
  };

  const closeChat = () => {
    if (!isOpen) return;
    setIsOpen(false);
    // Return focus to the floating button so keyboard users keep context
    if (fabRef.current) {
      fabRef.current.focus();
    }
  };

  // Focus the input when the chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Allow other parts of the app to open the chat (e.g. Support page button)
  useEffect(() => {
    const handleExternalOpen = () => {
      openChat();
    };
    window.addEventListener("uitour-open-chat", handleExternalOpen);
    return () => window.removeEventListener("uitour-open-chat", handleExternalOpen);
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFabClick = (event) => {
    event.preventDefault();
    // If not logged in, open chat to show login prompt
    // If logged in, open chat normally
    openChat();
  };

  const handleFabKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openChat();
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      // Only close when clicking on the backdrop, not the modal itself
      closeChat();
    }
  };

  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formatTimestamp = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSending) return;
    const value = inputRef.current ? inputRef.current.value.trim() : "";
    if (!value) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      author: "You",
      text: value,
      side: "user",
      timestamp: formatTimestamp(),
    };

    const historyForRequest = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch(CHATBOT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: value,
          history: historyForRequest.map((entry) => ({
            role: entry.side === "user" ? "user" : "assistant",
            content: entry.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Chatbot error: ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data?.reply ||
        "I couldn't find an answer right now, but I'll keep learning!";

      const aiMessage = {
        id: `ai-${Date.now()}`,
        author: "AI",
        text: replyText,
        side: "bot",
        timestamp: formatTimestamp(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setErrorMessage(
        "Unable to reach the AI service right now. Showing a local message instead."
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          author: "AI",
          text: "Sorry, I can't reach our AI brain right now. Please try again later.",
          side: "bot",
          timestamp: formatTimestamp(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Don't render on login/signup pages
  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        ref={fabRef}
        className="ai-chat-fab"
        aria-label="Open AI Chat"
        aria-haspopup="dialog"
        aria-expanded={isOpen ? "true" : "false"}
        onClick={handleFabClick}
        onKeyDown={handleFabKeyDown}
      >
        {/* Inline SVG icon: minimalist AI robot */}
        <svg
          className="ai-chat-fab-icon"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            className="ai-chat-fab-icon-head"
            x="9"
            y="11"
            width="14"
            height="10"
            rx="5"
          />
          <circle className="ai-chat-fab-icon-eye" cx="13" cy="16" r="1.2" />
          <circle className="ai-chat-fab-icon-eye" cx="19" cy="16" r="1.2" />
          <path
            className="ai-chat-fab-icon-mouth"
            d="M13.2 19c1.2 1.3 3.4 1.3 4.6 0"
          />
          <line
            className="ai-chat-fab-icon-antenna"
            x1="16"
            y1="9"
            x2="16"
            y2="11"
          />
          <circle className="ai-chat-fab-icon-antenna-tip" cx="16" cy="8" r="1" />
        </svg>
      </button>

      {/* Backdrop + modal */}
      {isOpen && (
        <div
          className="ai-chat-backdrop"
          onClick={handleBackdropClick}
          aria-hidden="false"
        >
          <section
            className="ai-chat-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-chat-title"
          >
            <header className="ai-chat-modal-header">
              <div className="ai-chat-header-left">
                <div className="ai-chat-avatar">
                  <span className="ai-chat-avatar-dot" />
                </div>
                <div className="ai-chat-header-text">
                  <h2 id="ai-chat-title" className="ai-chat-modal-title">
                    Chatbot
                  </h2>
                  <div className="ai-chat-modal-subtitle">Support Agent</div>
                </div>
              </div>
              <div className="ai-chat-header-actions">
                <button
                  type="button"
                  className="ai-chat-header-icon"
                  aria-label="Thumbs up"
                >
                  👍
                </button>
                <button
                  type="button"
                  className="ai-chat-header-icon"
                  aria-label="Thumbs down"
                >
                  👎
                </button>
                <button
                  type="button"
                  className="ai-chat-modal-close"
                  aria-label="Close AI Chat"
                  onClick={closeChat}
                >
                  ✕
                </button>
              </div>
            </header>
            <div className="ai-chat-modal-body">
              {!isLoggedIn ? (
                // Show login prompt when not logged in
                <div className="ai-chat-login-prompt">
                  <div className="ai-chat-messages" ref={messagesRef} aria-live="polite">
                    <div className="ai-chat-message ai-chat-message-bot">
                      <div className="ai-chat-message-avatar">
                        <span className="ai-chat-message-avatar-icon" />
                      </div>
                      <div className="ai-chat-message-content">
                        <div className="ai-chat-bubble">
                          Please log in to use the chatbot. You need to be signed in to chat with our AI assistant.
                        </div>
                        <div className="ai-chat-meta-row">
                          <span className="ai-chat-meta-author">
                            UITAssistant &bull; {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ai-chat-login-actions">
                    <button
                      type="button"
                      className="ai-chat-login-btn"
                      onClick={() => {
                        closeChat();
                        navigate("/login");
                      }}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      className="ai-chat-signup-btn"
                      onClick={() => {
                        closeChat();
                        navigate("/signup");
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                // Show normal chat when logged in
                <>
                  <div
                    className="ai-chat-messages"
                    ref={messagesRef}
                    aria-live="polite"
                  >
                    {messages.map((m, index) => {
                      const isUser = m.side === "user";
                      const isLastUser =
                        isUser &&
                        index ===
                          messages.reduce(
                            (lastIdx, msg, idx) =>
                              msg.side === "user" ? idx : lastIdx,
                            -1
                          );

                      return (
                        <div
                          key={m.id}
                          className={`ai-chat-message ai-chat-message-${
                            isUser ? "user" : "bot"
                          }`}
                        >
                          {!isUser && (
                            <div className="ai-chat-message-avatar">
                              <span className="ai-chat-message-avatar-icon" />
                            </div>
                          )}
                          <div className="ai-chat-message-content">
                            <div className="ai-chat-bubble">{m.text}</div>
                            <div className="ai-chat-meta-row">
                              {!isUser && (
                                <span className="ai-chat-meta-author">
                                  UITAssistant &bull; {m.timestamp}
                                </span>
                              )}
                              {isUser && (
                                <span className="ai-chat-meta-author">
                                  YOU &bull; {m.timestamp}
                                </span>
                              )}
                            </div>
                            {isLastUser && (
                              <div className="ai-chat-read-indicator">Read</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form className="ai-chat-input-bar" onSubmit={handleSubmit}>
                    <div className="ai-chat-input-wrapper">
                      <label className="visually-hidden" htmlFor="ai-chat-input">
                        Write a message
                      </label>
                      <input
                        id="ai-chat-input"
                        ref={inputRef}
                        className="ai-chat-input"
                        type="text"
                        autoComplete="off"
                        placeholder="Write a message"
                      />
                    </div>
                    <button
                      type="submit"
                      className="ai-chat-send-btn"
                      aria-label="Send message"
                      disabled={isSending}
                    >
                      {/* Inline send icon (paper plane) */}
                      <svg
                        className="ai-chat-send-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M3.4 20.6 20.5 12 3.4 3.4 3 10.5l9 1.5-9 1.5z" />
                      </svg>
                    </button>
                  </form>
                  {errorMessage && (
                    <div className="ai-chat-error" role="status">
                      {errorMessage}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default AiChatWidget;


