import { useEffect, useRef, useState } from "react";
import { init } from "pptx-preview";

import "./PowerPointPreview.css";

function PowerPointPreview({ fileUrl, zoom }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    const [slideCount, setSlideCount] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState(null);

    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

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
    }, [zoom, currentSlide]);

    const getDragLimits = () => {
        if (!containerRef.current) {
            return {
                x: 0,
                y: 0,
            };
        }

        const container =
            containerRef.current;

        const viewport =
            container.parentElement;

        if (!viewport) {
            return {
                x: 0,
                y: 0,
            };
        }

        const viewportWidth =
            viewport.clientWidth;

        const viewportHeight =
            viewport.clientHeight;

        const slideWidth =
            960 * zoom;

        const slideHeight =
            540 * zoom;

        return {
            x: Math.max(
                0,
                (slideWidth - viewportWidth) / 2
            ),

            y: Math.max(
                0,
                (slideHeight - viewportHeight) / 2
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

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        let cancelled = false;

        const loadPresentation = async () => {
            try {
                setError(null);

                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error(
                        `A PowerPoint fájl nem tölthető be. HTTP ${response.status}`
                    );
                }

                const arrayBuffer =
                    await response.arrayBuffer();

                if (
                    cancelled ||
                    !containerRef.current
                ) {
                    return;
                }

                containerRef.current.innerHTML = "";

                const viewer = init(
                    containerRef.current,
                    {
                        width: 960,
                        height: 540,
                        mode: "slide",
                    }
                );

                viewerRef.current = viewer;

                await viewer.preview(arrayBuffer);

                if (cancelled) {
                    return;
                }

                setSlideCount(viewer.slideCount);
                setCurrentSlide(0);
            } catch (err) {
                console.error(
                    "PowerPoint előnézeti hiba:",
                    err
                );

                if (!cancelled) {
                    setError(
                        "A PowerPoint fájl előnézete nem tölthető be."
                    );
                }
            }
        };

        loadPresentation();

        return () => {
            cancelled = true;

            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }

            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [fileUrl]);

    const goToPreviousSlide = () => {
        if (!viewerRef.current || slideCount === 0) {
            return;
        }

        const nextSlide =
            currentSlide > 0
                ? currentSlide - 1
                : slideCount - 1;

        viewerRef.current.renderSingleSlide(nextSlide);
        setCurrentSlide(nextSlide);
    };

    const goToNextSlide = () => {
        if (!viewerRef.current || slideCount === 0) {
            return;
        }

        const nextSlide =
            currentSlide < slideCount - 1
                ? currentSlide + 1
                : 0;

        viewerRef.current.renderSingleSlide(nextSlide);
        setCurrentSlide(nextSlide);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goToPreviousSlide();
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                goToNextSlide();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        currentSlide,
        slideCount,
    ]);

    if (error) {
        return (
            <div className="preview-placeholder">
                {error}
            </div>
        );
    }

    return (
        <div className="powerpoint-preview">

            <div
                ref={containerRef}
                className="powerpoint-preview-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform:
                        `translate(${position.x}px, ${position.y}px) scale(${zoom})`,

                    transformOrigin: "center center",

                    transition:
                        dragging.current
                            ? "none"
                            : "transform 0.2s ease",

                    cursor:
                        zoom > 1
                            ? dragging.current
                                ? "grabbing"
                                : "grab"
                            : "default",
                }}
            />

            {slideCount > 0 && (
                <div className="powerpoint-navigation">

                    <button
                        type="button"
                        onClick={goToPreviousSlide}
                        aria-label="Előző dia"
                    >
                        ◀
                    </button>

                    <span>
                        {currentSlide + 1} / {slideCount}
                    </span>

                    <button
                        type="button"
                        onClick={goToNextSlide}
                        aria-label="Következő dia"
                    >
                        ▶
                    </button>

                </div>
            )}

        </div>
    );
}

export default PowerPointPreview;