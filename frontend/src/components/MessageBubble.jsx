import {
    useEffect,
    useRef,
    useState,
} from "react";

import { createPortal } from "react-dom";

import {
    SmilePlus,
    Reply,
    MoreHorizontal,
    Copy,
    Check,
    Pin,
    Pencil,
    Trash2,
} from "lucide-react";

import AttachmentGallery from "./AttachmentGallery";

import "./MessageBubble.css";


function MessageBubble({
    message,
    currentUser,
    searchTerm,
    messageRefs,
    preview,
    setPreview,
    startEditingMessage,
    deleteMessage,
    hideMessage,
    startReplying,
    sendReaction,
    isMenuOpen,
    openMenu,
    closeMenu,
}) {

    const [showActions, setShowActions] =
        useState(false);

    const [menuPosition, setMenuPosition] =
        useState({
            x: 0,
            y: 0,
        });

    const [copied, setCopied] =
        useState(false);

    const [showReactionPicker, setShowReactionPicker] =
        useState(false);

    const availableReactions = [
        "👍",
        "❤️",
        "😂",
        "😮",
        "😢",
        "🎉",
    ];

    const menuRef =
        useRef(null);

    const moreButtonRef =
        useRef(null);

    const hideActionsTimeoutRef =
        useRef(null);


    const isOwnMessage =
        message.username ===
        currentUser?.username;

    const EDIT_TIME_LIMIT =
        15 * 60 * 1000;


    const messageCreatedAt =
        new Date(
            message.created_at
        ).getTime();


    const canEditMessage =
        isOwnMessage &&
        Date.now() - messageCreatedAt <=
            EDIT_TIME_LIMIT;

    const canDeleteMessage =
        canEditMessage;

    const wasEdited =
        Boolean(message.edited_at);


    const isSearchMatch =
        searchTerm &&
        message.content
            .toLowerCase()
            .includes(
                searchTerm.toLowerCase()
            );


    const highlightText = (text) => {

        if (!searchTerm) {
            return text;
        }

        const regex =
            new RegExp(
                `(${searchTerm})`,
                "gi"
            );

        return text
            .split(regex)
            .map((part, index) => {

                if (
                    part.toLowerCase() ===
                    searchTerm.toLowerCase()
                ) {

                    return (
                        <span
                            key={index}
                            className="search-highlight"
                        >
                            {part}
                        </span>
                    );
                }

                return part;
            });
    };


    useEffect(() => {

        if (!preview) {
            return;
        }

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                setPreview(null);
            }

        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [preview, setPreview]);


    useEffect(() => {

        if (!isMenuOpen) {
            return;
        }


        const handleOutsideClick = (event) => {

            const clickedInsideMenu =
                menuRef.current?.contains(
                    event.target
                );

            const clickedMoreButton =
                moreButtonRef.current?.contains(
                    event.target
                );


            if (
                !clickedInsideMenu &&
                !clickedMoreButton
            ) {

                closeMenu();

            }

        };


        const handleMenuEscape = (event) => {

            if (event.key === "Escape") {

                closeMenu();

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        window.addEventListener(
            "keydown",
            handleMenuEscape
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            window.removeEventListener(
                "keydown",
                handleMenuEscape
            );

        };

    }, [
        isMenuOpen,
        closeMenu,
    ]);


    const imageOnlyMessage =
        !message.content &&
        message.attachments?.length > 0;


    const audioOnlyMessage =
        !message.content &&
        message.attachments?.length > 0 &&
        message.attachments.every(
            (attachment) => {

                const extension =
                    attachment.file
                        .split(".")
                        .pop()
                        .toLowerCase();

                return [
                    "mp3",
                    "wav",
                    "ogg",
                    "aac",
                    "flac",
                    "webm",
                ].includes(extension);

            }
        );


    const messageClass = `
        message
        ${
            isOwnMessage
                ? "own-message"
                : "other-message"
        }
        ${
            isSearchMatch
                ? "message-search-match"
                : ""
        }
        ${
            imageOnlyMessage
                ? "image-only-message"
                : ""
        }
        ${
            audioOnlyMessage
                ? "audio-only-message"
                : ""
        }
    `;

    const scrollToOriginalMessage = () => {

        const originalMessageId =
            message.reply_to?.id;

        if (!originalMessageId) {
            return;
        }

        const originalMessageElement =
            messageRefs.current[
                originalMessageId
            ];

        if (!originalMessageElement) {
            return;
        }

        originalMessageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        originalMessageElement.classList.add(
            "message-reply-highlight"
        );

        setTimeout(() => {

            originalMessageElement.classList.remove(
                "message-reply-highlight"
            );

        }, 1600);
    };

    const handleReactionSelect = (emoji) => {

        console.log(
            "PICKER KATTINTÁS:",
            emoji,
            "MESSAGE ID:",
            message.id
        );

        sendReaction(
            message.id,
            emoji
        );

        setShowReactionPicker(false);

        if (isMenuOpen) {
            closeMenu();
        }
    };


    const handleCopyMessage = async () => {

        if (!message.content) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                message.content
            );

            setCopied(true);

            setTimeout(() => {

                setCopied(false);
                closeMenu();

            }, 1500);

        } catch (error) {

            console.error(
                "Az üzenet másolása sikertelen:",
                error
            );

        }
    };


    const handleContextMenu = (event) => {

        event.preventDefault();

        setMenuPosition({
            x: event.clientX,
            y: event.clientY,
        });

        openMenu();
    };


    const handleMoreClick = (event) => {

        event.stopPropagation();

        const button =
            moreButtonRef.current;

        if (!button) {
            return;
        }

        const rect =
            button.getBoundingClientRect();

        const menuWidth =
            220;

        if (isOwnMessage) {

            setMenuPosition({
                x:
                    rect.left -
                    menuWidth -
                    10,
                y:
                    rect.top,
            });

        } else {

            setMenuPosition({
                x:
                    rect.right +
                    10,
                y:
                    rect.top,
            });

        }

        openMenu();
    };

    useEffect(() => {

        if (
            !isMenuOpen ||
            !menuRef.current
        ) {
            return;
        }

        const menu =
            menuRef.current;

        const rect =
            menu.getBoundingClientRect();

        const screenPadding = 12;

        let newX =
            menuPosition.x;

        let newY =
            menuPosition.y;


        if (
            rect.right >
            window.innerWidth - screenPadding
        ) {

            newX -=
                rect.right -
                (
                    window.innerWidth -
                    screenPadding
                );
        }


        if (
            rect.bottom >
            window.innerHeight - screenPadding
        ) {

            newY -=
                rect.bottom -
                (
                    window.innerHeight -
                    screenPadding
                );
        }


        if (
            rect.left <
            screenPadding
        ) {

            newX +=
                screenPadding -
                rect.left;
        }


        if (
            rect.top <
            screenPadding
        ) {

            newY +=
                screenPadding -
                rect.top;
        }


        if (
            newX !== menuPosition.x ||
            newY !== menuPosition.y
        ) {

            setMenuPosition({
                x: newX,
                y: newY,
            });

        }

    }, [isMenuOpen]);


    const showMessageActions = () => {

        if (
            hideActionsTimeoutRef.current
        ) {

            clearTimeout(
                hideActionsTimeoutRef.current
            );

        }

        setShowActions(true);
    };


    const hideMessageActions = () => {

        if (
            hideActionsTimeoutRef.current
        ) {

            clearTimeout(
                hideActionsTimeoutRef.current
            );

        }

        hideActionsTimeoutRef.current =
            setTimeout(() => {

                setShowActions(false);

            }, 300);
    };


    return (

        <div
            ref={(element) => {

                if (element) {

                    messageRefs.current[
                        message.id
                    ] = element;

                }

            }}

            className={messageClass}

            onMouseEnter={
                showMessageActions
            }

            onMouseLeave={
                hideMessageActions
            }

            onContextMenu={
                handleContextMenu
            }
        >

            {isMenuOpen &&
                createPortal(

                    <div
                        ref={menuRef}
                        className="message-context-menu"
                        style={{
                            left:
                                menuPosition.x,
                            top:
                                menuPosition.y,
                        }}
                    >

                        <button
                            type="button"
                            className="message-menu-item"
                            onClick={() => {setShowReactionPicker(true); 
                                closeMenu();
                            }}
                        >
                            <SmilePlus />

                            <span>
                                Reakció hozzáadása
                            </span>
                        </button>


                        <button
                            type="button"
                            className="message-menu-item"
                            onClick={() => {

                                startReplying(
                                    message
                                );

                                closeMenu();
                            }}
                        >
                            <Reply />

                            <span>
                                Válasz
                            </span>
                        </button>


                        <button
                            type="button"
                            className="message-menu-item"
                            onClick={
                                handleCopyMessage
                            }
                        >
                            {copied ? (
                                <Check />
                            ) : (
                                <Copy />
                            )}

                            <span>
                                {copied
                                    ? "Másolva"
                                    : "Másolás"}
                            </span>
                        </button>


                        <button
                            type="button"
                            className="message-menu-item"
                        >
                            <Pin />

                            <span>
                                Kitűzés
                            </span>
                        </button>


                        {isOwnMessage && (

                            <>
                                <div className="message-menu-divider" />


                                {canEditMessage && (

                                    <button
                                        type="button"
                                        className="message-menu-item"
                                        onClick={() => {

                                            startEditingMessage(
                                                message
                                            );

                                            closeMenu();
                                        }}
                                    >
                                        <Pencil />

                                        <span>
                                            Módosítás
                                        </span>
                                    </button>

                                )}


                                {canDeleteMessage && (

                                    <button
                                        type="button"
                                        className="
                                            message-menu-item
                                            message-menu-delete
                                        "
                                        onClick={() => {

                                            deleteMessage(
                                                message.id
                                            );

                                            closeMenu();
                                        }}
                                    >
                                        <Trash2 />

                                        <span>
                                            Visszavonás
                                        </span>
                                    </button>

                                 )}

                            </>

                        )}


                        {!isOwnMessage && (

                            <>
                                <div className="message-menu-divider" />

                                <button
                                    type="button"
                                    className="
                                        message-menu-item
                                        message-menu-delete
                                    "
                                    onClick={() => {

                                        hideMessage(
                                            message.id
                                        );

                                        closeMenu();
                                    }}
                                >
                                    <Trash2 />

                                    <span>
                                        Eltávolítás nálam
                                    </span>

                                </button>
                            </>

                        )}

                    </div>,

                    document.body
                )
            }

            {showReactionPicker && (

                <div className="message-reaction-picker">

                    {availableReactions.map(
                        (emoji) => (

                            <button
                                key={emoji}
                                type="button"
                                className="message-reaction-picker-button"
                                onClick={() => {
                                    handleReactionSelect(
                                        emoji
                                    );
                                }}
                            >
                                {emoji}
                            </button>

                        )
                    )}

                </div>

            )}


            {showActions && (

                <div
                    className="message-actions"

                    onMouseEnter={
                        showMessageActions
                    }

                    onMouseLeave={
                        hideMessageActions
                    }
                >

                    <button
                        type="button"
                        className="message-action-btn"
                        title="Reakció"
                        onClick={() => {setShowReactionPicker((previous) => !previous);}}
                    >
                        <SmilePlus />
                    </button>


                    <button
                        type="button"
                        className="message-action-btn"
                        title="Válasz"
                        onClick={() => {startReplying(message);}}
                    >
                        <Reply />
                    </button>


                    <button
                        ref={moreButtonRef}
                        type="button"
                        className="message-action-btn"
                        title="További műveletek"
                        onClick={
                            handleMoreClick
                        }
                    >
                        <MoreHorizontal />
                    </button>

                </div>

            )}


            <div className="message-user">
                {message.username}
            </div>


            {message.reply_to && (

                <div
                    className="message-reply-reference"
                    onClick={
                        scrollToOriginalMessage
                    }
                    role="button"
                    tabIndex={0}
                    title="Ugrás az eredeti üzenethez"
                    onKeyDown={(event) => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            scrollToOriginalMessage();
                        }

                    }}
                >

                    <div className="message-reply-reference-user">
                        {message.reply_to.username}
                    </div>

                    <div className="message-reply-reference-content">
                        {message.reply_to.content || "Csatolmány"}
                    </div>

                </div>

            )}


            {message.content && (

                <div className="message-content">

                    {highlightText(
                        message.content
                    )}

                </div>

            )}

            {wasEdited && (

                <div className="message-edited-label">
                    Szerkesztve
                </div>

            )}

            <AttachmentGallery
                attachments={
                    message.attachments
                }
                setPreview={
                    setPreview
                }
            />

            {message.reactions?.length > 0 && (

                <div className="message-reactions">

                    {message.reactions.map(
                        (reaction) => (

                            <button
                                key={reaction.emoji}
                                type="button"
                                className="message-reaction"
                                onClick={() => {
                                    sendReaction(
                                        message.id,
                                        reaction.emoji
                                    );
                                }}
                            >
                                <span>
                                    {reaction.emoji}
                                </span>

                                <span>
                                    {reaction.count}
                                </span>
                            </button>

                        )
                    )}

                </div>

            )}

        </div>

    );
}


export default MessageBubble;