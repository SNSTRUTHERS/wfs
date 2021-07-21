/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import { WFSDirectory } from "./wfs";

import useLocalStorage from "./hooks/useLocalStorage";

import DirectoryItem from "./DirectoryItem";

import "./DirectoryView.css";

/**
 * @template T
 * @typedef {{
 *      allow: `${string}/${string}`[],
 *      canDelete?: boolean,
 *      onChange?: (
 *          directory: import("./wfs").WFSDirectory,
 *          state: T,
 *          setDirectory: (
 *              dir: import("./wfs").WFSDirectory,
 *              state: T
 *          ) => void
 *      ) => void | Promise<void>,
 *      onLoad?: (
 *          directory: import("./wfs").WFSDirectory,
 *          state: T,
 *          setDirectory: (
 *              dir: import("./wfs").WFSDirectory,
 *              state: T
 *          ) => void
 *      ) => void | Promise<void>,
 *      onLoadError?: (
 *          e: import("./wfs").WFSError,
 *          path: string,
 *          state: T,
 *          setDirectory: (
 *              dir: import("./wfs").WFSDirectory,
 *              state: T
 *          ) => void
 *      ) => void | Promise<void>,
 *      onOpen?: (
 *          path: string,
 *          type: string,
 *          driver: string,
 *          directory: WFSDirectory,
 *          state: T,
 *          setDirectory: (
 *              dir: import("./wfs").WFSDirectory,
 *              state: T
 *          ) => void
 *      ) =>
 *          import("./wfs").WFSOpenOptions |
 *          Promise<import("./wfs").WFSOpenOptions>,
 *      onSelect?: (
 *          selected: import("./wfs").WFSFileInfo[],
 *          previous: import("./wfs").WFSFileInfo[],
 *          state: T,
 *          setState: (state: T) => void
 *      ) => void | Promise<void>,
 *      path?: string,
 *      rootDirectory: WFSDirectory,
 *      select: 'one' | 'multiple',
 *      selectable: `${string}/${string}`[],
 *      state: T,
 *      view?: 'list' | 'blocks'
 * }} DirectoryViewProps
 */

/**
 * A component for viewing the contents of a WFSDirectory.
 * @template T
 * @param {React.PropsWithChildren<DirectoryViewProps<T>>} props
 */
