// == ABSTRACT BASE CLASSES ================================================= //

/**
 * @typedef {'file' | 'directory' | 'mount'} WFSFileType
 */

/**
 * @typedef {(
 *      Int8Array |
 *      Uint8Array |
 *      Uint8ClampedArray |
 *      Int16Array |
 *      Uint16Array |
 *      Int32Array |
 *      Uint32Array |
 *      BigInt64Array |
 *      BigUint64Array
 * )} TypedArray
 */

/**
 * @typedef {{
 *      createdTime: string,
 *      driver?: string,
 *      mimeType: string,
 *      modifiedTime: string,
 *      size?: number,
 *      type: WFSFileType
 * }} WFSFileInfo
 */

/**
 * @typedef {{
 *      filename: string,
 *      message?: string,
 *      name?: string,
 *      path: string,
 *      remaining: string
 * }} WFSError
 */

/**
 * @typedef {{
 *      createdTime?: Date,
 *      data?: (BlobPart | Promise<BlobPart>)[],
 *      mimeType?: string,
 *      modifiedTime?: Date,
 *      openExisting?: boolean,
 *      onError?: (error: WFSError) => void,
 *      params?: Array,
 *      readOnly?: boolean,
 *      type?: WFSFileType
 * }} WFSOpenOptions
 */

/** Base class for WFS files */
export class WFSFile {
    get type() { return "file"; }

    /**
     * Retrieves when the file was created as an ISO date string.
     * @returns {string}
     */
    get createdTime() {
        throw new Error("Abstract property 'createdTime' not defined.");
    }

    /**
     * Retrieves when the file was last modified as an ISO date string.
     * 
     * @returns {string}
     */
    get modifiedTime() {
        throw new Error("Abstract property 'modifiedTime' not defined.");
    }

    /**
     * Retrieves the type of file this is.
     * 
     * @returns {string}
     */
    get mimeType() {
        throw new Error("Abstract property 'mimeType' not defined.");
    }

    /**
     * Synchronizes the contents with any asynchronous changes that have been
     * made.
     * 
     * @returns {Promise<void>}
     */
    sync() {
        throw new Error("Abstract method 'sync' not defined.");
    }

    /**
     * Retrieves the size of the file in bytes.
     * 
     * @returns {Promise<number>}
     */
    size() {
        throw new Error("Abstract method 'size' not defined.");
    }

    /**
     * @returns {Promise<number>}
     */
    read() {
        throw new Error("Abstract method 'read' not defined.");
    }

    /**
     * @returns {Promise<Blob>}
     */
    readBlob() {
        throw new Error("Abstract method 'readBlob' not defined.");
    }
    
    /**
     * @returns {Promise<number>}
     */
    write() {
        throw new Error("Abstract method 'write' not defined.");
    }
}

/** @type {{ [s: string]: typeof WFSDirectory }} */
export const WFSDriverMap = {};

/** Base class for WFS directories */
export class WFSDirectory {
    /** 
     * Function called when a new file is created in the directory.
     * @type {(
     *      this: WFSDirectory,
     *      file: WFSFile | WFSDirectory,
     *      name: string
     * ) => void | Promise<void>}
     */
    oncreate;
    
    /** 
     * Function called when a file is removed from the directory.
     * @type {(
     *      this: WFSDirectory,
     *      name: string
     * ) => void | Promise<void>}
     */
    onremove;

    /**
     * Base constructor for WFS directories.
     * @param {WFSDirectory} parent
     */
    constructor(parent) {
        if (parent !== null && !(parent instanceof WFSDirectory))
            throw new Error("parent not a directory.");

        Object.defineProperty(this, 'parent', {
            configurable: false,
            enumerable: true,
            writable: false,

            value: parent
        });
    }

    get type() { return "directory"; }

    /**
     * Retrieves when the directory was created as an ISO date string.
     * @returns {string}
     */
    get createdTime() {
        throw new Error("Abstract property 'createdTime' not defined.");
    }

    /**
     * Retrieves when the directory was last modified as an ISO date string.
     * @returns {string}
     */
    get modifiedTime() {
        throw new Error("Abstract property 'modifiedTime' not defined.");
    }

