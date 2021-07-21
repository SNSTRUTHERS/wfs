import React, { useReducer, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import Router from "./Router";
import Window from "./Window";

import './App.css';

const ID_CHARS =
    "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "0123456789+-_=.,;:?!/#$%&~"
;

const App = () => {
    const [ name, setName ] = useState("/");

    const [ windows, dispatchWindows ] = useReducer(function (state, action) {
        switch (action.type) {
        case 'REMOVE_WINDOW':
            return state.filter(function (win) {
                return win.props.id !== action.id
            });
        
        case 'MOVE_WINDOW':
            return [ ...state.filter(function (win) {
                return win.props.id !== action.window.props.id
            }), action.window ];

        case 'ADD_WINDOW':
        default:
            return [ ...state, action.window ];
        }
    }, []);

    function setNameAndTitle(name) {
        setName(name);
        document.title = `Web File System ~ ${name}`;
    }

    function addWindow(title, children) {
        let id = "";
        for (let i = 0; i < 32; i++)
            id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];

        const window = <Window
            title={title}
            resizable movable
            onClose={function () {
                dispatchWindows({ type: 'REMOVE_WINDOW', id });
            }}
            onMouseDown={function () {
                dispatchWindows({ type: 'MOVE_WINDOW', window });
            }}
            key={id}
            id={id}
            children={<div
                className="container"
                children={children}
                style={{ flexFlow: 'column' }}
            />}
            style={{ height: "256px" }}
        />;

        dispatchWindows({ window });
    }

    return <div className="App">
        <Window
            title={`Web File System ~ ${name}`}
            style={{
                width: "calc(100vw - 2em)",
                height: "calc(100vh - 1.25em - 2em)"
            }}
            onClose={window.close}
        >
            <BrowserRouter>
                <Router
                    addWindow={addWindow}
                    path={name}
                    setPath={setNameAndTitle}
                />
            </BrowserRouter>
        </Window>

        {windows}
    </div>;
};

export default App;
