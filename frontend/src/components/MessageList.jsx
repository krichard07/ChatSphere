import {
    Fragment,
    useState,
} from "react";

import "./MessageList.css";

import MessageBubble from "./MessageBubble";


function MessageList({
    messages,
    currentUser,
    messagesEndRef,
    searchTerm,
    messageRefs,
    preview,
    setPreview,
    startEditingMessage,
    deleteMessage,
    hideMessage,
    startReplying,
    sendReaction,
}) {

    const [
        activeMenuMessageId,
        setActiveMenuMessageId,
    ] = useState(null);


    const shouldShowTimestamp = (
        currentMessage,
        previousMessage
    ) => {

        if (!previousMessage) {
            return true;
        }

        const currentDate =
            new Date(
                currentMessage.created_at
            );

        const previousDate =
            new Date(
                previousMessage.created_at
            );

        const timeDifference =
            currentDate.getTime() -
            previousDate.getTime();

        const fifteenMinutes =
            15 * 60 * 1000;

        const differentDay =
            currentDate.toDateString() !==
            previousDate.toDateString();


        return (
            differentDay ||
            timeDifference >= fifteenMinutes
        );
    };


    const formatTimestamp = (
        createdAt
    ) => {

        const date =
            new Date(createdAt);

        const now =
            new Date();


        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        const messageDay =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );


        const differenceInDays =
            Math.round(
                (
                    today.getTime() -
                    messageDay.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const time =
            date.toLocaleTimeString(
                "hu-HU",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );


        if (differenceInDays === 0) {

            return `Ma ${time}`;

        }


        if (differenceInDays === 1) {

            return `Tegnap ${time}`;

        }


        return date.toLocaleString(
            "hu-HU",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    return (

        <div className="messages">

            {messages.map(
                (
                    message,
                    index
                ) => {

                    const previousMessage =
                        messages[
                            index - 1
                        ];


                    const showTimestamp =
                        shouldShowTimestamp(
                            message,
                            previousMessage
                        );


                    return (

                        <Fragment
                            key={message.id}
                        >

                            {showTimestamp && (

                                <div className="message-timestamp">

                                    {formatTimestamp(
                                        message.created_at
                                    )}

                                </div>

                            )}

                            <MessageBubble
                                message={message}
                                currentUser={currentUser}
                                searchTerm={searchTerm}
                                messageRefs={messageRefs}
                                preview={preview}
                                setPreview={setPreview}
                                startEditingMessage={startEditingMessage}
                                isMenuOpen={ activeMenuMessageId ===message.id}
                                openMenu={() => {setActiveMenuMessageId(message.id);}}
                                closeMenu={() => {setActiveMenuMessageId(null);}}
                                deleteMessage={deleteMessage}
                                hideMessage={hideMessage}
                                startReplying={startReplying}
                                sendReaction={sendReaction}
                            />

                        </Fragment>
                    );
                }
            )}
            <div
                ref={messagesEndRef}
            />
        </div>
    );
}


export default MessageList;