    /**
     * Retrieves the type of file this is.
     * @returns {string}
     */
    get mimeType() {
        return this.constructor.mimeType;
    }

    /**
     * Retrieves a list of parameters to provide when mounting a directory.
     * @returns {Array}
     */
    get mountInfo() {
        throw new Error("Abstract property 'mountInfo' not defined.");
    }

    /**
     * @returns {{ [s: string]: WFSFileInfo }}
     */
    get children() {
        throw new Error("Abstract property 'getChildren' not defined.");
    }

    /**
     * Synchronizes the contents with any asynchronous changes that have been
     * made.
     * 
     * @returns {Promise<void>}
     */
    sync() {
        throw new Error("Abstract method 'sync' not defined.");
    }

    /**
     * Opens or creates a new file in the file system.
     * 
     * @param {string} path 
     * @param {WFSOpenOptions} options 
     * 
     * @returns {Promise<WFSFile | WFSDirectory>} 
     */
    async open(path, {
        createdTime = new Date(),
        data = [],
        mimeType = undefined,
        modifiedTime = new Date(),
        onError = function (e) { throw e; },
        openExisting = true,
        params = [],
        readOnly = false,
        type = 'file'
    } = {
        createdTime: new Date(),
        data: [],
        mimeType: undefined,
        modifiedTime: new Date(),
        onError(e) { throw e; },
        openExisting: true,
        params: [],
        readOnly: false,
        type: 'file'
    }) {
        if (!(path instanceof String || typeof path === 'string'))
            throw new Error("path must be a string.");

        if (mimeType === undefined) {
            if (type === 'file')
                mimeType = 'text/plain';
            else
                mimeType = this.mimeType;
        }

        const options = {
            mimeType, openExisting, readOnly, type, data, params,
            createdTime: createdTime.toISOString(),
            modifiedTime: modifiedTime.toISOString()
        };
        if (!['file', 'directory'].includes(type))
            throw new Error(`Invalid file type "${type}".`);

        // handle absolute paths where this directory isn't the root dir
        if (path.startsWith('/') && this.parent) {
            let parent;
            for (parent = this.parent;
                parent && parent.parent;
                parent = parent.parent
            );

            return parent.open(path.slice(1), options);
        }

        const paths = path.split('/').filter((s) =>
            ['.', ''].indexOf(s) < 0
        );
        const name = paths[0];
        path = paths.slice(1).join('/');
        const children = this.children;

        try {
            if (name === '..') {
                const parent = this.parent || this;
                return parent.open(path, options);
            } else if (name === undefined && path === '') {
                return this;
            } else {
                const hasChild = !!children[name];
                if (!(openExisting ^ hasChild) ||
                    (hasChild && path !== '')
                ) {
                    options.data = options.data ?
                        await Promise.all(options.data) :
                        options.data
                    ;
                    const file = await this.__openFile(name, options);
                    
                    // open subdirectory
                    if (path !== '') {
                        if (file instanceof WFSDirectory)
                            return file.open(path, options);
                        else
                            throw new Error(`"${name}" is not a directory.`);
                    }
                    
                    // readonly-specific protections
                    if (readOnly && file instanceof WFSFile) {
                        Object.defineProperty(file, 'write', {
                            configurable: false,
                            enumerable: false,
                            writable: false,

                            value() {
                                throw new Error("File cannot be written to.");
                            }
                        })
                    } else if (readOnly && file instanceof WFSDirectory) {
                        Object.defineProperty(file, '__openFile', {
                            configurable: false,
                            enumerable: false,
                            writable: false,

                            async value(name, options) {
                                const children = this.children;
                                if (children[name]) {
                                    return file.prototype.__openFile.call(
                                        this, name, options
                                    );
                                } else {
                                    throw new Error(
                                        "Directory contents cannot be modified."
                                    );
                                }
                            }
                        })
                        
                        Object.defineProperty(file, '__removeFile', {
                            configurable: false,
                            enumerable: false,
                            writable: false,

                            value() {
                                throw new Error(
                                    "Directory contents cannot be modified."
                                );
                            }
                        })
                    }

                    // call watcher function
                    if (this.oncreate && !hasChild)
                        this.oncreate.call(this, file, name);

                    return file;
                } else if (openExisting) {
                    throw new Error("No such file or directory.");
                } else {
                    throw new Error("Name already taken.")
                }
            }
        } catch (error) {
            if (!('directory' in error))
                error.directory = this;
            if (!('filename' in error))
                error.filename = name;
            if ('path' in error)
                error.path = `${name}/${error.path}`;
            else
                error.path = name;
            if (!('remaining' in error))
                error.remaining = path;

            onError(error);
        }
    }

