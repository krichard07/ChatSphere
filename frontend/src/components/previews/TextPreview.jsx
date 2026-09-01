import "./TextPreview.css";

function TextPreview({
    preview,
}) {

    return (

        <div
            className="text-preview"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="text-preview-header">

                <h2>
                    {preview.filename}
                </h2>

            </div>

            <pre className="text-preview-content">

                {preview.content}

            </pre>

        </div>

    );

}

export default TextPreview;