import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HostMessages.css";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import { useApp } from "../../contexts/AppContext";

// Mock conversation data
const mockConversations = [
    {
        id: 1,
        guestName: "Sarah Johnson",
        guestAvatar: null,
        lastMessage: "Thank you so much! The place was amazing.",
        timestamp: "2 hours ago",
        unread: 2,
        propertyTitle: "Apartment in Quận Ba Đình",
        messages: [
            {
                id: 1,
                sender: "guest",
                text: "Hi! I'm interested in booking your place for next week.",
                timestamp: "2024-01-15T10:30:00",
            },
            {
                id: 2,
                sender: "host",
                text: "Hello! That sounds great. Which dates are you looking for?",
                timestamp: "2024-01-15T10:35:00",
            },
            {
                id: 3,
                sender: "guest",
                text: "I'd like to check in on the 20th and check out on the 25th.",
                timestamp: "2024-01-15T10:40:00",
            },
            {
                id: 4,
                sender: "host",
                text: "Perfect! Those dates are available. I'll send you a booking request.",
                timestamp: "2024-01-15T10:45:00",
            },
            {
                id: 5,
                sender: "guest",
                text: "Thank you so much! The place was amazing.",
                timestamp: "2024-01-15T12:30:00",
            },
        ],
    },
    {
        id: 2,
        guestName: "Michael Chen",
        guestAvatar: null,
        lastMessage: "Is there parking available?",
        timestamp: "1 day ago",
        unread: 0,
        propertyTitle: "Apartment in Quận Ba Đình",
        messages: [
            {
                id: 1,
                sender: "guest",
                text: "Hi, I have a question about parking.",
                timestamp: "2024-01-14T14:20:00",
            },
            {
                id: 2,
                sender: "guest",
                text: "Is there parking available?",
                timestamp: "2024-01-14T14:25:00",
            },
        ],
    },
    {
        id: 3,
        guestName: "Emma Williams",
        guestAvatar: null,
        lastMessage: "Great, see you then!",
        timestamp: "3 days ago",
        unread: 0,
        propertyTitle: "Apartment in Quận Ba Đình",
        messages: [
            {
                id: 1,
                sender: "guest",
                text: "What time is check-in?",
                timestamp: "2024-01-12T09:15:00",
            },
            {
                id: 2,
                sender: "host",
                text: "Check-in is from 3 PM onwards. Let me know if you need an earlier time.",
                timestamp: "2024-01-12T09:20:00",
            },
            {
                id: 3,
                sender: "guest",
                text: "Great, see you then!",
                timestamp: "2024-01-12T09:25:00",
            },
        ],
    },
];

