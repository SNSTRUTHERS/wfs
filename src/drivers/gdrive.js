import { WFSFile, WFSDirectory, WFSDriverMap } from "../wfs";

const BASE_URL = "https://www.googleapis.com/drive/v3";

// == HELPER FUNCTIONS ====================================================== //

/**
 * 
 * @param {RequestInfo} input 
 * @param {string} token 
 * @param {RequestInit} init 
 * @returns 
 */
function fetchAuthenticated(
    input,
    token,
    { headers = {}, ...init} = { headers: {} }
) {
    return fetch(input, {
        withCredentials: true,
        credentials: 'include',
        headers: { authorization: `Bearer ${token}`, ...headers },
        ...init
    });
}

async function getFolderChildren(id, token) {
    let response = await fetchAuthenticated(
        `${BASE_URL}/files?q="${
            id
        }"+in+parents+and+trashed=false&fields=files(${
            "id,name,mimeType,createdTime,modifiedTime,size"
        }),nextPageToken`,
        token,
        { method: 'GET' }
    );
    if (!response.ok)
        throw response;

    let { files, nextPageToken = null } = await response.json();
    while (nextPageToken) {
        response = await fetchAuthenticated(
            `${BASE_URL}/files?q="${
                id
            }"+in+parents+and+trashed=false&fields=files(${
                "id,name,mimeType,createdTime,modifiedTime,size"
            }),nextPageToken&pageToken=${
                nextPageToken
            }`,
            token
        );
        if (!response.ok)
            throw response;

        const folders = await response.json();
        files = [ ...files, ...folders.files ];
        nextPageToken = folders.nextPageToken;
    }

    const folderChildren = {};
    for (let { id, name, mimeType, size, ...rest } of files) {
        const type = (function () { switch (mimeType) {
        case "application/vnd.google-apps.folder":
            return 'directory';
        case "application/vnd.wfs.inode":
            return 'mount';
        default:
            return 'file';
        }})();
        if (type === 'mount') {
            const response = await fetchAuthenticated(
                `${BASE_URL}/files/${id}?&fields=properties`,
                token
            );
            const { driver } = await response.json();
            rest.driver = driver;
            mimeType = WFSDriverMap[driver].mimeType;
        }

        const entry = {
            id, mimeType, type,
            size: parseInt(size),
            ...rest
        };
        if (isNaN(entry.size))
            delete entry.size;

        folderChildren[name] = entry;
    }
    
    return folderChildren;
}

async function uploadFileData(blob, name, id, token, uploadType) {
    const CHUNK_SIZE = 16 * 1024 * 1024;
    let fileInfo;
    
    restart: do {
        if (uploadType === 'POST') {
            fileInfo = await fetchAuthenticated(
                "https://www.googleapis.com/upload/drive/v3/" +
                    "files?uploadType=resumable",
                    token,
                {
                    method: 'POST',
                    headers: { 'content-type': "application/json" },
                    body: JSON.stringify({
                        mimeType: blob.type,
                        parents: [ id ],
                        name
                    })
                }
            );
        } else if (uploadType === 'PATCH') {
            fileInfo = await fetchAuthenticated(
                `https://www.googleapis.com/upload/drive/v3/files/${
                    id
                }?uploadType=resumable`,
                token,
                {
                    method: 'PATCH',
                    headers: { 'content-type': "application/json" },
                    body: JSON.stringify({ mimeType: blob.type })
                }
            );
        } else {
            throw new Error(`Invalid upload type "${uploadType}".`);
        }

        if (fileInfo.status === 401)
            throw new Error("Invalid credentials.");
        if (blob.size === 0)
            break;

        // send file data in chunks
        const resumeURL = fileInfo.headers.get('location');
        for (let offset = 0; offset < blob.size; offset += CHUNK_SIZE) {
            const blobSlice = blob.slice(offset, offset + CHUNK_SIZE);

            let sleepTime = 1000;
            do {
                fileInfo = await fetchAuthenticated(
                    resumeURL,
                    token,
                    {
                        method: 'PUT',
                        headers: {
                            'content-length': blobSlice.size,
                            'content-range': `bytes ${offset}-${
                                offset + blobSlice.size - 1
                            }/${blob.size}`
                        },
                        body: blobSlice
                    }
                );

                if (fileInfo.status === 429 ||
                    fileInfo.status >= 500
                ) {
                    // eslint-disable-next-line no-loop-func
                    await new Promise(function (resolve) {
                        setTimeout(function () {
                            sleepTime *= 2;
                            resolve();
                        }, sleepTime);
                    });
                    continue;
                } else if (fileInfo.status === 403) {
                    const {
                        error: { errors: [ { reason } ], message }
                    } = await fileInfo.json();
                    switch (reason) {
                    case "userRateLimitExceeded":
                    case "rateLimitExceeded":
                        // eslint-disable-next-line no-loop-func
                        await new Promise(function (resolve) {
                            setTimeout(function () {
                                sleepTime *= 2;
                                resolve();
                            }, sleepTime);
                        });
                        continue;
                    
                    default:
                        throw new Error(message);
                    }
                } else if (fileInfo.status === 404) {
                    continue restart;
                } else if (fileInfo.status === 308) {
                    const range = fileInfo.headers.get('range');
                    if (range) {
                        offset = parseInt(
                            range.match(/bytes=([0-9]+)-([0-9]+)/)[2]
                        ) + 1;
                    }
                } else if (!fileInfo.ok) {
                    throw new Error(fileInfo.statusText);
                }
            } while (false);
        }
    } while (false);

    return fileInfo;
}