    /**
     * Removes a file in the file system.
     * 
     * @param {string} path Absolute or relative path of a file to remove.
     * @returns {Promise<void>}
     */
    async remove(path) {
        if (!(path instanceof String || typeof path === 'string'))
            throw new Error("path must be a string.");

        // handle absolute paths where this directory isn't the root dir
        if (path.startsWith('/') && this.parent) {
            let parent;
            for (parent = this.parent;
                 parent && parent.parent;
                 parent = parent.parent
            );

            return parent.remove(path.slice(1));
        }

        const paths = path.split('/').filter((s) => ['.', ''].indexOf(s) < 0);
        const name = paths[0];
        path = paths.slice(1).join('/');
        const children = this.children;

        if (name === '..') {
            const parent = this.parent || this;
            return parent.remove(path);
        } else if (name === undefined && path === '') {
            throw new Error("Cannot remove the root directory.");
        } else if (children[name] && path === '') {
            await this.__removeFile(name);
            if (this.onremove)
                this.onremove.call(this, name);
        } else if (children[name]) {
            const file = await this.__openFile(name);
            if (file instanceof WFSDirectory) {
                return file.remove(path);
            } else {
                throw new Error(`"${name}" is not a directory.`);
            }
        } else {
            throw new Error("No such file or directory.");
        }
    }

    /**
     * Mounts a file system to a new mount point.
     * 
     * @param {string} path Where to mount the additional file system.
     * @param {string} type The type of directory to mount.
     * @param {Array}  mountInfo Data obtained from a mount point.
     * 
     * @returns {Promise<WFSDirectory>} 
     */
    async mount(path, type, ...mountInfo) {
        if (!(path instanceof String || typeof path === 'string'))
            throw new Error("path must be a string.");
        if (!(type in WFSDriverMap))
            throw new Error(`"${type}" is not a registered WFS driver.`);

        // handle absolute paths where this directory isn't the root dir
        if (path.startsWith('/') && this.parent) {
            let parent;
            for (parent = this.parent;
                 parent && parent.parent;
                 parent = parent.parent
            );

            return parent.mount(path.slice(1), ...mountInfo);
        }

        const paths = path.split('/').filter((s) => ['.', ''].indexOf(s) < 0);
        const name = paths[0];
        path = paths.slice(1).join('/');
        const children = this.children;

        if (name === '..') {
            const parent = this.parent || this;
            return parent.mount(path, ...mountInfo);
        } else if (name === undefined && path === '') {
            throw new Error("Cannot mount to root directory.");
        } else if (children[name]) {
            throw new Error("Name already taken.");
        } else {
            const directory = await WFSDirectory.mount(
                type, this, ...mountInfo
            );
            await this.__mountFile(name, type, directory);
            if (this.oncreate)
                this.oncreate.call(this, directory, name);
            return directory;
        }
    }

