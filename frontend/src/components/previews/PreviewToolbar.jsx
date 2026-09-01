import {
    HiArrowDownTray,
    HiArrowTopRightOnSquare,
    HiXMark,
    HiMinus,
    HiPlus,
} from "react-icons/hi2";

function PreviewToolbar({
    onDownload,
    onOpen,
    onClose,
    canOpen = true,
    canDownload = true,

    zoom = null,
    onZoomIn,
    onZoomOut,
}) {

    return (

        <div
            className="lightbox-toolbar"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="toolbar-left">

                {canDownload && (

                    <button
                        onClick={onDownload}
                        title="Letöltés"
                    >
                        <HiArrowDownTray />
                    </button>

                )}

                {canOpen && (

                    <button
                        onClick={onOpen}
                        title="Új lapon megnyitás"
                    >
                        <HiArrowTopRightOnSquare />
                    </button>

                )}

            </div>

            <div className="toolbar-center">

                {zoom !== null && (

                    <>

                        <button
                            onClick={onZoomOut}
                            title="Kicsinyítés"
                        >
                            <HiMinus />
                        </button>

                        <span>
                            {Math.round(zoom * 100)}%
                        </span>

                        <button
                            type="button"
                            onClick={(e) => {

                                e.stopPropagation();

                                console.log("PLUS gomb");

                                onZoomIn?.();

                            }}
                            title="Nagyítás"
                        >
                            <HiPlus />
                        </button>

                    </>

                )}

            </div>

            <div className="toolbar-right">

                <button
                    onClick={onClose}
                    title="Bezárás"
                >
                    <HiXMark />
                </button>

            </div>

        </div>

    );

}

export default PreviewToolbar;