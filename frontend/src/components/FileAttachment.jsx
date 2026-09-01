import {
    HiDocument,
    HiArrowDownTray,
    HiDocumentText,
    HiArchiveBox,
    HiPhoto,
    HiFilm,
    HiMusicalNote,
    HiCodeBracket,
    HiArrowTopRightOnSquare,
} from "react-icons/hi2";

import api from "../api/api";

import "./FileAttachment.css";

const FILE_TYPES = {
    pdf: {
        icon: HiDocumentText,
        label: "PDF dokumentum",
    },

    doc: {
        icon: HiDocumentText,
        label: "Word dokumentum",
    },

    docx: {
        icon: HiDocumentText,
        label: "Word dokumentum",
    },

    txt: {
        icon: HiDocumentText,
        label: "Szövegfájl",
    },

    zip: {
        icon: HiArchiveBox,
        label: "ZIP archívum",
    },

    rar: {
        icon: HiArchiveBox,
        label: "RAR archívum",
    },

    "7z": {
        icon: HiArchiveBox,
        label: "7z archívum",
    },

    png: {
        icon: HiPhoto,
        label: "Kép",
    },

    jpg: {
        icon: HiPhoto,
        label: "Kép",
    },

    jpeg: {
        icon: HiPhoto,
        label: "Kép",
    },

    gif: {
        icon: HiPhoto,
        label: "Kép",
    },

    mp3: {
        icon: HiMusicalNote,
        label: "Hangfájl",
    },

    wav: {
        icon: HiMusicalNote,
        label: "Hangfájl",
    },

    mp4: {
        icon: HiFilm,
        label: "Videó",
    },

    mov: {
        icon: HiFilm,
        label: "Videó",
    },

    js: {
        icon: HiCodeBracket,
        label: "JavaScript",
    },

    py: {
        icon: HiCodeBracket,
        label: "Python",
    },

    cs: {
        icon: HiCodeBracket,
        label: "C#",
    },
};

function FileAttachment({
    attachment,
    type,
    setPreview,
}) {

    const fileName = attachment.file.split("/").pop();

    const fileUrl = `http://127.0.0.1:8000${attachment.file}`;

    const extension = fileName
        .split(".")
        .pop()
        .toLowerCase();

    const fileType = FILE_TYPES[extension] ?? {
        icon: HiDocument,
        label: "Fájl",
    };

    const Icon = fileType.icon;

    const canPreview = type !== "unknown";

    const openPreview = async () => {

        if (!canPreview) {
            return;
        }

        try {

            const response = await api.get(
                `/chat/attachments/${attachment.id}/preview/`
            );

            console.log(response.data);

            setPreview(response.data);

        } catch (error) {

            console.error(
                "Preview betöltési hiba:",
                error
            );

        }

    };

    const downloadFile = async () => {

        const response = await fetch(fileUrl);

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    };

    return (

        <div className="file-attachment">

            <div className="file-icon">
                <Icon />
            </div>

            <div className="file-info">

                <div className="file-name">
                    {fileName}
                </div>

                <div className="file-type">
                    {fileType.label}
                </div>

            </div>

            {canPreview && (

                <button
                    className="file-preview"
                    onClick={openPreview}
                    title="Előnézet"
                >
                    <HiArrowTopRightOnSquare />
                </button>

            )}

            <button
                className="file-download"
                onClick={downloadFile}
                title="Letöltés"
            >
                <HiArrowDownTray />
            </button>

        </div>

    );

}

export default FileAttachment;