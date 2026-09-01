import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./PdfPreview.css";

pdfjs.GlobalWorkerOptions.workerSrc =
    `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfPreview({ fileUrl, zoom }) {

    const [numPages, setNumPages] =
        useState(null);

    return (

        <div className="document-preview">

            <div className="document-viewer">

                <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) =>
                        setNumPages(numPages)
                    }
                >

                    {Array.from(
                        {
                            length: numPages || 0,
                        },
                        (_, index) => (

                            <Page
                                key={index}
                                pageNumber={index + 1}
                                scale={zoom}
                            />

                        )
                    )}

                </Document>

            </div>

        </div>

    );

}

export default PdfPreview;