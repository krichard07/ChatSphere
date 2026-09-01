import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Workbook,
} from "@fortune-sheet/react";

import {
    transformExcelToFortune,
} from "@corbe30/fortune-excel";

import "@fortune-sheet/react/dist/index.css";

import "./ExcelPreview.css";


function ExcelPreview({
    fileUrl,
    zoom,
}) {

    const sheetRef =
        useRef(null);

    const [sheets, setSheets] =
        useState([]);

    const [workbookKey, setWorkbookKey] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        let cancelled = false;


        const loadWorkbook = async () => {

            try {

                setLoading(true);
                setError("");
                setSheets([]);


                const response =
                    await fetch(fileUrl);


                if (!response.ok) {

                    throw new Error(
                        "Az Excel fájl nem tölthető be."
                    );

                }


                const blob =
                    await response.blob();


                if (cancelled) {
                    return;
                }


                await transformExcelToFortune(
                    blob,
                    (importedSheets) => {

                        if (cancelled) {
                            return;
                        }

                        console.log(
                            "EXCEL TRANSFORM INDUL"
                        );

                        console.log(
                            "EREDETI IMPORTÁLT SHEETS:",
                            importedSheets
                        );

                        console.log(
                            "IMPORTÁLT SHEET ID-K:",
                            importedSheets.map((sheet) => ({
                                id: sheet.id,
                                name: sheet.name,
                                order: sheet.order,
                            }))
                        );

                        setSheets(
                            importedSheets
                        );

                    },
                    (key) => {

                        if (cancelled) {
                            return;
                        }

                        setWorkbookKey(
                            key
                        );

                    },
                    null
                );


            } catch (err) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Excel betöltési hiba:",
                    err
                );


                setError(
                    "Az Excel fájl előnézete nem tölthető be."
                );

            } finally {

                if (!cancelled) {

                    setLoading(
                        false
                    );

                }

            }

        };


        loadWorkbook();


        return () => {

            cancelled = true;

        };


    }, [fileUrl]);


    /*
     * A zoom értékét továbbra is frissítjük
     * az importált sheet objektumokon.
     */
    useEffect(() => {

        if (!sheets.length) {
            return;
        }


        setSheets(
            currentSheets =>
                currentSheets.map(
                    sheet => ({
                        ...sheet,
                        zoomRatio: zoom,
                    })
                )
        );


    }, [zoom]);


    if (loading) {

        return (
            <div className="excel-preview-state">

                Excel dokumentum betöltése...

            </div>
        );

    }


    if (error) {

        return (
            <div className="excel-preview-state">

                {error}

            </div>
        );

    }


    if (!sheets.length) {

        return (
            <div className="excel-preview-state">

                Az Excel fájl nem tartalmaz
                megjeleníthető munkalapot.

            </div>
        );

    }


    return (

        <div className="excel-preview">

            <Workbook
                key={workbookKey}
                data={sheets}
                ref={sheetRef}
                showToolbar={false}
                showFormulaBar={false}
                allowEdit={false}
            />

        </div>

    );

}


export default ExcelPreview;