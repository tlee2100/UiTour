import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HostMessages.css";
import { Icon } from "@iconify/react";
import { useApp } from "../../contexts/AppContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";

// ⭐ NEW HEADER
import HostHHeader from "../../components/headers/HostHHeader";

// ----- Mock data remains unchanged -----
const mockConversations = [
    // ... giữ nguyên như cũ ...
];

export default function HostMessages() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [conversations, setConversations] = useState(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, dispatch } = useApp();
    const { language } = useLanguage();

    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } =
        useLanguageCurrencyModal();

    const globeButtonRef = React.useRef(null);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        closeMenu();
        navigate("/");
    };

    // KEEP all message logic unchanged
    const filteredConversations = conversations.filter((conv) =>
        conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim()) {
            const newMessage = {
                id: selectedConversation.messages.length + 1,
                sender: "host",
                text: messageInput,
                timestamp: new Date().toISOString(),
            };

            const updated = {
                ...selectedConversation,
                messages: [...selectedConversation.messages, newMessage],
                lastMessage: messageInput,
                timestamp: "Just now",
            };

            setSelectedConversation(updated);
            setMessageInput("");
        }
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);

        if (mins < 1) return t(language, "host.justNow");
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t(language, "host.today");
        if (date.toDateString() === yesterday.toDateString()) return t(language, "host.yesterday");
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="host-messages">
            
            {/* ⭐⭐⭐ REPLACED HEADER WITH NEW SHARED HEADER ⭐⭐⭐ */}
            <HostHHeader />

            {/* ================= MESSAGE LAYOUT ================= */}
            <div className="messages-container">
                
                {/* LEFT SIDEBAR */}
                <div className="messages-sidebar">
                    <div className="messages-sidebar-header">
                        <h2>{t(language, "host.messages")}</h2>

                        <div className="messages-search">
                            <Icon icon="mdi:magnify" width="20" height="20" />
                            <input
                                type="text"
                                placeholder={t(language, "host.searchConversations")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="conversations-list">
                        {loading ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                                {t(language, "host.loadingMessages")}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                                {t(language, "host.noMessagesYet")}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${
                                        selectedConversation?.id === conv.id ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.guestAvatar ? (
                                            <img src={conv.guestAvatar} alt={conv.guestName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {conv.guestName.charAt(0)}
                                            </div>
                                        )}
                                        {conv.unread > 0 && (
                                            <span className="unread-badge">{conv.unread}</span>
                                        )}
                                    </div>

                                    <div className="conversation-content">
                                        <div className="conversation-header">
                                            <h3>{conv.guestName}</h3>
                                            <span className="conversation-time">{conv.timestamp}</span>
                                        </div>

                                        <p className="conversation-preview">{conv.lastMessage}</p>
                                        <p className="conversation-property">{conv.propertyTitle}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT THREAD */}
                <div className="messages-main">
                    {selectedConversation ? (
                        <>
                            <div className="messages-thread-header">
                                <div className="thread-header-info">
                                    <div className="thread-avatar">
                                        {selectedConversation.guestAvatar ? (
                                            <img
                                                src={selectedConversation.guestAvatar}
                                                alt={selectedConversation.guestName}
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {selectedConversation.guestName.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3>{selectedConversation.guestName}</h3>
                                        <p>{selectedConversation.propertyTitle}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="messages-thread">
                                {selectedConversation.messages.map((msg, index) => {
                                    const showDate =
                                        index === 0 ||
                                        formatMessageDate(msg.timestamp) !==
                                            formatMessageDate(selectedConversation.messages[index - 1].timestamp);

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDate && (
                                                <div className="message-date-divider">
                                                    {formatMessageDate(msg.timestamp)}
                                                </div>
                                            )}

                                            <div className={`message-bubble ${msg.sender === "host" ? "sent" : "received"}`}>
                                                <div className="message-text">{msg.text}</div>
                                                <div className="message-time">{formatMessageTime(msg.timestamp)}</div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            <div className="messages-input-container">
                                <form onSubmit={handleSendMessage}>
                                    <div className="messages-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder={t(language, "host.typeAMessage")}
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            className="messages-input"
                                        />
                                        <button
                                            type="submit"
                                            className="messages-send-btn"
                                            disabled={!messageInput.trim()}
                                        >
                                            <Icon icon="mdi:send" width="20" height="20" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="messages-empty">
                            <Icon icon="mdi:message-outline" width="64" height="64" />
                            <p>{t(language, "host.selectConversation")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