    /**
     * Copies a file from one directory to another.
     * @param {string} fromPath 
     * @param {string} toPath 
     * 
     * @returns {Promise<WFSFile | WFSDirectory>}
     */
    async copy(fromPath, toPath) {
        throw new Error("Unimplemented"); /*
        if (!(fromPath instanceof String || typeof fromPath === 'string'))
            throw new Error("fromPath must be a string.");
        if (!(toPath instanceof String || typeof toPath === 'string'))
            throw new Error("fromPath must be a string.");

        // handle absolute paths where this directory isn't the root dir
        if (fromPath.startsWith('/') && this.parent) {
            let parent;
            for (parent = this.parent;
                 parent && parent.parent;
                 parent = parent.parent
            );

            return parent.copy(fromPath.slice(1), toPath);
        }

        let paths = fromPath.split('/').filter(
            (s) => ['.', ''].indexOf(s) < 0
        );
        const name = paths[0];
        const path = paths.slice(1).join('/');
        const children = this.children;

        if (name === '..') {
            const parent = this.parent || this;
            return parent.copy(path, toPath);
        } else if (path !== '') {
            const file = await this.__openFile(name);
            if (file instanceof WFSDirectory) {
                return file.copy(path, `../${toPath}`);
            } else {
                throw new Error(`"${name}" is not a directory.`);
            }
        } else if (!children[name]) {
            throw new Error("No such file or directory.");
        } else {
            let toDir = this;
            if (toPath.startsWith('/')) {
                for (toDir = this.parent;
                    toDir && toDir.parent;
                    toDir = toDir.parent
                );
                toPath = toPath.slice(1);
            }

            paths = toPath.split('/').filter((s) => ['.', ''].indexOf(s) < 0);
            const toName = paths[paths.length - 1];
            for (const path of paths.slice(0, -1)) {
                if (path === '..')
                    toDir = toDir.parent || toDir;
                else
                    toDir = await toDir.open(path);
            }

            // don't override existing files
            if ((toDir.children)[paths[paths.length - 1]])
                throw new Error("Name already taken.");

            const children = this.children;
            const { type } = children[name];
            
            // copying between directories of the same type = copy
            if (WFSDirectory.mimeTypeToDriver(this) ===
                WFSDirectory.mimeTypeToDriver(toDir)
            ) {
                return this.__copyFile(toName, toDir);
            } else if (type === 'file') {
                const f = await this.open(name);
                return this.open(toName, {
                    data: [ f.readBlob() ],
                    openExisting: false,
                    type: 'file'
                });
            } else if (type === 'directory') {
                const [ toDir, dir ] = await Promise.all([
                    this.open(toName, {
                        openExisting: false,
                        type: 'directory'
                    }),
                    this.open(name)
                ]);
                await Promise.all(dir.children.map((childName) =>
                    dir.copy(childName, `${toPath}/${childName}`)
                ));
                return toDir;
            } else if (type === 'mount') {
                const dir = await this.open(name);
                return this.mount(
                    toName,
                    WFSDirectory.mimeTypeToDriver(dir),
                    ...dir.mountInfo
                );
            } else {
                throw new Error(`Invalid file type "${type}".`);
            }
        }*/
    }

    /**
     * Moves a file from one directory to another.
     * @param {string} fromPath 
     * @param {string} toPath 
     * 
     * @returns {Promise<WFSFile | WFSDirectory>}
     */
    async move(fromPath, toPath) {
        throw new Error("Unimplemented"); /*
        if (!(fromPath instanceof String || typeof fromPath === 'string'))
            throw new Error("fromPath must be a string.");
        if (!(toPath instanceof String || typeof toPath === 'string'))
            throw new Error("fromPath must be a string.");

        // handle absolute paths where this directory isn't the root dir
        if (fromPath.startsWith('/') && this.parent) {
            let parent;
            for (parent = this.parent;
                 parent && parent.parent;
                 parent = parent.parent
            );

            return parent.copy(fromPath.slice(1), toPath);
        }

        let paths = fromPath.split('/').filter((s) =>
            ['.', ''].indexOf(s) < 0
        );
        const name = paths[0];
        const path = paths.slice(1).join('/');
        const children = this.children;

        if (name === '..') {
            const parent = this.parent || this;
            return parent.move(path, toPath);
        } else if (path !== '') {
            const file = await this.__openFile(name);
            if (file instanceof WFSDirectory)
                return file.move(path, `../${toPath}`);
            else
                throw new Error(`"${name}" is not a directory.`);
        } else if (!children[name]) {
            throw new Error("No such file or directory.");
        } else {
            let toDir = this;
            if (toPath.startsWith('/')) {
                for (toDir = this.parent;
                    toDir && toDir.parent;
                    toDir = toDir.parent
                );
                toPath = toPath.slice(1);
            }

            paths = toPath.split('/').filter((s) => ['.', ''].indexOf(s) < 0);
            const toName = paths[paths.length - 1];
            for (const path of paths.slice(0, -1)) {
                if (path === '..')
                    toDir = toDir.parent || toDir;
                else
                    toDir = await toDir.open(path);
            }

            // don't override existing files
            if ((toDir.children)[paths[paths.length - 1]])
                throw new Error("Name already taken.");

            const children = this.children;
            const { type } = children[name];
            
            // copying between directories of the same type = copy
            if (WFSDirectory.mimeTypeToDriver(this) ===
                WFSDirectory.mimeTypeToDriver(toDir)
            ) {
                return this.__moveFile(toName, toDir);
            } else if (type === 'file') {
                const f = await this.open(name);
                const r = await this.open(toName, {
                    data: [ f.readBlob() ],
                    openExisting: false,
                    type: 'file'
                });
                await this.remove(name);
                return r;
            } else if (type === 'directory') {
                const [ toDir, dir ] = await Promise.all([
                    this.open(toName, {
                        openExisting: false,
                        type: 'directory'
                    }),
                    this.open(name)
                ]);
                await Promise.all(dir.children.map((childName) =>
                    dir.copy(childName, `${toPath}/${childName}`)
                ));
                await this.remove(name);
                return toDir;
            } else if (type === 'mount') {
                const dir = await this.open(name);
                const r = await this.mount(
                    toName,
                    WFSDirectory.mimeTypeToDriver(dir),
                    ...dir.mountInfo
                );
                await this.remove(name);
                return r;
            } else {
                throw new Error(`Invalid file type "${type}".`);
            }
        }
        */
    }
    
