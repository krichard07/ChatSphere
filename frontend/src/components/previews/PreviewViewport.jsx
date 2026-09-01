import {
    TransformWrapper,
    TransformComponent,
} from "react-zoom-pan-pinch";

function PreviewViewport({
    children,
    onReady,
    onZoomChange,
}) {

    return (

        <TransformWrapper

            initialScale={1}

            minScale={1}
            maxScale={5}

            centerOnInit
            centerZoomedOut

            limitToBounds={false}

            wheel={{
                disabled: true,
            }}

            pinch={{
                disabled: true,
            }}

            doubleClick={{
                disabled: true,
            }}

            onInit={(utils) => {

                onReady?.({

                    zoomIn: () => utils.zoomIn(),

                    zoomOut: () => utils.zoomOut(),

                    reset: () => utils.resetTransform(),

                });

            }}

            onTransformed={(utils) => {

                onZoomChange?.(

                    utils.state.scale

                );

            }}

        >

            <TransformComponent

                wrapperStyle={{

                    width: "100%",
                    height: "100%",

                }}

                contentStyle={{

                    width: "100%",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "flex-start",

                }}

            >

                {children}

            </TransformComponent>

        </TransformWrapper>

    );

}

export default PreviewViewport;