const DirectoryView = ({
    allow = [ "*/*" ],
    canDelete = false,
    children,
    onChange = function () {},
    onLoad = function () {},
    onLoadError = function (e) { },
    onOpen = function () { return {}; },
    onSelect = function () {},
    path = '',
    rootDirectory,
    select = 'multiple',
    selectable = [ "*/*" ],
    state: initialState,
    view = 'blocks'
}) => {
    if (!(rootDirectory instanceof WFSDirectory))
        throw new Error("rootDirectory must be a WFSDirectory.");

    const [ loaded, setLoaded ] = useState(false);
    const [ items, setItems ] = useState(null);
    const [ dview, setDview ] = useState(view);
    const [ directory, setDirectory ] = useState(null);
    const [ sort, setSort ] = useState('name');
    const [ state, setState ] = useState(initialState);
    const [ selected, setSelectedState ] = useState([]);
    
    const [ zoom, setZoom ] = useLocalStorage(100, "preferred-zoom");
    
    const allowed = new Set(allow);
    const selectedItems = new Set(selected);
    const selectableTypes = new Set(selectable);

    function sortByName([ name1, data1 ], [ name2, data2 ]) {
        const list = [ 'directory', 'mount', 'file' ];
        const i1 = list.indexOf(data1.type);
        const i2 = list.indexOf(data2.type);
        if (i1 !== i2)
            return i1 - i2;
        else
            return name2 < name1;
    }

    function sortByCreatedTime([ , data1 ], [ , data2 ]) {
        const list = [ 'directory', 'mount', 'file' ];
        const i1 = list.indexOf(data1.type);
        const i2 = list.indexOf(data2.type);
        if (i1 !== i2)
            return i1 - i2;
        else
            return new Date(data2.createdTime) - new Date(data1.createdTime);
    }

    function sortByModifiedTime([ , data1 ], [ , data2 ]) {
        const list = [ 'directory', 'mount', 'file' ];
        const i1 = list.indexOf(data1.type);
        const i2 = list.indexOf(data2.type);
        if (i1 !== i2)
            return i1 - i2;
        else
            return new Date(data2.modifiedTime) - new Date(data1.modifiedTime);
    }

    function setItemsSorted(items) {
        let newItems;

        switch (sort) {
        case 'name':
            newItems = [ ...items.sort(sortByName) ];
            break;

        case 'createdTime':
            newItems = [ ...items.sort(sortByCreatedTime) ];
            break;

        case 'modifiedTime':
            newItems = [ ...items.sort(sortByModifiedTime) ];
            break;

        default:
            return items;
        }

        setItems(newItems);
        return newItems;
    }

    function setSelected(list, items) {
        function indexToItem(index) {
            return {
                name: items[index][0],
                ...items[index][1]
            };
        }

        if (list.some((value) => !selectedItems.has(value)) ||
            (!list.length && selected.length)
        ) {
            onSelect(
                Array.from(list.values()).map(indexToItem),
                items ?
                    Array.from(selectedItems.values()).map(indexToItem) :
                    [],
                state,
                setState
            );
            setSelectedState(list);
        }
    }

    function setDirectoryAndState(dir, state) {
        if (state !== undefined)
            setState(state);
        
        if (dir)
            setDirectory(dir);
    }

    // open root directory
    useEffect(function () {
        (async () => {
            if (path === '') {
                setDirectory(rootDirectory);
            } else try {
                setItems(null);
                const dir = await rootDirectory.open(path);
                if (dir instanceof WFSDirectory) {
                    setDirectory(dir);
                } else {
                    const error = new Error(
                        `"${path}" is not a directory.`
                    );
                    const contents = path.split('/');
                    error.filename = contents.pop();
                    error.path = contents.slice(0, -1).join('/');
                    error.remaining = '';
                    onLoadError(error, path, state, setDirectoryAndState);
                    console.error(error);
                    setItems(error);
                }
            } catch (error) {
                try {
                    await onLoadError(
                        error, path, state, setDirectoryAndState
                    );
                } catch {
                    console.error(error);
                    setItems(error);
                }
            }
        })();
    }, [ setDirectory, setItems, setState ]);

    // grab directory contents on loading of a new directory
    useEffect(function () {
        (async function () {
            if (directory) {
                setSelected([], null);
                setItems(null);
                
                if (directory instanceof Promise) {
                    setDirectory(await directory);
                    return;
                }
                
                const children = directory.children;
                if (!loaded) {
                    setLoaded(true);
                    try {
                        await onLoad(directory, state, setDirectoryAndState);
                    } catch (error) {
                        console.error(error);
                        return setItems(error);
                    }
                }

                /** @type {import('./wfs').WFSDirectory} */
                const d = directory;
                
                let items = setItemsSorted(
                    Object.entries(children).filter(function ([ , data ]) {
                        const [
                            type, subtype
                        ] = data.mimeType.split('/');
                        return (
                            allowed.has("*/*") ||
                            allowed.has(`${type}/*`) ||
                            allowed.has(`${type}/${subtype}`)
                        );
                    })
                );
                
                d.oncreate = function (file, name) {
                    items = setItemsSorted([
                        ...items,
                        [
                            name,
                            {
                                createdTime: file.createdTime,
                                driver: file.type !== 'mount' ? null :
                                    WFSDirectory.mimeTypeToDriver(file.mimeType)
                                ,
                                id: file.__id,
                                mimeType: file.mimeType,
                                modifiedTime: file.modifiedTime,
                                type: file.type
                            }
                        ]
                    ]);
                };
                d.onremove = function (name) {
                    items = setItemsSorted([
                        ...items.filter(([ fileName ]) => fileName !== name)
                    ]);
                };

                await onChange(directory, state, setDirectoryAndState);
            }
        })();
    }, [ directory, setItems, setLoaded ]);

    useEffect(function () {
        if (items && !(items instanceof Error))
            setItemsSorted(items);
    }, [ sort ]);

    const actionsDiv = <div className="preview" children={children} />;
    const isError = items instanceof Error;

    let dirContents;
    if (isError) {
        dirContents = <>
            <h2>An error has occured:</h2>
            <p>{items.message}</p>
        </>;
    } else if (!(items instanceof Array)) {
        dirContents = <p>Loading...</p>;
    } else if (items.length) {
        dirContents = <>
            <ul
                onContextMenu={function (event) {
                    if (!canDelete)
                        return;

                    let target = event.target;
                    if (target.tagName === 'UL') {
                        if (!event.shiftKey && !event.ctrlKey)
                            setSelected([], items);
                        return;
                    } else while (target.parentElement.tagName !== 'UL') {
                        target = target.parentElement;
                    }

                    if (selectedItems.size) {
                        event.stopPropagation();
                        event.preventDefault();
                    } else {
                        return;
                    }

                    if (window.confirm(`Permanently remove ${
                        selectedItems.size > 1 ?
                        `${selectedItems.size} files` :
                        `"${items[[ ...selectedItems.values() ][0]][0]}"`
                    }?`)) {
                        setSelected([], items);
                        items.filter((_, index) =>
                            selectedItems.has(index)
                        ).forEach(async ([ name ]) =>
                            await directory.remove(name)
                        );
                    }
                }}
                onClick={function (event) {
                    event.stopPropagation();

                    let target = event.target;
                    if (target.tagName === 'UL') {
                        if (!event.shiftKey && !event.ctrlKey)
                            setSelected([], items);
                        return;
                    } else while (target.parentElement.tagName !== 'UL') {
                        target = target.parentElement;
                    }

                    const index = parseInt(target.dataset.index);
                    const [
                        type, subtype
                    ] = items[index][1].mimeType.split('/');
                    if (selectableTypes.has("*/*") ||
                        selectableTypes.has(`${type}/*`) ||
                        selectableTypes.has(`${type}/${subtype}`)
                    ) {
                        if (select === 'one' ||
                            (event.shiftKey && !selected.length)
                        ){
                            setSelected([ index ], items);
                        } else if (event.shiftKey) {
                            const diff = Math.abs(index - selected[0]);
                            setSelected([
                                selected[0],
                                ...Array(diff).fill(0).map((_, i) => {
                                    if (index < selected[0])
                                        return selected[0] - diff + i;
                                    else
                                        return selected[0] + i + 1;
                                })
                            ], items);
                        } else if (event.ctrlKey && selectedItems.has(index)) {
                            selectedItems.delete(index);
                            setSelected(
                                Array.from(selectedItems.values()),
                                items
                            );
                        } else if (event.ctrlKey) {
                            setSelected(
                                [ index, ...selectedItems.values() ],
                                items
                            );
                        } else {
                            setSelected([ index ], items);
                        }
                    }
                }}
                onDoubleClick={async function (event) {
                    let target = event.target;
                    if (target.tagName === 'UL')
                        return;
                    else while (target.parentElement.tagName !== 'UL')
                        target = target.parentElement;

                    const index = parseInt(target.dataset.index);
                    const { driver = null, type } = items[index][1];
                    const name = items[index][0];
                    const options = await onOpen(
                        name, type, driver, directory,
                        state, setDirectoryAndState
                    );
                    if (options && type !== 'file')
                        setDirectory(directory.open(name, options));
                }}
                children={
                    items.map(([ name, data ], index) => <DirectoryItem
                        name={name}
                        driver={data.driver}
                        createdTime={data.createdTime}
                        mimeType={data.mimeType}
                        modifiedTime={data.modifiedTime}
                        type={data.type}
                        key={index}
                        index={index}
                        selected={selectedItems.has(index)}
                    />)
                }
            />
            {actionsDiv}
        </>;
    } else {
        dirContents = actionsDiv;
    }

    return <div
        className={`DirectoryView ${dview}`}
        style={{fontSize: `${zoom / 100}em`}}
        onClick={function (event) {
            if (!event.ctrlKey && !event.shiftKey)
                setSelected([], items);
        }}
    >
        <div className="top" onClick={function (event) {
            event.stopPropagation();
        }}>
            <button
                disabled={!directory || !directory.parent}
                onClick={async function () {
                    const value = await onOpen(
                        '..',
                        directory.parent.type,
                        WFSDirectory.mimeTypeToDriver(
                            directory.parent.mimeType
                        ),
                        directory,
                        state,
                        setDirectoryAndState
                    );
                    if (value)
                        setDirectory(directory.parent);
                }}
            >Go Up</button>
            <span>
                view:
                <button onClick={function () {
                    setDview('blocks');
                }}>Grid</button>
                <button onClick={function () {
                    setDview('list');
                }}>List</button>
            </span>

            <span>
                sort:
                <button onClick={function () {
                    setSelected([], items);
                    setSort('name');
                }}>Name</button>
                <button onClick={function () {
                    setSelected([], items);
                    setSort('createdTime');
                }}>Create Time</button>
                <button onClick={function () {
                    setSelected([], items);
                    setSort('modifiedTime');
                }}>Last Modified Time</button>
            </span>

            <span>
                zoom:
                <input
                    type="range"
                    min="50.0"
                    max="500.0"
                    value={zoom}
                    onChange={function (event) {
                        setZoom(parseFloat(event.target.value));
                    }}
                />
            </span>
        </div>
        {dirContents}
    </div>;
};

export default DirectoryView;