    /**
     * Creates or opens a child file or directory of this directory.
     * @returns {Promise<WFSFile | WFSDirectory>}
     */
    __openFile() {
        throw new Error("Abstract method '__openFile' not defined.");
    }

    /**
     * Removes a child of this directory.
     * @returns {Promise<void>}
     */
    __removeFile() {
        throw new Error("Abstract method '__removeFile' not defined.");
    }

    /**
     * Adds a mount point as a child of this directory.
     * @returns {Promise<void>}
     */
    __mountFile() {
        throw new Error("Abstract method '__mountFile' not defined.");
    }

    /**
     * Copies another file into this directory.
     * @returns {Promise<WFSFile | WFSDirectory>}
     */
    __copyFile() {
        throw new Error("Abstract method '__copyFile' not defined.");
    }

    /**
     * Moves another file into this directory.
     * @returns {Promise<WFSFile | WFSDirectory>}
     */
    __moveFile() {
        throw new Error("Abstract method '__moveFile' not defined.");
    }

    /**
     * @returns {string}
     */
    static get mimeType() {
        throw new Error("Abstract static property 'mimeType' not defined.");
    }

    static mimeTypeToDriver(mimeType) {
        for (const driver in WFSDriverMap) {
            if (WFSDriverMap[driver].mimeType === mimeType) {
                return driver;
            }
        }
        return null;
    }

    /**
     * Generalize directory mounting function.
     * 
     * @param {string} type
     * @param {WFSDirectory} parent
     * @param {Array}  mountInfo
     * @returns {Promise<WFSDirectory>}
     */
    static async mount(type, parent, ...mountInfo) {
        if (!(type in WFSDriverMap))
            throw new Error(`Unknown WFS driver "${type}".`);
        if (parent !== null && !(parent instanceof WFSDirectory))
            throw new Error("parent must be a directory.");
        
        const directory = await WFSDriverMap[type].mount(parent, ...mountInfo);
        Object.defineProperty(directory, 'type', {
            configurable: false,
            enumerable: true,
            writable: false,

            value: 'mount'
        });

        return directory;
    }
}

// == IDB DRIVER ============================================================ //

/**
 * Wraps a Promise around an IndexedDB request.
 * 
 * @template T Type of item being requested.
 * 
 * @param {IDBRequest<T>} idbRequest  An IndexedDB request.
 * @param {(
 *      request: IDBRequest<T>,
 *      resolve: (value: T | PromiseLike<T>) => void,
 *      reject:  (reason?: any) => void
 * ) => any} initFn An initializer function to execute before the promise is
 *                  set up.
 * 
 * @returns {Promise<T>} Promise wrapper for the given IDB request.
 */
function promiseFromIDBRequest(
    idbRequest,
    initFn = () => {}
) {
    return new Promise((resolve, reject) => {
        initFn(idbRequest, resolve, reject);
        idbRequest.addEventListener('success', function () {
            resolve(idbRequest.result)
        });
        idbRequest.addEventListener('error', function () {
            reject(idbRequest.error);
        });
    });
}

