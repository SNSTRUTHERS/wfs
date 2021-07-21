import cssIcon   from "./css.svg";
import dirIcon   from "./dir.svg";
import fileIcon  from "./file.svg";
import fontIcon  from "./font.svg";
import gdIcon    from "./gdrive.svg";
import gdocIcon  from "./gdoc.svg";
import htmlIcon  from "./html.svg";
import imageIcon from "./image.svg";
import jsIcon    from "./js.svg";
import jsonIcon  from "./json.svg";
import mdIcon    from "./md.svg";
import pdfIcon   from "./pdf.svg";
import pgpIcon   from "./pgp.svg";
import soundIcon from "./sound.svg";
import txtIcon   from "./txt.svg";
import videoIcon from "./video.svg";

const iconMap = Object.freeze({
    "application/font-woff": fontIcon,
    "application/font-woff2": fontIcon,
    "application/javascript": jsIcon,
    "application/json": jsonIcon,
    "application/pdf": pdfIcon,
    "application/pgp-encrypted": pgpIcon,
    "application/vnd.wfs.inode": dirIcon,
    "application/vnd.google-apps.folder": gdIcon,
    "application/vnd.google-apps.document": gdocIcon,
    "application/vnd.google-apps.presentation": gdocIcon,
    "application/vnd.google-apps.spreadsheet": gdocIcon,
    "application/vnd.ms-fontobject": fontIcon,
    "application/x-font-otf": fontIcon,
    "application/x-font-opentype": fontIcon,
    "application/x-font-tff": fontIcon,
    "application/x-font-truetype": fontIcon,
    "application/x-javascript": jsIcon,
    "audio/*": soundIcon,
    "image/*": imageIcon,
    "inode/directory": dirIcon,
    "text/css": cssIcon,
    "text/html": htmlIcon,
    "text/javascript": jsIcon,
    "text/json": jsonIcon,
    "text/markdown": mdIcon,
    "text/plain": txtIcon,
    "text/*": txtIcon,
    "video/*": videoIcon,
    "*/*": fileIcon
});

export default iconMap;
