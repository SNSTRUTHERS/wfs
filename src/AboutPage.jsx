import React from "react";
import { Link, Redirect } from "react-router-dom";

import "./AboutPage.css";

function indent(num) {
    let str = "";
    for (let i = 0; i < num; i++)
        str += "    ";
    return str;
}

const TIMEREGEX =
    "/[0-9]{4}-[0-1][0-9]-[0-3][0-9]T" +
    "[0-2][0-9]:[0-6][0-9]:[0-6][0-9]\\.[0-9]{3}Z/"
;

const NAMES = {
    "about": "About",
    "about/predefs": "Predefined Types",
    "about/drives": "Drives",
    "about/files": "Files",
    "about/directories": "Directories",
    "about/wfsfile": <><code>WFSFile</code> Interface</>,
    "about/wfsfile/read": "read/readBlob",
    "about/wfsdirectory": <><code>WFSDirectory</code> Interface</>,
    "about/wfsdirectory/openfile": "__openFile",
    "about/wfsdirectory/mount-static": <>
        static abstract <code>mount</code>
    </>,
    "about/wfsdirectory/mount-static-base": <>
        static base <code>mount</code>
    </>,
    "about/wfsdirectory/mountfile": "__mountFile",
    "about/wfsdirectory/removefile": "__removeFile",
    "about/wfsdrivermap": <><code>WFSDriverMap</code> Object</>
};

const INTERFACES = {
    "wfsfile/read": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSFile</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >read</span>(<br />{indent(2)}
        <span
            className="property variable"
        >buffer</span>:  <Link
            className="type"
            to="/about/predefs#typedarray"
        >TypedArray</Link>,<br />{indent(2)}
        <span
            className="property variable"
        >offset</span>?: <span
            className="type"
        >number</span>,<br />{indent(2)}
        <span
            className="property variable"
        >count</span>?:  <span
            className="type"
        >number</span><br />{indent(1)}
        ): <span
            className="type"
        >number</span>;<br />
        {"}"}
    </pre>,
    
    "wfsfile/readblob": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSFile</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >readBlob</span>(<br />{indent(2)}
        <span
            className="property variable"
        >offset</span>?: <span
            className="type"
        >number</span>,<br />{indent(2)}
        <span
            className="property variable"
        >count</span>?:  <span
            className="type"
        >number</span><br />{indent(1)}
        ): <span
            className="type"
        >Blob</span>;<br />
        {"}"}
    </pre>,

    "wfsfile/write": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSFile</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >write</span>(<br />{indent(2)}
        <span
            className="property variable"
        >input</span>:   <Link
            className="type"
            to="/about/predefs#typedarray"
        >TypedArray</Link> | <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >offset</span>?: <span
            className="type"
        >number</span>,<br />{indent(2)}
        <span
            className="property variable"
        >count</span>?:  <span
            className="type"
        >number</span><br />{indent(1)}
        ): <span
            className="type"
        >number</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/copy": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >final</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >copy</span>(<br />{indent(2)}
        <span
            className="property variable"
        >fromPath</span>: <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >toPath</span>:   <span
            className="type"
        >string</span><br />{indent(1)}
        ): <span
            className="type"
        >WFSFile</span> | <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/mount": <pre>
        <span
            className="keyword"
        >class</span> <span
            className="keyword"
        >extends</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >static</span> <span
            className="keyword"
        >types</span> <span
            className="type"
        >_MountParams</span>;<br />
        <br />{indent(1)}
        <span
            className="keyword"
        >final</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >mount</span>(<br />{indent(2)}
        <span
            className="property variable"
        >path</span>: <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >type</span>: <span
            className="keyword"
        >keyof</span> <Link
            className="const variable"
            to="../wfsdrivermap"
        >WFSDriverMap</Link>,<br />{indent(2)}
        ...<span
            className="property variable"
        >params</span>: <span
            className="type"
        >_MountParams</span><br />{indent(1)}
        ): <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/mount-static-base": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >static</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >mount</span>(<br />{indent(2)}
        <span
            className="property variable"
        >type</span>:      <span
            className="keyword"
        >keyof</span> <Link
            className="const variable"
            to="/about/wfsdrivermap"
        >WFSDriverMap</Link>,<br />{indent(2)}
        <span
            className="property variable"
        >parent</span>:    <span
            className="type"
        >WFSDirectory</span>?,<br />{indent(2)}
        ...<span
            className="property variable"
        >params</span>: <span
            className="const variable"
        >WFSDriverMap</span>[<span
            className="property variable"
        >type</span>].<span
            className="type"
        >_MountParams</span><br />{indent(1)}
        ): <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}<br /><br />
        <span
            className="keyword"
        >class</span> <span
            className="keyword"
        >extends</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >static</span> <span
            className="keyword"
        >types</span> <span
            className="type"
        >_MountParams</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/mountfile": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >__mountFile</span>(<br />{indent(2)}
        <span
            className="property variable"
        >name</span>:      <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >type</span>:      <span
            className="keyword"
        >keyof</span> <Link
            className="const variable"
            to="/about/wfsdrivermap"
        >WFSDriverMap</Link>,<br />{indent(2)}
        <span
            className="property variable"
        >directory</span>: <span
            className="type"
        >WFSDirectory</span><br />{indent(1)}
        ): <span
            className="keyword"
        >void</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/open": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >final</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >open</span>(<br />{indent(2)}
        <span
            className="property variable"
        >path</span>:     <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >options</span>?: <Link
            className="type"
            to="/about/wfsdirectory/open#wfsopenoptions"
        >WFSOpenOptions</Link><br />{indent(1)}
        ): <span
            className="type"
        >WFSFile</span> | <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/openfile": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >__openFile</span>(<br />{indent(2)}
        <span
            className="property variable"
        >name</span>:     <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >options</span>?: <Link
            className="type"
            to="/about/wfsdirectory/open#wfsopenoptions"
        >WFSOpenOptions</Link><br />{indent(1)}
        ): <span
            className="type"
        >WFSFile</span> | <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/move": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >final</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >move</span>(<br />{indent(2)}
        <span
            className="property variable"
        >fromPath</span>: <span
            className="type"
        >string</span>,<br />{indent(2)}
        <span
            className="property variable"
        >toPath</span>:   <span
            className="type"
        >string</span><br />{indent(1)}
        ): <span
            className="type"
        >WFSFile</span> | <span
            className="type"
        >WFSDirectory</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/remove": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >final</span> <span
            className="keyword"
        >async</span> <span
            className="function"
        >remove</span>(<br />{indent(2)}
        <span
            className="property variable"
        >path</span>: <span
            className="type"
        >string</span><br />{indent(1)}
        ): <span
            className="keyword"
        >void</span>;<br />
        {"}"}
    </pre>,

    "wfsdirectory/removefile": <pre>
        <span
            className="keyword"
        >abstract</span> <span
            className="keyword"
        >class</span> <span
            className="type"
        >WFSDirectory</span>{" {"}<br />{indent(1)}
        <span
            className="keyword"
        >async</span> <span
            className="function"
        >__removeFile</span>(<br />{indent(2)}
        <span
            className="property variable"
        >name</span>: <span
            className="type"
        >string</span><br />{indent(1)}
        ): <span
            className="keyword"
        >void</span>;<br />
        {"}"}
    </pre>
};