export class IDBFile extends WFSFile {
    constructor(parent, idb, key, info, blob) {
        super();

        Object.defineProperties(this, {
            __parent: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: parent
            },
            __idb: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: idb
            },
            __key: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: key
            },
            __blob: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: blob
            },
            __modifiedTime: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: info.modifiedTime
            },
            createdTime: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: info.createdTime
            },
            mimeType: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: `${blob.type}`
            }
        });
    }

    get size() {
        return this.__blob.size;
    }

    get modifiedTime() {
        return this.__modifiedTime;
    }

    async sync() {
        const transaction = this.__idb.transaction(
            [ "file_info", "file_data" ], 'readonly'
        );
        const [ { modifiedTime }, blob ] = await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore("file_info").get(this.__key)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").get(this.__key)
            )
        ]);

        this.__blob = blob;
        this.__modifiedTime = modifiedTime;
    }

    /**
     * Reads contents from a given file.
     * 
     * @param {TypedArray} buffer 
     * @param {number}     offset 
     * @param {number}     count  
     */
    async read(buffer, offset = 0, count = 0) {
        if (!count)
            count = this.__blob.size;

        const start = offset * buffer.BYTES_PER_ELEMENT;
        const end   = start + (count * buffer.BYTES_PER_ELEMENT);

        const blobSlice = this.__blob.slice(start, end);
        if (buffer) {
            const blobBuffer = await blobSlice.arrayBuffer();
            const blobTArray = new buffer.constructor(blobBuffer);
            buffer.set(
                blobTArray.slice(0, Math.min(buffer.length, blobTArray.length)),
                0
            );
        }

        return blobSlice.size / (buffer ? buffer.BYTES_PER_ELEMENT : 1);
    }

    async readBlob(offset = 0, count = this.__blob.size) {
        return this.__blob.slice(offset, offset + count);
    }

    /**
     * 
     * @param {TypedArray | string} buffer What to write into the file.
     * @param {number}              offset Where to insert buffer into the file.
     * @param {number}              count  How much is to be overwritten.
     */
    async write(buffer, offset = 0, count = this.__blob.size) {
        if (buffer === undefined)
            throw new Error("buffer must be a typed array or string.");
        else if (typeof buffer === 'string' || buffer.constructor === String)
            buffer = new TextEncoder('utf-8').encode(buffer);

        const start = offset * buffer.BYTES_PER_ELEMENT;
        count *= buffer.BYTES_PER_ELEMENT;
        const newBlob = new Blob(
            [
                this.__blob.slice(0, start),
                new Blob([ buffer ]),
                this.__blob.slice(start + count)
            ],
            { type: this.__blob.type }
        );

        const fileInfo = await promiseFromIDBRequest(
            this.__idb.transaction(
                ["file_info"], 'readonly'
            ).objectStore(
                "file_info"
            ).get(this.__key)
        );
        fileInfo.modifiedTime = new Date().toISOString();

        await Promise.all([
            promiseFromIDBRequest(
                this.__idb.transaction(
                    ["file_info"], 'readwrite'
                ).objectStore(
                    "file_info"
                ).put(fileInfo)
            ),
            promiseFromIDBRequest(
                this.__idb.transaction(
                    ["file_data"], 'readwrite'
                ).objectStore(
                    "file_data"
                ).put(newBlob, this.__key)
            )
        ]);
        
        this.__blob = newBlob;
        this.__modifiedTime = fileInfo.modifiedTime;
        return this.__blob.size / buffer.BYTES_PER_ELEMENT;
    }
}

/**
 * Converts a directory's file data to a valid child object.
 * 
 * @param {IDBDatabase} idb 
 * @param {{ [s: string]: IDBValidKey }} data 
 */
