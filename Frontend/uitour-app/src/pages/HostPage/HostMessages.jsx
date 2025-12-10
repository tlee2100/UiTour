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

// ======= Time ago utilities =======
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

function formatTimeAgo(timestamp, language, tFn) {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Defensive logging for debugging abnormal deltas
    if (diffMs < 0 || diffMs > 365 * ONE_DAY) {
        console.warn("TimeAgo delta out of expected range", {
            timestamp,
            parsed: date.toISOString(),
            now: now.toISOString(),
            diffMs,
        });
    }

        if (diffMs < ONE_MINUTE) return tFn(language, "hostMessages.justNow");

    const mins = Math.floor(diffMs / ONE_MINUTE);
    const hours = Math.floor(diffMs / ONE_HOUR);
    const days = Math.floor(diffMs / ONE_DAY);

    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    // Older than a week → show fixed date
    return date.toLocaleDateString();
}

function useTimeAgo(timestamp, language, tFn) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, ONE_MINUTE);

        return () => clearInterval(interval);
    }, []);

    return useMemo(
        () => formatTimeAgo(timestamp, language, tFn),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [timestamp, language, tFn, now]
    );
}

function TimeAgo({ timestamp }) {
    const { language } = useLanguage();
    const text = useTimeAgo(timestamp, language, t);
    return <>{text}</>;
}

