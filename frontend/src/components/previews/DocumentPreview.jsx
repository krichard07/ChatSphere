import "./DocumentPreview.css";

import PdfPreview from "./document/PdfPreview";
import WordPreview from "./document/WordPreview";
import ExcelPreview from "./document/ExcelPreview";
import PowerPointPreview from "./document/PowerPointPreview";

function DocumentPreview({ preview, zoom }) {

    const extension = preview.filename
        ?.split(".")
        .pop()
        .toLowerCase();

    const documentType = {

        pdf: "pdf",

        doc: "word",
        docx: "word",
        odt: "word",
        rtf: "word",

        xls: "excel",
        xlsx: "excel",
        ods: "excel",
        csv: "excel",

        ppt: "powerpoint",
        pptx: "powerpoint",
        odp: "powerpoint",

    }[extension] ?? "unknown";

    const fileUrl =
        `http://127.0.0.1:8000${preview.attachment.file}`;

    switch (documentType) {

        case "pdf":
            return (
                <PdfPreview
                    fileUrl={fileUrl}
                    zoom={zoom}
                />
            );

        case "word":
            return (
                <WordPreview
                    fileUrl={fileUrl}
                    zoom={zoom}
                />
            );

        case "excel":
            return (
                <ExcelPreview
                    fileUrl={fileUrl}
                    zoom={zoom}
                />
            );

        case "powerpoint":
            return (
                <PowerPointPreview
                    fileUrl={fileUrl}
                    zoom={zoom}
                />
            );

        default:

            return (

                <div className="preview-placeholder">

                    Ez a dokumentumtípus még nem támogatott.

                </div>

            );

    }

}

export default DocumentPreview;