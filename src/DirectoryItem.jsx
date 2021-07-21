import React from "react";

import iconMap from "./icons/iconMap";

/**
 * @typedef {{
 *      createdTime: string,
 *      driver: string,
 *      index: number,
 *      mimeType: string,
 *      modifiedTime: string,
 *      name: string,
 *      selected: boolean,
 *      type: 'file' | 'directory' | 'mount'
 * }} DirectoryItemProps
 */

/**
 * A component representing an element of a DirectoryView.
 * @param {React.PropsWithChildren<DirectoryItemProps>} props 
 */
const DirectoryItem = ({
    createdTime,
    driver,
    index,
    mimeType,
    modifiedTime,
    name,
    selected,
    type
}) => {
    const icon =
        iconMap[mimeType] ||
        iconMap[mimeType.split('/')[0] + '/*'] ||
        (
            (type === 'file') ?
                iconMap['*/*'] :
                iconMap['inode/directory']
        )
    ;

    return (<li
        className={`DirectoryItem ${type} ${selected ? 'selected' : ''}`}
        data-index={index}
        key={name}
    >
        <img
            src={icon}
            alt={mimeType}
        />
        <span className="file-name">{name}</span>
        <span className="created-time">{
            new Date(createdTime).toLocaleString()
        }</span>
        <span className="modified-time">{
            new Date(modifiedTime).toLocaleString()
        }</span>
    </li>);
};

export default DirectoryItem;
