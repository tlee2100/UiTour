import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HostMessages.css";
import { Icon } from "@iconify/react";
import { useApp } from "../../contexts/AppContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";
import authAPI from "../../services/authAPI"; 
// ⭐ NEW HEADER
import HostHHeader from "../../components/headers/HostHHeader";

// ----- Mock data remains unchanged -----
const mockConversations = [
    // ... giữ nguyên như cũ ...
];

export default function HostMessages() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        authAPI.getConversations(user.UserID)
            .then((data) => {
                setConversations(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    // ======= Hàm load conversation giữa host và partner =======
    const loadConversation = async (userId1, userId2) => {
        if (!userId1 || !userId2) {
            console.warn("Cannot load conversation: missing userId1 or userId2");
            return;
        }

        try {
            const data = await authAPI.getConversationBetweenUsers(userId1, userId2);
            setSelectedConversation(data);
        } catch (err) {
            console.error("Failed to load conversation:", err);
        }
    };

    // ======= Gửi tin nhắn =======
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        const data = {
            fromUserID: user.id,
            toUserID: selectedConversation.partnerId,
            bookingID: selectedConversation.bookingId,
            content: messageInput.trim(),
        };

        try {
            const sentMessage = await authAPI.sendMessage(data);
            const updated = {
                ...selectedConversation,
                messages: [...selectedConversation.messages, sentMessage],
                lastMessage: messageInput,
                timestamp: "Just now",
            };
            setSelectedConversation(updated);

            // Cập nhật conversations list
            setConversations((prev) =>
                prev.map((c) => (c.id === selectedConversation.id ? updated : c))
            );

            setMessageInput("");
        } catch (err) {
            console.error("Send message failed:", err);
        }
    };

    // KEEP all message logic unchanged
    const filteredConversations = conversations.filter((conv) =>
        conv.partnerName?.toLowerCase().includes(searchQuery.toLowerCase())
        //conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
     // Click vào 1 conversation
    const handleSelectConversation = (conversation) => {
        const partner = {
            id: conversation.conversationId,
            name: conversation.partnerName,
        };
        setSelectedUser(partner);
        loadConversation(user.UserID, partner.id);
    };
    /*const handleSendMessage = (e) => {
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
    };*/

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
            <div className="messages-container">
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
                                    key={conv.conversationId} // sửa từ conv.id -> conv.conversationId
                                    className={`conversation-item ${selectedConversation?.id === conv.id ? "active" : ""}`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.partnerAvatar ? (
                                            <img src={conv.partnerAvatar} alt={conv.partnerName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {conv.partnerName ? conv.partnerName.charAt(0) : "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="conversation-content">
                                        <div className="conversation-header">
                                            <h3>{conv.partnerName}</h3>
                                            <span className="conversation-time">{conv.timestamp}</span>
                                        </div>
                                        <p className="conversation-preview">{conv.lastMessage}</p>
                                        {/* <p className="conversation-property">{conv.propertyTitle}</p> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="messages-main">
                    {selectedConversation ? (
                        <>
                            <div className="messages-thread-header">
                                <div className="thread-header-info">
                                    <div className="thread-avatar">
                                        {selectedConversation.partnerAvatar ? (
                                            <img src={selectedConversation.partnerAvatar} alt={selectedConversation.partnerName} />
                                        ) : (
                                            <div className="avatar-placeholder">{selectedConversation.partnerName ? selectedConversation.partnerName.charAt(0) : "?"}</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{selectedConversation.partnerName}</h3>
                                        {/* <p>{selectedConversation.propertyTitle}</p> */}
                                    </div>
                                </div>
                            </div>

                            <div className="messages-thread">
                                {selectedConversation?.messages?.length > 0 ? (
                                    selectedConversation.messages.map((msg, index) => {
                                        const showDate =
                                            index === 0 ||
                                            formatMessageDate(msg.timestamp) !==
                                                formatMessageDate(selectedConversation.messages[index - 1]?.timestamp);
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
                                    })
                                ) : (
                                    <div className="no-messages">
                                        <p>{t(language, "host.noMessagesYet")}</p>
                                    </div>
                                )}
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
                                        <button type="submit" className="messages-send-btn" disabled={!messageInput.trim()}>
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