// == WFS DEFINES =========================================================== //

export class GDFile extends WFSFile {
    constructor(id, token, mimeType, size, ctime, mtime) {
        super();

        Object.defineProperties(this, {
            __id: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: id
            },

            __modifiedTime: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: mtime
            },

            __size: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: size
            },

            __token: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: token
            },

            createdTime: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: ctime
            },

            mimeType: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: mimeType
            },

            mountInfo: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: Object.freeze([ id ])
            }
        });
    }

    get modifiedTime() {
        return this.__modifiedTime;
    }

    get size() {
        return this.__size;
    }

    async sync() {
        let fileInfo = await fetchAuthenticated(
            `${BASE_URL}/files/${this.__id}?&fields=${
                "mimeType,createdTime,modifiedTime,size"
            }`,
            this.__token
        );
        if (fileInfo.status === 401)
            throw new Error("Invalid credentials.");
        
        const { modifiedTime, size } = await fileInfo.json();
        this.__modifiedTime = modifiedTime;
        this.__size = parseInt(size);
    }

    async read(buffer, offset = 0, count = this.__size) {
        offset = Math.max(0, offset);
        count = Math.min(count, this.__size);

        const start = offset * buffer.BYTES_PER_ELEMENT;
        const end   = start + (count * buffer.BYTES_PER_ELEMENT);
        
        const fileInfo = await fetchAuthenticated(
            `${BASE_URL}/files/${this.__id}?alt=media`,
            this.__token,
            { headers: { range: `bytes=${start}-${end}` } }
        );
        if (fileInfo.status === 401)
            throw new Error("Invalid credentials.");

        if (buffer) {
            const fileBuffer = await fileInfo.arrayBuffer();
            const fileTArray = new buffer.constructor(fileBuffer);
            buffer.set(
                fileTArray.slice(0, Math.min(buffer.length, fileTArray.length)),
                0
            );
        }

        return parseInt(fileInfo.headers.get('content-length')) /
            (buffer ? buffer.BYTES_PER_ELEMENT : 1)
        ;
    }

    async readBlob(offset = 0, count = this.__size) {
        offset = Math.max(0, offset);
        count = Math.min(count, this.__size);

        const response = await fetchAuthenticated(
            `${BASE_URL}/files/${this.__id}?alt=media`,
            this.__token,
            { headers: { range: `bytes=${offset}-${offset + count}` }}
        );
        if (response.status === 401)
            throw new Error("Invalid credentials.");
        
        return response.blob();
    }

    async write(buffer, offset = 0, count = this.__size) {
        if (buffer === undefined)
            throw new Error("buffer must be a typed array or string.");
        else if (typeof buffer === 'string' || buffer.constructor === String)
            buffer = new TextEncoder('utf-8').encode(buffer);

        offset = Math.max(0, offset * buffer.BYTES_PER_ELEMENT);
        count = Math.min(count * buffer.BYTES_PER_ELEMENT, this.__size);
        const [ beginBlob, endBlob ] = await Promise.all([
            this.readBlob(0, offset),
            this.readBlob(offset + count)
        ]);

        const fileInfo = await uploadFileData(
            new Blob(
                [ beginBlob, new Blob([ buffer ]), endBlob ],
                { type: this.__blob.type }
            ),
            null, this.__id, this.__token, 'PATCH'
        );
        const fileData = await fileInfo.json();

        this.__size = fileData.size;
        this.__modifiedTime = fileData.modifiedTime;
        return this.__size / buffer.BYTES_PER_ELEMENT;
    }

    async export() {
        const response = await fetchAuthenticated(
            `${BASE_URL}/files/${this.__id}/export?mimeType=application/pdf`,
            this.__token
        );
        if (response.status === 401)
            throw new Error("Invalid credentials.");

        return response.blob();
    }
};

