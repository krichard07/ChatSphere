import { useEffect, useState } from "react";

import {
    DocumentViewer,
} from "react-docxodus-viewer";

import "react-docxodus-viewer/styles.css";

function WordPreviewV2({
    fileUrl,
    zoom,
}) {

    const [file, setFile] = useState(null);

    useEffect(() => {

        const loadFile = async () => {

            try {

                const response =
                    await fetch(fileUrl);

                const blob =
                    await response.blob();

                const file =
                    new File(
                        [blob],
                        "document.docx",
                        {
                            type: blob.type,
                        }
                    );

                setFile(file);

            } catch (error) {

                console.error(
                    "DOCX betöltési hiba:",
                    error
                );

            }

        };

        loadFile();

    }, [fileUrl]);

    if (!file) {

        return (

            <div
                className="preview-placeholder"
            >

                Dokumentum betöltése...

            </div>

        );

    }

    return (

        <DocumentViewer
            file={file}
            toolbar="none"
            fitMode="page-width"
            wasmBasePath="/wasm"
            settings={{
                paginationScale: zoom,
            }}
        />

    );

}

export default WordPreviewV2;