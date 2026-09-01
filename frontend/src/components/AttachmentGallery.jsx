import "./AttachmentGallery.css";
import FileAttachment from "./FileAttachment";
import VoiceMessage from "./VoiceMessage";

function AttachmentGallery({
    attachments = [],
    setPreview,
}) {

    if (attachments.length === 0) {
        return null;
    }

    const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
    ];

    const textExtensions = [
        "txt",
        "md",
        "json",
        "csv",
        "xml",
        "yaml",
        "yml",
        "log",
    ];

    const documentExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
    ];

    const videoExtensions = [
        "mp4",
        "webm",
        "mov",
        "avi",
        "mkv",
    ];

    const audioExtensions = [
        "mp3",
        "wav",
        "ogg",
        "aac",
        "flac",
    ];

    const imageAttachments = [];
    const textAttachments = [];
    const documentAttachments = [];
    const mediaAttachments = [];
    const audioAttachments = []
    const otherAttachments = [];

    attachments.forEach((attachment) => {

        const extension = attachment.file
            .split(".")
            .pop()
            .toLowerCase();

        if (imageExtensions.includes(extension)) {

            imageAttachments.push(attachment);

        } else if (textExtensions.includes(extension)) {

            textAttachments.push(attachment);

        } else if (documentExtensions.includes(extension)) {

            documentAttachments.push(attachment);

        } else if (
            audioExtensions.includes(extension) ||
            extension === "webm"
        ) {

            audioAttachments.push(attachment);

        } else if (
            videoExtensions.includes(extension)
        ) {

            mediaAttachments.push(attachment);

        } else {

            otherAttachments.push(attachment);

        }

    });


    return (

        <div className="attachment-gallery">

            {imageAttachments.length === 1 && (

                <div className="image-message">

                    <img
                        src={`http://127.0.0.1:8000${imageAttachments[0].file}`}
                        alt="Uploaded"
                        className="single-image"
                        onClick={() =>
                            setPreview({
                                type: "image",
                                images: imageAttachments,
                                currentIndex: 0,
                            })
                        }
                    />

                </div>

            )}

            {imageAttachments.length > 1 && (

                <div className="image-message">

                    <div
                        className="image-stack"
                        onClick={() =>
                            setPreview({
                                type: "image",
                                images: imageAttachments,
                                currentIndex: 0,
                            })
                        }
                    >

                        <img
                            src={`http://127.0.0.1:8000${imageAttachments[2]?.file ?? imageAttachments[0].file}`}
                            alt=""
                            className="stack-back-2"
                        />

                        <img
                            src={`http://127.0.0.1:8000${imageAttachments[1]?.file ?? imageAttachments[0].file}`}
                            alt=""
                            className="stack-back-1"
                        />

                        <img
                            src={`http://127.0.0.1:8000${imageAttachments[0].file}`}
                            alt="Uploaded"
                            className="stack-front"
                        />

                    </div>

                </div>

            )}

            {(
                textAttachments.length > 0 ||
                documentAttachments.length > 0 ||
                mediaAttachments.length > 0 ||
                audioAttachments.length > 0 ||
                otherAttachments.length > 0
            ) && (

                <div className="attachment-files">

                    {textAttachments.map((attachment) => (

                        <FileAttachment
                            key={attachment.id}
                            attachment={attachment}
                            type="text"
                            setPreview={setPreview}
                        />

                    ))}

                    {documentAttachments.map((attachment) => (

                        <FileAttachment
                            key={attachment.id}
                            attachment={attachment}
                            type="document"
                            setPreview={setPreview}
                        />

                    ))}

                    {mediaAttachments.map((attachment) => (

                        <FileAttachment
                            key={attachment.id}
                            attachment={attachment}
                            type="media"
                            setPreview={setPreview}
                        />

                    ))}

                    {audioAttachments.map((attachment) => (
                        
                        <VoiceMessage
                            key={attachment.id}
                            attachment={attachment}
                        />
                    ))}

                    {otherAttachments.map((attachment) => (

                        <FileAttachment
                            key={attachment.id}
                            attachment={attachment}
                            type="unknown"
                            setPreview={setPreview}
                        />

                    ))}

                </div>

            )}

        </div>

    );

}

export default AttachmentGallery;