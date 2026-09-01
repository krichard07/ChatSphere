import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    BsHash,
    BsSearch,
    BsThreeDotsVertical,
    BsPin,
    BsBellSlash,
    BsBoxArrowRight,
    BsTrash,
} from "react-icons/bs";

import "./ChatHeader.css";


function ChatHeader({
    selectedChannel,
    messages,
    searchOpen,
    setSearchOpen,
}) {

    const [
        menuOpen,
        setMenuOpen,
    ] = useState(false);

    const menuRef =
        useRef(null);

    const menuButtonRef =
        useRef(null);

    const hasSelectedChannel =
        Boolean(selectedChannel);


    useEffect(() => {

        if (!menuOpen) {
            return;
        }

        const handleOutsideClick = (
            event
        ) => {

            const clickedInsideMenu =
                menuRef.current?.contains(
                    event.target
                );

            const clickedMenuButton =
                menuButtonRef.current?.contains(
                    event.target
                );

            if (
                !clickedInsideMenu &&
                !clickedMenuButton
            ) {

                setMenuOpen(false);

            }

        };


        const handleEscape = (
            event
        ) => {

            if (event.key === "Escape") {

                setMenuOpen(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        window.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [menuOpen]);


    return (

        <div className="chat-header">

            <div className="chat-header-left">

                <h2 className="channel-title">

                    <BsHash />

                    {
                        selectedChannel?.name ||
                        "Válassz egy csatornát"
                    }

                </h2>


                <div className="channel-info">

                    <span className="channel-description">

                        Nyilvános csatorna

                    </span>


                    <span className="channel-divider">

                        •

                    </span>


                    <span className="channel-count">

                        {
                            messages?.length || 0
                        } üzenet

                    </span>

                </div>

            </div>


            <div className="chat-header-right">

                <button
                    type="button"
                    className="glass-btn"
                    title="Keresés"
                    disabled={
                        !hasSelectedChannel
                    }
                    onClick={() => {

                        if (
                            !hasSelectedChannel
                        ) {
                            return;
                        }

                        setSearchOpen(
                            !searchOpen
                        );

                        setMenuOpen(false);
                    }}
                >

                    <BsSearch />

                </button>


                <div className="header-menu-wrapper">

                    <button
                        ref={menuButtonRef}
                        type="button"
                        className="glass-btn"
                        title="További lehetőségek"
                        disabled={
                            !hasSelectedChannel
                        }
                        onClick={() => {

                            if (
                                !hasSelectedChannel
                            ) {
                                return;
                            }

                            setMenuOpen(
                                (current) =>
                                    !current
                            );

                            setSearchOpen(false);
                        }}
                    >

                        <BsThreeDotsVertical />

                    </button>


                    {menuOpen && (

                        <div
                            ref={menuRef}
                            className="header-context-menu"
                        >

                            <button
                                type="button"
                                className="header-menu-item"
                            >

                                <BsPin />

                                <span>
                                    Kitűzött üzenetek
                                </span>

                            </button>


                            <button
                                type="button"
                                className="header-menu-item"
                            >

                                <BsBellSlash />

                                <span>
                                    Némítás
                                </span>

                            </button>


                            <div className="header-menu-divider" />


                            <button
                                type="button"
                                className="
                                    header-menu-item
                                    header-menu-warning
                                "
                            >

                                <BsBoxArrowRight />

                                <span>
                                    Csatorna elhagyása
                                </span>

                            </button>


                            <button
                                type="button"
                                className="
                                    header-menu-item
                                    header-menu-danger
                                "
                            >

                                <BsTrash />

                                <span>
                                    Csatorna törlése
                                </span>

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}


export default ChatHeader;