function pathToDisplayText(path) {
    let displayText = NAMES[path];
    if (displayText &&
        !(typeof displayText === 'string' || displayText instanceof String)
    ) {
        function combine(str, child) {
            if (typeof child === 'string')
                return str + child;
            else if (child.props.children instanceof Array)
                return str + child.props.children.reduce(combine, "");
            else
                return str + child.props.children;
        }
        if (displayText.props.children instanceof Array)
            displayText = displayText.props.children.reduce(combine, "");
        else
            displayText = displayText.props.children;
    }

    return displayText || path.split('/').pop();
}

const PAGES = {
    "": <>
        <h1>About Web File System</h1>
        <p>
            <b>Web File System</b> is an JavaScript (ES2015+) library intended
            to make interacting with different virtual file systems on the web
            easier to use and interoperate.
        </p>

        <h2>Purpose &amp; Definition of Terms</h2>
        <p>
            A <b>file system</b> is a service= or object which controls how
            groups of data are read from and written to. A <b>file</b> is a
            singular group of data within one of these systems. File systems in
            this context are <b>hierarchical</b>, meaning that files are
            organized and stored within <b>directories</b>, which themselves are
            a type of file which can contain multiple files, including other
            directories.
        </p>
        <p>
            Nearly all desktop and business computer operating systems that
            exist have hierarchical file systems as the primary method for
            storing chunks of data of arbitrary size on most computers,
            as well as providing facilities for interprocess communication and
            accessing process-specific internal data amongst other things. The
            aforementioned data can contain sensitive information, and as such
            it makes sense to not allow web browsers to access to a user's file
            system without their explicit consent.
        </p>
        <p>
            With the continued advancement and complexity of web applications,
            users and developers increasingly required this sort of permanent
            storage -- a problem fixed thanks to cloud storage providers, such
            as Dropbox or Google Drive. These services, originating from
            separate companies or individuals, have incompatible APIs and
            are not easily able to interoperate between one another. <b>
            Web File System</b> aims to address this by providing a common,
            versitile API to access, transfer, or otherwise manipulate files,
            regardless of Web APIs.
        </p>
        <p>
            These pages are intended to provide documentation regarding how to
            use &amp; program with Web File System, as well as how to implement
            Web File System drivers such that one can connect and interact with
            multiple different file systems at the same time.
        </p>

        <h2>How to Use</h2>
        <ol>
            <li><Link to="about/files">{
                NAMES["about/files"]
            }</Link></li>
            <li><Link to="about/directories">{
                NAMES["about/directories"]
            }</Link></li>
            <li><Link to="about/drives">{
                NAMES["about/drives"]
            }</Link></li>
        </ol>

        <h2>API Listing</h2>
        <ol>
            <li><Link to="about/predefs">{
                NAMES["about/predefs"]
            }</Link></li>
            <li><Link to="about/wfsfile">{
                NAMES["about/wfsfile"]
            }</Link></li>
            <li><Link to="about/wfsdirectory">{
                NAMES["about/wfsdirectory"]
            }</Link></li>
            <li><Link to="about/wfsdrivermap">{
                NAMES["about/wfsdrivermap"]
            }</Link></li>
        </ol>
    </>,

    "files": <>
        <h4><Link to="directories">Next</Link></h4>
        <h1>{pathToDisplayText("about/files")}</h1>
        <p>
            A <b>file</b> is an arbitrary collection of binary data associated
            with a type denoting its contents. <b>Web File System</b> provides
            facilities to <b>read</b> and <b>write</b> to these files in a
            convenient manner.
        </p>

        <h2>JavaScript API</h2>
        <p>
            Web File System has the abstract base class <code>WFSFile</code>,
            which provides the interface from which file interactions are based.
            This, however, does not include file creation, opening, or
            destruction. This base class, and associated subclasses, are not
            intended to be constructed via <code>new</code> directly by the
            user; it is instead the responsibility of the code which operates
            the specific file system, the <b>driver</b>, to construct and
            prepare this class for use by the user.
        </p>
        <p>
            Files can be opened as either read-write or read-only; the former
            allows one to both read from and write to the file; the former only
            allows reading. To open or otherwise access a file and its contents,
            it must be opened from a directory. Creating and/or opening a file
            uses the following interface:
        </p>
        {INTERFACES["wfsdirectory/open"]}
        <p>
            <i>path</i> consists of a file path, similar to that found on
            Unix-like file systems. For creating or opening a file, a simple
            name will suffice. If you are opening an exsiting
            file, <i>options</i> can be omitted. If you are creating a new
            file, <i>options</i> should, at minimum, consist of an object with
            a single property, <i>openExisting</i>, set to <code>false</code>.
        </p>
        <p>
            There are two fundamental single-file interactions in Web File
            System: <b>reading</b> and <b>writing</b>. Reading provides the
            file's contents and writing overrides the file's contents with new
            data. Two interfaces are available for reading files; one which uses
            an <code>ArrayBuffer</code>:
        </p>
        {INTERFACES["wfsfile/read"]}
        <p>
            ...and one which returns a <code>Blob</code>:
        </p>
        {INTERFACES["wfsfile/readblob"]}

        <p>
            <i>buffer</i> is a JavaScript typed array which will be written to
            in order to receive the file contents. The size of the individual
            elements of <i>buffer</i> in bytes serves as a
            baseline <b>unit</b>. <i>offset</i> denotes how many units to skip
            when reading from the file. <i>count</i> denotes how many units to
            read from the file. Both of these numeric parameters are optional,
            defaulting to behavior in which an attempt is made to read the
            entirety of the file's contents into the provided <i>buffer</i>. The
            function returns how many units were available to be read into the
            buffer; not how many were ultimately read into it.
        </p>
        {INTERFACES["wfsfile/write"]}
        <p>
            <i>buffer</i> is a JavaScript typed array whose contents are to be
            written into the file. Alternatively, it can be a string, in which
            it is encoded as UTF-8 and then written into the file. The size of
            the individual elements of <i>buffer</i> in bytes serves as a
            baseline <b>unit</b>. For strings, the unit size
            is <code>1</code>. <i>offset</i> denotes how many units to skip
            when writing into the file. <i>count</i> denotes how many units to
            overwrite during the operation. Both of these numeric parameters are
            optional, defaulting to behavior in which the file's contents are
            entirely overridden and replaced with the contents of <i>buffer</i>. 
        </p>
        <p>
            In addition to reading &amp; writing, <code>WFSFile</code> contains
            properties which provide additional information about thie file,
            including creation &amp; last write times, the size of the file in
            bytes, and the MIME type:
        </p>

        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >createdTime</span>(): <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>;<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >mimeType</span>(): <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link>;<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >modifiedTime</span>(): <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>;<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >size</span>(): <span
                className="type"
            >number</span>;<br />
            {"}"}
        </pre>

        <h2>Example Usage</h2>
        <h3>Reading</h3>
        <p>
            Let's say we are given a text file we need to read &amp;
            subsequently parse. The name of the file is <code>test.txt</code>,
            and the current working directory is in a variable
            called <i>cwd</i>. Opening the file is done as follows:
        </p>

        <pre>
            <span
                className="keyword"
            >let</span> <span
                className="property variable"
            >cwd</span>: <span
                className="type"
            >WFSDirectory</span>;<br /><br />
            <span
                className="comment"
            >{"// ..."}</span><br /><br />
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >file</span> = <span
                className="keyword"
            >await</span> <span
                className="property variable"
            >cwd</span>.<span
                className="function"
            >open</span>(<span
                className="string"
            >"test.txt"</span>);
        </pre>

        <p>
            To make things easier in JavaScript land, we'll convert the file's
            contents to a JavaScript string. For brevity's sake, we'll use
            a singule <code>Uint8Array</code> to do the job. The following
            sample code reads in the file's contents into a variable
            called <i>string</i>:
        </p>
        <pre>
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >buffer</span> = <span
                className="keyword"
            >new</span> <span
                className="type"
            >Uint8Array</span>(<span
                className="const variable"
            >file</span>.<span
                className="const"
            >size</span>);<br />
            <span
                className="keyword"
            >await</span> <span
                className="const variable"
            >file</span>.<span
                className="function"
            >read</span>(<span
                className="const variable"
            >buffer</span>);<br />
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >string</span> = <span
                className="keyword"
            >new</span> <span
                className="type"
            >TextDecoder</span>(<span
                className="string"
            >"utf-8"</span>).<span
                className="function"
            >decode</span>(<span
                className="const variable"
            >buffer</span>);
        </pre>

        <h3>Writing</h3>
        <p>
            Let's say we need to write some text data to an output file
            called <code>output.txt</code>. This file doesn't presently exist in
            the file system. Creating a new file is done as follows:
        </p>

        <pre>
            <span
                className="keyword"
            >let</span> <span
                className="property variable"
            >cwd</span>: <span
                className="type"
            >WFSDirectory</span>;<br /><br />
            <span
                className="comment"
            >{"// ..."}</span><br /><br />
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >file</span> = <span
                className="keyword"
            >await</span> <span
                className="property variable"
            >cwd</span>.<span
                className="function"
            >open</span>(<span
                className="string"
            >"output.txt"</span>{", { "}<span
                className="property"
            >openExisting</span>: <span
                className="keyword"
            >false</span>{" });"}
        </pre>

        <p>
            As seen earlier, explicit use of a <code>TextDecoder</code> is
            needed for reading from a file due to its interface. By contrast,
            writing into a file does not require explicit use of
            a <code>TextEncoder</code>:
        </p>

        <pre>
            <span
                className="keyword"
            >await</span> <span
                className="const variable"
            >file</span>.<span
                className="function"
            >write</span>(<span
                className="string"
            >"Hello, WFS!"</span>);
        </pre>

        <p>
            If we need to append data to the end of a file (i.e. write without
            overriding the file's contents), set the file's size as the offset
            for the write operation:
        </p>

        <pre>
            <span
                className="keyword"
            >await</span> <span
                className="const variable"
            >file</span>.<span
                className="function"
            >write</span>(<span
                className="string"
            >" How are you doing today?\n"</span>, <span
                className="const variable"
            >file</span>.<span
                className="const"
            >size</span>);
        </pre>

        <p>
            <code>WFSFile.write</code> also allows for bytewise/unit-wise
            patch semantics. Here, we are replacing the
            substring <code>"WFS"</code> from the above code samples with the
            substring <code>"user"</code>:
        </p>

        <pre>
            <span
                className="keyword"
            >await</span> <span
                className="const variable"
            >file</span>.<span
                className="function"
            >write</span>(<span
                className="string"
            >"user"</span>, <span
                className="string"
            >"Hello, "</span>.<span
                className="const"
            >length</span>, <span
                className="string"
            >"WFS"</span>.<span
                className="const"
            >length</span>);
        </pre>
    </>,

    "directories": <>
        <h4><Link to="files">Previous</Link></h4>
        <h4><Link to="drives">Next</Link></h4>
        <h1>{pathToDisplayText("about/directories")}</h1>
        <p>
            A <b>directory</b> is an object which contains one or more files,
            directories, or mounted drives within. Directories maintain a
            hierarchy of how files are accessed,
            and <b>Web File System</b> includes various facilities for file
            management.
        </p>

        <h2>JavaScript API</h2>
        <p>
            Web File System has the abstract base
            class <code>WFSDirectory</code>, which provides the interface from
            which directory interactions are based. This includes file creation,
            destruction, copying, and moving, as well as an interface for
            mounting drives that don't serve as the root of the file system as
            a whole. The files contained within a directory are
            called <b>children</b>.
        </p>
        <p>
            Creating new files and opening existing files is accomplished via
            the following interface:
        </p>
        {INTERFACES["wfsdirectory/open"]}
        <p>
            <i>path</i> refers to a <b>file path</b>, a string describing how
            to traverse a hierarchical file system. It consists of file names
            separated by slashes (<code>"/"</code>). Each individual name in the
            path is a path component. A path component matching the
            string <code>"."</code> refers to the location at the moment of
            reaching the component when traversing down the path. A path
            component matching the string <code>".."</code> refers to the parent
            directory of the current location as explained above. A path can
            either be <b>absolute</b>, in which traversal starts at the root
            directory, or <b>relative</b>, in which traversal starts at the
            directory object which was called. An absolute path starts with
            a <code>"/"</code> at the beginning of the path
            (e.g. <code>"/bin/bash"</code>). <i>options</i> is an object
            containing more specific information regarding how to open or
            create the file.
        </p>
        <p>
            Whilst the above method can open all file types, it can only create
            two: files and directories. <b>Mount points</b>, i.e. files which
            point to a directory stored on another drive, must be created using
            the following interface:
        </p>
        {INTERFACES["wfsdirectory/mount"]}
        <p>
            <i>path</i> is a file path, as specified above. <i>type</i> is the
            name of the driver which will handle the given mount point's
            operations. <i>params</i> is a list of mounting parameters provided
            to more precisely open the drive. More information about this topic
            is explained on the next page.
        </p>
        <p>
            Aside from opening or creating files, directories can also remove
            files from the file system. This is done with the following
            interface:
        </p>
        {INTERFACES["wfsdirectory/remove"]}
        <h3>Unimplemented</h3>
        <p>
            Files can also be copied from one location to another using this
            interface:
        </p>
        {INTERFACES["wfsdirectory/copy"]}
        <p>
            ...and relocated from one location to another using this
            interface:
        </p>
        {INTERFACES["wfsdirectory/move"]}
    </>,

    "drives": <>
        <h4><Link to="directories">Previous</Link></h4>
        <h1>{pathToDisplayText("about/drives")}</h1>
        <p>
            A <b>drive</b> is the root of a virtual file system. Each type of
            drive implements its own versions
            of <b>files</b> and <b>directories</b> that adhere to the Web File
            System specification. These implementations are packaged as
            a <b>driver</b>, with a unique string identifier,
            or <b>name</b>, to identify them.
        </p>
        <p>
            When using <b>Web File System</b>, the first thing one must do is
            open a drive, which thus serves as the <b>root</b> of the file
            system. This process is called <b>mounting</b> a drive. The
            directory serving as the top level of the root drive is called
            the <b>root directory.</b>. 
        </p>

        <h2>JavaScript API</h2>
        <p>
            There is no interface or abstract base class representing a drive
            in Web File System. Instead, drives are presented just like how a
            normal directory is presented: a subclass of the
            abstract <code>WFSDirectory</code> base class. The primary method
            in which a drive is mounted for use in Web File System is via a
            static method of this base class called <code>mount</code>. Each
            subclass of <code>WFSDirectory</code> overrides this static
            method, which in turn serves as the secondary method in which a
            drive can be mounted.
        </p>

        <p>
            The reference implementation of Web File System provides a builtin
            driver for using <a href=
                "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
            ><code>indexedDB</code></a>, with the
            string <code>"idb"</code> reserved to identify it. The directory
            implementation provided by the IDB driver is
            called <code>IDBDirectory</code>, and its
            static <code>mount</code> function has the following interface:
        </p>

        <pre>
            <span
                className="keyword"
            >class</span> <span
                className="type"
            >IDBDirectory</span> <span
                className="keyword"
            >extends</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >static</span> <span
                className="keyword"
            >async</span> <span
                className="function"
            >mount</span>(<br />{indent(2)}
            <span
                className="property variable"
            >parent</span>:  <span
                className="type"
            >WFSDirectory</span>?,<br />{indent(2)}
            <span
                className="property variable"
            >idbName</span>: <span
                className="type"
            >string</span>,<br />{indent(2)}
            <span
                className="property variable"
            >key</span>?:    <span
                className="type"
            >IDBValidKey</span><br />{indent(1)}
            ): <span
                className="type"
            >WFSDirectory</span>;<br />
            {"}"}
        </pre>

        <p>
            <i>idbName</i> represents the name of
            the <code>IDBDatabase</code> used to store the file system
            contents. <i>key</i> is the object store key which points to the
            directory's contents within the database. This parameter is
            optional, and is thus irrelevant to the topic of this
            page. Likewise, <i>parent</i> is, too, irrelevant; it is used when
            setting up a drive to be viewed as the child of another drive, a
            topic covered on a later page.
        </p>
        <p>
            The parameters following <i>parent</i> are known as the
            drive's <b>mount parameters</b>. These same parameters can be passed
            into <code>WFSDirectory</code>'s static <code>mount</code> method,
            which has the following interface:
        </p>
        {INTERFACES["wfsdirectory/mount-static-base"]}
        <p>
            <i>type</i> is the driver implementation name, <i>parent</i> is,
            again, irrelevant to this page's contents, and <i>params</i> are
            the aforementioned mounting parameters.
        </p>

        <h2>Example Usage</h2>
        <p>
            We will be storing our file system contents in
            the <code>IDBDatabase</code> identified by the
            string <code>"wfs"</code>. If we are to mount the drive
            using <code>WFSDirectory</code>, it would be written like this:
        </p>

        <pre>
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >rootDirectory</span> = <span
                className="keyword"
            >await</span> <span
                className="type"
            >WFSDirectory</span>.<span
                className="function"
            >mount</span>(<span
                className="string"
            >"idb"</span>, <span
                className="keyword"
            >null</span>, <span
                className="string"
            >"wfs"</span>);
        </pre>

        <p>
            If we were to use <code>IDBDirectory</code> directly, it would be
            written like this:
        </p>

        <pre>
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >rootDirectory</span> = <span
                className="keyword"
            >await</span> <span
                className="type"
            >IDBDirectory</span>.<span
                className="function"
            >mount</span>(<span
                className="keyword"
            >null</span>, <span
                className="string"
            >"wfs"</span>);
        </pre>
    </>,
    
    "predefs": <>
        <h1>{pathToDisplayText("about/predefs")}</h1>
        <p>
            This page formally defines type names which are referenced
            throughout these pages.
        </p>

        <h2 id="blobpart"><code>BlobPart</code></h2>
        <p>
            Any type which is allowed to be used when constructing a
            new <code>Blob</code>.
        </p>
        <pre>
            <span
                className="keyword"
            >type</span> <span
                className="type"
            >BlobPart</span> = <span
                className="type"
            >ArrayBufferView</span> | <span
                className="type"
            >ArrayBuffer</span> | <span
                className="type"
            >Blob</span> | <span
                className="type"
            >string</span>;
        </pre>

        <h2 id="isotimestring"><code>ISOTimeString</code></h2>
        <p>
            A string representing a date and time, as specified by <a
                href="https://en.wikipedia.org/wiki/ISO_8601"
            >ISO 8601</a>.
        </p>
        <pre>
            <span
                className="keyword"
            >type</span> <span
                className="type"
            >ISOTimeString</span> = <span
                className="type"
            >string</span>{"<"}<span
                className="regexp"
            >{TIMEREGEX}</span>{">"};
        </pre>

        <h2 id="mimetypestring"><code>MIMETypeString</code></h2>
        <p>
            A string representing a MIME type (a.k.a. "<a
                href="https://en.wikipedia.org/wiki/Media_type"
            ><i>media type</i></a>"), which specifies a file's contents.
        </p>
        <pre>
            <span
                className="keyword"
            >type</span> <span
                className="type"
            >ISOTimeString</span> = <span
                className="type"
            >string</span>{"<"}<span
                className="regexp"
            >{"/[a-z\\\\]+\\/[a-z.-]+/"}</span>{">"};
        </pre>

        <h2 id="typedarray"><code>TypedArray</code></h2>
        <p>
            A union representing any the typed arrays specified by the
            ECMAScript standard.
        </p>
        <pre>
            <span
                className="keyword"
            >type</span> <span
                className="type"
            >TypedArray</span> = <br />{indent(1)}
            <span
                className="type"
            >Int8Array</span>         |<br />{indent(1)}
            <span
                className="type"
            >Uint8Array</span>        |<br />{indent(1)}
            <span
                className="type"
            >Uint8ClampedArray</span> |<br />{indent(1)}
            <span
                className="type"
            >Int16Array</span>        |<br />{indent(1)}
            <span
                className="type"
            >Uint16Array</span>       |<br />{indent(1)}
            <span
                className="type"
            >Int32Array</span>        |<br />{indent(1)}
            <span
                className="type"
            >Uint32Array</span>       |<br />{indent(1)}
            <span
                className="type"
            >BigInt64Array</span>     |<br />{indent(1)}
            <span
                className="type"
            >BigUint64Array</span><br />
            ;
        </pre>

        <h2 id="wfsfiletype"><code>WFSFileType</code></h2>
        <p>
            An enumeration of strings representing the type of a file object.
        </p>
        <pre>
            <span
                className="keyword"
            >enum</span> <span
                className="type"
            >WFSFileType</span>{" {"}<br />{indent(1)}
            <span
                className="string"
            >'file'</span>, <span
                className="string"
            >'directory'</span>, <span
                className="string"
            >'mount'</span>
            <br />
            {"}"}
        </pre>
    </>,
    
    "wfsfile": <>
        <h1>{pathToDisplayText("about/wfsfile")}</h1>
        <p>
            The <code>WFSFile</code> interface represents a file containing
            arbitrary data. Web File System driver implementations should
            implement this interface according to the following specification.
        </p>
        <p>
            In JavaScript, <code>WFSFile</code> is an abstract base class which
            interface implementations must inherit from.
        </p>

        <h2>Instance Properties</h2>
        <h3 id="property-created-time"><code>createdTime</code></h3>
        <p>
            Denotes the time in which the file was first created.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >createdTime</span>(): <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>;<br />
            {"}"}
        </pre>

        <h3 id="property-created-mime-type"><code>mimeType</code></h3>
        <p>
            Denotes the type of contents are contained within the file.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >mimeType</span>(): <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link>;<br />
            {"}"}
        </pre>

        <h3 id="property-modified-time"><code>modifiedTime</code></h3>
        <p>
            Denotes the time in which the file was last written to.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >modifiedTime</span>(): <Link
                className="type"
                to="predefs#isotimestring"
            >ISOTimeString</Link>;<br />
            {"}"}
        </pre>

        <h3 id="property-size"><code>size</code></h3>
        <p>
            Denotes the size of the file in bytes.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >size</span>(): <span
                className="type"
            >number</span>;<br />
            {"}"}
        </pre>

        <h3 id="property-type"><code>type</code></h3>
        <p>
            Denotes what type of contents the file contains.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSFile</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >final</span> <span
                className="keyword"
            >get</span> <span
                className="const"
            >type</span>(): <Link
                className="type"
                to="predefs#wfsfiletype"
            >WFSFileType</Link> = <span
                className="string"
            >"file"</span>;<br />
            {"}"}
        </pre>

        <h2 id="methods">Instance Methods</h2>
        <ul>
            <li><Link to="wfsfile/read">
                <code>read</code>/<code>readBlob</code>
            </Link></li>
            <li><Link to="wfsfile/write"><code>write</code></Link></li>
        </ul>
    </>,

    "wfsfile/read": <>
        <h1>WFSFile.read</h1>
        {INTERFACES["wfsfile/read"]}
        {INTERFACES["wfsfile/readblob"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>buffer</code> (out)
                <ul>
                    <li>A typed array in which to receive file data.</li>
                    <li>
                        The <code>BYTES_PER_ELEMENT</code> field of the output
                        buffer is used as the baseline <b>unit</b> when reading
                        file data.
                    </li>
                </ul>
            </li>
            <li>
                <code>offset</code> (in, optional)
                <ul>
                    <li>How many units to start reading into the file.</li>
                    <li>Defaults to <code>0</code>.</li>
                </ul>
            </li>
            <li>
                <code>count</code> (in, optional)
                <ul>
                    <li>How many units to read from the file.</li>
                    <li>Defaults to the size of the file in units.</li>
                </ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            <code>read</code> returns how many units were read into the
            output buffer. <code>readBlob</code> returns
            a <code>Blob</code> containing the units read from the file.
        </p>
    </>,

    "wfsfile/write": <>
        <h1>WFSFile.write</h1>
        {INTERFACES["wfsfile/write"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>buffer</code> (in)
                <ul>
                    <li>A typed array or string to write into the file.</li>
                    <li>
                        The <code>BYTES_PER_ELEMENT</code> field of the input
                        buffer is used as the baseline <b>unit</b> when reading
                        file data. If a string is passed, the unit size
                        is <code>1</code>.
                    </li>
                </ul>
            </li>
            <li>
                <code>offset</code> (in, optional)
                <ul>
                    <li>How many units to start writing into the file.</li>
                    <li>Defaults to <code>0</code>.</li>
                </ul>
            </li>
            <li>
                <code>count</code> (in, optional)
                <ul>
                    <li>
                        How many units of the prior file's contents to append
                        after writing to the file at the specified offset.
                    </li>
                    <li>Defaults to <code>0</code>.</li>
                </ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>The new size of the file in units.</p>
    </>,

    "wfsdirectory": <>
        <h1>{pathToDisplayText("about/wfsdirectory")}</h1>
        <p>
            The <code>WFSDirectory</code> interface represents a file containing
            one or more files within itself. Directories cannot be recursively
            referenced unless one or more mount points create a circular
            reference.
        </p>
        <p>
            In JavaScript, <code>WFSDirectory</code> is an abstract base class
            which interface implementations must inherit from. Instance
            methods are split in two: a public-facing method for general usage,
            which is not overridden, and a private method which performs the
            operation, which is.
        </p>
        <p>
            The static method <code>mount</code> is also split in two; the base
            static method, which acts as a dispatch for mounting any file system
            type registered in the <code>WFSDriverMap</code>, and a
            specification which overridden static methods must implement. The
            latter, like the aforementioned private instance methods, actually
            performs the listed operation.
        </p>

        <h2>Instance Properties</h2>
        <h3 id="property-children"><code>children</code></h3>
        <p>
            An object matching file names to file metadata such that it can
            be retrieved without explicitly opening the file.
        </p>
        <ul>
            <li><code>createdTime</code>: when the file was first created.</li>
            <li>
                <code>driver</code>: (only used if the file is a mount point)
                denotes the name of this mount point's driver.
            </li>
            <li><code>mimeType</code>: what contents this file contains.</li>
            <li>
                <code>modifiedTime</code>: when the file was last written to.
            </li>
            <li>
                <code>size</code>: (only used if the file is a regular file)
                the size of the file in bytes.
            </li>
            <li><code>type</code>: what kind of file this is.</li>
        </ul>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >children</span>{"(): {"}<br />{indent(2)}
            [<span
                className="property variable"
            >name</span>: <span
                className="type"
            >string</span>{"]: {"}<br />{indent(3)}
            <span
                className="property"
            >createdTime</span>: <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>,<br />{indent(3)}
            <span
                className="property"
            >driver</span>?: <span
                className="keyword"
            >keyof</span> <Link
                className="const variable"
                to="/about/wfsdrivermap"
            >WFSDriverMap</Link>,<br />{indent(3)}
            <span
                className="property"
            >mimeType</span>: <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link>,<br />{indent(3)}
            <span
                className="property"
            >modifiedTime</span>: <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>,<br />{indent(3)}
            <span
                className="property"
            >size</span>?: <span
                className="type"
            >number</span>,<br />{indent(3)}
            <span
                className="property"
            >type</span>: <Link
                className="type"
                to="/about/predefs#wfsfiletype"
            >WFSFileType</Link><br />{indent(2)}
            {"};"}<br />{indent(1)}
            {"};"}<br />
            {"}"}
        </pre>

        <h3 id="property-created-time"><code>createdTime</code></h3>
        <p>
            Denotes the time in which the directory was first created.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >createdTime</span>(): <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>;<br />
            {"}"}
        </pre>
        
        <h3 id="property-mime-type"><code>mimeType</code></h3>
        <p>
            Forward of the static property <Link
                to="#static-mime-type"
            ><code>mimeType</code></Link>.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >mimeType</span>(): <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link> = <span
                className="keyword"
            >this</span>.<span
                className="property"
            >constructor</span>.<span
                className="const"
            >mimeType</span>;<br />
            {"}"}
        </pre>
        
        <h3 id="property-modified-time"><code>modifiedTime</code></h3>
        <p>
            Denotes the time in which the directory was last modified.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >modifiedTime</span>(): <Link
                className="type"
                to="/about/predefs#isotimestring"
            >ISOTimeString</Link>;<br />
            {"}"}
        </pre>
        
        <h3 id="property-mount-info"><code>mountInfo</code></h3>
        <p>
            Provides the mounting parameters needed to create a mount point to
            this directory. Some mounting parameters are allowed to be omitted
            by this function for security purposes.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >mountInfo</span>(): <span
                className="type"
            >any</span>[];<br />
            {"}"}
        </pre>

        <h3 id="property-type"><code>type</code></h3>
        <p>
            If this directory is a mount point, the type
            is <code>"mount"</code>; otherwise it is <code>"directory"</code>.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >final</span> <span
                className="keyword"
            >get</span> <span
                className="const"
            >type</span>(): <Link
                className="type"
                to="predefs#wfsfiletype"
            >WFSFileType</Link> = <span
                className="string"
            >"directory"</span> | <span
                className="string"
            >"mount"</span>;<br />
            {"}"}
        </pre>
        
        <h2>Instance Methods</h2>
        <ul>
            <li><code>copy</code> (unimplemented)</li>
            <li><code>open</code> (
                <Link to="wfsdirectory/open">
                    public
                </Link> / <Link to="wfsdirectory/openfile">
                    private
                </Link>
            )</li>
            <li><code>mount</code> (
                <Link to="wfsdirectory/mount">
                    public
                </Link> / <Link to="wfsdirectory/mountfile">
                    private
                </Link>
            )</li>
            <li><code>move</code> (unimplemented)</li>
            <li><code>remove</code> (
                <Link to="wfsdirectory/remove">
                    public
                </Link> / <Link to="wfsdirectory/removefile">
                    private
                </Link>
            )</li>
        </ul>

        <h2>Static Properties</h2>
        <h3 id="static-mime-type"><code>mimeType</code></h3>
        <p>
            The MIME type for directories for this directory's driver
            implementation.
        </p>
        <pre>
            <span
                className="keyword"
            >abstract</span> <span
                className="keyword"
            >class</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >get</span> <span
                className="const"
            >mimeType</span>(): <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link>;<br />
            {"}"}
        </pre>
        
        <h2>Static Methods</h2>
        <ul>
            <li><code>mount</code> (
                <Link to="wfsdirectory/mount-static-base">
                    base
                </Link> / <Link to="wfsdirectory/mount-static">
                    abstract
                </Link>
            )</li>
        </ul>
    </>,

    "wfsdirectory/copy": <>
        <h1>WFSDirectory.copy</h1>
        {INTERFACES["wfsdirectory/copy"]}
    </>,

    "wfsdirectory/open": <>
        <h1>WFSDirectory.open</h1>
        <p>
            Opens and creates files.
        </p>
        {INTERFACES["wfsdirectory/open"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>path</code> (in)
                <ul>
                    <li>A path to a file.</li>
                    <li>
                        Can be an absolute path (relative to the root of the
                        file system) or relative path (relative to the current
                        directory).
                    </li>
                </ul>
            </li>
            <li>
                <code>options</code> (in, optional)
                <ul><li>
                    How to open the file. See below for more information.
                </li></ul>
            </li>
            <li>
                <code>count</code> (in, optional)
                <ul>
                    <li>
                        How many units of the prior file's contents to append
                        after writing to the file at the specified offset.
                    </li>
                    <li>Defaults to <code>0</code>.</li>
                </ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            A file or directory, depending on what is kept at the given path in
            the file system.
        </p>

        <h2>Definitions</h2>
        <h3 id="wfsopenoptions"><code>WFSOpenOptions</code></h3>
        <pre>
            <span
                className="keyword"
            >interface</span> <span
                className="type"
            >WFSOpenOptions</span>{" {"}<br />{indent(1)}
            <span
                className="property"
            >createdTime</span>?: <span
                className="type"
            >Date</span>;<br />{indent(1)}
            <span
                className="property"
            >data</span>?: (<Link
                className="type"
                to="/about/predefs#blobpart"
            >BlobPart</Link> | <span
                className="type"
            >Promise</span>{'<'}<Link
                className="type"
                to="/about/predefs#blobpart"
            >BlobPart</Link>{">)[];"}<br />{indent(1)}
            <span
                className="property"
            >mimeType</span>?: <Link
                className="type"
                to="/about/predefs#mimetypestring"
            >MIMETypeString</Link>;<br />{indent(1)}
            <span
                className="property"
            >modifiedTime</span>?: <span
                className="type"
            >Date</span>;<br />{indent(1)}
            <span
                className="property"
            >openExisting</span>?: <span
                className="type"
            >boolean</span>;<br />{indent(1)}
            <span
                className="property"
            >params</span>?: <span
                className="type"
            >any</span>[];<br />{indent(1)}
            <span
                className="property"
            >readOnly</span>?: <span
                className="type"
            >boolean</span>;<br />{indent(1)}
            <span
                className="property"
            >type</span>?: <Link
                className="type"
                to="/about/predefs#wfsfiletype"
            >WFSFileType</Link>;<br />
            {"}"}
        </pre>

        <p>
            This object provides a wide variety of parameters which either
            specify how or provide parameters when opening or creating a file or
            directory.
        </p>
        <ul>
            <li>
                <code>creationTime</code>: the time in which the file was
                created. Used when creating new files or directories. Defaults
                to the time at which <code>open</code> was called.
            </li>
            <li>
                <code>data</code>: an array of blob parts or promises which
                resolve to blob parts to initialize a new file with. Used when
                creating new files. Defaults to an empty array.
            </li>
            <li>
                <code>mimeType</code>: the MIME type of the file. Used when
                creating new files or directories. Defaults
                to <code>"text/plain"</code> when creating files.
            </li>
            <li>
                <code>openExisting</code>: specifies whether one is opening an
                existing file or creating a new file. Defaults
                to <code>true</code>.
            </li>
            <li>
                <code>params</code>: provides additional mounting parameters
                when opening a mount point. Used when opening mount points as
                directories. Defaults to an empty array.
            </li>
            <li>
                <code>readOnly</code>: specifies whether the opened file or
                directory can be written to or not. Defaults
                to <code>false</code>.
            </li>
            <li>
                <code>type</code>: specifies the type of file being opened or
                created. Defaults to <code>"file"</code>. Should be set
                to <code>"directory"</code> when creating a new directory.
            </li>
        </ul>
    </>,

    "wfsdirectory/openfile": <>
        <h1>WFSDirectory.__openFile</h1>
        <p>
            The internal function responsible for opening and or creating files
            and/or directories.
        </p>
        {INTERFACES["wfsdirectory/openfile"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>name</code> (in)
                <ul><li>The name of the file.</li></ul>
            </li>
            <li>
                <code>type</code> (in)
                <ul><li>
                    The <Link
                        to="/about/wfsdirectory/open#wfsopenoptions"
                    >options</Link> passed in from <code>open</code>.
                </li></ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            A file or directory, depending on what is kept at the given name in
            the file system and the open options.
        </p>
    </>,

    "wfsdirectory/mount": <>
        <h1>WFSDirectory.mount</h1>
        <p>
            Creates a new mount point to another drive.
        </p>
        {INTERFACES["wfsdirectory/mount"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>path</code> (in)
                <ul>
                    <li>A path to a file.</li>
                    <li>
                        Can be an absolute path (relative to the root of the
                        file system) or relative path (relative to the current
                        directory).
                    </li>
                </ul>
            </li>
            <li>
                <code>type</code> (in)
                <ul><li>
                    The type of drive that is going to be mounted.
                </li></ul>
            </li>
            <li>
                <code>params</code> (in)
                <ul><li>
                    The mounting parameters needed for the given drive
                    type's <code>mount</code> function.
                </li></ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            A new directory pointing to the separate drive.
        </p>
    </>,

    "wfsdirectory/mountfile": <>
        <h1>WFSDirectory.__mountFile</h1>
        <p>
            The internal function responsible for creating a mount point which
            points to the given directory.
        </p>
        {INTERFACES["wfsdirectory/mountfile"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>name</code> (in)
                <ul><li>The name of the file.</li></ul>
            </li>
            <li>
                <code>type</code> (in)
                <ul><li>
                    What type of drive the given directory belongs to.
                </li></ul>
            </li>
            <li>
                <code>directory</code> (in)
                <ul><li>The directory to be mounted.</li></ul>
            </li>
        </ul>
    </>,

    "wfsdirectory/remove": <>
        <h1>WFSDirectory.remove</h1>
        <p>
            Removes a file from the file system.
        </p>
        {INTERFACES["wfsdirectory/remove"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>path</code> (in)
                <ul>
                    <li>A path to a file.</li>
                    <li>
                        Can be an absolute path (relative to the root of the
                        file system) or relative path (relative to the current
                        directory).
                    </li>
                </ul>
            </li>
        </ul>
    </>,

    "wfsdirectory/removefile": <>
        <h1>WFSDirectory.__removeFile</h1>
        <p>
            The internal function responsible for deleting a file and its
            contents from the file system and parent directory.
        </p>
        {INTERFACES["wfsdirectory/removefile"]}
        
        <h2>Parameters</h2>
        <ul>
            <li>
                <code>name</code> (in)
                <ul><li>The name of the file.</li></ul>
            </li>
        </ul>
    </>,

    "wfsdirectory/mount-static": <>
        <h1>WFSDirectory.mount</h1>
        <p>
            The top-level method to call when opening (i.e. mounting)
            a specific type of drive.
        </p>

        <pre>
            <span
                className="keyword"
            >class</span> <span
                className="keyword"
            >extends</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >static</span> <span
                className="keyword"
            >types</span> <span
                className="type"
            >_MountParams</span>;<br />
            <br />{indent(1)}
            <span
                className="keyword"
            >static</span> <span
                className="keyword"
            >async</span> <span
                className="function"
            >mount</span>(<br />{indent(2)}
            <span
                className="property variable"
            >parent</span>:    <span
                className="type"
            >WFSDirectory</span>?,<br />{indent(2)}
            ...<span
                className="property variable"
            >params</span>: <span
                className="type"
            >_MountParams</span><br />{indent(1)}
            ): <span
                className="type"
            >WFSDirectory</span>;<br />
            {"}"}
        </pre>

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>parent</code> (in, optional)
                <ul>
                    <li>
                        The <code>WFSDirectory</code> that will serve as the
                        new mount point's parent directory.
                    </li>
                </ul>
            </li>
            <li>
                <code>params</code> (in)
                <ul><li>
                    The mounting parameters needed for opening the drive.
                </li></ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            A directory pointing to the drive's contents; dependent on the
            given drive's mounting parameters.
        </p>
    </>,

    "wfsdirectory/mount-static-base": <>
        <h1>WFSDirectory.mount</h1>
        <p>
            The top-level, generic method to call when opening (i.e. mounting)
            a drive.
        </p>
        {INTERFACES["wfsdirectory/mount-static-base"]}

        <h2>Parameters</h2>
        <ul>
            <li>
                <code>type</code> (in)
                <ul><li>
                    The type of drive that is going to be mounted.
                </li></ul>
            </li>
            <li>
                <code>parent</code> (in, optional)
                <ul>
                    <li>
                        The <code>WFSDirectory</code> that will serve as the
                        new mount point's parent directory.
                    </li>
                </ul>
            </li>
            <li>
                <code>params</code> (in)
                <ul><li>
                    The mounting parameters needed for the given drive
                    type's <code>mount</code> function.
                </li></ul>
            </li>
        </ul>

        <h2>Returns</h2>
        <p>
            A directory pointing to the drive's contents; dependent on the
            given drive's mounting parameters.
        </p>
    </>,

    "wfsdrivermap": <>
        <h1>{pathToDisplayText("about/wfsdrivermap")}</h1>
        <p>
            To track the link between driver names and implementations, a
            global object is used. This object is
            called <code>WFSDriverMap</code>, and has the following
            specification:
        </p>

        <pre>
            <span
                className="keyword"
            >const</span> <span
                className="const variable"
            >WFSDriverMap</span>{": {"}<br />{indent(1)}
            [<span
                className="property variable"
            >name</span>: <span
                className="type"
            >string</span>]: <span
                className="keyword"
            >typeof</span> <span
                className="type"
            >WFSDirectory</span><br />
            {"};"}
        </pre>

        <h2>Predefined Driver Implementations</h2>
        <h3>IndexedDB</h3>
        <p>
            The name <code>"idb"</code> is reserved for a reference Web File
            System driver included with the library which
            uses <code>indexedDB</code> as the medium for storing files. The
            following classes are defined by the driver implementation:
        </p>

        <pre>
            <span
                className="keyword"
            >class</span> <span
                className="type"
            >IDBFile</span> <span
                className="keyword"
            >extends</span> <span
                className="type"
            >WFSFile</span>;<br />
            <span
                className="keyword"
            >class</span> <span
                className="type"
            >IDBDirectory</span> <span
                className="keyword"
            >extends</span> <span
                className="type"
            >WFSDirectory</span>;
        </pre>

        <p>
            Indexed DB drives are mounted via the following interface:
        </p>

        <pre>
            <span
                className="keyword"
            >class</span> <span
                className="type"
            >IDBDirectory</span> <span
                className="keyword"
            >extends</span> <span
                className="type"
            >WFSDirectory</span>{" {"}<br />{indent(1)}
            <span
                className="keyword"
            >final</span> <span
                className="keyword"
            >static</span> <span
                className="keyword"
            >async</span> <span
                className="function"
            >mount</span>(<br />{indent(2)}
            <span
                className="property variable"
            >parent</span>:  <span
                className="type"
            >WFSDirectory</span>?,<br />{indent(2)}
            <span
                className="property variable"
            >idbName</span>: <span
                className="type"
            >string</span>,<br />{indent(2)}
            <span
                className="property variable"
            >key</span>?:    <span
                className="type"
            >IDBValidKey</span><br />{indent(1)}
            );<br />
            {"}"}
        </pre>

        <p>
            <i>idbName</i> refers to the name of
            the <code>IDBDatabase</code> which will contain the file
            data. <i>key</i> is the database key pointing to the to-be-mounted
            directory's file data.
        </p>
    </>
};

const AboutPage = ({ pathname, setWindowTitle }) => {
    const parts = [ 'about', ...pathname.split('/') ].filter((name) => name);
    setWindowTitle(parts.map((_, index) =>
        pathToDisplayText(parts.slice(0, index + 1).join('/'))
    ).join(' ~ '));

    return <div className="AboutPage">
        <h3><Link to="/files">Go Home</Link></h3>
        <ol className="parts-nav">{parts.map((name, index) => {
            const link = parts.slice(0, index + 1).join('/');
            const displayName = NAMES[link] || name;

            if (index === parts.length - 1) {
                return <li key={index}>{displayName}</li>;
            } else {
                return <Link to={`/${link}`} key={index}>
                    <li>{displayName}</li>
                </Link>;
            }
        })}</ol>
        {PAGES[pathname] || <Redirect to="/" />}
    </div>;
};

export default AboutPage;
