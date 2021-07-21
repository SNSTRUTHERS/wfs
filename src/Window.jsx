import React from "react";
import "./Window.css";

/**
 * @typedef {{
 *      title?: string,
 *      movable?: boolean
 *      resizable?: boolean,
 *      style?: React.CSSProperties,
 *      onClose?: React.MouseEventHandler<HTMLButtonElement>,
 *      onMouseDown?: React.MouseEventHandler<HTMLDivElement
 * }} WindowProps
 */

/**
 * @brief Creates a window component.
 * 
 * @param {React.PropsWithChildren<WindowProps>} props
 * 
 * @returns A new window component.
 */
const Window = ({
    children,
    onClose,
    onMouseDown,
    style,
    movable = false,
    resizable = false,
    title = "Window"
}) => {
    const classNameStr = `Window${
        resizable ? ' resizable': ''
    }${
        movable ? ' movable': ''
    }`;

    let topStyle;
    if (style) {
        const {
            marginBottom,
            marginLeft,
            marginRight,
            marginTop,
            width,
            ...rest
        } = style;

        topStyle = {
            marginBottom,
            marginLeft,
            marginRight,
            marginTop,
            width
        };
        style = rest;
    }

    function onMouseDownMove(event) {
        onMouseDown(event);
        if (!event.isPropagationStopped() && event.buttons === 1) {
            event.preventDefault();
            event.stopPropagation();

            let parent = event.target;
            while (parent && !parent.classList.contains("Window"))
                parent = parent.parentElement;
            if (!parent)
                return;

            const style = getComputedStyle(parent);
            let left = parseInt(style.left), top = parseInt(style.top);
            let width = parseInt(style.width), height = parseInt(style.height);

            function onMouseMove(event) {
                left += event.movementX;
                top += event.movementY;
                parent.style.left = `${left}px`;
                parent.style.top = `${top}px`;
            }
            
            function onMouseUp() {
                window.removeEventListener('mousemove', onMouseMove, true);
                window.removeEventListener('mouseup', onMouseUp, true);
                document.body.style.cursor = "";
            }

            document.body.style.cursor = "all-scroll";
            parent.style.position = 'absolute';
            parent.style.left = `${left}px`;
            parent.style.top = `${top}px`;
            parent.style.width = `${width}px`;
            parent.style.height = `${height}px`;

            window.addEventListener('mousemove', onMouseMove, true);
            window.addEventListener('mouseup', onMouseUp, true);
        }
    }

    function onMouseDownResize(event) {
        event.stopPropagation();

        if (event.buttons === 1 && event.target.className === "resize-anchor") {
            event.preventDefault();

            let parent = event.target;
            while (parent && !parent.classList.contains("Window"))
                parent = parent.parentElement;
            if (!parent)
                return;
            
            const style = getComputedStyle(parent);
            let left = parseInt(style.left), top = parseInt(style.top);
            let width = parseInt(style.width), height = parseInt(style.height);
            
            const windowBodyStyle = parent.querySelector(".Window-body").style;
            windowBodyStyle.width = "";
            windowBodyStyle.height = "";

            if (event.target.tagName === "SPAN") {
                function onMouseMove(event) {
                    width += event.movementX;
                    height += event.movementY;
                    parent.style.width = `${width}px`;
                    parent.style.height = `${height}px`;
                }
                
                function onMouseUp() {
                    window.removeEventListener('mousemove', onMouseMove, true);
                    window.removeEventListener('mouseup', onMouseUp, true);
                    document.body.style.cursor = "";
                }

                document.body.style.cursor = "nwse-resize";
                parent.style.position = 'absolute';
                parent.style.left = `${left}px`;
                parent.style.top = `${top}px`;
                parent.style.width = `${width}px`;
                parent.style.height = `${height}px`;

                window.addEventListener('mousemove', onMouseMove, true);
                window.addEventListener('mouseup', onMouseUp, true);
            } else {
                function onMouseMove(event) {
                    //
                }
                
                function onMouseUp() {
                    window.removeEventListener('mousemove', onMouseMove, true);
                    window.removeEventListener('mouseup', onMouseUp, true);
                    document.body.style.cursor = "";
                }

                window.addEventListener('mousemove', onMouseMove, true);
                window.addEventListener('mouseup', onMouseUp, true);
            }
        }
    }

    return <div className={classNameStr} style={topStyle}>
        <div
            className="Window-title"
            onMouseDown={movable ? onMouseDownMove : onMouseDown}
        >
            <span className="Window-title-text">{title}</span>
            <span />
            <button
                className="minimize"
                disabled
            />
            <button
                className="maximize"
                disabled
            />
            <button
                onClick={onClose}
                className="close"
            />
        </div>
        <div className="Window-body" style={style}>
            {resizable ?
                <div
                    className="resize-anchor"
                    onMouseDown={onMouseDownResize}
                    children={<>
                        {children}
                        <span
                            className="resize-anchor"
                            onMouseDown={onMouseDownResize}
                        />
                    </>}
                /> :
                children
            }
        </div>
    </div>;
};

export default Window;
