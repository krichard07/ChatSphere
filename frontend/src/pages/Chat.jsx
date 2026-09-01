import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import CreateChannelModal from "../components/CreateChannelModal";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import PreviewModal from "../components/PreviewModal";
import { getAccessToken } from "../api/tokenService";
import {BsChevronUp, BsChevronDown, BsX,} from "react-icons/bs";
import "./Chat.css";

function Chat() {

    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);

    const handleSelectChannel = (channel) => {

        setSelectedChannel(channel);

        localStorage.setItem(
            "selectedChannelId",
            String(channel.id)
        );

    };
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const [replyingTo, setReplyingTo] = useState(null);

    const [editingMessage, setEditingMessage] =
        useState(null);

    const [preview, setPreview] = useState(null);

    const [socket, setSocket] = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const messageRefs = useRef({});
    const searchInputRef = useRef(null);

    const [newChannelName, setNewChannelName] = useState("");
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

    const navigate = useNavigate();

    const sendMessage = async (files = []) => {

        console.log("sendMessage", {
            message,
            selectedFiles: files,
        });

        if (!socket) return false;


        /* =========================================
        ÜZENET SZERKESZTÉSE
        ========================================= */

        if (editingMessage) {

            const editedText =
                message.trim();

            if (!editedText) {
                return false;
            }

            if (
                editedText ===
                editingMessage.content
            ) {

                setEditingMessage(null);
                setMessage("");

                return true;
            }

            editMessage(
                editingMessage.id,
                editedText
            );

            setEditingMessage(null);
            setMessage("");

            return true;
        }


        /* =========================================
        ÚJ ÜZENET
        ========================================= */

        if (
            message.trim() === "" &&
            files.length === 0
        ) {
            return false;
        }

        const attachmentIds = [];

        for (const file of files) {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            const response =
                await api.post(
                    "/chat/upload/",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

            attachmentIds.push(
                response.data.attachment_id
            );
        }

        const payload = {
            type: "message",
            content: message,
            attachments: attachmentIds,
            reply_to: replyingTo?.id || null,
        };

        socket.send(
            JSON.stringify(payload)
        );

        setMessage("");
        setReplyingTo(null);

        return true;
    };

    const editMessage = (
        messageId,
        newContent
    ) => {

        if (!socket) {
            return;
        }

        if (!newContent.trim()) {
            return;
        }

        const payload = {
            type: "message_edit",
            message_id: messageId,
            content: newContent,
        };

        socket.send(
            JSON.stringify(payload)
        );
    };

    const startReplying = (message) => {

        setReplyingTo(
            message
        );

        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const deleteMessage = (messageId) => {

        if (!socket) {
            return;
        }

        const payload = {
            type: "message_delete",
            message_id: messageId,
        };

        socket.send(
            JSON.stringify(payload)
        );
    };

    const hideMessage = (messageId) => {

        if (!socket) {
            return;
        }

        const payload = {
            type: "message_hide",
            message_id: messageId,
        };

        socket.send(
            JSON.stringify(payload)
        );
    };

    const sendReaction = (
        messageId,
        emoji
    ) => {

        if (!socket) {
            return;
        }

        const payload = {
            type: "message_reaction",
            message_id: messageId,
            emoji: emoji,
        };

        socket.send(
            JSON.stringify(payload)
        );
    };

    const startEditingMessage = (
        messageToEdit
    ) => {

        setEditingMessage(
            messageToEdit
        );

        setMessage(
            messageToEdit.content || ""
        );

        requestAnimationFrame(() => {

            textareaRef.current?.focus();

            const length =
                messageToEdit.content?.length || 0;

            textareaRef.current?.setSelectionRange(
                length,
                length
            );

        });
    };

    const cancelEditingMessage = () => {

        setEditingMessage(null);

        setMessage("");

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    const createChannel = () => {

        if (!newChannelName.trim()) return;

        api.post("/chat/channels/", {
            name: newChannelName,
        })
            .then((response) => {

                setChannels((prev) => [...prev, response.data]);

                setNewChannelName("");

            })
            .catch((error) => {

                console.error(error);

            });

    };

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("selectedChannelId");

        setSelectedChannel(null);
        setMessages([]);
        setSocket(null);

        navigate("/login");

    };

    const closeSearch = () => {

        setSearchOpen(false);
        setSearchTerm("");
        setCurrentSearchIndex(0);

    };

    const goToNextSearchResult = () => {

    if (matchedMessageIds.length === 0) return;

    if (currentSearchIndex >= matchedMessageIds.length - 1) {
        return;
    }

    setCurrentSearchIndex((prev) => prev + 1);

    };

    const goToPreviousSearchResult = () => {

        if (matchedMessageIds.length === 0) return;

        if (currentSearchIndex <= 0) {
            return;
        }

        setCurrentSearchIndex((prev) => prev - 1);

    };

    useEffect(() => {

        api.get("/chat/channels/")
            .then((response) => {

                const loadedChannels = response.data;

                setChannels(loadedChannels);

                const savedChannelId =
                    localStorage.getItem(
                        "selectedChannelId"
                    );

                if (!savedChannelId) {
                    return;
                }

                const savedChannel =
                    loadedChannels.find(
                        (channel) =>
                            String(channel.id) ===
                            savedChannelId
                    );

                if (savedChannel) {

                    setSelectedChannel(
                        savedChannel
                    );

                } else {

                    localStorage.removeItem(
                        "selectedChannelId"
                    );

                }

            })
            .catch(console.error);

    }, []);

    useEffect(() => {

        api.get("/accounts/me/")
            .then((response) => {

                setCurrentUser(response.data);

            })
            .catch(console.error);

    }, []);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);

    useEffect(() => {

        if (!selectedChannel) return;

        api.get(`/chat/channels/${selectedChannel.id}/messages/`)
            .then((response) => {

                console.log(response.data);

                setMessages(response.data);

            })
            .catch(console.error);

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/${selectedChannel.id}/?token=${getAccessToken()}`
        );

        ws.onmessage = (event) => {

            const data =
                JSON.parse(event.data);


            if (
                data.type ===
                "message_edited"
            ) {

                const editedMessage =
                    data.message;

                setMessages((prev) =>
                    prev.map((message) =>

                        message.id ===
                        editedMessage.id

                            ? editedMessage
                            : message

                    )
                );

                return;
            }


            if (
                data.type ===
                "message_deleted"
            ) {

                setMessages((prev) =>
                    prev.filter(
                        (message) =>
                            message.id !==
                            data.message_id
                    )
                );

                return;
            }

            if (
                data.type ===
                "message_hidden"
            ) {

                setMessages((prev) =>
                    prev.filter(
                        (message) =>
                            message.id !==
                            data.message_id
                    )
                );

                return;
            }

            if (
                data.type ===
                "message_reaction_updated"
            ) {

                setMessages((prev) =>
                    prev.map((message) =>

                        message.id === data.message_id

                            ? {
                                ...message,
                                reactions: data.reactions,
                            }

                            : message

                    )
                );

                return;
            }

            setMessages((prev) => [
                ...prev,
                data,
            ]);
        };

        setSocket(ws);

        return () => ws.close();

    }, [selectedChannel]);

    const matchedMessages =
        searchTerm.trim() === ""
            ? []
            : messages.filter((message) =>
                message.content
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );

    const totalSearchResults = matchedMessages.length;

    const matchedMessageIds =
        matchedMessages.map((message) => message.id);

    useEffect(() => {

        if (matchedMessageIds.length === 0) return;

        const currentMessageId =
            matchedMessageIds[currentSearchIndex];

        const element =
            messageRefs.current[currentMessageId];

        if (element) {

            element.scrollIntoView({

                behavior: "smooth",

                block: "center",

            });

        }

    }, [currentSearchIndex, matchedMessageIds]);

    useEffect(() => {

          if (searchOpen) {

              searchInputRef.current?.focus();

          }

      }, [searchOpen]);

      useEffect(() => {

    const handleKeyDown = (event) => {

              if (event.key === "Escape" && searchOpen) {

                  closeSearch();

              }

          };

          window.addEventListener("keydown", handleKeyDown);

          return () => {

              window.removeEventListener("keydown", handleKeyDown);

          };

      }, [searchOpen]);


    useEffect(() => {

    const handleSearchShortcut = (event) => {

            const isCtrlOrCmd =
                event.ctrlKey || event.metaKey;

            if (isCtrlOrCmd && event.key.toLowerCase() === "f") {

                event.preventDefault();

                setSearchOpen(true);

            }

        };

        window.addEventListener("keydown", handleSearchShortcut);

        return () => {

            window.removeEventListener(
                "keydown",
                handleSearchShortcut
            );

        };

    }, []);

    const previousImage = () => {

        setPreview((current) => ({

            ...current,

            currentIndex:
                current.currentIndex === 0
                    ? current.images.length - 1
                    : current.currentIndex - 1,

        }));

    };

    const nextImage = () => {

        setPreview((current) => ({

            ...current,

            currentIndex:
                current.currentIndex === current.images.length - 1
                    ? 0
                    : current.currentIndex + 1,

        }));

    };

    return (

        <div className="app-container">

            <Sidebar
                channels={channels}
                selectedChannel={selectedChannel}
                setSelectedChannel={handleSelectChannel}
                logout={logout}
                setShowCreateChannelModal={setShowCreateChannelModal}
                currentUser={currentUser}
            />

            <CreateChannelModal
                show={showCreateChannelModal}
                onClose={() => setShowCreateChannelModal(false)}
                newChannelName={newChannelName}
                setNewChannelName={setNewChannelName}
                createChannel={createChannel}
            />

            <div className="chat-panel">

                <ChatHeader
                    selectedChannel={selectedChannel}
                    messages={messages}
                    searchOpen={searchOpen}
                    setSearchOpen={setSearchOpen}
                />

                {
                    searchOpen && (

                        <div className="chat-search">

                            <input
                                ref={searchInputRef}
                                className="chat-search-input"
                                type="text"
                                placeholder="Keresés az üzenetek között..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {
                                searchTerm.trim() !== "" && (

                                    <div className="search-footer">

                                        <span className="search-result-count">

                                            {
                                                totalSearchResults === 0
                                                    ? "Nincs találat"
                                                    : `${currentSearchIndex + 1} / ${totalSearchResults}`
                                            }

                                        </span>

                                        <div className="search-actions">

                                            <button
                                                className="glass-btn search-btn"
                                                type="button"
                                                onClick={goToPreviousSearchResult}
                                                disabled={
                                                    currentSearchIndex === 0 ||
                                                    totalSearchResults === 0
                                                }
                                            >
                                                <BsChevronUp />
                                            </button>

                                            <button
                                                  className="glass-btn search-btn"
                                                  type="button"
                                                  onClick={goToNextSearchResult}
                                                  disabled={
                                                      currentSearchIndex === totalSearchResults - 1 ||
                                                      totalSearchResults === 0
                                                  }
                                              >
                                                <BsChevronDown />
                                            </button>

                                            <button
                                                className="glass-btn search-btn"
                                                type="button"
                                                onClick={closeSearch}
                                            >
                                                <BsX />
                                            </button>

                                        </div>

                                    </div>

                                )
                            }

                        </div>

                    )
                }

                <MessageList
                    messages={messages}
                    currentUser={currentUser}
                    messagesEndRef={messagesEndRef}
                    searchTerm={searchTerm}
                    messageRefs={messageRefs}
                    preview={preview}
                    setPreview={setPreview}
                    startEditingMessage={startEditingMessage}
                    deleteMessage={deleteMessage}
                    hideMessage={hideMessage}
                    startReplying={startReplying}
                    sendReaction={sendReaction}
                />

                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                    textareaRef={textareaRef}
                    disabled={!selectedChannel}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                />

            </div>

            <PreviewModal
                preview={preview}
                setPreview={setPreview}
                previousImage={previousImage}
                nextImage={nextImage}
            />

        </div>

    );

}

export default Chat;