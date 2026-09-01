import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    HiChevronLeft,
    HiChevronRight,
} from "react-icons/hi2";

import "./ImagePreview.css";

function ImagePreview({
    preview,
    previousImage,
    nextImage,
    zoom = 1,
    showNavigation = true,
}) {

    const currentImage =
        preview.images[preview.currentIndex];

    const imageUrl =
        `http://127.0.0.1:8000${currentImage.file}`;

    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const viewportRef = useRef(null);
    const imageRef = useRef(null);

    const dragging = useRef(false);

    const dragStart = useRef({
        x: 0,
        y: 0,
    });

    const startPosition = useRef({
        x: 0,
        y: 0,
    });

    useEffect(() => {

        setPosition({
            x: 0,
            y: 0,
        });

    }, [
        zoom,
        preview.currentIndex,
    ]);

    const getDragLimits = () => {

        if (
            !viewportRef.current ||
            !imageRef.current
        ) {
            return {
                x: 0,
                y: 0,
            };
        }

        const viewport =
            viewportRef.current;

        const image =
            imageRef.current;

        const viewportWidth =
            viewport.clientWidth;

        const viewportHeight =
            viewport.clientHeight;

        const imageWidth =
            image.offsetWidth * zoom;

        const imageHeight =
            image.offsetHeight * zoom;

        return {

            x: Math.max(
                0,
                (imageWidth - viewportWidth) / 2
            ),

            y: Math.max(
                0,
                (imageHeight - viewportHeight) / 2
            ),

        };

    };

    const handleMouseDown = (e) => {

        if (zoom <= 1) {
            return;
        }

        e.preventDefault();

        dragging.current = true;

        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
        };

        startPosition.current = {
            x: position.x,
            y: position.y,
        };

    };

    const handleMouseMove = (e) => {

        if (!dragging.current) {
            return;
        }

        const deltaX =
            e.clientX -
            dragStart.current.x;

        const deltaY =
            e.clientY -
            dragStart.current.y;

        const limits =
            getDragLimits();

        const nextX =
            startPosition.current.x +
            deltaX;

        const nextY =
            startPosition.current.y +
            deltaY;

        setPosition({

            x: Math.max(
                -limits.x,
                Math.min(
                    limits.x,
                    nextX
                )
            ),

            y: Math.max(
                -limits.y,
                Math.min(
                    limits.y,
                    nextY
                )
            ),

        });

    };

    const handleMouseUp = () => {

        dragging.current = false;

    };

    const handleMouseLeave = () => {

        dragging.current = false;

    };

    return (

        <>

            {showNavigation && (

                <button
                    className="lightbox-arrow left"
                    onClick={(e) => {

                        e.stopPropagation();

                        previousImage();

                    }}
                >

                    <HiChevronLeft />

                </button>

            )}

            <div
                ref={viewportRef}
                className="image-preview-viewport"
                onClick={(e) =>
                    e.stopPropagation()
                }
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >

                <img
                    ref={imageRef}
                    className="image-preview-image"
                    src={imageUrl}
                    alt=""
                    draggable={false}
                    style={{
                        transform:
                            `translate(${position.x}px, ${position.y}px) scale(${zoom})`,

                        cursor:
                            zoom > 1
                                ? dragging.current
                                    ? "grabbing"
                                    : "grab"
                                : "default",
                    }}
                />

            </div>

            {showNavigation && (

                <button
                    className="lightbox-arrow right"
                    onClick={(e) => {

                        e.stopPropagation();

                        nextImage();

                    }}
                >

                    <HiChevronRight />

                </button>

            )}

            <div className="lightbox-counter">

                {preview.currentIndex + 1}
                {" / "}
                {preview.images.length}

            </div>

        </>

    );

}

export default ImagePreview;