async function directoryDataToChildObject(idb, data) {
    const names = Object.getOwnPropertyNames(data);
    const transaction = idb.transaction(
        [ "file_info", "file_data" ], 'readonly'
    );
    const [ childInfo, childData ] = await Promise.all([
        Promise.all(names.map((name) =>
            promiseFromIDBRequest(
                transaction.objectStore("file_info").get(data[name])
            )
        )),
        Promise.all(names.map((name) =>
            promiseFromIDBRequest(
                transaction.objectStore("file_data").get(data[name])
            )
        ))
    ]);
    names.forEach((name, index) => {
        const {
            type, createdTime, modifiedTime
        } = childInfo[index];

        const obj = {
            key: data[name],
            type, createdTime, modifiedTime
        };
        if (type === 'file') {
            obj.size = childData[index].size;
            obj.mimeType = childData[index].type;
        } else if (type === 'directory') {
            obj.mimeType = "application/vnd.wfs.inode";
        } else if (type === 'mount') {
            obj.driver = childData[index].type;
            obj.mimeType = WFSDriverMap[childData[index].type].mimeType;
        }
        
        data[name] = obj;
    });

    return data;
}

export class IDBDirectory extends WFSDirectory {
    /**
     * A directory for an indexedDB file sytstem.
     * 
     * @param {IDBDirectory} parent 
     * @param {IDBDatabase} idb 
     * @param {IDBValidKey} key 
     * @param {{ createdTime: string, modifiedTime: string }} info
     */
    constructor(parent, idb, key, info, children) {
        super(parent);

        Object.defineProperties(this, {
            __idb: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: idb
            },
            __key: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: key
            },
            __children: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: children
            },
            __modifiedTime: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: info.modifiedTime
            },
            createdTime: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: info.createdTime
            },
            mountInfo: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: Object.freeze([ idb.name, key ])
            }
        });
    }

    get children() {
        return this.__children;
    }

    get modifiedTime() {
        return this.__modifiedTime;
    }

    /**
     * Internal function for handling opening of a new or existing file.
     * 
     * @param {string} name  
     * @param {WFSOpenOptions} options
     */
    async __openFile(name, {
        createdTime,
        data,
        mimeType,
        modifiedTime,
        params,
        type
    }) {
        // if name is taken, we're opening an existing file
        if (name in this.__children) {
            const transaction = this.__idb.transaction(
                [ "file_info", "file_data" ], 'readonly'
            );
            const key = this.__children[name].key;

            const [ info, data ] = await Promise.all([
                promiseFromIDBRequest(
                    transaction.objectStore("file_info").get(key)
                ),
                promiseFromIDBRequest(
                    transaction.objectStore("file_data").get(key)
                )
            ]);
            
            switch (info.type) {
            case 'file':
                return new IDBFile(this, this.__idb, key, info, data);
            case 'directory':
                const childData = await directoryDataToChildObject(
                    this.__idb, data
                );
                return new IDBDirectory(this, this.__idb, key, info, childData);
            case 'mount':
                return WFSDirectory.mount(data.type, this,
                    ...data.params, ...params
                );
            default:
                throw new Error(`Invalid file type "${info.type}".`);
            }
        }

        // create file & add to database
        let transaction = this.__idb.transaction(
            ["file_info", "file_data"], 'readwrite'
        );
        let fileData = type === 'file' ?
            new Blob(data, { type: mimeType }) :
            {}
        ;
        const [ key, dirInfo ] = await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore(
                    "file_data"
                ).add(fileData)
            ),
            promiseFromIDBRequest(
                transaction.objectStore(
                    "file_info"
                ).get(this.__key)
            )
        ]);

        const fileInfo = { createdTime, modifiedTime, type, key };
        if (type === 'file')
            fileInfo.mimeType = mimeType;

        this.__children[name] = fileInfo;
        const names = Object.getOwnPropertyNames(this.__children).reduce(
            (prev, name) => ({ [name]: this.__children[name].key, ...prev }),
            {}
        );
        dirInfo.modifiedTime = new Date().toISOString();

        transaction = this.__idb.transaction(
            ["file_info", "file_data"], 'readwrite'
        );
        await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore("file_info").add(fileInfo)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").put(names, this.__key)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_info").put(dirInfo)
            )
        ]);

        this.__modifiedTime = dirInfo.modifiedTime;
        this.__children[name].mimeType = mimeType;
        
        if (type === 'file')
            return new IDBFile(this, this.__idb, key, fileInfo, fileData);
        else
            return new IDBDirectory(this, this.__idb, key, fileInfo, fileData);
    }

    /**
     * Internal function for removing a file from the directory.
     * 
     * @param {string} name 
     */
    async __removeFile(name) {
        const dirInfo = await promiseFromIDBRequest(
            this.__idb.transaction(
                ["file_info"], 'readonly'
            ).objectStore(
                "file_info"
            ).get(this.__key)
        );

        const key = this.__children[name].key;
        const { type: fileType } = await promiseFromIDBRequest(
            this.__idb.transaction(
                ["file_info"], 'readonly'
            ).objectStore(
                "file_info"
            ).get(key)
        );

        if (fileType === 'directory') {
            const dir = await this.open(name);
            const children = Object.keys(dir.children);
            await Promise.all(children.map((name) => dir.remove(name)));
        }

        delete this.__children[name];
        dirInfo.modifiedTime = new Date().toISOString();
        const names = Object.getOwnPropertyNames(this.__children).reduce(
            (prev, name) => ({ [name]: this.__children[name].key, ...prev }),
            {}
        );

        const transaction = this.__idb.transaction(
            ["file_info", "file_data"], 'readwrite'
        );

        await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore("file_info").put(dirInfo)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").put(names, this.__key)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_info").delete(key)
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").delete(key)
            )
        ]);

        this.__modifiedTime = dirInfo.modifiedTime;
    }

    /**
     * Internal function for mounting a segregated file system.
     * 
     * @param {string} name
     * @param {string} type
     * @param {WFSDirectory} dir
     */
    async __mountFile(name, type, dir) {
        const currentTime = new Date().toISOString();
        const key = await promiseFromIDBRequest(
            this.__idb.transaction(
                [ "file_data" ], 'readwrite'
            ).objectStore("file_data").add({
                type, params: dir.mountInfo
            })
        );
        
        const names = Object.getOwnPropertyNames(
            this.__children
        ).reduce((prev, name) =>
            ({ [name]: this.__children[name].key, ...prev }),
            {}
        );
        names[name] = key;

        const transaction = this.__idb.transaction(
            [ "file_info", "file_data" ], 'readwrite'
        );
        await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore("file_info").add({
                    type: 'mount', key,
                    createdTime: currentTime,
                    modifiedTime: currentTime,
                    mimeType: dir.mimeType
                })
            ),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").put(
                    names, this.__key
                )
            )
        ]);
    }

    async __copyFile(name, fileToCopy) {
        //
    }

    async __moveFile(name, fileToMove) {
        //
    }

    static get mimeType() {
        return "application/vnd.wfs.inode";
    }

    /**
     * Creates or opens an indexedDB-based file system.
     * 
     * @param {WFSDirectory} parent  Parent directory if this isn't the root.
     * @param {string}       idbName Name of the IDB database to load from.
     * @param {IDBValidKey}  key     Key of the root directory.
     */
    static async mount(parent, idbName, key = 1) {
        if (parent !== null && !(parent instanceof WFSDirectory))
            throw new Error("parent must be a directory.");
        if (typeof idbName !== 'string')
            throw new TypeError('"idbName" must be a string.');

        const db = await promiseFromIDBRequest(
            indexedDB.open(idbName),
            (request, _, reject) => {
                request.onupgradeneeded = () => {
                    const db = request.result;
                    const currentTime = new Date().toISOString();

                    // create root directory
                    Promise.all([
                        promiseFromIDBRequest(db.createObjectStore(
                            "file_info",
                            { keyPath: 'key' }
                        ).add({
                            createdTime: currentTime,
                            modifiedTime: currentTime,
                            type: 'directory',
                            key
                        })),
                        promiseFromIDBRequest(db.createObjectStore(
                            "file_data",
                            { autoIncrement: true }
                        ).add({}, key))
                    ]).catch(reject);
                };
            }
        );

        
        const transaction = db.transaction(
            [ "file_info", "file_data" ], 'readonly'
        );
        const [ info, children ] = await Promise.all([
            promiseFromIDBRequest(
                transaction.objectStore("file_info").get(key)),
            promiseFromIDBRequest(
                transaction.objectStore("file_data").get(key)
            )
        ]);
        const childData = await directoryDataToChildObject(db, children);

        return new IDBDirectory(parent, db, key, info, childData);
    }
}

WFSDriverMap.idb = IDBDirectory;
