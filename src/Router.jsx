import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Redirect, Switch, useHistory } from "react-router-dom";

import AboutPage from "./AboutPage";
import DirectoryView from "./DirectoryView"
import GDriveFolderPicker from "./GDriveFolderPicker";
import OAuthHandler from "./OAuthHandler";

import { IDBDirectory } from "./wfs";

import useLocalStorage from "./hooks/useLocalStorage";
import { GDFile } from "./drivers/gdrive";

window.IDBDirectory = IDBDirectory;

/**
 * The client-side path router
 * @param {{
 *      path: string,
 *      setPath: (name: string) => void,
 *      addWindow: (title: string, children: JSX.Element) => void
 * }} props
 */
const Router = ({ path, setPath, addWindow }) => {
    const [ directory, setDirectory ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ rootDirectory, setRootDirectory ] = useState(null);
    const [ credentials, setCredentials ] = useLocalStorage({}, 'credentials');

    setPath("/");

    function clearCredential(key) {
        const { [key]: _, ...creds } = credentials;
        setCredentials(creds);
    }
    
    const history = useHistory();

    const setWindowTitle = useCallback(function (newPath) {
        let title = path;
        if (newPath !== '') {
            if (newPath === '..' && path === '/') {
                title = '/';
            } else {
                title = (newPath === '..' ?
                    `${path.split("/").slice(0, -2).join('/')}` :
                    `${path}${newPath}/`
                ) || '/';
            }
        }

        if (!title.endsWith('/'))
            title += '/';
        
        setPath(title);
        if (title !== '/') {
            title = title.split('/').map(
                (part) => encodeURIComponent(part)
            ).join('/');
        }

        return title;
    }, [ path, setPath ]);

    useEffect(function () {
        IDBDirectory.mount(null, "wfs").then((rootDirectory) => {
            setRootDirectory(rootDirectory);
        }).catch((error) => {
            console.error(error);
            alert(`Failed to load web file system root directory: ${
                error.toString()
            }`);
        });
    }, [ setRootDirectory, setWindowTitle ]);

    /**
     * 
     * @param {import("./wfs").WFSError} error 
     * @param {import("./wfs").WFSDirectory} directory 
     * @param {*} setDirectory 
     */
    async function handleOpenDirectoryError(error, directory, setDirectory) {
        const children = error.directory.children;
        const { driver } = children[error.filename];
        switch (driver) {
        case 'gdrive':
            if (!credentials.gdrive) {
                history.push(`/oauth`, {
                    to: `/files/${error.path}`,
                    after: error.remaining
                });
            } else {
                const promise = directory.open(
                    error.path,
                    { params: [ credentials.gdrive ] }
                ).catch(function (error) {
                    if (error.message.startsWith("Invalid credentials")) {
                        clearCredential('gdrive');
                        history.push(`/oauth`, {
                            to: `/files/${error.path}`,
                            after: error.remaining
                        });
                    } else {
                        console.error(error);
                        alert(error.message);
                    }
                });
                setDirectory(promise, { after: error.remaining });
            }
            break;
        default:
            throw error;
        }
    }

    function uploadFile() {
        const input = document.createElement("input");
        input.type = 'file';
        input.multiple = true;
        input.oninput = async function () {
            const files = Array.from(input.files);
            setLoading(true);

            Promise.all(files.map(function (file) {
                const names = Object.keys(directory.children);
                let name = file.name;
                if (names.includes(name)) {
                    let num = 2;
                    while (names.includes(`${name} (${num})`))
                        num++;
                    name = `${name} (${num})`;
                }
                
                return directory.open(name, {
                    data: [ file ],
                    mimeType: file.type,
                    modifiedTime: new Date(file.lastModified),
                    openExisting: false,
                    type: 'file'
                }).catch(function (error) {
                    console.error(error);
                    alert(`Error uploading "${file.name}": ${error.message}`);
                });
            })).then(function () {
                setLoading(false);
            });
        };
        input.click();
    }

    return <Switch>
        <Route exact path="/oauth" render={function (props) {
            return <OAuthHandler
                credentials={credentials}
                setCredentials={setCredentials}
                { ...props }
            />;
        }} />

        <Route path="/about" render={function ({
            location: { pathname }
        }) {
            return <AboutPage
                pathname={pathname.slice("/about/".length)}
                setWindowTitle={setPath}
            />;
        }} />

        <Route path="/mount/gdrive" render={function (props) {
            return <GDriveFolderPicker
                credentials={credentials}
                setCredentials={setCredentials}
                { ...props }
            />;
        }} />

        <Route exact path="/mount/idb" />

        <Route path="/files" render={function ({
            location: { state, pathname }
        }) {
            const urlPath = pathname.replace(
                /\/$/g, ''
            ).slice('/files/'.length);

            return rootDirectory && <>
            {loading && <div className="loading" />}
            <div className="container">
            <DirectoryView
                canDelete
                path={
                    (state && state.after && typeof state.after === 'string') ?
                    state.after : urlPath
            }
                rootDirectory={rootDirectory}
                onChange={function (dir) {
                    setDirectory(dir);
                    if (state &&
                        state.after &&
                        typeof state.after !== 'string'
                    ) {
                        const { after: { type, name, params }} = state;
                        setDirectory(dir.mount(name, type, ...params));
                    }
                }}
                onLoad={async function (dir, dirState, setDirectory) {
                    if (dirState && dirState.after && !dirState.type) {
                        setDirectory(dir.open(dirState.after), null);
                    }

                    setWindowTitle(
                        (state &&
                            state.after &&
                            typeof state.after === 'string'
                        ) ? state.after : urlPath
                    );
                    setLoading(false);
                }}
                onLoadError={async function (error, _, __, setDirectory) {
                    if (error.message.startsWith('Invalid credentials')) {
                        await handleOpenDirectoryError(
                            error,
                            rootDirectory,
                            setDirectory
                        );
                    } else {
                        throw error;
                    }
                }}
                onOpen={async function (newPath, type, driver, dir) {
                    if (newPath === '..') {
                        const title = setWindowTitle('..');
                        history.push(`/files${title}`);
                        return {};
                    }
                    
                    const data = { params: [] };
            
                    if (type !== 'file') {
                        if (driver === 'gdrive') {
                            data.params.push(credentials.gdrive);
                            data.onError = function (error) {
                                if (error.message.startsWith(
                                    'Invalid credentials'
                                )) {
                                    clearCredential('gdrive');
                                    history.push(`/oauth`, {
                                        to: `/files${path}${newPath}`
                                    });
                                }
                            };
                        }
            
                        const title = setWindowTitle(newPath);
                        history.push(`/files${title}`);
                    } else {
                        function createWindow(url, children) {
                            addWindow(newPath, <>
                                <button
                                    onClick={function () {
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = newPath;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    style={{ display: "block" }}
                                >Download</button>
                                {children ? children : <iframe
                                    title={newPath}
                                    src={url}
                                    style={{ flex: 1 }}
                                />}
                            </>);
                        }

                        try {
                            setLoading(true);
                            const file = await dir.open(newPath);
                            const mimeType = file.mimeType;
                            if (mimeType.startsWith("audio/")) {
                                const blob = await file.readBlob();
                                const url = URL.createObjectURL(blob);
                                createWindow(url,
                                    <audio autoPlay controls src={url} />
                                );
                            } else if (mimeType.startsWith("image/")) {
                                const blob = await file.readBlob();
                                const url = URL.createObjectURL(blob);
                                createWindow(url,
                                    <img src={url} alt={newPath} />
                                );
                            } else if (mimeType.startsWith("video/")) {
                                const blob = await file.readBlob();
                                const url = URL.createObjectURL(blob);
                                createWindow(url,
                                    <video autoPlay controls src={url} style={{
                                        height: "inherit"
                                    }} />
                                );
                            } else if (
                                mimeType.startsWith("image/") ||
                                mimeType.startsWith("text/")  ||
                                mimeType === "application/x-javascript" ||
                                mimeType === "application/javascript" ||
                                mimeType === "application/pdf"
                            ) {
                                const blob = await file.readBlob();
                                const url = URL.createObjectURL(blob);
                                createWindow(url);
                            } else switch (mimeType) {
                            case "application/vnd.google-apps.document":
                            case "application/vnd.google-apps.spreadsheet":
                                if (file instanceof GDFile) {
                                    const blob = await file.export();
                                    const url = URL.createObjectURL(blob);
                                    createWindow(url);
                                    break;
                                }
                                // fallthrough
                            default:
                                if (window.confirm(
                                        `Download file "${newPath}"?`
                                )) {
                                    const blob = await file.readBlob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = newPath;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }
                                break;
                            }
                        } catch (error) {
                            (async () => {
                                console.error(error);
                                alert(
                                    `Couldn't open "${
                                        newPath
                                    }": ${error.message}`
                                );
                            })();
                        } finally {
                            setLoading(false);
                        }
                    }
            
                    return data;
                }}
                view="blocks"
                actions="shown"
            >
                {(pathname === '/files' || pathname === "/files/") && <>
                    <h1>Welcome to Web File System!</h1>
                    <p>
                        Get started by mounting a new drive,<br/>
                        creating or uploading a new file,<br/>
                        or <Link to="/about">learning more about WFS</Link>.
                    </p>
                </>}

                <div className="actions">
                    <div className="file-options">
                        <h2>File Options</h2>
                        <div>
                            <div onClick={uploadFile}>Upload</div>
                            <div onClick={function () {
                                const name = window.prompt(
                                    "Insert directory name:"
                                );
                                if (name !== "" && name !== null) {
                                    setLoading(true);
                                    directory.open(name, {
                                        openExisting: false,
                                        type: 'directory'
                                    }).catch(function (error) {
                                        console.error(error);
                                        alert(`Error creating new directory: ${
                                            error.message
                                        }`);
                                    }).finally(function () {
                                        setLoading(false);
                                    });
                                }
                            }}>New Directory</div>
                        </div>
                    </div>

                    <div className="mount-options">
                        <h2>Mount Options</h2>
                        <div>
                            <Link to={{
                                    pathname: "/mount/gdrive",
                                    state: { after: `/files${path}` }
                                }}
                                children={<div>Google Drive</div>}
                            />
                        </div>
                    </div>
                </div>
            </DirectoryView>
            </div>
            </>;
        }} />

        <Redirect from="/" to="/files/" />
    </Switch>;
};

export default Router;
