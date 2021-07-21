import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import DirectoryView from "./DirectoryView";

import { GDDirectory } from "./drivers/gdrive";

import "./GDriveFolderPicker.css";

const BASE_URL = "https://www.googleapis.com/drive/v3";

const GDriveFolderPicker = ({
    credentials,
    setCredentials,
    location
}) => {
    const [ after, setAfter ] = useState('/files');
    const [ drives, setDrives ] = useState(null);
    const [ gdDir, setGDDir ] = useState(null);
    const [ path, setPath ] = useState('/');
    const [ modifiedName, setModifiedName ] = useState(false);
    const [ name, setName ] = useState("");
    const [ selectedID, setSelectedID ] = useState([]);

    const history = useHistory();
    const nameBox = useRef();

    const bearer = `Bearer ${credentials.gdrive}`;

    useEffect(() => {
        (async () => {
            if (location.state && location.state.after)
                setAfter(location.state.after);

            const [ root, sharedDrives ] = await Promise.all([
                fetch(`${BASE_URL}/files/root`, {
                    method: 'GET',
                    withCredentials: true,
                    credentials: 'include',
                    headers: { Authorization: bearer }
                }),
                fetch(`${BASE_URL}/drives`, {
                    method: 'GET',
                    withCredentials: true,
                    credentials: 'include',
                    headers: { Authorization: bearer }
                })
            ]);

            if (root.ok && sharedDrives.ok) {
                const [ rootData, sharedDrivesData ] = await Promise.all([
                    root.json(), sharedDrives.json()
                ]);

                setDrives([
                    [ rootData.id, rootData.name ],
                    ...sharedDrivesData.drives.map(
                        ({ id, name }) => [ id, name ]
                    )
                ]);
            } else {
                const { gdrive: _, ...creds } = credentials;
                setCredentials(creds);
                history.push("/oauth", {
                    handler: 'gdrive',
                    to: "/mount/gdrive",
                    after
                });
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ setCredentials, setAfter, setDrives, setPath ]);

    function setNameBoxValue(value) {
        if (!modifiedName)
            setName(value);
    }

    if (!drives) {
        return <p>Loading...</p>;
    }

    let folderPicker;
    if (gdDir === 'loading') {
        folderPicker = "Loading...";
    } else if (gdDir) {
        folderPicker = <div className="folder-picker">
            <p>
                Pick a folder:
                <code>{path}</code>
            </p>
            <p>
                Name the mounted folder:
                <input
                    type="text"
                    value={name}
                    ref={nameBox}
                    onInput={function (event) {
                        setModifiedName(event.target.value !== '');
                        setName(event.target.value);
                    }}
                />
                <button
                    disabled={name === ''}
                    onClick={function () {
                        history.push(after, {
                            after: {
                                type: 'gdrive', name,
                                params: [
                                    selectedID[selectedID.length - 1],
                                    credentials.gdrive
                                ]
                            }
                        });
                    }}
                >Select</button>
            </p>
            
            <DirectoryView
                allow={[ GDDirectory.mimeType ]}
                onOpen={function (name) {
                    if (name === '..') {
                        setNameBoxValue(path.replace(/[-\s/:.,;\\]+/g, '_'));
                        setPath(path.split('/').slice(0, -1).join('/'));
                        selectedID.pop();
                        setSelectedID([ ...selectedID ]);
                    }
                    return {};
                }}
                onSelect={function (items, prev) {
                    const pathSlice = path.split('/')
                    if (prev.length) {
                        pathSlice.pop();
                        selectedID.pop();
                        setSelectedID([ ...selectedID ]);
                    }

                    if (items.length) {
                        pathSlice.push(items[0].name);
                        setSelectedID([ ...selectedID, items[0].id ]);
                    }

                    const newPath = pathSlice.join('/');
                    setNameBoxValue(newPath.replace(/[-\s/:.,;\\]+/g, '_'));
                    setPath(newPath);
                }}
                rootDirectory={gdDir}
                select="one"
            />
        </div>;
    }

    return <div className="GDriveFolderPicker">
        <h3><Link to={after}>Go Back</Link></h3>

        <h1>Mounting a Google Drive</h1>
        <p>
            Pick a drive:
            <select onChange={async function (event) {
                setGDDir('loading');

                let name;
                for (const child of event.target.children) {
                    if (child.tagName !== 'OPTION')
                        continue;
                    if (child.value === event.target.value) {
                        name = child.innerText;
                        break;
                    }
                }
                setPath(name);
                setName(name.replace(/[-\s/:]/g, '_'));
                setSelectedID([ event.target.value ]);

                const gdDir = await GDDirectory.mount(
                    null,
                    event.target.value,
                    credentials.gdrive
                );
                setGDDir(gdDir);
            }}>
                <option value={null} key={0} hidden />
                {drives.map(([ id, name ]) =>
                    <option value={id} key={id}>{name}</option>
                )}
            </select>
        </p>

        {folderPicker}
    </div>;
};

export default GDriveFolderPicker;
