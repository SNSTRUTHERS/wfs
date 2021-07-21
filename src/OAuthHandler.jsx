import { useEffect } from "react";
import { useHistory } from "react-router-dom";

/**
 * @namespace
 * @type {{ [s: string]: {
 *      client_id: string,
 *      endpoint: string,
 *      scope: string
 * }}}
 */
const OAUTH_VALUES = {
    gdrive: {
        client_id:
            "221071047095-fipddprr9eie4opei5lr273o8hrai6ku.apps." +
            "googleusercontent.com",
        endpoint:
            "https://accounts.google.com/o/oauth2/v2/auth",
        scope:
            "https://www.googleapis.com/auth/drive"
    }
};

const OAuthHandler = ({
    credentials,
    setCredentials,
    location
}) => {
    let {
        to = '',
        after = '',
        handler = 'gdrive'
    } = location.state ? location.state : {};

    const history = useHistory();
    
    // retrieve OAuth2 params if they exist
    const
        url = new URL(document.location),
        origin = url.origin,
        fragment = url.hash.substring(1),
        regexp = /([^&=]+)=([^&]*)/g,
        oauthParams = {}
    ;
    for (let m = regexp.exec(fragment); m; m = regexp.exec(fragment))
        oauthParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);

    useEffect(function () {
        if (token) {
            setCredentials({
                [handler]: oauthParams.access_token,
                ...credentials
            });
            (async () => history.replace(to, { after }))();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ setCredentials ]);

    // use local storage credentials just in case
    const token = oauthParams.access_token || credentials[handler];
    if (oauthParams.access_token) {
        const parts = JSON.parse(oauthParams.state);
        handler = parts.handler;
        after = parts.after;
        to = parts.to;
    }
    if (!token) {
        const items = {
            client_id: OAUTH_VALUES[handler].client_id,
            include_granted_scopes: 'true',
            redirect_uri: `${origin}/oauth`,
            response_type: 'token',
            scope: OAUTH_VALUES[handler].scope,
            state: JSON.stringify({ handler, after, to })
        };

        const form = document.createElement('form');
        form.setAttribute('method', 'GET');
        form.setAttribute('action', OAUTH_VALUES[handler].endpoint);
        for (const item in items) {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', item);
            input.setAttribute('value', items[item]);
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    }

    return null;
};

export default OAuthHandler;