export default function HostMessages() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [newChatEmail, setNewChatEmail] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [newChatError, setNewChatError] = useState("");
    const [showNewChatBox, setShowNewChatBox] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, dispatch } = useApp();
    const { language } = useLanguage();
    const params = new URLSearchParams(location.search);
    const hostEmail = params.get("email");

    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } =
        useLanguageCurrencyModal();

    const globeButtonRef = React.useRef(null);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        closeMenu();
        navigate("/");
    };

    const currentUserId = user?.UserID || user?.id;

    useEffect(() => {
        if (!hostEmail) return; // không có hostEmail thì bỏ qua effect này

        setNewChatEmail(hostEmail);
        setShowNewChatBox(true);       
        async function initChat() {
            try {
                const found = await authAPI.getUserByEmail(hostEmail);

                if (found?.userID) {
                    const partnerId = found.userID;
                    const partnerName = found.fullName ?? found.email;
                    
                    // Bước 2: Thiết lập cuộc trò chuyện tạm thời
                    // Việc thiết lập này sẽ làm cho box chat hiển thị (vì render dựa trên selectedConversation)
                    setSelectedConversation({
                        partnerId: partnerId,
                        partnerName: partnerName,
                        messages: [], // Bắt đầu với mảng trống
                    });

                    // Bước 3: Tải tin nhắn cũ (hàm này sẽ tự cập nhật setSelectedConversation)
                    // Hàm này cũng sẽ xử lý việc thêm user này vào danh sách nếu chưa có
                    loadConversation(
                        currentUserId,
                        partnerId,
                        partnerName
                    );


                } else {
                    // Xử lý trường hợp không tìm thấy người dùng nếu cần
                    console.log(`User with email ${hostEmail} not found.`);
                    setSelectedConversation(null); // Đảm bảo không có chat mở
                }
            } catch (err) {
                console.error("Failed to find user:", err);
            }
        }

        initChat();
        const cleanUrl = location.pathname;
        navigate(cleanUrl, { replace: true });
    }, [hostEmail, currentUserId, navigate, location.pathname]);


    useEffect(() => {
        if (!currentUserId) return;
        setLoading(true);
        authAPI.getConversations(currentUserId)
            .then((data) => {
                // Keep raw timestamps from backend; TimeAgo will handle display & timezone
                setConversations(data || []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [currentUserId]);

    // Hide global AI chatbot on Host Messages
    useEffect(() => {
        document.body.classList.add("hide-ai-chat");
        return () => {
            document.body.classList.remove("hide-ai-chat");
        };
    }, []);

    // ======= Hàm load conversation giữa host và partner =======
    const loadConversation = async (userId1, userId2, partnerName) => {
        if (!userId1 || !userId2) {
            console.warn("Cannot load conversation: missing userId1 or userId2");
            return;
        }

        try {
            const data = await authAPI.getConversationBetweenUsers(userId1, userId2);
            const messages = (data || []).map((m) => ({
                id: m.messageID ?? m.MessageID ?? m.id,
                fromUserId: m.fromUserID ?? m.FromUserID,
                toUserId: m.toUserID ?? m.ToUserID,
                text: m.content ?? m.Content,
                timestamp: m.sentAt ?? m.SentAt,
            }));

            setSelectedConversation({
                partnerId: userId2,
                partnerName: partnerName || data?.[0]?.partnerName || "",
                messages,
            });
        } catch (err) {
            console.error("Failed to load conversation:", err);
        }
    };

    // ======= Gửi tin nhắn =======
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation || !currentUserId) return;

        const data = {
            fromUserID: currentUserId,
            toUserID: selectedConversation.partnerId,
            bookingID: selectedConversation.bookingId,
            content: messageInput.trim(),
        };

        try {
            const sentMessage = await authAPI.sendMessage(data);
            const rawTimestamp = sentMessage.sentAt ?? sentMessage.SentAt ?? new Date().toISOString();

            const mappedMessage = {
                id: sentMessage.messageID ?? sentMessage.MessageID ?? Date.now(),
                fromUserId: sentMessage.fromUserID ?? sentMessage.FromUserID ?? data.fromUserID,
                toUserId: sentMessage.toUserID ?? sentMessage.ToUserID ?? data.toUserID,
                text: sentMessage.content ?? sentMessage.Content ?? data.content,
                timestamp: rawTimestamp,
            };

            const updated = {
                ...selectedConversation,
                messages: [...(selectedConversation.messages || []), mappedMessage],
                lastMessage: mappedMessage.text,
            };
            setSelectedConversation(updated);

            // Cập nhật conversations list
            setConversations((prev) =>
                prev.some((c) => c.conversationId === selectedConversation.partnerId)
                    ? prev.map((c) =>
                          c.conversationId === selectedConversation.partnerId
                              ? {
                                    ...c,
                                    lastMessage: mappedMessage.text,
                                    lastMessageAt: mappedMessage.timestamp,
                                }
                              : c
                      )
                    : [
                          {
                              conversationId: selectedConversation.partnerId,
                              partnerName: selectedConversation.partnerName,
                              lastMessage: mappedMessage.text,
                              lastMessageAt: mappedMessage.timestamp,
                              unreadCount: 0,
                          },
                          ...prev,
                      ]
            );

            setMessageInput("");
        } catch (err) {
            console.error("Send message failed:", err);
        }
    };

    // Lọc theo tên (và sau này có thể mở rộng theo email)
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
        loadConversation(currentUserId, partner.id, partner.name);
    };

    // Tạo cuộc trò chuyện mới bằng email
    const handleCreateNewChat = async (e) => {
        e.preventDefault();
        if (!newChatEmail.trim() || !currentUserId) return;
        setIsCreatingChat(true);
        setNewChatError("");
        try {
            
            const foundUser = await authAPI.getUserByEmail(newChatEmail.trim());
            if (!foundUser?.userID && !foundUser?.UserID) {
                setNewChatError("User not found");
                return;
            }
            const partnerId = foundUser.userID ?? foundUser.UserID;
            const partnerName = foundUser.fullName ?? foundUser.FullName ?? foundUser.email ?? foundUser.Email;

            setSelectedConversation({
                partnerId,
                partnerName,
                messages: [],
            });

            // Nếu chưa có trong danh sách hội thoại, thêm vào
            setConversations((prev) => {
                if (prev.some((c) => c.conversationId === partnerId)) return prev;
                return [
                    {
                        conversationId: partnerId,
                        partnerName,
                        lastMessage: "",
                        lastMessageAt: null,
                        timestamp: "",
                        unreadCount: 0,
                    },
                    ...prev,
                ];
            });

            setNewChatEmail("");
        } catch (err) {
            setNewChatError(err.message || "Failed to start chat");
        } finally {
            setIsCreatingChat(false);
        }
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

    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return t(language, "hostMessages.today");
        if (date.toDateString() === yesterday.toDateString()) return t(language, "hostMessages.yesterday");
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="host-messages">
            <div className="messages-container">
                <div className="messages-sidebar">
                    <div className="messages-sidebar-header">
                        <div className="messages-sidebar-title-row">
                            <h2 className="messages-title">{t(language, "hostMessages.title")}</h2>
                            <div className="new-chat-button-wrapper">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewChatBox((prev) => !prev);
                                        setNewChatError("");
                                    }}
                                    className="new-chat-button"
                                >
                                    <Icon icon="mdi:pencil-box-outline" width="16" height="16" />
                                </button>

                                {showNewChatBox && (
                                    <div className="new-chat-popover">
                                        <form className="new-chat-form" onSubmit={handleCreateNewChat}>
                                            <div className="new-chat-title">Start a new chat</div>
                                            <input
                                                type="email"
                                                placeholder="Enter guest email"
                                                value={newChatEmail}
                                                onChange={(e) => setNewChatEmail(e.target.value)}
                                                className="new-chat-input"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isCreatingChat || !newChatEmail.trim()}
                                                className="new-chat-submit"
                                            >
                                                {isCreatingChat ? "Creating..." : "Start chat"}
                                            </button>
                                            {newChatError && (
                                                <div className="new-chat-error">{newChatError}</div>
                                            )}
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="messages-search">
                            <Icon icon="mdi:magnify" width="20" height="20" />
                            <input
                                type="text"
                                placeholder={t(language, "hostMessages.searchConversations")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="conversations-list">
                        {loading ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                                {t(language, "hostMessages.loadingMessages")}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                                {t(language, "hostMessages.noMessagesYet")}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const isActive =
                                    selectedConversation &&
                                    selectedConversation.partnerId === conv.conversationId;
                                return (
                                    <div
                                        key={conv.conversationId} // sửa từ conv.id -> conv.conversationId
                                        className={`conversation-item chat-item ${isActive ? "active" : ""}`}
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
                                                <span className="conversation-time">
                                                    <TimeAgo timestamp={conv.lastMessageAt || conv.timestamp} />
                                                </span>
                                            </div>
                                            <p className="conversation-preview">{conv.lastMessage}</p>
                                            {/* <p className="conversation-property">{conv.propertyTitle}</p> */}
                                        </div>
                                    </div>
                            );
                            })
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
                                            <React.Fragment key={msg.id || index}>
                                                {showDate && (
                                                    <div className="message-date-divider">
                                                        {formatMessageDate(msg.timestamp)}
                                                    </div>
                                                )}
                                                <div className={`message-bubble ${msg.fromUserId === currentUserId ? "sent" : "received"}`}>
                                                    <div className="message-text">{msg.text}</div>
                                                    <div className="message-time">
                                                        <TimeAgo timestamp={msg.timestamp} />
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <div className="no-messages">
                                        <p>{t(language, "hostMessages.noMessagesYet")}</p>
                                    </div>
                                )}
                            </div>

                            <div className="messages-input-container">
                                <form onSubmit={handleSendMessage}>
                                    <div className="messages-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder={t(language, "hostMessages.typeAMessage")}
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
                            <p>{t(language, "hostMessages.selectConversation")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