export default function HostMessages() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const navigate = useNavigate();
    const { dispatch } = useApp();

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => window.removeEventListener("keydown", handleEsc);
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        closeMenu();
        navigate('/');
    };

    const filteredConversations = mockConversations.filter((conv) =>
        conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim()) {
            // In a real app, this would send the message to the backend
            const newMessage = {
                id: selectedConversation.messages.length + 1,
                sender: "host",
                text: messageInput,
                timestamp: new Date().toISOString(),
            };
            // Update the conversation with the new message
            const updatedConversation = {
                ...selectedConversation,
                messages: [...selectedConversation.messages, newMessage],
                lastMessage: messageInput,
                timestamp: "Just now",
            };
            setSelectedConversation(updatedConversation);
            setMessageInput("");
        }
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    return (
        <div className="host-messages">
            {/* ================= HEADER ================= */}
            <header className="host-header">
                {/* LOGO */}
                <div className="header-logo">
                    <img src={logo} alt="UiTour logo" />
                </div>

                {/* NAVBAR */}
                <nav className="nav-tabs">
                    <Link to="/host/today">Today</Link>
                    <Link to="/host/listings">Listings</Link>
                    <Link to="/host/messages" className="active">
                        Messages
                    </Link>
                </nav>

                {/* RIGHT SIDE */}
                <div className="header-right">
                    <button
                        className="switch-title"
                        onClick={() => navigate("/")}
                    >
                        Switch to traveling
                    </button>

                    {/* Globe */}
                    <button className="globe-btn">
                        <Icon icon="mdi:earth" width="24" height="24" />
                    </button>

                    {/* User Menu */}
                    <div className="header_profile">
                        <button
                            className="header_menu"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Open host navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <Icon icon="mdi:menu" width="22" height="22" />
                        </button>

                        <button
                            className="header_avatarButton"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Open host navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <Icon icon="mdi:account-circle" width="28" height="28" />
                        </button>
                    </div>
                </div>
            </header>

            {menuOpen && (
                <>
                    <div
                        className="host-menu-backdrop"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                    <aside
                        className="host-menu-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Host navigation menu"
                    >
                        <div className="host-menu-header">
                            <h2>Menu</h2>
                            <button
                                className="host-menu-close"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                <Icon icon="mdi:close" width="24" height="24" />
                            </button>
                        </div>

                        <div className="host-menu-card">
                            <div className="host-menu-card-content">
                                <h3>New to hosting?</h3>
                                <p>
                                    Discover best practices shared by top-rated hosts and start
                                    welcoming guests with confidence.
                                </p>
                                <button className="host-menu-card-action">Get started</button>
                            </div>
                        </div>

                        <nav className="host-menu-links">
                            <button className="host-menu-link">
                                <Icon icon="mdi:cog-outline" width="20" height="20" />
                                <span>Account settings</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:earth" width="20" height="20" />
                                <span>Language & currency</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:book-open-page-variant" width="20" height="20" />
                                <span>Hosting resources</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:lifebuoy" width="20" height="20" />
                                <span>Get support</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:account-group-outline" width="20" height="20" />
                                <span>Find a co-host</span>
                            </button>
                            <button 
                                className="host-menu-link"
                                onClick={() => {
                                    closeMenu();
                                    navigate("/host/becomehost");
                                }}
                            >
                                <Icon icon="mdi:plus-circle-outline" width="20" height="20" />
                                <span>Create a new listing</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:gift-outline" width="20" height="20" />
                                <span>Refer another host</span>
                            </button>
                            <div className="host-menu-divider" />
                            <button 
                                className="host-menu-link host-menu-link-secondary"
                                onClick={handleLogout}
                            >
                                <Icon icon="mdi:logout" width="20" height="20" />
                                <span>Log out</span>
                            </button>
                        </nav>
                    </aside>
                </>
            )}

            {/* ================= MESSAGES CONTENT ================= */}
            <div className="messages-container">
                {/* Left Sidebar - Conversation List */}
                <div className="messages-sidebar">
                    <div className="messages-sidebar-header">
                        <h2>Messages</h2>
                        <div className="messages-search">
                            <Icon icon="mdi:magnify" width="20" height="20" />
                            <input
                                type="text"
                                placeholder="Search conversations"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="conversations-list">
                        {filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`conversation-item ${
                                    selectedConversation?.id === conversation.id ? "active" : ""
                                }`}
                                onClick={() => setSelectedConversation(conversation)}
                            >
                                <div className="conversation-avatar">
                                    {conversation.guestAvatar ? (
                                        <img
                                            src={conversation.guestAvatar}
                                            alt={conversation.guestName}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {conversation.guestName.charAt(0)}
                                        </div>
                                    )}
                                    {conversation.unread > 0 && (
                                        <span className="unread-badge">{conversation.unread}</span>
                                    )}
                                </div>
                                <div className="conversation-content">
                                    <div className="conversation-header">
                                        <h3>{conversation.guestName}</h3>
                                        <span className="conversation-time">
                                            {conversation.timestamp}
                                        </span>
                                    </div>
                                    <p className="conversation-preview">{conversation.lastMessage}</p>
                                    <p className="conversation-property">{conversation.propertyTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Main Area - Message Thread */}
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
                                {selectedConversation.messages.map((message, index) => {
                                    const showDate =
                                        index === 0 ||
                                        formatMessageDate(message.timestamp) !==
                                            formatMessageDate(selectedConversation.messages[index - 1].timestamp);
                                    return (
                                        <React.Fragment key={message.id}>
                                            {showDate && (
                                                <div className="message-date-divider">
                                                    {formatMessageDate(message.timestamp)}
                                                </div>
                                            )}
                                            <div
                                                className={`message-bubble ${
                                                    message.sender === "host" ? "sent" : "received"
                                                }`}
                                            >
                                                <div className="message-text">{message.text}</div>
                                                <div className="message-time">
                                                    {formatMessageTime(message.timestamp)}
                                                </div>
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
                                            placeholder="Type a message"
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
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

