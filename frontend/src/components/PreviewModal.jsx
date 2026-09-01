import { useEffect, useRef, useState } from "react";

import "./PreviewModal.css";

import PreviewToolbar from "./previews/PreviewToolbar";
import PreviewViewport from "./previews/PreviewViewport";

import ImagePreview from "./previews/ImagePreview";
import TextPreview from "./previews/TextPreview";
import DocumentPreview from "./previews/DocumentPreview";

function PreviewModal({
    preview,
    setPreview,
    previousImage,
    nextImage,
}) {

    const viewportRef = useRef(null);

    const DEFAULT_ZOOM = 1;
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2.6;
    const ZOOM_STEP = 0.2;

    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    useEffect(() => {

        setZoom(DEFAULT_ZOOM);

    }, [preview]);

    useEffect(() => {

        if (!preview) {
            return;
        }

        const handleKeyDown = (e) => {

            switch (e.key) {

                case "ArrowLeft":

                    if (preview.type === "image") {
                        previousImage();
                    }

                    break;

                case "ArrowRight":

                    if (preview.type === "image") {
                        nextImage();
                    }

                    break;

                case "Escape":

                    setPreview(null);

                    break;

                default:
                    break;

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
        preview,
        previousImage,
        nextImage,
        setPreview,
    ]);

    if (!preview) {
        return null;
    }

    const previewType =
        preview.preview_type ?? preview.type;

    const isImage =
        previewType === "image";

    const isText =
        previewType === "text";

    const isDocument =
        previewType === "document";

    const isMedia =
        previewType === "media";

    let fileUrl = "";

    if (isImage) {

        const currentImage =
            preview.images[
                preview.currentIndex
            ];

        fileUrl =
            `http://127.0.0.1:8000${currentImage.file}`;

    } else if (preview.attachment?.file) {

        fileUrl =
            `http://127.0.0.1:8000${preview.attachment.file}`;

    }

    const downloadFile = async () => {

        const response =
            await fetch(fileUrl);

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            fileUrl.split("/").pop();

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    };

    const openInNewTab = () => {

        if (isDocument || isImage) {

            const filePath = isImage
                ? preview.images[preview.currentIndex].file
                : preview.attachment.file;

            const previewUrl =
                `/document-preview?type=${
                    isImage ? "image" : "document"
                }&file=${encodeURIComponent(filePath)}`;

            window.open(
                previewUrl,
                "_blank"
            );

            return;

        }

        window.open(
            fileUrl,
            "_blank"
        );

    };

    return (

        <div
            className="image-lightbox"
            onClick={() => setPreview(null)}
        >

            <PreviewToolbar
                onDownload={downloadFile}
                onOpen={openInNewTab}
                onClose={() => setPreview(null)}
                canDownload={true}
                canOpen={!!fileUrl}

                zoom={zoom}

                onZoomIn={() =>
                    setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM))
                }

                onZoomOut={() =>
                    setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM))
                }

                onReset={() =>
                    setZoom(DEFAULT_ZOOM)
                }
            />

            {isImage && (

                <ImagePreview
                preview={preview}
                previousImage={previousImage}
                nextImage={nextImage}
                zoom={zoom}
            />

            )}

            {isText && (

                <div
                    onClick={(e) => e.stopPropagation()}
                >

                    <TextPreview
                        preview={preview}
                    />

                </div>

            )}

            {isDocument && (

                <div
                    onClick={(e) => e.stopPropagation()}
                >

                    <DocumentPreview
                        preview={preview}
                        zoom={zoom}
                    />

                </div>

            )}

            {isMedia && (

                <div
                    className="preview-placeholder"
                    onClick={(e) => e.stopPropagation()}
                >
                    Media Viewer hamarosan...
                </div>

            )}

        </div>

    );

}

export default PreviewModal;