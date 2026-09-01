import {
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import DocumentPreview from "../components/previews/DocumentPreview";
import ImagePreview from "../components/previews/ImagePreview";
import PreviewToolbar from "../components/previews/PreviewToolbar";

import "./DocumentPreviewPage.css";

function DocumentPreviewPage() {

    const [searchParams] =
        useSearchParams();

    const file =
        searchParams.get("file");

    const type =
        searchParams.get("type") ?? "document";

    const [zoom, setZoom] =
        useState(1);

    const DEFAULT_ZOOM = 1;
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2.6;
    const ZOOM_STEP = 0.2;

    if (!file) {

        return (

            <div className="document-page">

                Nincs megadott fájl.

            </div>

        );

    }

    const filename =
        decodeURIComponent(file)
            .split("/")
            .pop();

    const isImage =
        type === "image";

    const preview = {

        filename,

        currentIndex: 0,

        images: isImage
            ? [
                {
                    file,
                },
            ]
            : [],

        attachment: {
            file,
        },

    };

    const fileUrl =
        `http://127.0.0.1:8000${file}`;

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

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    };

    return (

        <div className="document-page">

            <PreviewToolbar

                onDownload={downloadFile}

                onOpen={() => {}}

                onClose={() =>
                    window.close()
                }

                canDownload={true}

                canOpen={false}

                zoom={zoom}

                onZoomIn={() =>
                    setZoom(
                        z =>
                            Math.min(
                                z + ZOOM_STEP,
                                MAX_ZOOM
                            )
                    )
                }

                onZoomOut={() =>
                    setZoom(
                        z =>
                            Math.max(
                                z - ZOOM_STEP,
                                MIN_ZOOM
                            )
                    )
                }

                onReset={() =>
                    setZoom(DEFAULT_ZOOM)
                }

            />

            <div className="document-page-content">

                {isImage ? (

                    <ImagePreview

                        preview={preview}

                        previousImage={() => {}}

                        nextImage={() => {}}

                        zoom={zoom}

                        showNavigation={false}

                    />

                ) : (

                    <DocumentPreview

                        preview={preview}

                        zoom={zoom}

                    />

                )}

            </div>

        </div>

    );

}

export default DocumentPreviewPage;