import { useEffect, useRef } from "react";

import { renderAsync } from "docx-preview";

import "./WordPreview.css";

function WordPreview({ fileUrl, zoom }) {

    const wordContainerRef = useRef(null);

    useEffect(() => {

        const loadDocument = async () => {

            try {

                const response = await fetch(fileUrl);

                const blob = await response.blob();

                if (!wordContainerRef.current) {
                    return;
                }

                wordContainerRef.current.innerHTML = "";

                await renderAsync(
                    blob,
                    wordContainerRef.current,
                    undefined,
                    {
                        className: "docx",
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false,
                        ignoreFonts: false,
                        breakPages: true,
                    }
                );

                const pages =
                    wordContainerRef.current.querySelectorAll("section.docx");

                pages.forEach((page) => {

                    const baseWidth = 595;
                    const baseHeight = 842;
                    const basePadding = 70.85;

                    page.style.width =
                        `${baseWidth * zoom}pt`;

                    page.style.minHeight =
                        `${baseHeight * zoom}pt`;

                    page.style.padding =
                        `${basePadding * zoom}pt`;

                });

                const elements =
                    wordContainerRef.current.querySelectorAll("span");

                elements.forEach((element) => {

                    const style =
                        window.getComputedStyle(element);

                    const fontSize =
                        parseFloat(style.fontSize);

                    if (!Number.isNaN(fontSize)) {

                        element.style.fontSize =
                            `${fontSize * zoom}px`;

                    }

                    /*const lineHeight =
                        parseFloat(style.lineHeight);

                    if (!Number.isNaN(lineHeight)) {

                        element.style.lineHeight =
                            `${lineHeight * zoom}px`;

                    }*/

                });

            } catch (error) {

                console.error(
                    "DOCX betöltési hiba:",
                    error
                );

            }

        };

        loadDocument();

    }, [fileUrl, zoom]);

    return (

        <div className="document-preview">

            <div className="document-viewer">

                <div
                    className="document-scale"
                >

                    <div ref={wordContainerRef} />

                </div>

            </div>

        </div>

    );

}

export default WordPreview;