export class GDDirectory extends WFSDirectory {
    constructor(parent, id, token, children, ctime, mtime) {
        super(parent);

        Object.defineProperties(this, {
            __children: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: { ...children }
            },

            __id: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: id
            },

            __modifiedTime: {
                configurable: false,
                enumerable: false,
                writable: true,

                value: mtime
            },

            __token: {
                configurable: false,
                enumerable: false,
                writable: false,

                value: token
            },

            createdTime: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: ctime
            },

            mountInfo: {
                configurable: false,
                enumerable: true,
                writable: false,

                value: Object.freeze([ id ])
            }
        });
    }

    get children() {
        return this.__children;
    }

    get modifiedTime() {
        return this.__modifiedTime;
    }

    async sync() {

    }

    async __openFile(name, { data, mimeType, type, params }) {
        if (name in this.__children) /* open existing file */ {
            const { id } = this.__children[name];
            const token = this.__token

            let fileInfo = await fetchAuthenticated(
                `${BASE_URL}/files/${id}?&fields=${
                    "mimeType,createdTime,modifiedTime,size"
                }`,
                token
            );
            if (fileInfo.status === 401)
                throw new Error("Invalid credentials.");
            
            const {
                mimeType,
                createdTime,
                modifiedTime,
                size
            } = await fileInfo.json();

            let fileData;
            if (mimeType === this.mimeType) {
                try {
                    const children = await getFolderChildren(id, token);
                    return new GDDirectory(
                        this,
                        id, token,
                        children,
                        createdTime,
                        modifiedTime
                    );
                } catch (erroneousResponse) {
                    console.error(erroneousResponse);
                    if (erroneousResponse.status === 401)
                        throw new Error("Invalid credentials.");
                    else
                        throw new Error(erroneousResponse.statusText);
                }
            } else if (mimeType === "application/vnd.wfs.inode") {
                fileInfo = await fetchAuthenticated(
                    `${BASE_URL}/files/${id}?alt=media`,
                    token
                );
                if (fileInfo.headers.get('content-type') !== this.mimeType)
                    throw new Error("Invalid file data.");

                fileData = await fileInfo.json();
                if (!('type' in fileData) ||
                    !('params' in fileData) ||
                    Object.getOwnPropertyNames(fileData).length !== 2
                )
                    throw new Error("Invalid file data.");

                const { type, params: mountData } = fileData;
                return WFSDirectory.mount(type, this, ...mountData, ...params);
            } else {
                return new GDFile(
                    id, token,
                    mimeType,
                    parseInt(size),
                    createdTime,
                    modifiedTime
                );
            }
        } else if (type === 'file') /* create new file */ {
            const fileInfo = await uploadFileData(
                new Blob([ data ], { type: mimeType }),
                name, this.__id, this.__token, 'POST'
            );
            const fileData = await fileInfo.json();
            
            this.__children[name] = {
                id: fileData.id,
                createdTime: fileData.createdTime,
                modifiedTime: fileData.modifiedTime,
                mimeType: fileData.mimeType,
                size: fileData.size
            };

            return new GDFile(
                fileData.id,
                this.__token,
                fileData.mimeType,
                fileData.size,
                fileData.createdTime,
                fileData.modifiedTime
            );
        } else /* create new folder */ {
            const fileInfo = await fetchAuthenticated(
                `${BASE_URL}/files?uploadType=resumable`,
                this.__token,
                {
                    method: 'POST',
                    headers: {
                        'content-type': "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        mimeType: this.mimeType,
                        parents: [ this.__id ],
                        name
                    })
                }
            );
            if (fileInfo.status === 401)
                throw new Error("Invalid credentials.");

            const fileData = await fileInfo.json();
            
            this.__children[name] = {
                id: fileData.id,
                createdTime: fileData.createdTime,
                modifiedTime: fileData.modifiedTime
            };

            return new GDDirectory(
                this,
                fileData.id, this.__token,
                {},
                fileData.createdTime,
                fileData.modifiedTime
            );
        }
    }

    async __removeFile(name) {
        const response = await fetchAuthenticated(
            `${BASE_URL}/files/${this.__children[name].id}`,
            this.__token,
            { method: 'DELETE' }
        );

        if (response.status === 401) {
            throw new Error("Invalid credentials.");
        } else if (!response.ok) {
            const { error: { message } } = await response.json();
            throw new Error(message);
        }

        delete this.__children[name];
    }

    async __mountFile(name, type, dir) {
        let response = await fetchAuthenticated(
            `${BASE_URL}/files?uploadType=resumable`,
            this.__token,
            {
                method: 'POST',
                headers: {
                    'content-type': "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    mimeType: "application/vnd.wfs.inode",
                    name,
                    parents: [ this.__id ],
                    properties: { driver: type }
                })
            }
        );

        if (response.status === 401)
            throw new Error("Invalid credentials.");

        const resumeURL = response.headers.get('location');
        const data = JSON.stringify({ type, params: dir.mountInfo });
        let sleepTime = 1000;
        do {
            response = await fetchAuthenticated(
                resumeURL,
                this.__token,
                {
                    method: 'PUT',
                    headers: { 'content-length': data.length },
                    body: data
                }
            );

            if (response.status === 429 ||
                response.status >= 500
            ) {
                // eslint-disable-next-line no-loop-func
                await new Promise(function (resolve) {
                    setTimeout(function () {
                        sleepTime *= 2;
                        resolve();
                    }, sleepTime);
                });
                continue;
            } else if (response.status === 403) {
                const {
                    error: { errors: [ { reason } ], message }
                } = await response.json();
                switch (reason) {
                case "userRateLimitExceeded":
                case "rateLimitExceeded":
                    // eslint-disable-next-line no-loop-func
                    await new Promise(function (resolve) {
                        setTimeout(function () {
                            sleepTime *= 2;
                            resolve();
                        }, sleepTime);
                    });
                    continue;
                
                default:
                    throw new Error(message);
                }
            } else if (response.status === 404) {
                continue;
            } else if (!response.ok) {
                throw new Error(response.statusText);
            }
        } while (false);
    }

    async __copyFile(name, fileToCopy) {
        //
    }

    async __moveFile(name, fileToMove) {
        //
    }

    static get mimeType() {
        return "application/vnd.google-apps.folder";
    }

    static async mount(parent = null, id, token) {
        if (typeof id !== 'string')
            throw new Error("'id' must be a string.");
        if (token !== undefined && typeof token !== 'string')
            throw new Error("'token' must be a string.");
        
        const fileInfo = await fetchAuthenticated(
            `${BASE_URL}/files/${id}?q="${
                id
            }"&fields=mimeType,createdTime,modifiedTime,name`,
            token,
            { method: 'GET' }
        );
        if (fileInfo.status === 401)
            throw new Error("Invalid credentials.");
        
        const {
            mimeType,
            createdTime,
            modifiedTime,
            name
        } = await fileInfo.json();
        if (mimeType !== 'application/vnd.google-apps.folder')
            throw new Error(`"${name}" isn't a directory.`);
        
        try {
            const children = await getFolderChildren(id, token);
            return new GDDirectory(
                parent,
                id, token,
                children, createdTime, modifiedTime
            );
        } catch (erroneousResponse) {
            console.error(erroneousResponse);
            if (erroneousResponse.status === 401)
                throw new Error("Invalid credentials.");
            else
                throw new Error(erroneousResponse.statusText);
        }
    }
};

WFSDriverMap.gdrive = GDDirectory;
window.GDDirectory = GDDirectory;
