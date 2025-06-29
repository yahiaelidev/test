/*! @sentry/browser 6.3.5 (3f7be6d) | https://github.com/getsentry/sentry-javascript */
var Sentry = (function (exports) {
    /** Console logging verbosity for the SDK. */
    var LogLevel;
    (function (LogLevel) {
        /** No logs will be generated. */
        LogLevel[LogLevel["None"] = 0] = "None";
        /** Only SDK internal errors will be logged. */
        LogLevel[LogLevel["Error"] = 1] = "Error";
        /** Information useful for debugging the SDK will be logged. */
        LogLevel[LogLevel["Debug"] = 2] = "Debug";
        /** All SDK actions will be logged. */
        LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
    })(LogLevel || (LogLevel = {}));
  
    /**
     * Session Status
     */
    var SessionStatus;
    (function (SessionStatus) {
        /** JSDoc */
        SessionStatus["Ok"] = "ok";
        /** JSDoc */
        SessionStatus["Exited"] = "exited";
        /** JSDoc */
        SessionStatus["Crashed"] = "crashed";
        /** JSDoc */
        SessionStatus["Abnormal"] = "abnormal";
    })(SessionStatus || (SessionStatus = {}));
  
    /** JSDoc */
    (function (Severity) {
        /** JSDoc */
        Severity["Fatal"] = "fatal";
        /** JSDoc */
        Severity["Error"] = "error";
        /** JSDoc */
        Severity["Warning"] = "warning";
        /** JSDoc */
        Severity["Log"] = "log";
        /** JSDoc */
        Severity["Info"] = "info";
        /** JSDoc */
        Severity["Debug"] = "debug";
        /** JSDoc */
        Severity["Critical"] = "critical";
    })(exports.Severity || (exports.Severity = {}));
    // eslint-disable-next-line @typescript-eslint/no-namespace, import/export
    (function (Severity) {
        /**
         * Converts a string-based level into a {@link Severity}.
         *
         * @param level string representation of Severity
         * @returns Severity
         */
        function fromString(level) {
            switch (level) {
                case 'debug':
                    return Severity.Debug;
                case 'info':
                    return Severity.Info;
                case 'warn':
                case 'warning':
                    return Severity.Warning;
                case 'error':
                    return Severity.Error;
                case 'fatal':
                    return Severity.Fatal;
                case 'critical':
                    return Severity.Critical;
                case 'log':
                default:
                    return Severity.Log;
            }
        }
        Severity.fromString = fromString;
    })(exports.Severity || (exports.Severity = {}));
  
    /** The status of an event. */
    (function (Status) {
        /** The status could not be determined. */
        Status["Unknown"] = "unknown";
        /** The event was skipped due to configuration or callbacks. */
        Status["Skipped"] = "skipped";
        /** The event was sent to Sentry successfully. */
        Status["Success"] = "success";
        /** The client is currently rate limited and will try again later. */
        Status["RateLimit"] = "rate_limit";
        /** The event could not be processed. */
        Status["Invalid"] = "invalid";
        /** A server-side error ocurred during submission. */
        Status["Failed"] = "failed";
    })(exports.Status || (exports.Status = {}));
    // eslint-disable-next-line @typescript-eslint/no-namespace, import/export
    (function (Status) {
        /**
         * Converts a HTTP status code into a {@link Status}.
         *
         * @param code The HTTP response status code.
         * @returns The send status or {@link Status.Unknown}.
         */
        function fromHttpCode(code) {
            if (code >= 200 && code < 300) {
                return Status.Success;
            }
            if (code === 429) {
                return Status.RateLimit;
            }
            if (code >= 400 && code < 500) {
                return Status.Invalid;
            }
            if (code >= 500) {
                return Status.Failed;
            }
            return Status.Unknown;
        }
        Status.fromHttpCode = fromHttpCode;
    })(exports.Status || (exports.Status = {}));
  
    var TransactionSamplingMethod;
    (function (TransactionSamplingMethod) {
        TransactionSamplingMethod["Explicit"] = "explicitly_set";
        TransactionSamplingMethod["Sampler"] = "client_sampler";
        TransactionSamplingMethod["Rate"] = "client_rate";
        TransactionSamplingMethod["Inheritance"] = "inheritance";
    })(TransactionSamplingMethod || (TransactionSamplingMethod = {}));
  
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    /**
     * Checks whether given value's type is one of a few Error or Error-like
     * {@link isError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isError(wat) {
        switch (Object.prototype.toString.call(wat)) {
            case '[object Error]':
                return true;
            case '[object Exception]':
                return true;
            case '[object DOMException]':
                return true;
            default:
                return isInstanceOf(wat, Error);
        }
    }
    /**
     * Checks whether given value's type is ErrorEvent
     * {@link isErrorEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isErrorEvent(wat) {
        return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
    }
    /**
     * Checks whether given value's type is DOMError
     * {@link isDOMError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMError(wat) {
        return Object.prototype.toString.call(wat) === '[object DOMError]';
    }
    /**
     * Checks whether given value's type is DOMException
     * {@link isDOMException}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMException(wat) {
        return Object.prototype.toString.call(wat) === '[object DOMException]';
    }
    /**
     * Checks whether given value's type is a string
     * {@link isString}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isString(wat) {
        return Object.prototype.toString.call(wat) === '[object String]';
    }
    /**
     * Checks whether given value's is a primitive (undefined, null, number, boolean, string, bigint, symbol)
     * {@link isPrimitive}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPrimitive(wat) {
        return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
    }
    /**
     * Checks whether given value's type is an object literal
     * {@link isPlainObject}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPlainObject(wat) {
        return Object.prototype.toString.call(wat) === '[object Object]';
    }
    /**
     * Checks whether given value's type is an Event instance
     * {@link isEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isEvent(wat) {
        return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
    }
    /**
     * Checks whether given value's type is an Element instance
     * {@link isElement}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isElement(wat) {
        return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
    }
    /**
     * Checks whether given value's type is an regexp
     * {@link isRegExp}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isRegExp(wat) {
        return Object.prototype.toString.call(wat) === '[object RegExp]';
    }
    /**
     * Checks whether given value has a then function.
     * @param wat A value to be checked.
     */
    function isThenable(wat) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return Boolean(wat && wat.then && typeof wat.then === 'function');
    }
    /**
     * Checks whether given value's type is a SyntheticEvent
     * {@link isSyntheticEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isSyntheticEvent(wat) {
        return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
    }
    /**
     * Checks whether given value's type is an instance of provided constructor.
     * {@link isInstanceOf}.
     *
     * @param wat A value to be checked.
     * @param base A constructor to be used in a check.
     * @returns A boolean representing the result.
     */
    function isInstanceOf(wat, base) {
        try {
            return wat instanceof base;
        }
        catch (_e) {
            return false;
        }
    }
  
    /**
     * Given a child DOM element, returns a query-selector statement describing that
     * and its ancestors
     * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function htmlTreeAsString(elem) {
        // try/catch both:
        // - accessing event.target (see getsentry/raven-js#838, #768)
        // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
        // - can throw an exception in some circumstances.
        try {
            let currentElem = elem;
            const MAX_TRAVERSE_HEIGHT = 5;
            const MAX_OUTPUT_LEN = 80;
            const out = [];
            let height = 0;
            let len = 0;
            const separator = ' > ';
            const sepLength = separator.length;
            let nextStr;
            // eslint-disable-next-line no-plusplus
            while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
                nextStr = _htmlElementAsString(currentElem);
                // bail out if
                // - nextStr is the 'html' element
                // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
                //   (ignore this limit if we are on the first iteration)
                if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)) {
                    break;
                }
                out.push(nextStr);
                len += nextStr.length;
                currentElem = currentElem.parentNode;
            }
            return out.reverse().join(separator);
        }
        catch (_oO) {
            return '<unknown>';
        }
    }
    /**
     * Returns a simple, query-selector representation of a DOM element
     * e.g. [HTMLElement] => input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function _htmlElementAsString(el) {
        const elem = el;
        const out = [];
        let className;
        let classes;
        let key;
        let attr;
        let i;
        if (!elem || !elem.tagName) {
            return '';
        }
        out.push(elem.tagName.toLowerCase());
        if (elem.id) {
            out.push(`#${elem.id}`);
        }
        // eslint-disable-next-line prefer-const
        className = elem.className;
        if (className && isString(className)) {
            classes = className.split(/\s+/);
            for (i = 0; i < classes.length; i++) {
                out.push(`.${classes[i]}`);
            }
        }
        const allowedAttrs = ['type', 'name', 'title', 'alt'];
        for (i = 0; i < allowedAttrs.length; i++) {
            key = allowedAttrs[i];
            attr = elem.getAttribute(key);
            if (attr) {
                out.push(`[${key}="${attr}"]`);
            }
        }
        return out.join('');
    }
  
    const setPrototypeOf = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties);
    /**
     * setPrototypeOf polyfill using __proto__
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    function setProtoOf(obj, proto) {
        // @ts-ignore __proto__ does not exist on obj
        obj.__proto__ = proto;
        return obj;
    }
    /**
     * setPrototypeOf polyfill using mixin
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    function mixinProperties(obj, proto) {
        for (const prop in proto) {
            // eslint-disable-next-line no-prototype-builtins
            if (!obj.hasOwnProperty(prop)) {
                // @ts-ignore typescript complains about indexing so we remove
                obj[prop] = proto[prop];
            }
        }
        return obj;
    }
  
    /** An error emitted by Sentry SDKs and related utilities. */
    class SentryError extends Error {
        constructor(message) {
            super(message);
            this.message = message;
            this.name = new.target.prototype.constructor.name;
            setPrototypeOf(this, new.target.prototype);
        }
    }
  
    /** Regular expression used to parse a Dsn. */
    const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;
    /** Error message */
    const ERROR_MESSAGE = 'Invalid Dsn';
    /** The Sentry Dsn, identifying a Sentry instance and project. */
    class Dsn {
        /** Creates a new Dsn component */
        constructor(from) {
            if (typeof from === 'string') {
                this._fromString(from);
            }
            else {
                this._fromComponents(from);
            }
            this._validate();
        }
        /**
         * Renders the string representation of this Dsn.
         *
         * By default, this will render the public representation without the password
         * component. To get the deprecated private representation, set `withPassword`
         * to true.
         *
         * @param withPassword When set to true, the password will be included.
         */
        toString(withPassword = false) {
            const { host, path, pass, port, projectId, protocol, publicKey } = this;
            return (`${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` +
                `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`);
        }
        /** Parses a string into this Dsn. */
        _fromString(str) {
            const match = DSN_REGEX.exec(str);
            if (!match) {
                throw new SentryError(ERROR_MESSAGE);
            }
            const [protocol, publicKey, pass = '', host, port = '', lastPath] = match.slice(1);
            let path = '';
            let projectId = lastPath;
            const split = projectId.split('/');
            if (split.length > 1) {
                path = split.slice(0, -1).join('/');
                projectId = split.pop();
            }
            if (projectId) {
                const projectMatch = projectId.match(/^\d+/);
                if (projectMatch) {
                    projectId = projectMatch[0];
                }
            }
            this._fromComponents({ host, pass, path, projectId, port, protocol: protocol, publicKey });
        }
        /** Maps Dsn components into this instance. */
        _fromComponents(components) {
            // TODO this is for backwards compatibility, and can be removed in a future version
            if ('user' in components && !('publicKey' in components)) {
                components.publicKey = components.user;
            }
            this.user = components.publicKey || '';
            this.protocol = components.protocol;
            this.publicKey = components.publicKey || '';
            this.pass = components.pass || '';
            this.host = components.host;
            this.port = components.port || '';
            this.path = components.path || '';
            this.projectId = components.projectId;
        }
        /** Validates this Dsn and throws on error. */
        _validate() {
            ['protocol', 'publicKey', 'host', 'projectId'].forEach(component => {
                if (!this[component]) {
                    throw new SentryError(`${ERROR_MESSAGE}: ${component} missing`);
                }
            });
            if (!this.projectId.match(/^\d+$/)) {
                throw new SentryError(`${ERROR_MESSAGE}: Invalid projectId ${this.projectId}`);
            }
            if (this.protocol !== 'http' && this.protocol !== 'https') {
                throw new SentryError(`${ERROR_MESSAGE}: Invalid protocol ${this.protocol}`);
            }
            if (this.port && isNaN(parseInt(this.port, 10))) {
                throw new SentryError(`${ERROR_MESSAGE}: Invalid port ${this.port}`);
            }
        }
    }
  
    /**
     * Checks whether we're in the Node.js or Browser environment
     *
     * @returns Answer to given question
     */
    function isNodeEnv() {
        return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
    }
    /**
     * Requires a module which is protected against bundler minification.
     *
     * @param request The module path to resolve
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    function dynamicRequire(mod, request) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return mod.require(request);
    }
  
    /**
     * Truncates given string to the maximum characters count
     *
     * @param str An object that contains serializable values
     * @param max Maximum number of characters in truncated string (0 = unlimited)
     * @returns string Encoded
     */
    function truncate(str, max = 0) {
        if (typeof str !== 'string' || max === 0) {
            return str;
        }
        return str.length <= max ? str : `${str.substr(0, max)}...`;
    }
    /**
     * Join values in array
     * @param input array of values to be joined together
     * @param delimiter string to be placed in-between values
     * @returns Joined values
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function safeJoin(input, delimiter) {
        if (!Array.isArray(input)) {
            return '';
        }
        const output = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < input.length; i++) {
            const value = input[i];
            try {
                output.push(String(value));
            }
            catch (e) {
                output.push('[value cannot be serialized]');
            }
        }
        return output.join(delimiter);
    }
    /**
     * Checks if the value matches a regex or includes the string
     * @param value The string value to be checked against
     * @param pattern Either a regex or a string that must be contained in value
     */
    function isMatchingPattern(value, pattern) {
        if (!isString(value)) {
            return false;
        }
        if (isRegExp(pattern)) {
            return pattern.test(value);
        }
        if (typeof pattern === 'string') {
            return value.indexOf(pattern) !== -1;
        }
        return false;
    }
  
    const fallbackGlobalObject = {};
    /**
     * Safely get global scope object
     *
     * @returns Global scope object
     */
    function getGlobalObject() {
        return (isNodeEnv()
            ? global
            : typeof window !== 'undefined'
                ? window
                : typeof self !== 'undefined'
                    ? self
                    : fallbackGlobalObject);
    }
    /**
     * UUID4 generator
     *
     * @returns string Generated UUID4.
     */
    function uuid4() {
        const global = getGlobalObject();
        const crypto = global.crypto || global.msCrypto;
        if (!(crypto === void 0) && crypto.getRandomValues) {
            // Use window.crypto API if available
            const arr = new Uint16Array(8);
            crypto.getRandomValues(arr);
            // set 4 in byte 7
            // eslint-disable-next-line no-bitwise
            arr[3] = (arr[3] & 0xfff) | 0x4000;
            // set 2 most significant bits of byte 9 to '10'
            // eslint-disable-next-line no-bitwise
            arr[4] = (arr[4] & 0x3fff) | 0x8000;
            const pad = (num) => {
                let v = num.toString(16);
                while (v.length < 4) {
                    v = `0${v}`;
                }
                return v;
            };
            return (pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]));
        }
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
            // eslint-disable-next-line no-bitwise
            const r = (Math.random() * 16) | 0;
            // eslint-disable-next-line no-bitwise
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    /**
     * Parses string form of URL into an object
     * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
     * // intentionally using regex and not <a/> href parsing trick because React Native and other
     * // environments where DOM might not be available
     * @returns parsed URL object
     */
    function parseUrl(url) {
        if (!url) {
            return {};
        }
        const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
        if (!match) {
            return {};
        }
        // coerce to undefined values to empty string so we don't get 'undefined'
        const query = match[6] || '';
        const fragment = match[8] || '';
        return {
            host: match[4],
            path: match[5],
            protocol: match[2],
            relative: match[5] + query + fragment,
        };
    }
    /**
     * Extracts either message or type+value from an event that can be used for user-facing logs
     * @returns event's description
     */
    function getEventDescription(event) {
        if (event.message) {
            return event.message;
        }
        if (event.exception && event.exception.values && event.exception.values[0]) {
            const exception = event.exception.values[0];
            if (exception.type && exception.value) {
                return `${exception.type}: ${exception.value}`;
            }
            return exception.type || exception.value || event.event_id || '<unknown>';
        }
        return event.event_id || '<unknown>';
    }
    /** JSDoc */
    function consoleSandbox(callback) {
        const global = getGlobalObject();
        const levels = ['debug', 'info', 'warn', 'error', 'log', 'assert'];
        if (!('console' in global)) {
            return callback();
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const originalConsole = global.console;
        const wrappedLevels = {};
        // Restore all wrapped console methods
        levels.forEach(level => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (level in global.console && originalConsole[level].__sentry_original__) {
                wrappedLevels[level] = originalConsole[level];
                originalConsole[level] = originalConsole[level].__sentry_original__;
            }
        });
        // Perform callback manipulations
        const result = callback();
        // Revert restoration to wrapped state
        Object.keys(wrappedLevels).forEach(level => {
            originalConsole[level] = wrappedLevels[level];
        });
        return result;
    }
    /**
     * Adds exception values, type and value to an synthetic Exception.
     * @param event The event to modify.
     * @param value Value of the exception.
     * @param type Type of the exception.
     * @hidden
     */
    function addExceptionTypeValue(event, value, type) {
        event.exception = event.exception || {};
        event.exception.values = event.exception.values || [];
        event.exception.values[0] = event.exception.values[0] || {};
        event.exception.values[0].value = event.exception.values[0].value || value || '';
        event.exception.values[0].type = event.exception.values[0].type || type || 'Error';
    }
    /**
     * Adds exception mechanism to a given event.
     * @param event The event to modify.
     * @param mechanism Mechanism of the mechanism.
     * @hidden
     */
    function addExceptionMechanism(event, mechanism = {}) {
        // TODO: Use real type with `keyof Mechanism` thingy and maybe make it better?
        try {
            // @ts-ignore Type 'Mechanism | {}' is not assignable to type 'Mechanism | undefined'
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            event.exception.values[0].mechanism = event.exception.values[0].mechanism || {};
            Object.keys(mechanism).forEach(key => {
                // @ts-ignore Mechanism has no index signature
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                event.exception.values[0].mechanism[key] = mechanism[key];
            });
        }
        catch (_oO) {
            // no-empty
        }
    }
    /**
     * A safe form of location.href
     */
    function getLocationHref() {
        try {
            return document.location.href;
        }
        catch (oO) {
            return '';
        }
    }
    const defaultRetryAfter = 60 * 1000; // 60 seconds
    /**
     * Extracts Retry-After value from the request header or returns default value
     * @param now current unix timestamp
     * @param header string representation of 'Retry-After' header
     */
    function parseRetryAfterHeader(now, header) {
        if (!header) {
            return defaultRetryAfter;
        }
        const headerDelay = parseInt(`${header}`, 10);
        if (!isNaN(headerDelay)) {
            return headerDelay * 1000;
        }
        const headerDate = Date.parse(`${header}`);
        if (!isNaN(headerDate)) {
            return headerDate - now;
        }
        return defaultRetryAfter;
    }
  
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // TODO: Implement different loggers for different environments
    const global$1 = getGlobalObject();
    /** Prefix for logging strings */
    const PREFIX = 'Sentry Logger ';
    /** JSDoc */
    class Logger {
        /** JSDoc */
        constructor() {
            this._enabled = false;
        }
        /** JSDoc */
        disable() {
            this._enabled = false;
        }
        /** JSDoc */
        enable() {
            this._enabled = true;
        }
        /** JSDoc */
        log(...args) {
            if (!this._enabled) {
                return;
            }
            consoleSandbox(() => {
                global$1.console.log(`${PREFIX}[Log]: ${args.join(' ')}`);
            });
        }
        /** JSDoc */
        warn(...args) {
            if (!this._enabled) {
                return;
            }
            consoleSandbox(() => {
                global$1.console.warn(`${PREFIX}[Warn]: ${args.join(' ')}`);
            });
        }
        /** JSDoc */
        error(...args) {
            if (!this._enabled) {
                return;
            }
            consoleSandbox(() => {
                global$1.console.error(`${PREFIX}[Error]: ${args.join(' ')}`);
            });
        }
    }
    // Ensure we only have a single logger instance, even if multiple versions of @sentry/utils are being used
    global$1.__SENTRY__ = global$1.__SENTRY__ || {};
    const logger = global$1.__SENTRY__.logger || (global$1.__SENTRY__.logger = new Logger());
  
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    /**
     * Memo class used for decycle json objects. Uses WeakSet if available otherwise array.
     */
    class Memo {
        constructor() {
            this._hasWeakSet = typeof WeakSet === 'function';
            this._inner = this._hasWeakSet ? new WeakSet() : [];
        }
        /**
         * Sets obj to remember.
         * @param obj Object to remember
         */
        memoize(obj) {
            if (this._hasWeakSet) {
                if (this._inner.has(obj)) {
                    return true;
                }
                this._inner.add(obj);
                return false;
            }
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this._inner.length; i++) {
                const value = this._inner[i];
                if (value === obj) {
                    return true;
                }
            }
            this._inner.push(obj);
            return false;
        }
        /**
         * Removes object from internal storage.
         * @param obj Object to forget
         */
        unmemoize(obj) {
            if (this._hasWeakSet) {
                this._inner.delete(obj);
            }
            else {
                for (let i = 0; i < this._inner.length; i++) {
                    if (this._inner[i] === obj) {
                        this._inner.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
  
    const defaultFunctionName = '<anonymous>';
    /**
     * Safely extract function name from itself
     */
    function getFunctionName(fn) {
        try {
            if (!fn || typeof fn !== 'function') {
                return defaultFunctionName;
            }
            return fn.name || defaultFunctionName;
        }
        catch (e) {
            // Just accessing custom props in some Selenium environments
            // can cause a "Permission denied" exception (see raven-js#495).
            return defaultFunctionName;
        }
    }
  
    /**
     * Wrap a given object method with a higher-order function
     *
     * @param source An object that contains a method to be wrapped.
     * @param name A name of method to be wrapped.
     * @param replacementFactory A function that should be used to wrap a given method, returning the wrapped method which
     * will be substituted in for `source[name]`.
     * @returns void
     */
    function fill(source, name, replacementFactory) {
        if (!(name in source)) {
            return;
        }
        const original = source[name];
        const wrapped = replacementFactory(original);
        // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
        // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
        if (typeof wrapped === 'function') {
            try {
                wrapped.prototype = wrapped.prototype || {};
                Object.defineProperties(wrapped, {
                    __sentry_original__: {
                        enumerable: false,
                        value: original,
                    },
                });
            }
            catch (_Oo) {
                // This can throw if multiple fill happens on a global object like XMLHttpRequest
                // Fixes https://github.com/getsentry/sentry-javascript/issues/2043
            }
        }
        source[name] = wrapped;
    }
    /**
     * Encodes given object into url-friendly format
     *
     * @param object An object that contains serializable values
     * @returns string Encoded
     */
    function urlEncode(object) {
        return Object.keys(object)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`)
            .join('&');
    }
    /**
     * Transforms any object into an object literal with all its attributes
     * attached to it.
     *
     * @param value Initial source that we have to transform in order for it to be usable by the serializer
     */
    function getWalkSource(value) {
        if (isError(value)) {
            const error = value;
            const err = {
                message: error.message,
                name: error.name,
                stack: error.stack,
            };
            for (const i in error) {
                if (Object.prototype.hasOwnProperty.call(error, i)) {
                    err[i] = error[i];
                }
            }
            return err;
        }
        if (isEvent(value)) {
            const event = value;
            const source = {};
            source.type = event.type;
            // Accessing event.target can throw (see getsentry/raven-js#838, #768)
            try {
                source.target = isElement(event.target)
                    ? htmlTreeAsString(event.target)
                    : Object.prototype.toString.call(event.target);
            }
            catch (_oO) {
                source.target = '<unknown>';
            }
            try {
                source.currentTarget = isElement(event.currentTarget)
                    ? htmlTreeAsString(event.currentTarget)
                    : Object.prototype.toString.call(event.currentTarget);
            }
            catch (_oO) {
                source.currentTarget = '<unknown>';
            }
            if (typeof CustomEvent !== 'undefined' && isInstanceOf(value, CustomEvent)) {
                source.detail = event.detail;
            }
            for (const i in event) {
                if (Object.prototype.hasOwnProperty.call(event, i)) {
                    source[i] = event;
                }
            }
            return source;
        }
        return value;
    }
    /** Calculates bytes size of input string */
    function utf8Length(value) {
        // eslint-disable-next-line no-bitwise
        return ~-encodeURI(value).split(/%..|./).length;
    }
    /** Calculates bytes size of input object */
    function jsonSize(value) {
        return utf8Length(JSON.stringify(value));
    }
    /** JSDoc */
    function normalizeToSize(object, 
    // Default Node.js REPL depth
    depth = 3, 
    // 100kB, as 200kB is max payload size, so half sounds reasonable
    maxSize = 100 * 1024) {
        const serialized = normalize(object, depth);
        if (jsonSize(serialized) > maxSize) {
            return normalizeToSize(object, depth - 1, maxSize);
        }
        return serialized;
    }
    /**
     * Transform any non-primitive, BigInt, or Symbol-type value into a string. Acts as a no-op on strings, numbers,
     * booleans, null, and undefined.
     *
     * @param value The value to stringify
     * @returns For non-primitive, BigInt, and Symbol-type values, a string denoting the value's type, type and value, or
     *  type and `description` property, respectively. For non-BigInt, non-Symbol primitives, returns the original value,
     *  unchanged.
     */
    function serializeValue(value) {
        const type = Object.prototype.toString.call(value);
        // Node.js REPL notation
        if (typeof value === 'string') {
            return value;
        }
        if (type === '[object Object]') {
            return '[Object]';
        }
        if (type === '[object Array]') {
            return '[Array]';
        }
        const normalized = normalizeValue(value);
        return isPrimitive(normalized) ? normalized : type;
    }
    /**
     * normalizeValue()
     *
     * Takes unserializable input and make it serializable friendly
     *
     * - translates undefined/NaN values to "[undefined]"/"[NaN]" respectively,
     * - serializes Error objects
     * - filter global objects
     */
    function normalizeValue(value, key) {
        if (key === 'domain' && value && typeof value === 'object' && value._events) {
            return '[Domain]';
        }
        if (key === 'domainEmitter') {
            return '[DomainEmitter]';
        }
        if (typeof global !== 'undefined' && value === global) {
            return '[Global]';
        }
        if (typeof window !== 'undefined' && value === window) {
            return '[Window]';
        }
        if (typeof document !== 'undefined' && value === document) {
            return '[Document]';
        }
        // React's SyntheticEvent thingy
        if (isSyntheticEvent(value)) {
            return '[SyntheticEvent]';
        }
        if (typeof value === 'number' && value !== value) {
            return '[NaN]';
        }
        if (value === void 0) {
            return '[undefined]';
        }
        if (typeof value === 'function') {
            return `[Function: ${getFunctionName(value)}]`;
        }
        // symbols and bigints are considered primitives by TS, but aren't natively JSON-serilaizable
        if (typeof value === 'symbol') {
            return `[${String(value)}]`;
        }
        if (typeof value === 'bigint') {
            return `[BigInt: ${String(value)}]`;
        }
        return value;
    }
    /**
     * Walks an object to perform a normalization on it
     *
     * @param key of object that's walked in current iteration
     * @param value object to be walked
     * @param depth Optional number indicating how deep should walking be performed
     * @param memo Optional Memo class handling decycling
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function walk(key, value, depth = +Infinity, memo = new Memo()) {
        // If we reach the maximum depth, serialize whatever has left
        if (depth === 0) {
            return serializeValue(value);
        }
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        // If value implements `toJSON` method, call it and return early
        if (value !== null && value !== undefined && typeof value.toJSON === 'function') {
            return value.toJSON();
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        // If normalized value is a primitive, there are no branches left to walk, so we can just bail out, as theres no point in going down that branch any further
        const normalized = normalizeValue(value, key);
        if (isPrimitive(normalized)) {
            return normalized;
        }
        // Create source that we will use for next itterations, either objectified error object (Error type with extracted keys:value pairs) or the input itself
        const source = getWalkSource(value);
        // Create an accumulator that will act as a parent for all future itterations of that branch
        const acc = Array.isArray(value) ? [] : {};
        // If we already walked that branch, bail out, as it's circular reference
        if (memo.memoize(value)) {
            return '[Circular ~]';
        }
        // Walk all keys of the source
        for (const innerKey in source) {
            // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
            if (!Object.prototype.hasOwnProperty.call(source, innerKey)) {
                continue;
            }
            // Recursively walk through all the child nodes
            acc[innerKey] = walk(innerKey, source[innerKey], depth - 1, memo);
        }
        // Once walked through all the branches, remove the parent from memo storage
        memo.unmemoize(value);
        // Return accumulated values
        return acc;
    }
    /**
     * normalize()
     *
     * - Creates a copy to prevent original input mutation
     * - Skip non-enumerablers
     * - Calls `toJSON` if implemented
     * - Removes circular references
     * - Translates non-serializeable values (undefined/NaN/Functions) to serializable format
     * - Translates known global objects/Classes to a string representations
     * - Takes care of Error objects serialization
     * - Optionally limit depth of final output
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function normalize(input, depth) {
        try {
            return JSON.parse(JSON.stringify(input, (key, value) => walk(key, value, depth)));
        }
        catch (_oO) {
            return '**non-serializable**';
        }
    }
    /**
     * Given any captured exception, extract its keys and create a sorted
     * and truncated list that will be used inside the event message.
     * eg. `Non-error exception captured with keys: foo, bar, baz`
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function extractExceptionKeysForMessage(exception, maxLength = 40) {
        const keys = Object.keys(getWalkSource(exception));
        keys.sort();
        if (!keys.length) {
            return '[object has no keys]';
        }
        if (keys[0].length >= maxLength) {
            return truncate(keys[0], maxLength);
        }
        for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
            const serialized = keys.slice(0, includedKeys).join(', ');
            if (serialized.length > maxLength) {
                continue;
            }
            if (includedKeys === keys.length) {
                return serialized;
            }
            return truncate(serialized, maxLength);
        }
        return '';
    }
    /**
     * Given any object, return the new object with removed keys that value was `undefined`.
     * Works recursively on objects and arrays.
     */
    function dropUndefinedKeys(val) {
        if (isPlainObject(val)) {
            const obj = val;
            const rv = {};
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] !== 'undefined') {
                    rv[key] = dropUndefinedKeys(obj[key]);
                }
            }
            return rv;
        }
        if (Array.isArray(val)) {
            return val.map(dropUndefinedKeys);
        }
        return val;
    }
  
    /**
     * Tells whether current environment supports Fetch API
     * {@link supportsFetch}.
     *
     * @returns Answer to the given question.
     */
    function supportsFetch() {
        if (!('fetch' in getGlobalObject())) {
            return false;
        }
        try {
            new Headers();
            new Request('');
            new Response();
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * isNativeFetch checks if the given function is a native implementation of fetch()
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    function isNativeFetch(func) {
        return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
    }
    /**
     * Tells whether current environment supports Fetch API natively
     * {@link supportsNativeFetch}.
     *
     * @returns true if `window.fetch` is natively implemented, false otherwise
     */
    function supportsNativeFetch() {
        if (!supportsFetch()) {
            return false;
        }
        const global = getGlobalObject();
        // Fast path to avoid DOM I/O
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (isNativeFetch(global.fetch)) {
            return true;
        }
        // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
        // so create a "pure" iframe to see if that has native fetch
        let result = false;
        const doc = global.document;
        // eslint-disable-next-line deprecation/deprecation
        if (doc && typeof doc.createElement === `function`) {
            try {
                const sandbox = doc.createElement('iframe');
                sandbox.hidden = true;
                doc.head.appendChild(sandbox);
                if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    result = isNativeFetch(sandbox.contentWindow.fetch);
                }
                doc.head.removeChild(sandbox);
            }
            catch (err) {
                logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
            }
        }
        return result;
    }
    /**
     * Tells whether current environment supports Referrer Policy API
     * {@link supportsReferrerPolicy}.
     *
     * @returns Answer to the given question.
     */
    function supportsReferrerPolicy() {
        // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
        // https://caniuse.com/#feat=referrer-policy
        // It doesn't. And it throw exception instead of ignoring this parameter...
        // REF: https://github.com/getsentry/raven-js/issues/1233
        if (!supportsFetch()) {
            return false;
        }
        try {
            new Request('_', {
                referrerPolicy: 'origin',
            });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Tells whether current environment supports History API
     * {@link supportsHistory}.
     *
     * @returns Answer to the given question.
     */
    function supportsHistory() {
        // NOTE: in Chrome App environment, touching history.pushState, *even inside
        //       a try/catch block*, will cause Chrome to output an error to console.error
        // borrowed from: https://github.com/angular/angular.js/pull/13945/files
        const global = getGlobalObject();
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chrome = global.chrome;
        const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        const hasHistoryApi = 'history' in global && !!global.history.pushState && !!global.history.replaceState;
        return !isChromePackagedApp && hasHistoryApi;
    }
  
    const global$2 = getGlobalObject();
    /**
     * Instrument native APIs to call handlers that can be used to create breadcrumbs, APM spans etc.
     *  - Console API
     *  - Fetch API
     *  - XHR API
     *  - History API
     *  - DOM API (click/typing)
     *  - Error API
     *  - UnhandledRejection API
     */
    const handlers = {};
    const instrumented = {};
    /** Instruments given API */
    function instrument(type) {
        if (instrumented[type]) {
            return;
        }
        instrumented[type] = true;
        switch (type) {
            case 'console':
                instrumentConsole();
                break;
            case 'dom':
                instrumentDOM();
                break;
            case 'xhr':
                instrumentXHR();
                break;
            case 'fetch':
                instrumentFetch();
                break;
            case 'history':
                instrumentHistory();
                break;
            case 'error':
                instrumentError();
                break;
            case 'unhandledrejection':
                instrumentUnhandledRejection();
                break;
            default:
                logger.warn('unknown instrumentation type:', type);
        }
    }
    /**
     * Add handler that will be called when given type of instrumentation triggers.
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addInstrumentationHandler(handler) {
        if (!handler || typeof handler.type !== 'string' || typeof handler.callback !== 'function') {
            return;
        }
        handlers[handler.type] = handlers[handler.type] || [];
        handlers[handler.type].push(handler.callback);
        instrument(handler.type);
    }
    /** JSDoc */
    function triggerHandlers(type, data) {
        if (!type || !handlers[type]) {
            return;
        }
        for (const handler of handlers[type] || []) {
            try {
                handler(data);
            }
            catch (e) {
                logger.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError: ${e}`);
            }
        }
    }
    /** JSDoc */
    function instrumentConsole() {
        if (!('console' in global$2)) {
            return;
        }
        ['debug', 'info', 'warn', 'error', 'log', 'assert'].forEach(function (level) {
            if (!(level in global$2.console)) {
                return;
            }
            fill(global$2.console, level, function (originalConsoleLevel) {
                return function (...args) {
                    triggerHandlers('console', { args, level });
                    // this fails for some browsers. :(
                    if (originalConsoleLevel) {
                        Function.prototype.apply.call(originalConsoleLevel, global$2.console, args);
                    }
                };
            });
        });
    }
    /** JSDoc */
    function instrumentFetch() {
        if (!supportsNativeFetch()) {
            return;
        }
        fill(global$2, 'fetch', function (originalFetch) {
            return function (...args) {
                const handlerData = {
                    args,
                    fetchData: {
                        method: getFetchMethod(args),
                        url: getFetchUrl(args),
                    },
                    startTimestamp: Date.now(),
                };
                triggerHandlers('fetch', Object.assign({}, handlerData));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return originalFetch.apply(global$2, args).then((response) => {
                    triggerHandlers('fetch', Object.assign(Object.assign({}, handlerData), { endTimestamp: Date.now(), response }));
                    return response;
                }, (error) => {
                    triggerHandlers('fetch', Object.assign(Object.assign({}, handlerData), { endTimestamp: Date.now(), error }));
                    // NOTE: If you are a Sentry user, and you are seeing this stack frame,
                    //       it means the sentry.javascript SDK caught an error invoking your application code.
                    //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
                    throw error;
                });
            };
        });
    }
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /** Extract `method` from fetch call arguments */
    function getFetchMethod(fetchArgs = []) {
        if ('Request' in global$2 && isInstanceOf(fetchArgs[0], Request) && fetchArgs[0].method) {
            return String(fetchArgs[0].method).toUpperCase();
        }
        if (fetchArgs[1] && fetchArgs[1].method) {
            return String(fetchArgs[1].method).toUpperCase();
        }
        return 'GET';
    }
    /** Extract `url` from fetch call arguments */
    function getFetchUrl(fetchArgs = []) {
        if (typeof fetchArgs[0] === 'string') {
            return fetchArgs[0];
        }
        if ('Request' in global$2 && isInstanceOf(fetchArgs[0], Request)) {
            return fetchArgs[0].url;
        }
        return String(fetchArgs[0]);
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    /** JSDoc */
    function instrumentXHR() {
        if (!('XMLHttpRequest' in global$2)) {
            return;
        }
        // Poor man's implementation of ES6 `Map`, tracking and keeping in sync key and value separately.
        const requestKeys = [];
        const requestValues = [];
        const xhrproto = XMLHttpRequest.prototype;
        fill(xhrproto, 'open', function (originalOpen) {
            return function (...args) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const xhr = this;
                const url = args[1];
                xhr.__sentry_xhr__ = {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    method: isString(args[0]) ? args[0].toUpperCase() : args[0],
                    url: args[1],
                };
                // if Sentry key appears in URL, don't capture it as a request
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (isString(url) && xhr.__sentry_xhr__.method === 'POST' && url.match(/sentry_key/)) {
                    xhr.__sentry_own_request__ = true;
                }
                const onreadystatechangeHandler = function () {
                    if (xhr.readyState === 4) {
                        try {
                            // touching statusCode in some platforms throws
                            // an exception
                            if (xhr.__sentry_xhr__) {
                                xhr.__sentry_xhr__.status_code = xhr.status;
                            }
                        }
                        catch (e) {
                            /* do nothing */
                        }
                        try {
                            const requestPos = requestKeys.indexOf(xhr);
                            if (requestPos !== -1) {
                                // Make sure to pop both key and value to keep it in sync.
                                requestKeys.splice(requestPos);
                                const args = requestValues.splice(requestPos)[0];
                                if (xhr.__sentry_xhr__ && args[0] !== undefined) {
                                    xhr.__sentry_xhr__.body = args[0];
                                }
                            }
                        }
                        catch (e) {
                            /* do nothing */
                        }
                        triggerHandlers('xhr', {
                            args,
                            endTimestamp: Date.now(),
                            startTimestamp: Date.now(),
                            xhr,
                        });
                    }
                };
                if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                    fill(xhr, 'onreadystatechange', function (original) {
                        return function (...readyStateArgs) {
                            onreadystatechangeHandler();
                            return original.apply(xhr, readyStateArgs);
                        };
                    });
                }
                else {
                    xhr.addEventListener('readystatechange', onreadystatechangeHandler);
                }
                return originalOpen.apply(xhr, args);
            };
        });
        fill(xhrproto, 'send', function (originalSend) {
            return function (...args) {
                requestKeys.push(this);
                requestValues.push(args);
                triggerHandlers('xhr', {
                    args,
                    startTimestamp: Date.now(),
                    xhr: this,
                });
                return originalSend.apply(this, args);
            };
        });
    }
    let lastHref;
    /** JSDoc */
    function instrumentHistory() {
        if (!supportsHistory()) {
            return;
        }
        const oldOnPopState = global$2.onpopstate;
        global$2.onpopstate = function (...args) {
            const to = global$2.location.href;
            // keep track of the current URL state, as we always receive only the updated state
            const from = lastHref;
            lastHref = to;
            triggerHandlers('history', {
                from,
                to,
            });
            if (oldOnPopState) {
                // Apparently this can throw in Firefox when incorrectly implemented plugin is installed.
                // https://github.com/getsentry/sentry-javascript/issues/3344
                // https://github.com/bugsnag/bugsnag-js/issues/469
                try {
                    return oldOnPopState.apply(this, args);
                }
                catch (_oO) {
                    // no-empty
                }
            }
        };
        /** @hidden */
        function historyReplacementFunction(originalHistoryFunction) {
            return function (...args) {
                const url = args.length > 2 ? args[2] : undefined;
                if (url) {
                    // coerce to string (this is what pushState does)
                    const from = lastHref;
                    const to = String(url);
                    // keep track of the current URL state, as we always receive only the updated state
                    lastHref = to;
                    triggerHandlers('history', {
                        from,
                        to,
                    });
                }
                return originalHistoryFunction.apply(this, args);
            };
        }
        fill(global$2.history, 'pushState', historyReplacementFunction);
        fill(global$2.history, 'replaceState', historyReplacementFunction);
    }
    const debounceDuration = 1000;
    let debounceTimerID;
    let lastCapturedEvent;
    /**
     * Decide whether the current event should finish the debounce of previously captured one.
     * @param previous previously captured event
     * @param current event to be captured
     */
    function shouldShortcircuitPreviousDebounce(previous, current) {
        // If there was no previous event, it should always be swapped for the new one.
        if (!previous) {
            return true;
        }
        // If both events have different type, then user definitely performed two separate actions. e.g. click + keypress.
        if (previous.type !== current.type) {
            return true;
        }
        try {
            // If both events have the same type, it's still possible that actions were performed on different targets.
            // e.g. 2 clicks on different buttons.
            if (previous.target !== current.target) {
                return true;
            }
        }
        catch (e) {
            // just accessing `target` property can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/sentry-javascript/issues/838
        }
        // If both events have the same type _and_ same `target` (an element which triggered an event, _not necessarily_
        // to which an event listener was attached), we treat them as the same action, as we want to capture
        // only one breadcrumb. e.g. multiple clicks on the same button, or typing inside a user input box.
        return false;
    }
    /**
     * Decide whether an event should be captured.
     * @param event event to be captured
     */
    function shouldSkipDOMEvent(event) {
        // We are only interested in filtering `keypress` events for now.
        if (event.type !== 'keypress') {
            return false;
        }
        try {
            const target = event.target;
            if (!target || !target.tagName) {
                return true;
            }
            // Only consider keypress events on actual input elements. This will disregard keypresses targeting body
            // e.g.tabbing through elements, hotkeys, etc.
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return false;
            }
        }
        catch (e) {
            // just accessing `target` property can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/sentry-javascript/issues/838
        }
        return true;
    }
    /**
     * Wraps addEventListener to capture UI breadcrumbs
     * @param handler function that will be triggered
     * @param globalListener indicates whether event was captured by the global event listener
     * @returns wrapped breadcrumb events handler
     * @hidden
     */
    function makeDOMEventHandler(handler, globalListener = false) {
        return (event) => {
            // It's possible this handler might trigger multiple times for the same
            // event (e.g. event propagation through node ancestors).
            // Ignore if we've already captured that event.
            if (!event || lastCapturedEvent === event) {
                return;
            }
            // We always want to skip _some_ events.
            if (shouldSkipDOMEvent(event)) {
                return;
            }
            const name = event.type === 'keypress' ? 'input' : event.type;
            // If there is no debounce timer, it means that we can safely capture the new event and store it for future comparisons.
            if (debounceTimerID === undefined) {
                handler({
                    event: event,
                    name,
                    global: globalListener,
                });
                lastCapturedEvent = event;
            }
            // If there is a debounce awaiting, see if the new event is different enough to treat it as a unique one.
            // If that's the case, emit the previous event and store locally the newly-captured DOM event.
            else if (shouldShortcircuitPreviousDebounce(lastCapturedEvent, event)) {
                handler({
                    event: event,
                    name,
                    global: globalListener,
                });
                lastCapturedEvent = event;
            }
            // Start a new debounce timer that will prevent us from capturing multiple events that should be grouped together.
            clearTimeout(debounceTimerID);
            debounceTimerID = global$2.setTimeout(() => {
                debounceTimerID = undefined;
            }, debounceDuration);
        };
    }
    /** JSDoc */
    function instrumentDOM() {
        if (!('document' in global$2)) {
            return;
        }
        // Make it so that any click or keypress that is unhandled / bubbled up all the way to the document triggers our dom
        // handlers. (Normally we have only one, which captures a breadcrumb for each click or keypress.) Do this before
        // we instrument `addEventListener` so that we don't end up attaching this handler twice.
        const triggerDOMHandler = triggerHandlers.bind(null, 'dom');
        const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
        global$2.document.addEventListener('click', globalDOMEventHandler, false);
        global$2.document.addEventListener('keypress', globalDOMEventHandler, false);
        // After hooking into click and keypress events bubbled up to `document`, we also hook into user-handled
        // clicks & keypresses, by adding an event listener of our own to any element to which they add a listener. That
        // way, whenever one of their handlers is triggered, ours will be, too. (This is needed because their handler
        // could potentially prevent the event from bubbling up to our global listeners. This way, our handler are still
        // guaranteed to fire at least once.)
        ['EventTarget', 'Node'].forEach((target) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const proto = global$2[target] && global$2[target].prototype;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
            if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
                return;
            }
            fill(proto, 'addEventListener', function (originalAddEventListener) {
                return function (type, listener, options) {
                    if (type === 'click' || type == 'keypress') {
                        try {
                            const el = this;
                            const handlers = (el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {});
                            const handlerForType = (handlers[type] = handlers[type] || { refCount: 0 });
                            if (!handlerForType.handler) {
                                const handler = makeDOMEventHandler(triggerDOMHandler);
                                handlerForType.handler = handler;
                                originalAddEventListener.call(this, type, handler, options);
                            }
                            handlerForType.refCount += 1;
                        }
                        catch (e) {
                            // Accessing dom properties is always fragile.
                            // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
                        }
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                };
            });
            fill(proto, 'removeEventListener', function (originalRemoveEventListener) {
                return function (type, listener, options) {
                    if (type === 'click' || type == 'keypress') {
                        try {
                            const el = this;
                            const handlers = el.__sentry_instrumentation_handlers__ || {};
                            const handlerForType = handlers[type];
                            if (handlerForType) {
                                handlerForType.refCount -= 1;
                                // If there are no longer any custom handlers of the current type on this element, we can remove ours, too.
                                if (handlerForType.refCount <= 0) {
                                    originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                                    handlerForType.handler = undefined;
                                    delete handlers[type]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
                                }
                                // If there are no longer any custom handlers of any type on this element, cleanup everything.
                                if (Object.keys(handlers).length === 0) {
                                    delete el.__sentry_instrumentation_handlers__;
                                }
                            }
                        }
                        catch (e) {
                            // Accessing dom properties is always fragile.
                            // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
                        }
                    }
                    return originalRemoveEventListener.call(this, type, listener, options);
                };
            });
        });
    }
    let _oldOnErrorHandler = null;
    /** JSDoc */
    function instrumentError() {
        _oldOnErrorHandler = global$2.onerror;
        global$2.onerror = function (msg, url, line, column, error) {
            triggerHandlers('error', {
                column,
                error,
                line,
                msg,
                url,
            });
            if (_oldOnErrorHandler) {
                // eslint-disable-next-line prefer-rest-params
                return _oldOnErrorHandler.apply(this, arguments);
            }
            return false;
        };
    }
    let _oldOnUnhandledRejectionHandler = null;
    /** JSDoc */
    function instrumentUnhandledRejection() {
        _oldOnUnhandledRejectionHandler = global$2.onunhandledrejection;
        global$2.onunhandledrejection = function (e) {
            triggerHandlers('unhandledrejection', e);
            if (_oldOnUnhandledRejectionHandler) {
                // eslint-disable-next-line prefer-rest-params
                return _oldOnUnhandledRejectionHandler.apply(this, arguments);
            }
            return true;
        };
    }
  
    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    /** SyncPromise internal states */
    var States;
    (function (States) {
        /** Pending */
        States["PENDING"] = "PENDING";
        /** Resolved / OK */
        States["RESOLVED"] = "RESOLVED";
        /** Rejected / Error */
        States["REJECTED"] = "REJECTED";
    })(States || (States = {}));
    /**
     * Thenable class that behaves like a Promise and follows it's interface
     * but is not async internally
     */
    class SyncPromise {
        constructor(executor) {
            this._state = States.PENDING;
            this._handlers = [];
            /** JSDoc */
            this._resolve = (value) => {
                this._setResult(States.RESOLVED, value);
            };
            /** JSDoc */
            this._reject = (reason) => {
                this._setResult(States.REJECTED, reason);
            };
            /** JSDoc */
            this._setResult = (state, value) => {
                if (this._state !== States.PENDING) {
                    return;
                }
                if (isThenable(value)) {
                    value.then(this._resolve, this._reject);
                    return;
                }
                this._state = state;
                this._value = value;
                this._executeHandlers();
            };
            // TODO: FIXME
            /** JSDoc */
            this._attachHandler = (handler) => {
                this._handlers = this._handlers.concat(handler);
                this._executeHandlers();
            };
            /** JSDoc */
            this._executeHandlers = () => {
                if (this._state === States.PENDING) {
                    return;
                }
                const cachedHandlers = this._handlers.slice();
                this._handlers = [];
                cachedHandlers.forEach(handler => {
                    if (handler.done) {
                        return;
                    }
                    if (this._state === States.RESOLVED) {
                        if (handler.onfulfilled) {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            handler.onfulfilled(this._value);
                        }
                    }
                    if (this._state === States.REJECTED) {
                        if (handler.onrejected) {
                            handler.onrejected(this._value);
                        }
                    }
                    handler.done = true;
                });
            };
            try {
                executor(this._resolve, this._reject);
            }
            catch (e) {
                this._reject(e);
            }
        }
        /** JSDoc */
        static resolve(value) {
            return new SyncPromise(resolve => {
                resolve(value);
            });
        }
        /** JSDoc */
        static reject(reason) {
            return new SyncPromise((_, reject) => {
                reject(reason);
            });
        }
        /** JSDoc */
        static all(collection) {
            return new SyncPromise((resolve, reject) => {
                if (!Array.isArray(collection)) {
                    reject(new TypeError(`Promise.all requires an array as input.`));
                    return;
                }
                if (collection.length === 0) {
                    resolve([]);
                    return;
                }
                let counter = collection.length;
                const resolvedCollection = [];
                collection.forEach((item, index) => {
                    SyncPromise.resolve(item)
                        .then(value => {
                        resolvedCollection[index] = value;
                        counter -= 1;
                        if (counter !== 0) {
                            return;
                        }
                        resolve(resolvedCollection);
                    })
                        .then(null, reject);
                });
            });
        }
        /** JSDoc */
        then(onfulfilled, onrejected) {
            return new SyncPromise((resolve, reject) => {
                this._attachHandler({
                    done: false,
                    onfulfilled: result => {
                        if (!onfulfilled) {
                            // TODO: ¯\_(ツ)_/¯
                            // TODO: FIXME
                            resolve(result);
                            return;
                        }
                        try {
                            resolve(onfulfilled(result));
                            return;
                        }
                        catch (e) {
                            reject(e);
                            return;
                        }
                    },
                    onrejected: reason => {
                        if (!onrejected) {
                            reject(reason);
                            return;
                        }
                        try {
                            resolve(onrejected(reason));
                            return;
                        }
                        catch (e) {
                            reject(e);
                            return;
                        }
                    },
                });
            });
        }
        /** JSDoc */
        catch(onrejected) {
            return this.then(val => val, onrejected);
        }
        /** JSDoc */
        finally(onfinally) {
            return new SyncPromise((resolve, reject) => {
                let val;
                let isRejected;
                return this.then(value => {
                    isRejected = false;
                    val = value;
                    if (onfinally) {
                        onfinally();
                    }
                }, reason => {
                    isRejected = true;
                    val = reason;
                    if (onfinally) {
                        onfinally();
                    }
                }).then(() => {
                    if (isRejected) {
                        reject(val);
                        return;
                    }
                    resolve(val);
                });
            });
        }
        /** JSDoc */
        toString() {
            return '[object SyncPromise]';
        }
    }
  
    /** A simple queue that holds promises. */
    class PromiseBuffer {
        constructor(_limit) {
            this._limit = _limit;
            /** Internal set of queued Promises */
            this._buffer = [];
        }
        /**
         * Says if the buffer is ready to take more requests
         */
        isReady() {
            return this._limit === undefined || this.length() < this._limit;
        }
        /**
         * Add a promise to the queue.
         *
         * @param task Can be any PromiseLike<T>
         * @returns The original promise.
         */
        add(task) {
            if (!this.isReady()) {
                return SyncPromise.reject(new SentryError('Not adding Promise due to buffer limit reached.'));
            }
            if (this._buffer.indexOf(task) === -1) {
                this._buffer.push(task);
            }
            task
                .then(() => this.remove(task))
                .then(null, () => this.remove(task).then(null, () => {
                // We have to add this catch here otherwise we have an unhandledPromiseRejection
                // because it's a new Promise chain.
            }));
            return task;
        }
        /**
         * Remove a promise to the queue.
         *
         * @param task Can be any PromiseLike<T>
         * @returns Removed promise.
         */
        remove(task) {
            const removedTask = this._buffer.splice(this._buffer.indexOf(task), 1)[0];
            return removedTask;
        }
        /**
         * This function returns the number of unresolved promises in the queue.
         */
        length() {
            return this._buffer.length;
        }
        /**
         * This will drain the whole queue, returns true if queue is empty or drained.
         * If timeout is provided and the queue takes longer to drain, the promise still resolves but with false.
         *
         * @param timeout Number in ms to wait until it resolves with false.
         */
        drain(timeout) {
            return new SyncPromise(resolve => {
                const capturedSetTimeout = setTimeout(() => {
                    if (timeout && timeout > 0) {
                        resolve(false);
                    }
                }, timeout);
                SyncPromise.all(this._buffer)
                    .then(() => {
                    clearTimeout(capturedSetTimeout);
                    resolve(true);
                })
                    .then(null, () => {
                    resolve(true);
                });
            });
        }
    }
  
    /**
     * A TimestampSource implementation for environments that do not support the Performance Web API natively.
     *
     * Note that this TimestampSource does not use a monotonic clock. A call to `nowSeconds` may return a timestamp earlier
     * than a previously returned value. We do not try to emulate a monotonic behavior in order to facilitate debugging. It
     * is more obvious to explain "why does my span have negative duration" than "why my spans have zero duration".
     */
    const dateTimestampSource = {
        nowSeconds: () => Date.now() / 1000,
    };
    /**
     * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
     * support the API.
     *
     * Wrapping the native API works around differences in behavior from different browsers.
     */
    function getBrowserPerformance() {
        const { performance } = getGlobalObject();
        if (!performance || !performance.now) {
            return undefined;
        }
        // Replace performance.timeOrigin with our own timeOrigin based on Date.now().
        //
        // This is a partial workaround for browsers reporting performance.timeOrigin such that performance.timeOrigin +
        // performance.now() gives a date arbitrarily in the past.
        //
        // Additionally, computing timeOrigin in this way fills the gap for browsers where performance.timeOrigin is
        // undefined.
        //
        // The assumption that performance.timeOrigin + performance.now() ~= Date.now() is flawed, but we depend on it to
        // interact with data coming out of performance entries.
        //
        // Note that despite recommendations against it in the spec, browsers implement the Performance API with a clock that
        // might stop when the computer is asleep (and perhaps under other circumstances). Such behavior causes
        // performance.timeOrigin + performance.now() to have an arbitrary skew over Date.now(). In laptop computers, we have
        // observed skews that can be as long as days, weeks or months.
        //
        // See https://github.com/getsentry/sentry-javascript/issues/2590.
        //
        // BUG: despite our best intentions, this workaround has its limitations. It mostly addresses timings of pageload
        // transactions, but ignores the skew built up over time that can aversely affect timestamps of navigation
        // transactions of long-lived web pages.
        const timeOrigin = Date.now() - performance.now();
        return {
            now: () => performance.now(),
            timeOrigin,
        };
    }
    /**
     * Returns the native Performance API implementation from Node.js. Returns undefined in old Node.js versions that don't
     * implement the API.
     */
    function getNodePerformance() {
        try {
            const perfHooks = dynamicRequire(module, 'perf_hooks');
            return perfHooks.performance;
        }
        catch (_) {
            return undefined;
        }
    }
    /**
     * The Performance API implementation for the current platform, if available.
     */
    const platformPerformance = isNodeEnv() ? getNodePerformance() : getBrowserPerformance();
    const timestampSource = platformPerformance === undefined
        ? dateTimestampSource
        : {
            nowSeconds: () => (platformPerformance.timeOrigin + platformPerformance.now()) / 1000,
        };
    /**
     * Returns a timestamp in seconds since the UNIX epoch using the Date API.
     */
    const dateTimestampInSeconds = dateTimestampSource.nowSeconds.bind(dateTimestampSource);
    /**
     * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
     * availability of the Performance API.
     *
     * See `usingPerformanceAPI` to test whether the Performance API is used.
     *
     * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
     * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
     * skew can grow to arbitrary amounts like days, weeks or months.
     * See https://github.com/getsentry/sentry-javascript/issues/2590.
     */
    const timestampInSeconds = timestampSource.nowSeconds.bind(timestampSource);
    /**
     * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
     * performance API is available.
     */
    const browserPerformanceTimeOrigin = (() => {
        // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
        // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
        // data as reliable if they are within a reasonable threshold of the current time.
        const { performance } = getGlobalObject();
        if (!performance) {
            return undefined;
        }
        const threshold = 3600 * 1000;
        const performanceNow = performance.now();
        const dateNow = Date.now();
        // if timeOrigin isn't available set delta to threshold so it isn't used
        const timeOriginDelta = performance.timeOrigin
            ? Math.abs(performance.timeOrigin + performanceNow - dateNow)
            : threshold;
        const timeOriginIsReliable = timeOriginDelta < threshold;
        // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
        // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
        // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
        // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
        // Date API.
        // eslint-disable-next-line deprecation/deprecation
        const navigationStart = performance.timing && performance.timing.navigationStart;
        const hasNavigationStart = typeof navigationStart === 'number';
        // if navigationStart isn't available set delta to threshold so it isn't used
        const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
        const navigationStartIsReliable = navigationStartDelta < threshold;
        if (timeOriginIsReliable || navigationStartIsReliable) {
            // Use the more reliable time origin
            if (timeOriginDelta <= navigationStartDelta) {
                return performance.timeOrigin;
            }
            else {
                return navigationStart;
            }
        }
        return dateNow;
    })();
  
    /**
     * Holds additional event information. {@link Scope.applyToEvent} will be
     * called by the client before an event will be sent.
     */
    class Scope {
        constructor() {
            /** Flag if notifiying is happening. */
            this._notifyingListeners = false;
            /** Callback for client to receive scope changes. */
            this._scopeListeners = [];
            /** Callback list that will be called after {@link applyToEvent}. */
            this._eventProcessors = [];
            /** Array of breadcrumbs. */
            this._breadcrumbs = [];
            /** User */
            this._user = {};
            /** Tags */
            this._tags = {};
            /** Extra */
            this._extra = {};
            /** Contexts */
            this._contexts = {};
        }
        /**
         * Inherit values from the parent scope.
         * @param scope to clone.
         */
        static clone(scope) {
            const newScope = new Scope();
            if (scope) {
                newScope._breadcrumbs = [...scope._breadcrumbs];
                newScope._tags = Object.assign({}, scope._tags);
                newScope._extra = Object.assign({}, scope._extra);
                newScope._contexts = Object.assign({}, scope._contexts);
                newScope._user = scope._user;
                newScope._level = scope._level;
                newScope._span = scope._span;
                newScope._session = scope._session;
                newScope._transactionName = scope._transactionName;
                newScope._fingerprint = scope._fingerprint;
                newScope._eventProcessors = [...scope._eventProcessors];
            }
            return newScope;
        }
        /**
         * Add internal on change listener. Used for sub SDKs that need to store the scope.
         * @hidden
         */
        addScopeListener(callback) {
            this._scopeListeners.push(callback);
        }
        /**
         * @inheritDoc
         */
        addEventProcessor(callback) {
            this._eventProcessors.push(callback);
            return this;
        }
        /**
         * @inheritDoc
         */
        setUser(user) {
            this._user = user || {};
            if (this._session) {
                this._session.update({ user });
            }
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        getUser() {
            return this._user;
        }
        /**
         * @inheritDoc
         */
        setTags(tags) {
            this._tags = Object.assign(Object.assign({}, this._tags), tags);
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setTag(key, value) {
            this._tags = Object.assign(Object.assign({}, this._tags), { [key]: value });
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setExtras(extras) {
            this._extra = Object.assign(Object.assign({}, this._extra), extras);
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setExtra(key, extra) {
            this._extra = Object.assign(Object.assign({}, this._extra), { [key]: extra });
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setFingerprint(fingerprint) {
            this._fingerprint = fingerprint;
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setLevel(level) {
            this._level = level;
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setTransactionName(name) {
            this._transactionName = name;
            this._notifyScopeListeners();
            return this;
        }
        /**
         * Can be removed in major version.
         * @deprecated in favor of {@link this.setTransactionName}
         */
        setTransaction(name) {
            return this.setTransactionName(name);
        }
        /**
         * @inheritDoc
         */
        setContext(key, context) {
            if (context === null) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this._contexts[key];
            }
            else {
                this._contexts = Object.assign(Object.assign({}, this._contexts), { [key]: context });
            }
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        setSpan(span) {
            this._span = span;
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        getSpan() {
            return this._span;
        }
        /**
         * @inheritDoc
         */
        getTransaction() {
            var _a, _b, _c, _d;
            // often, this span will be a transaction, but it's not guaranteed to be
            const span = this.getSpan();
            // try it the new way first
            if ((_a = span) === null || _a === void 0 ? void 0 : _a.transaction) {
                return (_b = span) === null || _b === void 0 ? void 0 : _b.transaction;
            }
            // fallback to the old way (known bug: this only finds transactions with sampled = true)
            if ((_d = (_c = span) === null || _c === void 0 ? void 0 : _c.spanRecorder) === null || _d === void 0 ? void 0 : _d.spans[0]) {
                return span.spanRecorder.spans[0];
            }
            // neither way found a transaction
            return undefined;
        }
        /**
         * @inheritDoc
         */
        setSession(session) {
            if (!session) {
                delete this._session;
            }
            else {
                this._session = session;
            }
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        getSession() {
            return this._session;
        }
        /**
         * @inheritDoc
         */
        update(captureContext) {
            if (!captureContext) {
                return this;
            }
            if (typeof captureContext === 'function') {
                const updatedScope = captureContext(this);
                return updatedScope instanceof Scope ? updatedScope : this;
            }
            if (captureContext instanceof Scope) {
                this._tags = Object.assign(Object.assign({}, this._tags), captureContext._tags);
                this._extra = Object.assign(Object.assign({}, this._extra), captureContext._extra);
                this._contexts = Object.assign(Object.assign({}, this._contexts), captureContext._contexts);
                if (captureContext._user && Object.keys(captureContext._user).length) {
                    this._user = captureContext._user;
                }
                if (captureContext._level) {
                    this._level = captureContext._level;
                }
                if (captureContext._fingerprint) {
                    this._fingerprint = captureContext._fingerprint;
                }
            }
            else if (isPlainObject(captureContext)) {
                // eslint-disable-next-line no-param-reassign
                captureContext = captureContext;
                this._tags = Object.assign(Object.assign({}, this._tags), captureContext.tags);
                this._extra = Object.assign(Object.assign({}, this._extra), captureContext.extra);
                this._contexts = Object.assign(Object.assign({}, this._contexts), captureContext.contexts);
                if (captureContext.user) {
                    this._user = captureContext.user;
                }
                if (captureContext.level) {
                    this._level = captureContext.level;
                }
                if (captureContext.fingerprint) {
                    this._fingerprint = captureContext.fingerprint;
                }
            }
            return this;
        }
        /**
         * @inheritDoc
         */
        clear() {
            this._breadcrumbs = [];
            this._tags = {};
            this._extra = {};
            this._user = {};
            this._contexts = {};
            this._level = undefined;
            this._transactionName = undefined;
            this._fingerprint = undefined;
            this._span = undefined;
            this._session = undefined;
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        addBreadcrumb(breadcrumb, maxBreadcrumbs) {
            const mergedBreadcrumb = Object.assign({ timestamp: dateTimestampInSeconds() }, breadcrumb);
            this._breadcrumbs =
                maxBreadcrumbs !== undefined && maxBreadcrumbs >= 0
                    ? [...this._breadcrumbs, mergedBreadcrumb].slice(-maxBreadcrumbs)
                    : [...this._breadcrumbs, mergedBreadcrumb];
            this._notifyScopeListeners();
            return this;
        }
        /**
         * @inheritDoc
         */
        clearBreadcrumbs() {
            this._breadcrumbs = [];
            this._notifyScopeListeners();
            return this;
        }
        /**
         * Applies the current context and fingerprint to the event.
         * Note that breadcrumbs will be added by the client.
         * Also if the event has already breadcrumbs on it, we do not merge them.
         * @param event Event
         * @param hint May contain additional informartion about the original exception.
         * @hidden
         */
        applyToEvent(event, hint) {
            var _a;
            if (this._extra && Object.keys(this._extra).length) {
                event.extra = Object.assign(Object.assign({}, this._extra), event.extra);
            }
            if (this._tags && Object.keys(this._tags).length) {
                event.tags = Object.assign(Object.assign({}, this._tags), event.tags);
            }
            if (this._user && Object.keys(this._user).length) {
                event.user = Object.assign(Object.assign({}, this._user), event.user);
            }
            if (this._contexts && Object.keys(this._contexts).length) {
                event.contexts = Object.assign(Object.assign({}, this._contexts), event.contexts);
            }
            if (this._level) {
                event.level = this._level;
            }
            if (this._transactionName) {
                event.transaction = this._transactionName;
            }
            // We want to set the trace context for normal events only if there isn't already
            // a trace context on the event. There is a product feature in place where we link
            // errors with transaction and it relys on that.
            if (this._span) {
                event.contexts = Object.assign({ trace: this._span.getTraceContext() }, event.contexts);
                const transactionName = (_a = this._span.transaction) === null || _a === void 0 ? void 0 : _a.name;
                if (transactionName) {
                    event.tags = Object.assign({ transaction: transactionName }, event.tags);
                }
            }
            this._applyFingerprint(event);
            event.breadcrumbs = [...(event.breadcrumbs || []), ...this._breadcrumbs];
            event.breadcrumbs = event.breadcrumbs.length > 0 ? event.breadcrumbs : undefined;
            return this._notifyEventProcessors([...getGlobalEventProcessors(), ...this._eventProcessors], event, hint);
        }
        /**
         * This will be called after {@link applyToEvent} is finished.
         */
        _notifyEventProcessors(processors, event, hint, index = 0) {
            return new SyncPromise((resolve, reject) => {
                const processor = processors[index];
                if (event === null || typeof processor !== 'function') {
                    resolve(event);
                }
                else {
                    const result = processor(Object.assign({}, event), hint);
                    if (isThenable(result)) {
                        result
                            .then(final => this._notifyEventProcessors(processors, final, hint, index + 1).then(resolve))
                            .then(null, reject);
                    }
                    else {
                        this._notifyEventProcessors(processors, result, hint, index + 1)
                            .then(resolve)
                            .then(null, reject);
                    }
                }
            });
        }
        /**
         * This will be called on every set call.
         */
        _notifyScopeListeners() {
            // We need this check for this._notifyingListeners to be able to work on scope during updates
            // If this check is not here we'll produce endless recursion when something is done with the scope
            // during the callback.
            if (!this._notifyingListeners) {
                this._notifyingListeners = true;
                this._scopeListeners.forEach(callback => {
                    callback(this);
                });
                this._notifyingListeners = false;
            }
        }
        /**
         * Applies fingerprint from the scope to the event if there's one,
         * uses message if there's one instead or get rid of empty fingerprint
         */
        _applyFingerprint(event) {
            // Make sure it's an array first and we actually have something in place
            event.fingerprint = event.fingerprint
                ? Array.isArray(event.fingerprint)
                    ? event.fingerprint
                    : [event.fingerprint]
                : [];
            // If we have something on the scope, then merge it with event
            if (this._fingerprint) {
                event.fingerprint = event.fingerprint.concat(this._fingerprint);
            }
            // If we have no data at all, remove empty array default
            if (event.fingerprint && !event.fingerprint.length) {
                delete event.fingerprint;
            }
        }
    }
    /**
     * Retruns the global event processors.
     */
    function getGlobalEventProcessors() {
        /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access  */
        const global = getGlobalObject();
        global.__SENTRY__ = global.__SENTRY__ || {};
        global.__SENTRY__.globalEventProcessors = global.__SENTRY__.globalEventProcessors || [];
        return global.__SENTRY__.globalEventProcessors;
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    }
    /**
     * Add a EventProcessor to be kept globally.
     * @param callback EventProcessor to add
     */
    function addGlobalEventProcessor(callback) {
        getGlobalEventProcessors().push(callback);
    }
  
    /**
     * @inheritdoc
     */
    class Session {
        constructor(context) {
            this.errors = 0;
            this.sid = uuid4();
            this.timestamp = Date.now();
            this.started = Date.now();
            this.duration = 0;
            this.status = SessionStatus.Ok;
            this.init = true;
            if (context) {
                this.update(context);
            }
        }
        /** JSDoc */
        // eslint-disable-next-line complexity
        update(context = {}) {
            if (context.user) {
                if (context.user.ip_address) {
                    this.ipAddress = context.user.ip_address;
                }
                if (!context.did) {
                    this.did = context.user.id || context.user.email || context.user.username;
                }
            }
            this.timestamp = context.timestamp || Date.now();
            if (context.sid) {
                // Good enough uuid validation. — Kamil
                this.sid = context.sid.length === 32 ? context.sid : uuid4();
            }
            if (context.init !== undefined) {
                this.init = context.init;
            }
            if (context.did) {
                this.did = `${context.did}`;
            }
            if (typeof context.started === 'number') {
                this.started = context.started;
            }
            if (typeof context.duration === 'number') {
                this.duration = context.duration;
            }
            else {
                this.duration = this.timestamp - this.started;
            }
            if (context.release) {
                this.release = context.release;
            }
            if (context.environment) {
                this.environment = context.environment;
            }
            if (context.ipAddress) {
                this.ipAddress = context.ipAddress;
            }
            if (context.userAgent) {
                this.userAgent = context.userAgent;
            }
            if (typeof context.errors === 'number') {
                this.errors = context.errors;
            }
            if (context.status) {
                this.status = context.status;
            }
        }
        /** JSDoc */
        close(status) {
            if (status) {
                this.update({ status });
            }
            else if (this.status === SessionStatus.Ok) {
                this.update({ status: SessionStatus.Exited });
            }
            else {
                this.update();
            }
        }
        /** JSDoc */
        toJSON() {
            return dropUndefinedKeys({
                sid: `${this.sid}`,
                init: this.init,
                started: new Date(this.started).toISOString(),
                timestamp: new Date(this.timestamp).toISOString(),
                status: this.status,
                errors: this.errors,
                did: typeof this.did === 'number' || typeof this.did === 'string' ? `${this.did}` : undefined,
                duration: this.duration,
                attrs: dropUndefinedKeys({
                    release: this.release,
                    environment: this.environment,
                    ip_address: this.ipAddress,
                    user_agent: this.userAgent,
                }),
            });
        }
    }
  
    /* eslint-disable max-lines */
    /**
     * API compatibility version of this hub.
     *
     * WARNING: This number should only be increased when the global interface
     * changes and new methods are introduced.
     *
     * @hidden
     */
    const API_VERSION = 3;
    /**
     * Default maximum number of breadcrumbs added to an event. Can be overwritten
     * with {@link Options.maxBreadcrumbs}.
     */
    const DEFAULT_BREADCRUMBS = 100;
    /**
     * Absolute maximum number of breadcrumbs added to an event. The
     * `maxBreadcrumbs` option cannot be higher than this value.
     */
    const MAX_BREADCRUMBS = 100;
    /**
     * @inheritDoc
     */
    class Hub {
        /**
         * Creates a new instance of the hub, will push one {@link Layer} into the
         * internal stack on creation.
         *
         * @param client bound to the hub.
         * @param scope bound to the hub.
         * @param version number, higher number means higher priority.
         */
        constructor(client, scope = new Scope(), _version = API_VERSION) {
            this._version = _version;
            /** Is a {@link Layer}[] containing the client and scope */
            this._stack = [{}];
            this.getStackTop().scope = scope;
            this.bindClient(client);
        }
        /**
         * @inheritDoc
         */
        isOlderThan(version) {
            return this._version < version;
        }
        /**
         * @inheritDoc
         */
        bindClient(client) {
            const top = this.getStackTop();
            top.client = client;
            if (client && client.setupIntegrations) {
                client.setupIntegrations();
            }
        }
        /**
         * @inheritDoc
         */
        pushScope() {
            // We want to clone the content of prev scope
            const scope = Scope.clone(this.getScope());
            this.getStack().push({
                client: this.getClient(),
                scope,
            });
            return scope;
        }
        /**
         * @inheritDoc
         */
        popScope() {
            if (this.getStack().length <= 1)
                return false;
            return !!this.getStack().pop();
        }
        /**
         * @inheritDoc
         */
        withScope(callback) {
            const scope = this.pushScope();
            try {
                callback(scope);
            }
            finally {
                this.popScope();
            }
        }
        /**
         * @inheritDoc
         */
        getClient() {
            return this.getStackTop().client;
        }
        /** Returns the scope of the top stack. */
        getScope() {
            return this.getStackTop().scope;
        }
        /** Returns the scope stack for domains or the process. */
        getStack() {
            return this._stack;
        }
        /** Returns the topmost scope layer in the order domain > local > process. */
        getStackTop() {
            return this._stack[this._stack.length - 1];
        }
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        captureException(exception, hint) {
            const eventId = (this._lastEventId = uuid4());
            let finalHint = hint;
            // If there's no explicit hint provided, mimick the same thing that would happen
            // in the minimal itself to create a consistent behavior.
            // We don't do this in the client, as it's the lowest level API, and doing this,
            // would prevent user from having full control over direct calls.
            if (!hint) {
                let syntheticException;
                try {
                    throw new Error('Sentry syntheticException');
                }
                catch (exception) {
                    syntheticException = exception;
                }
                finalHint = {
                    originalException: exception,
                    syntheticException,
                };
            }
            this._invokeClient('captureException', exception, Object.assign(Object.assign({}, finalHint), { event_id: eventId }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        captureMessage(message, level, hint) {
            const eventId = (this._lastEventId = uuid4());
            let finalHint = hint;
            // If there's no explicit hint provided, mimick the same thing that would happen
            // in the minimal itself to create a consistent behavior.
            // We don't do this in the client, as it's the lowest level API, and doing this,
            // would prevent user from having full control over direct calls.
            if (!hint) {
                let syntheticException;
                try {
                    throw new Error(message);
                }
                catch (exception) {
                    syntheticException = exception;
                }
                finalHint = {
                    originalException: message,
                    syntheticException,
                };
            }
            this._invokeClient('captureMessage', message, level, Object.assign(Object.assign({}, finalHint), { event_id: eventId }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        captureEvent(event, hint) {
            const eventId = (this._lastEventId = uuid4());
            this._invokeClient('captureEvent', event, Object.assign(Object.assign({}, hint), { event_id: eventId }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        lastEventId() {
            return this._lastEventId;
        }
        /**
         * @inheritDoc
         */
        addBreadcrumb(breadcrumb, hint) {
            const { scope, client } = this.getStackTop();
            if (!scope || !client)
                return;
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = (client.getOptions && client.getOptions()) || {};
            if (maxBreadcrumbs <= 0)
                return;
            const timestamp = dateTimestampInSeconds();
            const mergedBreadcrumb = Object.assign({ timestamp }, breadcrumb);
            const finalBreadcrumb = beforeBreadcrumb
                ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint))
                : mergedBreadcrumb;
            if (finalBreadcrumb === null)
                return;
            scope.addBreadcrumb(finalBreadcrumb, Math.min(maxBreadcrumbs, MAX_BREADCRUMBS));
        }
        /**
         * @inheritDoc
         */
        setUser(user) {
            const scope = this.getScope();
            if (scope)
                scope.setUser(user);
        }
        /**
         * @inheritDoc
         */
        setTags(tags) {
            const scope = this.getScope();
            if (scope)
                scope.setTags(tags);
        }
        /**
         * @inheritDoc
         */
        setExtras(extras) {
            const scope = this.getScope();
            if (scope)
                scope.setExtras(extras);
        }
        /**
         * @inheritDoc
         */
        setTag(key, value) {
            const scope = this.getScope();
            if (scope)
                scope.setTag(key, value);
        }
        /**
         * @inheritDoc
         */
        setExtra(key, extra) {
            const scope = this.getScope();
            if (scope)
                scope.setExtra(key, extra);
        }
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setContext(name, context) {
            const scope = this.getScope();
            if (scope)
                scope.setContext(name, context);
        }
        /**
         * @inheritDoc
         */
        configureScope(callback) {
            const { scope, client } = this.getStackTop();
            if (scope && client) {
                callback(scope);
            }
        }
        /**
         * @inheritDoc
         */
        run(callback) {
            const oldHub = makeMain(this);
            try {
                callback(this);
            }
            finally {
                makeMain(oldHub);
            }
        }
        /**
         * @inheritDoc
         */
        getIntegration(integration) {
            const client = this.getClient();
            if (!client)
                return null;
            try {
                return client.getIntegration(integration);
            }
            catch (_oO) {
                logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
                return null;
            }
        }
        /**
         * @inheritDoc
         */
        startSpan(context) {
            return this._callExtensionMethod('startSpan', context);
        }
        /**
         * @inheritDoc
         */
        startTransaction(context, customSamplingContext) {
            return this._callExtensionMethod('startTransaction', context, customSamplingContext);
        }
        /**
         * @inheritDoc
         */
        traceHeaders() {
            return this._callExtensionMethod('traceHeaders');
        }
        /**
         * @inheritDoc
         */
        captureSession(endSession = false) {
            // both send the update and pull the session from the scope
            if (endSession) {
                return this.endSession();
            }
            // only send the update
            this._sendSessionUpdate();
        }
        /**
         * @inheritDoc
         */
        endSession() {
            var _a, _b, _c, _d, _e;
            (_c = (_b = (_a = this.getStackTop()) === null || _a === void 0 ? void 0 : _a.scope) === null || _b === void 0 ? void 0 : _b.getSession()) === null || _c === void 0 ? void 0 : _c.close();
            this._sendSessionUpdate();
            // the session is over; take it off of the scope
            (_e = (_d = this.getStackTop()) === null || _d === void 0 ? void 0 : _d.scope) === null || _e === void 0 ? void 0 : _e.setSession();
        }
        /**
         * @inheritDoc
         */
        startSession(context) {
            const { scope, client } = this.getStackTop();
            const { release, environment } = (client && client.getOptions()) || {};
            const session = new Session(Object.assign(Object.assign({ release,
                environment }, (scope && { user: scope.getUser() })), context));
            if (scope) {
                // End existing session if there's one
                const currentSession = scope.getSession && scope.getSession();
                if (currentSession && currentSession.status === SessionStatus.Ok) {
                    currentSession.update({ status: SessionStatus.Exited });
                }
                this.endSession();
                // Afterwards we set the new session on the scope
                scope.setSession(session);
            }
            return session;
        }
        /**
         * Sends the current Session on the scope
         */
        _sendSessionUpdate() {
            const { scope, client } = this.getStackTop();
            if (!scope)
                return;
            const session = scope.getSession && scope.getSession();
            if (session) {
                if (client && client.captureSession) {
                    client.captureSession(session);
                }
            }
        }
        /**
         * Internal helper function to call a method on the top client if it exists.
         *
         * @param method The method to call on the client.
         * @param args Arguments to pass to the client function.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _invokeClient(method, ...args) {
            const { scope, client } = this.getStackTop();
            if (client && client[method]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                client[method](...args, scope);
            }
        }
        /**
         * Calls global extension method and binding current instance to the function call
         */
        // @ts-ignore Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _callExtensionMethod(method, ...args) {
            const carrier = getMainCarrier();
            const sentry = carrier.__SENTRY__;
            if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
                return sentry.extensions[method].apply(this, args);
            }
            logger.warn(`Extension method ${method} couldn't be found, doing nothing.`);
        }
    }
    /** Returns the global shim registry. */
    function getMainCarrier() {
        const carrier = getGlobalObject();
        carrier.__SENTRY__ = carrier.__SENTRY__ || {
            extensions: {},
            hub: undefined,
        };
        return carrier;
    }
    /**
     * Replaces the current main hub with the passed one on the global object
     *
     * @returns The old replaced hub
     */
    function makeMain(hub) {
        const registry = getMainCarrier();
        const oldHub = getHubFromCarrier(registry);
        setHubOnCarrier(registry, hub);
        return oldHub;
    }
    /**
     * Returns the default hub instance.
     *
     * If a hub is already registered in the global carrier but this module
     * contains a more recent version, it replaces the registered version.
     * Otherwise, the currently registered hub will be returned.
     */
    function getCurrentHub() {
        // Get main carrier (global for every environment)
        const registry = getMainCarrier();
        // If there's no hub, or its an old API, assign a new one
        if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
            setHubOnCarrier(registry, new Hub());
        }
        // Prefer domains over global if they are there (applicable only to Node environment)
        if (isNodeEnv()) {
            return getHubFromActiveDomain(registry);
        }
        // Return hub that lives on a global object
        return getHubFromCarrier(registry);
    }
    /**
     * Try to read the hub from an active domain, and fallback to the registry if one doesn't exist
     * @returns discovered hub
     */
    function getHubFromActiveDomain(registry) {
        var _a, _b, _c;
        try {
            const activeDomain = (_c = (_b = (_a = getMainCarrier().__SENTRY__) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b.domain) === null || _c === void 0 ? void 0 : _c.active;
            // If there's no active domain, just return global hub
            if (!activeDomain) {
                return getHubFromCarrier(registry);
            }
            // If there's no hub on current domain, or it's an old API, assign a new one
            if (!hasHubOnCarrier(activeDomain) || getHubFromCarrier(activeDomain).isOlderThan(API_VERSION)) {
                const registryHubTopStack = getHubFromCarrier(registry).getStackTop();
                setHubOnCarrier(activeDomain, new Hub(registryHubTopStack.client, Scope.clone(registryHubTopStack.scope)));
            }
            // Return hub that lives on a domain
            return getHubFromCarrier(activeDomain);
        }
        catch (_Oo) {
            // Return hub that lives on a global object
            return getHubFromCarrier(registry);
        }
    }
    /**
     * This will tell whether a carrier has a hub on it or not
     * @param carrier object
     */
    function hasHubOnCarrier(carrier) {
        return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
    }
    /**
     * This will create a new {@link Hub} and add to the passed object on
     * __SENTRY__.hub.
     * @param carrier object
     * @hidden
     */
    function getHubFromCarrier(carrier) {
        if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub)
            return carrier.__SENTRY__.hub;
        carrier.__SENTRY__ = carrier.__SENTRY__ || {};
        carrier.__SENTRY__.hub = new Hub();
        return carrier.__SENTRY__.hub;
    }
    /**
     * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
     * @param carrier object
     * @param hub Hub
     * @returns A boolean indicating success or failure
     */
    function setHubOnCarrier(carrier, hub) {
        if (!carrier)
            return false;
        carrier.__SENTRY__ = carrier.__SENTRY__ || {};
        carrier.__SENTRY__.hub = hub;
        return true;
    }
  
    /**
     * This calls a function on the current hub.
     * @param method function to call on hub.
     * @param args to pass to function.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function callOnHub(method, ...args) {
        const hub = getCurrentHub();
        if (hub && hub[method]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return hub[method](...args);
        }
        throw new Error(`No hub defined or ${method} was not found on the hub, please open a bug report.`);
    }
    /**
     * Captures an exception event and sends it to Sentry.
     *
     * @param exception An exception-like object.
     * @returns The generated eventId.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function captureException(exception, captureContext) {
        let syntheticException;
        try {
            throw new Error('Sentry syntheticException');
        }
        catch (exception) {
            syntheticException = exception;
        }
        return callOnHub('captureException', exception, {
            captureContext,
            originalException: exception,
            syntheticException,
        });
    }
    /**
     * Captures a message event and sends it to Sentry.
     *
     * @param message The message to send to Sentry.
     * @param level Define the level of the message.
     * @returns The generated eventId.
     */
    function captureMessage(message, captureContext) {
        let syntheticException;
        try {
            throw new Error(message);
        }
        catch (exception) {
            syntheticException = exception;
        }
        // This is necessary to provide explicit scopes upgrade, without changing the original
        // arity of the `captureMessage(message, level)` method.
        const level = typeof captureContext === 'string' ? captureContext : undefined;
        const context = typeof captureContext !== 'string' ? { captureContext } : undefined;
        return callOnHub('captureMessage', message, level, Object.assign({ originalException: message, syntheticException }, context));
    }
    /**
     * Captures a manually created event and sends it to Sentry.
     *
     * @param event The event to send to Sentry.
     * @returns The generated eventId.
     */
    function captureEvent(event) {
        return callOnHub('captureEvent', event);
    }
    /**
     * Callback to set context information onto the scope.
     * @param callback Callback function that receives Scope.
     */
    function configureScope(callback) {
        callOnHub('configureScope', callback);
    }
    /**
     * Records a new breadcrumb which will be attached to future events.
     *
     * Breadcrumbs will be added to subsequent events to provide more context on
     * user's actions prior to an error or crash.
     *
     * @param breadcrumb The breadcrumb to record.
     */
    function addBreadcrumb(breadcrumb) {
        callOnHub('addBreadcrumb', breadcrumb);
    }
    /**
     * Sets context data with the given name.
     * @param name of the context
     * @param context Any kind of data. This data will be normalized.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setContext(name, context) {
        callOnHub('setContext', name, context);
    }
    /**
     * Set an object that will be merged sent as extra data with the event.
     * @param extras Extras object to merge into current context.
     */
    function setExtras(extras) {
        callOnHub('setExtras', extras);
    }
    /**
     * Set an object that will be merged sent as tags data with the event.
     * @param tags Tags context object to merge into current context.
     */
    function setTags(tags) {
        callOnHub('setTags', tags);
    }
    /**
     * Set key:value that will be sent as extra data with the event.
     * @param key String of extra
     * @param extra Any kind of data. This data will be normalized.
     */
    function setExtra(key, extra) {
        callOnHub('setExtra', key, extra);
    }
    /**
     * Set key:value that will be sent as tags data with the event.
     *
     * Can also be used to unset a tag, by passing `undefined`.
     *
     * @param key String key of tag
     * @param value Value of tag
     */
    function setTag(key, value) {
        callOnHub('setTag', key, value);
    }
    /**
     * Updates user context information for future events.
     *
     * @param user User context object to be set in the current context. Pass `null` to unset the user.
     */
    function setUser(user) {
        callOnHub('setUser', user);
    }
    /**
     * Creates a new scope with and executes the given operation within.
     * The scope is automatically removed once the operation
     * finishes or throws.
     *
     * This is essentially a convenience function for:
     *
     *     pushScope();
     *     callback();
     *     popScope();
     *
     * @param callback that will be enclosed into push/popScope.
     */
    function withScope(callback) {
        callOnHub('withScope', callback);
    }
    /**
     * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
     *
     * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
     * new child span within the transaction or any span, call the respective `.startChild()` method.
     *
     * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
     *
     * The transaction must be finished with a call to its `.finish()` method, at which point the transaction with all its
     * finished child spans will be sent to Sentry.
     *
     * @param context Properties of the new `Transaction`.
     * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
     * default values). See {@link Options.tracesSampler}.
     *
     * @returns The transaction which was just started
     */
    function startTransaction(context, customSamplingContext) {
        return callOnHub('startTransaction', Object.assign({}, context), customSamplingContext);
    }
  
    const SENTRY_API_VERSION = '7';
    /**
     * Helper class to provide urls, headers and metadata that can be used to form
     * different types of requests to Sentry endpoints.
     * Supports both envelopes and regular event requests.
     **/
    class API {
        /** Create a new instance of API */
        constructor(dsn, metadata = {}) {
            this.dsn = dsn;
            this._dsnObject = new Dsn(dsn);
            this.metadata = metadata;
        }
        /** Returns the Dsn object. */
        getDsn() {
            return this._dsnObject;
        }
        /** Returns the prefix to construct Sentry ingestion API endpoints. */
        getBaseApiEndpoint() {
            const dsn = this._dsnObject;
            const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
            const port = dsn.port ? `:${dsn.port}` : '';
            return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ''}/api/`;
        }
        /** Returns the store endpoint URL. */
        getStoreEndpoint() {
            return this._getIngestEndpoint('store');
        }
        /**
         * Returns the store endpoint URL with auth in the query string.
         *
         * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
         */
        getStoreEndpointWithUrlEncodedAuth() {
            return `${this.getStoreEndpoint()}?${this._encodedAuth()}`;
        }
        /**
         * Returns the envelope endpoint URL with auth in the query string.
         *
         * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
         */
        getEnvelopeEndpointWithUrlEncodedAuth() {
            return `${this._getEnvelopeEndpoint()}?${this._encodedAuth()}`;
        }
        /** Returns only the path component for the store endpoint. */
        getStoreEndpointPath() {
            const dsn = this._dsnObject;
            return `${dsn.path ? `/${dsn.path}` : ''}/api/${dsn.projectId}/store/`;
        }
        /**
         * Returns an object that can be used in request headers.
         * This is needed for node and the old /store endpoint in sentry
         */
        getRequestHeaders(clientName, clientVersion) {
            // CHANGE THIS to use metadata but keep clientName and clientVersion compatible
            const dsn = this._dsnObject;
            const header = [`Sentry sentry_version=${SENTRY_API_VERSION}`];
            header.push(`sentry_client=${clientName}/${clientVersion}`);
            header.push(`sentry_key=${dsn.publicKey}`);
            if (dsn.pass) {
                header.push(`sentry_secret=${dsn.pass}`);
            }
            return {
                'Content-Type': 'application/json',
                'X-Sentry-Auth': header.join(', '),
            };
        }
        /** Returns the url to the report dialog endpoint. */
        getReportDialogEndpoint(dialogOptions = {}) {
            const dsn = this._dsnObject;
            const endpoint = `${this.getBaseApiEndpoint()}embed/error-page/`;
            const encodedOptions = [];
            encodedOptions.push(`dsn=${dsn.toString()}`);
            for (const key in dialogOptions) {
                if (key === 'dsn') {
                    continue;
                }
                if (key === 'user') {
                    if (!dialogOptions.user) {
                        continue;
                    }
                    if (dialogOptions.user.name) {
                        encodedOptions.push(`name=${encodeURIComponent(dialogOptions.user.name)}`);
                    }
                    if (dialogOptions.user.email) {
                        encodedOptions.push(`email=${encodeURIComponent(dialogOptions.user.email)}`);
                    }
                }
                else {
                    encodedOptions.push(`${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`);
                }
            }
            if (encodedOptions.length) {
                return `${endpoint}?${encodedOptions.join('&')}`;
            }
            return endpoint;
        }
        /** Returns the envelope endpoint URL. */
        _getEnvelopeEndpoint() {
            return this._getIngestEndpoint('envelope');
        }
        /** Returns the ingest API endpoint for target. */
        _getIngestEndpoint(target) {
            const base = this.getBaseApiEndpoint();
            const dsn = this._dsnObject;
            return `${base}${dsn.projectId}/${target}/`;
        }
        /** Returns a URL-encoded string with auth config suitable for a query string. */
        _encodedAuth() {
            const dsn = this._dsnObject;
            const auth = {
                // We send only the minimum set of required information. See
                // https://github.com/getsentry/sentry-javascript/issues/2572.
                sentry_key: dsn.publicKey,
                sentry_version: SENTRY_API_VERSION,
            };
            return urlEncode(auth);
        }
    }
  
    const installedIntegrations = [];
    /** Gets integration to install */
    function getIntegrationsToSetup(options) {
        const defaultIntegrations = (options.defaultIntegrations && [...options.defaultIntegrations]) || [];
        const userIntegrations = options.integrations;
        let integrations = [];
        if (Array.isArray(userIntegrations)) {
            const userIntegrationsNames = userIntegrations.map(i => i.name);
            const pickedIntegrationsNames = [];
            // Leave only unique default integrations, that were not overridden with provided user integrations
            defaultIntegrations.forEach(defaultIntegration => {
                if (userIntegrationsNames.indexOf(defaultIntegration.name) === -1 &&
                    pickedIntegrationsNames.indexOf(defaultIntegration.name) === -1) {
                    integrations.push(defaultIntegration);
                    pickedIntegrationsNames.push(defaultIntegration.name);
                }
            });
            // Don't add same user integration twice
            userIntegrations.forEach(userIntegration => {
                if (pickedIntegrationsNames.indexOf(userIntegration.name) === -1) {
                    integrations.push(userIntegration);
                    pickedIntegrationsNames.push(userIntegration.name);
                }
            });
        }
        else if (typeof userIntegrations === 'function') {
            integrations = userIntegrations(defaultIntegrations);
            integrations = Array.isArray(integrations) ? integrations : [integrations];
        }
        else {
            integrations = [...defaultIntegrations];
        }
        // Make sure that if present, `Debug` integration will always run last
        const integrationsNames = integrations.map(i => i.name);
        const alwaysLastToRun = 'Debug';
        if (integrationsNames.indexOf(alwaysLastToRun) !== -1) {
            integrations.push(...integrations.splice(integrationsNames.indexOf(alwaysLastToRun), 1));
        }
        return integrations;
    }
    /** Setup given integration */
    function setupIntegration(integration) {
        if (installedIntegrations.indexOf(integration.name) !== -1) {
            return;
        }
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        installedIntegrations.push(integration.name);
        logger.log(`Integration installed: ${integration.name}`);
    }
    /**
     * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
     * integrations are added unless they were already provided before.
     * @param integrations array of integration instances
     * @param withDefault should enable default integrations
     */
    function setupIntegrations(options) {
        const integrations = {};
        getIntegrationsToSetup(options).forEach(integration => {
            integrations[integration.name] = integration;
            setupIntegration(integration);
        });
        return integrations;
    }
  
    /* eslint-disable max-lines */
    /**
     * Base implementation for all JavaScript SDK clients.
     *
     * Call the constructor with the corresponding backend constructor and options
     * specific to the client subclass. To access these options later, use
     * {@link Client.getOptions}. Also, the Backend instance is available via
     * {@link Client.getBackend}.
     *
     * If a Dsn is specified in the options, it will be parsed and stored. Use
     * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
     * invalid, the constructor will throw a {@link SentryException}. Note that
     * without a valid Dsn, the SDK will not send any events to Sentry.
     *
     * Before sending an event via the backend, it is passed through
     * {@link BaseClient._prepareEvent} to add SDK information and scope data
     * (breadcrumbs and context). To add more custom information, override this
     * method and extend the resulting prepared event.
     *
     * To issue automatically created events (e.g. via instrumentation), use
     * {@link Client.captureEvent}. It will prepare the event and pass it through
     * the callback lifecycle. To issue auto-breadcrumbs, use
     * {@link Client.addBreadcrumb}.
     *
     * @example
     * class NodeClient extends BaseClient<NodeBackend, NodeOptions> {
     *   public constructor(options: NodeOptions) {
     *     super(NodeBackend, options);
     *   }
     *
     *   // ...
     * }
     */
    class BaseClient {
        /**
         * Initializes this client instance.
         *
         * @param backendClass A constructor function to create the backend.
         * @param options Options for the client.
         */
        constructor(backendClass, options) {
            /** Array of used integrations. */
            this._integrations = {};
            /** Number of call being processed */
            this._processing = 0;
            this._backend = new backendClass(options);
            this._options = options;
            if (options.dsn) {
                this._dsn = new Dsn(options.dsn);
            }
        }
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        captureException(exception, hint, scope) {
            let eventId = hint && hint.event_id;
            this._process(this._getBackend()
                .eventFromException(exception, hint)
                .then(event => this._captureEvent(event, hint, scope))
                .then(result => {
                eventId = result;
            }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        captureMessage(message, level, hint, scope) {
            let eventId = hint && hint.event_id;
            const promisedEvent = isPrimitive(message)
                ? this._getBackend().eventFromMessage(String(message), level, hint)
                : this._getBackend().eventFromException(message, hint);
            this._process(promisedEvent
                .then(event => this._captureEvent(event, hint, scope))
                .then(result => {
                eventId = result;
            }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        captureEvent(event, hint, scope) {
            let eventId = hint && hint.event_id;
            this._process(this._captureEvent(event, hint, scope).then(result => {
                eventId = result;
            }));
            return eventId;
        }
        /**
         * @inheritDoc
         */
        captureSession(session) {
            if (!(typeof session.release === 'string')) {
                logger.warn('Discarded session because of missing or non-string release');
            }
            else {
                this._sendSession(session);
                // After sending, we set init false to indicate it's not the first occurrence
                session.update({ init: false });
            }
        }
        /**
         * @inheritDoc
         */
        getDsn() {
            return this._dsn;
        }
        /**
         * @inheritDoc
         */
        getOptions() {
            return this._options;
        }
        /**
         * @inheritDoc
         */
        flush(timeout) {
            return this._isClientProcessing(timeout).then(ready => {
                return this._getBackend()
                    .getTransport()
                    .close(timeout)
                    .then(transportFlushed => ready && transportFlushed);
            });
        }
        /**
         * @inheritDoc
         */
        close(timeout) {
            return this.flush(timeout).then(result => {
                this.getOptions().enabled = false;
                return result;
            });
        }
        /**
         * Sets up the integrations
         */
        setupIntegrations() {
            if (this._isEnabled()) {
                this._integrations = setupIntegrations(this._options);
            }
        }
        /**
         * @inheritDoc
         */
        getIntegration(integration) {
            try {
                return this._integrations[integration.id] || null;
            }
            catch (_oO) {
                logger.warn(`Cannot retrieve integration ${integration.id} from the current Client`);
                return null;
            }
        }
        /** Updates existing session based on the provided event */
        _updateSessionFromEvent(session, event) {
            let crashed = false;
            let errored = false;
            let userAgent;
            const exceptions = event.exception && event.exception.values;
            if (exceptions) {
                errored = true;
                for (const ex of exceptions) {
                    const mechanism = ex.mechanism;
                    if (mechanism && mechanism.handled === false) {
                        crashed = true;
                        break;
                    }
                }
            }
            const user = event.user;
            if (!session.userAgent) {
                const headers = event.request ? event.request.headers : {};
                for (const key in headers) {
                    if (key.toLowerCase() === 'user-agent') {
                        userAgent = headers[key];
                        break;
                    }
                }
            }
            session.update(Object.assign(Object.assign({}, (crashed && { status: SessionStatus.Crashed })), { user,
                userAgent, errors: session.errors + Number(errored || crashed) }));
            this.captureSession(session);
        }
        /** Deliver captured session to Sentry */
        _sendSession(session) {
            this._getBackend().sendSession(session);
        }
        /** Waits for the client to be done with processing. */
        _isClientProcessing(timeout) {
            return new SyncPromise(resolve => {
                let ticked = 0;
                const tick = 1;
                const interval = setInterval(() => {
                    if (this._processing == 0) {
                        clearInterval(interval);
                        resolve(true);
                    }
                    else {
                        ticked += tick;
                        if (timeout && ticked >= timeout) {
                            clearInterval(interval);
                            resolve(false);
                        }
                    }
                }, tick);
            });
        }
        /** Returns the current backend. */
        _getBackend() {
            return this._backend;
        }
        /** Determines whether this SDK is enabled and a valid Dsn is present. */
        _isEnabled() {
            return this.getOptions().enabled !== false && this._dsn !== undefined;
        }
        /**
         * Adds common information to events.
         *
         * The information includes release and environment from `options`,
         * breadcrumbs and context (extra, tags and user) from the scope.
         *
         * Information that is already present in the event is never overwritten. For
         * nested objects, such as the context, keys are merged.
         *
         * @param event The original event.
         * @param hint May contain additional information about the original exception.
         * @param scope A scope containing event metadata.
         * @returns A new event with more information.
         */
        _prepareEvent(event, scope, hint) {
            const { normalizeDepth = 3 } = this.getOptions();
            const prepared = Object.assign(Object.assign({}, event), { event_id: event.event_id || (hint && hint.event_id ? hint.event_id : uuid4()), timestamp: event.timestamp || dateTimestampInSeconds() });
            this._applyClientOptions(prepared);
            this._applyIntegrationsMetadata(prepared);
            // If we have scope given to us, use it as the base for further modifications.
            // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
            let finalScope = scope;
            if (hint && hint.captureContext) {
                finalScope = Scope.clone(finalScope).update(hint.captureContext);
            }
            // We prepare the result here with a resolved Event.
            let result = SyncPromise.resolve(prepared);
            // This should be the last thing called, since we want that
            // {@link Hub.addEventProcessor} gets the finished prepared event.
            if (finalScope) {
                // In case we have a hub we reassign it.
                result = finalScope.applyToEvent(prepared, hint);
            }
            return result.then(evt => {
                if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
                    return this._normalizeEvent(evt, normalizeDepth);
                }
                return evt;
            });
        }
        /**
         * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
         * Normalized keys:
         * - `breadcrumbs.data`
         * - `user`
         * - `contexts`
         * - `extra`
         * @param event Event
         * @returns Normalized event
         */
        _normalizeEvent(event, depth) {
            if (!event) {
                return null;
            }
            const normalized = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, event), (event.breadcrumbs && {
                breadcrumbs: event.breadcrumbs.map(b => (Object.assign(Object.assign({}, b), (b.data && {
                    data: normalize(b.data, depth),
                })))),
            })), (event.user && {
                user: normalize(event.user, depth),
            })), (event.contexts && {
                contexts: normalize(event.contexts, depth),
            })), (event.extra && {
                extra: normalize(event.extra, depth),
            }));
            // event.contexts.trace stores information about a Transaction. Similarly,
            // event.spans[] stores information about child Spans. Given that a
            // Transaction is conceptually a Span, normalization should apply to both
            // Transactions and Spans consistently.
            // For now the decision is to skip normalization of Transactions and Spans,
            // so this block overwrites the normalized event to add back the original
            // Transaction information prior to normalization.
            if (event.contexts && event.contexts.trace) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                normalized.contexts.trace = event.contexts.trace;
            }
            return normalized;
        }
        /**
         *  Enhances event using the client configuration.
         *  It takes care of all "static" values like environment, release and `dist`,
         *  as well as truncating overly long values.
         * @param event event instance to be enhanced
         */
        _applyClientOptions(event) {
            const options = this.getOptions();
            const { environment, release, dist, maxValueLength = 250 } = options;
            if (!('environment' in event)) {
                event.environment = 'environment' in options ? environment : 'production';
            }
            if (event.release === undefined && release !== undefined) {
                event.release = release;
            }
            if (event.dist === undefined && dist !== undefined) {
                event.dist = dist;
            }
            if (event.message) {
                event.message = truncate(event.message, maxValueLength);
            }
            const exception = event.exception && event.exception.values && event.exception.values[0];
            if (exception && exception.value) {
                exception.value = truncate(exception.value, maxValueLength);
            }
            const request = event.request;
            if (request && request.url) {
                request.url = truncate(request.url, maxValueLength);
            }
        }
        /**
         * This function adds all used integrations to the SDK info in the event.
         * @param event The event that will be filled with all integrations.
         */
        _applyIntegrationsMetadata(event) {
            const integrationsArray = Object.keys(this._integrations);
            if (integrationsArray.length > 0) {
                event.sdk = event.sdk || {};
                event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationsArray];
            }
        }
        /**
         * Tells the backend to send this event
         * @param event The Sentry event to send
         */
        _sendEvent(event) {
            this._getBackend().sendEvent(event);
        }
        /**
         * Processes the event and logs an error in case of rejection
         * @param event
         * @param hint
         * @param scope
         */
        _captureEvent(event, hint, scope) {
            return this._processEvent(event, hint, scope).then(finalEvent => {
                return finalEvent.event_id;
            }, reason => {
                logger.error(reason);
                return undefined;
            });
        }
        /**
         * Processes an event (either error or message) and sends it to Sentry.
         *
         * This also adds breadcrumbs and context information to the event. However,
         * platform specific meta data (such as the User's IP address) must be added
         * by the SDK implementor.
         *
         *
         * @param event The event to send to Sentry.
         * @param hint May contain additional information about the original exception.
         * @param scope A scope containing event metadata.
         * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
         */
        _processEvent(event, hint, scope) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const { beforeSend, sampleRate } = this.getOptions();
            if (!this._isEnabled()) {
                return SyncPromise.reject(new SentryError('SDK not enabled, will not send event.'));
            }
            const isTransaction = event.type === 'transaction';
            // 1.0 === 100% events are sent
            // 0.0 === 0% events are sent
            // Sampling for transaction happens somewhere else
            if (!isTransaction && typeof sampleRate === 'number' && Math.random() > sampleRate) {
                return SyncPromise.reject(new SentryError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`));
            }
            return this._prepareEvent(event, scope, hint)
                .then(prepared => {
                if (prepared === null) {
                    throw new SentryError('An event processor returned null, will not send event.');
                }
                const isInternalException = hint && hint.data && hint.data.__sentry__ === true;
                if (isInternalException || isTransaction || !beforeSend) {
                    return prepared;
                }
                const beforeSendResult = beforeSend(prepared, hint);
                if (typeof beforeSendResult === 'undefined') {
                    throw new SentryError('`beforeSend` method has to return `null` or a valid event.');
                }
                else if (isThenable(beforeSendResult)) {
                    return beforeSendResult.then(event => event, e => {
                        throw new SentryError(`beforeSend rejected with ${e}`);
                    });
                }
                return beforeSendResult;
            })
                .then(processedEvent => {
                if (processedEvent === null) {
                    throw new SentryError('`beforeSend` returned `null`, will not send event.');
                }
                const session = scope && scope.getSession && scope.getSession();
                if (!isTransaction && session) {
                    this._updateSessionFromEvent(session, processedEvent);
                }
                this._sendEvent(processedEvent);
                return processedEvent;
            })
                .then(null, reason => {
                if (reason instanceof SentryError) {
                    throw reason;
                }
                this.captureException(reason, {
                    data: {
                        __sentry__: true,
                    },
                    originalException: reason,
                });
                throw new SentryError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
            });
        }
        /**
         * Occupies the client with processing and event
         */
        _process(promise) {
            this._processing += 1;
            promise.then(value => {
                this._processing -= 1;
                return value;
            }, reason => {
                this._processing -= 1;
                return reason;
            });
        }
    }
  
    /** Noop transport */
    class NoopTransport {
        /**
         * @inheritDoc
         */
        sendEvent(_) {
            return SyncPromise.resolve({
                reason: `NoopTransport: Event has been skipped because no Dsn is configured.`,
                status: exports.Status.Skipped,
            });
        }
        /**
         * @inheritDoc
         */
        close(_) {
            return SyncPromise.resolve(true);
        }
    }
  
    /**
     * This is the base implemention of a Backend.
     * @hidden
     */
    class BaseBackend {
        /** Creates a new backend instance. */
        constructor(options) {
            this._options = options;
            if (!this._options.dsn) {
                logger.warn('No DSN provided, backend will not do anything.');
            }
            this._transport = this._setupTransport();
        }
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        eventFromException(_exception, _hint) {
            throw new SentryError('Backend has to implement `eventFromException` method');
        }
        /**
         * @inheritDoc
         */
        eventFromMessage(_message, _level, _hint) {
            throw new SentryError('Backend has to implement `eventFromMessage` method');
        }
        /**
         * @inheritDoc
         */
        sendEvent(event) {
            this._transport.sendEvent(event).then(null, reason => {
                logger.error(`Error while sending event: ${reason}`);
            });
        }
        /**
         * @inheritDoc
         */
        sendSession(session) {
            if (!this._transport.sendSession) {
                logger.warn("Dropping session because custom transport doesn't implement sendSession");
                return;
            }
            this._transport.sendSession(session).then(null, reason => {
                logger.error(`Error while sending session: ${reason}`);
            });
        }
        /**
         * @inheritDoc
         */
        getTransport() {
            return this._transport;
        }
        /**
         * Sets up the transport so it can be used later to send requests.
         */
        _setupTransport() {
            return new NoopTransport();
        }
    }
  
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0
  
    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.
  
    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
  
    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    }
  
    /** Extract sdk info from from the API metadata */
    function getSdkMetadataForEnvelopeHeader(api) {
        if (!api.metadata || !api.metadata.sdk) {
            return;
        }
        const { name, version } = api.metadata.sdk;
        return { name, version };
    }
    /**
     * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
     * Merge with existing data if any.
     **/
    function enhanceEventWithSdkInfo(event, sdkInfo) {
        if (!sdkInfo) {
            return event;
        }
        event.sdk = event.sdk || {};
        event.sdk.name = event.sdk.name || sdkInfo.name;
        event.sdk.version = event.sdk.version || sdkInfo.version;
        event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
        event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
        return event;
    }
    /** Creates a SentryRequest from a Session. */
    function sessionToSentryRequest(session, api) {
        const sdkInfo = getSdkMetadataForEnvelopeHeader(api);
        const envelopeHeaders = JSON.stringify(Object.assign({ sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })));
        const itemHeaders = JSON.stringify({
            type: 'session',
        });
        return {
            body: `${envelopeHeaders}\n${itemHeaders}\n${JSON.stringify(session)}`,
            type: 'session',
            url: api.getEnvelopeEndpointWithUrlEncodedAuth(),
        };
    }
    /** Creates a SentryRequest from an event. */
    function eventToSentryRequest(event, api) {
        const sdkInfo = getSdkMetadataForEnvelopeHeader(api);
        const eventType = event.type || 'event';
        const useEnvelope = eventType === 'transaction';
        const _a = event.debug_meta || {}, { transactionSampling } = _a, metadata = __rest(_a, ["transactionSampling"]);
        const { method: samplingMethod, rate: sampleRate } = transactionSampling || {};
        if (Object.keys(metadata).length === 0) {
            delete event.debug_meta;
        }
        else {
            event.debug_meta = metadata;
        }
        const req = {
            body: JSON.stringify(sdkInfo ? enhanceEventWithSdkInfo(event, api.metadata.sdk) : event),
            type: eventType,
            url: useEnvelope ? api.getEnvelopeEndpointWithUrlEncodedAuth() : api.getStoreEndpointWithUrlEncodedAuth(),
        };
        // https://develop.sentry.dev/sdk/envelopes/
        // Since we don't need to manipulate envelopes nor store them, there is no
        // exported concept of an Envelope with operations including serialization and
        // deserialization. Instead, we only implement a minimal subset of the spec to
        // serialize events inline here.
        if (useEnvelope) {
            const envelopeHeaders = JSON.stringify(Object.assign({ event_id: event.event_id, sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })));
            const itemHeaders = JSON.stringify({
                type: event.type,
                // TODO: Right now, sampleRate may or may not be defined (it won't be in the cases of inheritance and
                // explicitly-set sampling decisions). Are we good with that?
                sample_rates: [{ id: samplingMethod, rate: sampleRate }],
            });
            // The trailing newline is optional. We intentionally don't send it to avoid
            // sending unnecessary bytes.
            //
            // const envelope = `${envelopeHeaders}\n${itemHeaders}\n${req.body}\n`;
            const envelope = `${envelopeHeaders}\n${itemHeaders}\n${req.body}`;
            req.body = envelope;
        }
        return req;
    }
  
    /**
     * Internal function to create a new SDK client instance. The client is
     * installed and then bound to the current scope.
     *
     * @param clientClass The client class to instantiate.
     * @param options Options to pass to the client.
     */
    function initAndBind(clientClass, options) {
        if (options.debug === true) {
            logger.enable();
        }
        const hub = getCurrentHub();
        const client = new clientClass(options);
        hub.bindClient(client);
    }
  
    const SDK_VERSION = '6.3.5';
  
    let originalFunctionToString;
    /** Patch toString calls to return proper name for wrapped functions */
    class FunctionToString {
        constructor() {
            /**
             * @inheritDoc
             */
            this.name = FunctionToString.id;
        }
        /**
         * @inheritDoc
         */
        setupOnce() {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            originalFunctionToString = Function.prototype.toString;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Function.prototype.toString = function (...args) {
                const context = this.__sentry_original__ || this;
                return originalFunctionToString.apply(context, args);
            };
        }
    }
    /**
     * @inheritDoc
     */
    FunctionToString.id = 'FunctionToString';
  
    // "Script error." is hard coded into browsers for errors that it can't read.
    // this is the result of a script being pulled in from an external domain and CORS.
    const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
    /** Inbound filters configurable by the user */
    class InboundFilters {
        constructor(_options = {}) {
            this._options = _options;
            /**
             * @inheritDoc
             */
            this.name = InboundFilters.id;
        }
        /**
         * @inheritDoc
         */
        setupOnce() {
            addGlobalEventProcessor((event) => {
                const hub = getCurrentHub();
                if (!hub) {
                    return event;
                }
                const self = hub.getIntegration(InboundFilters);
                if (self) {
                    const client = hub.getClient();
                    const clientOptions = client ? client.getOptions() : {};
                    // This checks prevents most of the occurrences of the bug linked below:
                    // https://github.com/getsentry/sentry-javascript/issues/2622
                    // The bug is caused by multiple SDK instances, where one is minified and one is using non-mangled code.
                    // Unfortunatelly we cannot fix it reliably (thus reserved property in rollup's terser config),
                    // as we cannot force people using multiple instances in their apps to sync SDK versions.
                    const options = typeof self._mergeOptions === 'function' ? self._mergeOptions(clientOptions) : {};
                    if (typeof self._shouldDropEvent !== 'function') {
                        return event;
                    }
                    return self._shouldDropEvent(event, options) ? null : event;
                }
                return event;
            });
        }
        /** JSDoc */
        _shouldDropEvent(event, options) {
            if (this._isSentryError(event, options)) {
                logger.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${getEventDescription(event)}`);
                return true;
            }
            if (this._isIgnoredError(event, options)) {
                logger.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`);
                return true;
            }
            if (this._isDeniedUrl(event, options)) {
                logger.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${this._getEventFilterUrl(event)}`);
                return true;
            }
            if (!this._isAllowedUrl(event, options)) {
                logger.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${this._getEventFilterUrl(event)}`);
                return true;
            }
            return false;
        }
        /** JSDoc */
        _isSentryError(event, options) {
            if (!options.ignoreInternal) {
                return false;
            }
            try {
                return ((event &&
                    event.exception &&
                    event.exception.values &&
                    event.exception.values[0] &&
                    event.exception.values[0].type === 'SentryError') ||
                    false);
            }
            catch (_oO) {
                return false;
            }
        }
        /** JSDoc */
        _isIgnoredError(event, options) {
            if (!options.ignoreErrors || !options.ignoreErrors.length) {
                return false;
            }
            return this._getPossibleEventMessages(event).some(message => 
            // Not sure why TypeScript complains here...
            options.ignoreErrors.some(pattern => isMatchingPattern(message, pattern)));
        }
        /** JSDoc */
        _isDeniedUrl(event, options) {
            // TODO: Use Glob instead?
            if (!options.denyUrls || !options.denyUrls.length) {
                return false;
            }
            const url = this._getEventFilterUrl(event);
            return !url ? false : options.denyUrls.some(pattern => isMatchingPattern(url, pattern));
        }
        /** JSDoc */
        _isAllowedUrl(event, options) {
            // TODO: Use Glob instead?
            if (!options.allowUrls || !options.allowUrls.length) {
                return true;
            }
            const url = this._getEventFilterUrl(event);
            return !url ? true : options.allowUrls.some(pattern => isMatchingPattern(url, pattern));
        }
        /** JSDoc */
        _mergeOptions(clientOptions = {}) {
            return {
                allowUrls: [
                    // eslint-disable-next-line deprecation/deprecation
                    ...(this._options.whitelistUrls || []),
                    ...(this._options.allowUrls || []),
                    // eslint-disable-next-line deprecation/deprecation
                    ...(clientOptions.whitelistUrls || []),
                    ...(clientOptions.allowUrls || []),
                ],
                denyUrls: [
                    // eslint-disable-next-line deprecation/deprecation
                    ...(this._options.blacklistUrls || []),
                    ...(this._options.denyUrls || []),
                    // eslint-disable-next-line deprecation/deprecation
                    ...(clientOptions.blacklistUrls || []),
                    ...(clientOptions.denyUrls || []),
                ],
                ignoreErrors: [
                    ...(this._options.ignoreErrors || []),
                    ...(clientOptions.ignoreErrors || []),
                    ...DEFAULT_IGNORE_ERRORS,
                ],
                ignoreInternal: typeof this._options.ignoreInternal !== 'undefined' ? this._options.ignoreInternal : true,
            };
        }
        /** JSDoc */
        _getPossibleEventMessages(event) {
            if (event.message) {
                return [event.message];
            }
            if (event.exception) {
                try {
                    const { type = '', value = '' } = (event.exception.values && event.exception.values[0]) || {};
                    return [`${value}`, `${type}: ${value}`];
                }
                catch (oO) {
                    logger.error(`Cannot extract message for event ${getEventDescription(event)}`);
                    return [];
                }
            }
            return [];
        }
        /** JSDoc */
        _getEventFilterUrl(event) {
            try {
                if (event.stacktrace) {
                    const frames = event.stacktrace.frames;
                    return (frames && frames[frames.length - 1].filename) || null;
                }
                if (event.exception) {
                    const frames = event.exception.values && event.exception.values[0].stacktrace && event.exception.values[0].stacktrace.frames;
                    return (frames && frames[frames.length - 1].filename) || null;
                }
                return null;
            }
            catch (oO) {
                logger.error(`Cannot extract url for event ${getEventDescription(event)}`);
                return null;
            }
        }
    }
    /**
     * @inheritDoc
     */
    InboundFilters.id = 'InboundFilters';
  
  
  
    var CoreIntegrations = /*#__PURE__*/Object.freeze({
      __proto__: null,
      FunctionToString: FunctionToString,
      InboundFilters: InboundFilters
    });
  
    /**
     * This was originally forked from https://github.com/occ/TraceKit, but has since been
     * largely modified and is now maintained as part of Sentry JS SDK.
     */
    // global reference to slice
    const UNKNOWN_FUNCTION = '?';
    // Chromium based browsers: Chrome, Brave, new Opera, new Edge
    const chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    // gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
    // generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
    // We need this specific case for now because we want no other regex to match.
    const gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
    const winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    // Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
    const reactMinifiedRegexp = /Minified React error #\d+;/i;
    /** JSDoc */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function computeStackTrace(ex) {
        let stack = null;
        let popSize = 0;
        if (ex) {
            if (typeof ex.framesToPop === 'number') {
                popSize = ex.framesToPop;
            }
            else if (reactMinifiedRegexp.test(ex.message)) {
                popSize = 1;
            }
        }
        try {
            // This must be tried first because Opera 10 *destroys*
            // its stacktrace property if you try to access the stack
            // property first!!
            stack = computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return popFrames(stack, popSize);
            }
        }
        catch (e) {
            // no-empty
        }
        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return popFrames(stack, popSize);
            }
        }
        catch (e) {
            // no-empty
        }
        return {
            message: extractMessage(ex),
            name: ex && ex.name,
            stack: [],
            failed: true,
        };
    }
    /** JSDoc */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, complexity
    function computeStackTraceFromStackProp(ex) {
        if (!ex || !ex.stack) {
            return null;
        }
        const stack = [];
        const lines = ex.stack.split('\n');
        let isEval;
        let submatch;
        let parts;
        let element;
        for (let i = 0; i < lines.length; ++i) {
            if ((parts = chrome.exec(lines[i]))) {
                const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                    // throw out eval line/column and use top-most line/column number
                    parts[2] = submatch[1]; // url
                    parts[3] = submatch[2]; // line
                    parts[4] = submatch[3]; // column
                }
                // Arpad: Working with the regexp above is super painful. it is quite a hack, but just stripping the `address at `
                // prefix here seems like the quickest solution for now.
                let url = parts[2] && parts[2].indexOf('address at ') === 0 ? parts[2].substr('address at '.length) : parts[2];
                // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
                // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
                let func = parts[1] || UNKNOWN_FUNCTION;
                const isSafariExtension = func.indexOf('safari-extension') !== -1;
                const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
                if (isSafariExtension || isSafariWebExtension) {
                    func = func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION;
                    url = isSafariExtension ? `safari-extension:${url}` : `safari-web-extension:${url}`;
                }
                element = {
                    url,
                    func,
                    args: isNative ? [parts[2]] : [],
                    line: parts[3] ? +parts[3] : null,
                    column: parts[4] ? +parts[4] : null,
                };
            }
            else if ((parts = winjs.exec(lines[i]))) {
                element = {
                    url: parts[2],
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: [],
                    line: +parts[3],
                    column: parts[4] ? +parts[4] : null,
                };
            }
            else if ((parts = gecko.exec(lines[i]))) {
                isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                    // throw out eval line/column and use top-most line number
                    parts[1] = parts[1] || `eval`;
                    parts[3] = submatch[1];
                    parts[4] = submatch[2];
                    parts[5] = ''; // no column when eval
                }
                else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
                    // FireFox uses this awesome columnNumber property for its top frame
                    // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                    // so adding 1
                    // NOTE: this hack doesn't work if top-most frame is eval
                    stack[0].column = ex.columnNumber + 1;
                }
                element = {
                    url: parts[3],
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: parts[2] ? parts[2].split(',') : [],
                    line: parts[4] ? +parts[4] : null,
                    column: parts[5] ? +parts[5] : null,
                };
            }
            else {
                continue;
            }
            if (!element.func && element.line) {
                element.func = UNKNOWN_FUNCTION;
            }
            stack.push(element);
        }
        if (!stack.length) {
            return null;
        }
        return {
            message: extractMessage(ex),
            name: ex.name,
            stack,
        };
    }
    /** JSDoc */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function computeStackTraceFromStacktraceProp(ex) {
        if (!ex || !ex.stacktrace) {
            return null;
        }
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        const stacktrace = ex.stacktrace;
        const opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
        const opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\((.*)\))? in (.*):\s*$/i;
        const lines = stacktrace.split('\n');
        const stack = [];
        let parts;
        for (let line = 0; line < lines.length; line += 2) {
            let element = null;
            if ((parts = opera10Regex.exec(lines[line]))) {
                element = {
                    url: parts[2],
                    func: parts[3],
                    args: [],
                    line: +parts[1],
                    column: null,
                };
            }
            else if ((parts = opera11Regex.exec(lines[line]))) {
                element = {
                    url: parts[6],
                    func: parts[3] || parts[4],
                    args: parts[5] ? parts[5].split(',') : [],
                    line: +parts[1],
                    column: +parts[2],
                };
            }
            if (element) {
                if (!element.func && element.line) {
                    element.func = UNKNOWN_FUNCTION;
                }
                stack.push(element);
            }
        }
        if (!stack.length) {
            return null;
        }
        return {
            message: extractMessage(ex),
            name: ex.name,
            stack,
        };
    }
    /** Remove N number of frames from the stack */
    function popFrames(stacktrace, popSize) {
        try {
            return Object.assign(Object.assign({}, stacktrace), { stack: stacktrace.stack.slice(popSize) });
        }
        catch (e) {
            return stacktrace;
        }
    }
    /**
     * There are cases where stacktrace.message is an Event object
     * https://github.com/getsentry/sentry-javascript/issues/1949
     * In this specific case we try to extract stacktrace.message.error.message
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function extractMessage(ex) {
        const message = ex && ex.message;
        if (!message) {
            return 'No error message';
        }
        if (message.error && typeof message.error.message === 'string') {
            return message.error.message;
        }
        return message;
    }
  
    const STACKTRACE_LIMIT = 50;
    /**
     * This function creates an exception from an TraceKitStackTrace
     * @param stacktrace TraceKitStackTrace that will be converted to an exception
     * @hidden
     */
    function exceptionFromStacktrace(stacktrace) {
        const frames = prepareFramesForEvent(stacktrace.stack);
        const exception = {
            type: stacktrace.name,
            value: stacktrace.message,
        };
        if (frames && frames.length) {
            exception.stacktrace = { frames };
        }
        if (exception.type === undefined && exception.value === '') {
            exception.value = 'Unrecoverable error caught';
        }
        return exception;
    }
    /**
     * @hidden
     */
    function eventFromPlainObject(exception, syntheticException, rejection) {
        const event = {
            exception: {
                values: [
                    {
                        type: isEvent(exception) ? exception.constructor.name : rejection ? 'UnhandledRejection' : 'Error',
                        value: `Non-Error ${rejection ? 'promise rejection' : 'exception'} captured with keys: ${extractExceptionKeysForMessage(exception)}`,
                    },
                ],
            },
            extra: {
                __serialized__: normalizeToSize(exception),
            },
        };
        if (syntheticException) {
            const stacktrace = computeStackTrace(syntheticException);
            const frames = prepareFramesForEvent(stacktrace.stack);
            event.stacktrace = {
                frames,
            };
        }
        return event;
    }
    /**
     * @hidden
     */
    function eventFromStacktrace(stacktrace) {
        const exception = exceptionFromStacktrace(stacktrace);
        return {
            exception: {
                values: [exception],
            },
        };
    }
    /**
     * @hidden
     */
    function prepareFramesForEvent(stack) {
        if (!stack || !stack.length) {
            return [];
        }
        let localStack = stack;
        const firstFrameFunction = localStack[0].func || '';
        const lastFrameFunction = localStack[localStack.length - 1].func || '';
        // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
        if (firstFrameFunction.indexOf('captureMessage') !== -1 || firstFrameFunction.indexOf('captureException') !== -1) {
            localStack = localStack.slice(1);
        }
        // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
        if (lastFrameFunction.indexOf('sentryWrapped') !== -1) {
            localStack = localStack.slice(0, -1);
        }
        // The frame where the crash happened, should be the last entry in the array
        return localStack
            .slice(0, STACKTRACE_LIMIT)
            .map((frame) => ({
            colno: frame.column === null ? undefined : frame.column,
            filename: frame.url || localStack[0].url,
            function: frame.func || '?',
            in_app: true,
            lineno: frame.line === null ? undefined : frame.line,
        }))
            .reverse();
    }
  
    /**
     * Builds and Event from a Exception
     * @hidden
     */
    function eventFromException(options, exception, hint) {
        const syntheticException = (hint && hint.syntheticException) || undefined;
        const event = eventFromUnknownInput(exception, syntheticException, {
            attachStacktrace: options.attachStacktrace,
        });
        addExceptionMechanism(event, {
            handled: true,
            type: 'generic',
        });
        event.level = exports.Severity.Error;
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return SyncPromise.resolve(event);
    }
    /**
     * Builds and Event from a Message
     * @hidden
     */
    function eventFromMessage(options, message, level = exports.Severity.Info, hint) {
        const syntheticException = (hint && hint.syntheticException) || undefined;
        const event = eventFromString(message, syntheticException, {
            attachStacktrace: options.attachStacktrace,
        });
        event.level = level;
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return SyncPromise.resolve(event);
    }
    /**
     * @hidden
     */
    function eventFromUnknownInput(exception, syntheticException, options = {}) {
        let event;
        if (isErrorEvent(exception) && exception.error) {
            // If it is an ErrorEvent with `error` property, extract it to get actual Error
            const errorEvent = exception;
            // eslint-disable-next-line no-param-reassign
            exception = errorEvent.error;
            event = eventFromStacktrace(computeStackTrace(exception));
            return event;
        }
        if (isDOMError(exception) || isDOMException(exception)) {
            // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
            // then we just extract the name, code, and message, as they don't provide anything else
            // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
            // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
            const domException = exception;
            const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
            const message = domException.message ? `${name}: ${domException.message}` : name;
            event = eventFromString(message, syntheticException, options);
            addExceptionTypeValue(event, message);
            if ('code' in domException) {
                event.tags = Object.assign(Object.assign({}, event.tags), { 'DOMException.code': `${domException.code}` });
            }
            return event;
        }
        if (isError(exception)) {
            // we have a real Error object, do nothing
            event = eventFromStacktrace(computeStackTrace(exception));
            return event;
        }
        if (isPlainObject(exception) || isEvent(exception)) {
            // If it is plain Object or Event, serialize it manually and extract options
            // This will allow us to group events based on top-level keys
            // which is much better than creating new group when any key/value change
            const objectException = exception;
            event = eventFromPlainObject(objectException, syntheticException, options.rejection);
            addExceptionMechanism(event, {
                synthetic: true,
            });
            return event;
        }
        // If none of previous checks were valid, then it means that it's not:
        // - an instance of DOMError
        // - an instance of DOMException
        // - an instance of Event
        // - an instance of Error
        // - a valid ErrorEvent (one with an error property)
        // - a plain Object
        //
        // So bail out and capture it as a simple message:
        event = eventFromString(exception, syntheticException, options);
        addExceptionTypeValue(event, `${exception}`, undefined);
        addExceptionMechanism(event, {
            synthetic: true,
        });
        return event;
    }
    /**
     * @hidden
     */
    function eventFromString(input, syntheticException, options = {}) {
        const event = {
            message: input,
        };
        if (options.attachStacktrace && syntheticException) {
            const stacktrace = computeStackTrace(syntheticException);
            const frames = prepareFramesForEvent(stacktrace.stack);
            event.stacktrace = {
                frames,
            };
        }
        return event;
    }
  
    const CATEGORY_MAPPING = {
        event: 'error',
        transaction: 'transaction',
        session: 'session',
    };
    /** Base Transport class implementation */
    class BaseTransport {
        constructor(options) {
            this.options = options;
            /** A simple buffer holding all requests. */
            this._buffer = new PromiseBuffer(30);
            /** Locks transport after receiving rate limits in a response */
            this._rateLimits = {};
            this._api = new API(options.dsn, options._metadata);
            // eslint-disable-next-line deprecation/deprecation
            this.url = this._api.getStoreEndpointWithUrlEncodedAuth();
        }
        /**
         * @inheritDoc
         */
        sendEvent(_) {
            throw new SentryError('Transport Class has to implement `sendEvent` method');
        }
        /**
         * @inheritDoc
         */
        close(timeout) {
            return this._buffer.drain(timeout);
        }
        /**
         * Handle Sentry repsonse for promise-based transports.
         */
        _handleResponse({ requestType, response, headers, resolve, reject, }) {
            const status = exports.Status.fromHttpCode(response.status);
            /**
             * "The name is case-insensitive."
             * https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
             */
            const limited = this._handleRateLimit(headers);
            if (limited)
                logger.warn(`Too many requests, backing off until: ${this._disabledUntil(requestType)}`);
            if (status === exports.Status.Success) {
                resolve({ status });
                return;
            }
            reject(response);
        }
        /**
         * Gets the time that given category is disabled until for rate limiting
         */
        _disabledUntil(requestType) {
            const category = CATEGORY_MAPPING[requestType];
            return this._rateLimits[category] || this._rateLimits.all;
        }
        /**
         * Checks if a category is rate limited
         */
        _isRateLimited(requestType) {
            return this._disabledUntil(requestType) > new Date(Date.now());
        }
        /**
         * Sets internal _rateLimits from incoming headers. Returns true if headers contains a non-empty rate limiting header.
         */
        _handleRateLimit(headers) {
            const now = Date.now();
            const rlHeader = headers['x-sentry-rate-limits'];
            const raHeader = headers['retry-after'];
            if (rlHeader) {
                // rate limit headers are of the form
                //     <header>,<header>,..
                // where each <header> is of the form
                //     <retry_after>: <categories>: <scope>: <reason_code>
                // where
                //     <retry_after> is a delay in ms
                //     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
                //         <category>;<category>;...
                //     <scope> is what's being limited (org, project, or key) - ignored by SDK
                //     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
                for (const limit of rlHeader.trim().split(',')) {
                    const parameters = limit.split(':', 2);
                    const headerDelay = parseInt(parameters[0], 10);
                    const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000; // 60sec default
                    for (const category of parameters[1].split(';')) {
                        this._rateLimits[category || 'all'] = new Date(now + delay);
                    }
                }
                return true;
            }
            else if (raHeader) {
                this._rateLimits.all = new Date(now + parseRetryAfterHeader(now, raHeader));
                return true;
            }
            return false;
        }
    }
  
    /**
     * A special usecase for incorrectly wrapped Fetch APIs in conjunction with ad-blockers.
     * Whenever someone wraps the Fetch API and returns the wrong promise chain,
     * this chain becomes orphaned and there is no possible way to capture it's rejections
     * other than allowing it bubble up to this very handler. eg.
     *
     * const f = window.fetch;
     * window.fetch = function () {
     *   const p = f.apply(this, arguments);
     *
     *   p.then(function() {
     *     console.log('hi.');
     *   });
     *
     *   return p;
     * }
     *
     * `p.then(function () { ... })` is producing a completely separate promise chain,
     * however, what's returned is `p` - the result of original `fetch` call.
     *
     * This mean, that whenever we use the Fetch API to send our own requests, _and_
     * some ad-blocker blocks it, this orphaned chain will _always_ reject,
     * effectively causing another event to be captured.
     * This makes a whole process become an infinite loop, which we need to somehow
     * deal with, and break it in one way or another.
     *
     * To deal with this issue, we are making sure that we _always_ use the real
     * browser Fetch API, instead of relying on what `window.fetch` exposes.
     * The only downside to this would be missing our own requests as breadcrumbs,
     * but because we are already not doing this, it should be just fine.
     *
     * Possible failed fetch error messages per-browser:
     *
     * Chrome:  Failed to fetch
     * Edge:    Failed to Fetch
     * Firefox: NetworkError when attempting to fetch resource
     * Safari:  resource blocked by content blocker
     */
    function getNativeFetchImplementation() {
        /* eslint-disable @typescript-eslint/unbound-method */
        var _a, _b;
        // Fast path to avoid DOM I/O
        const global = getGlobalObject();
        if (isNativeFetch(global.fetch)) {
            return global.fetch.bind(global);
        }
        const document = global.document;
        let fetchImpl = global.fetch;
        // eslint-disable-next-line deprecation/deprecation
        if (typeof ((_a = document) === null || _a === void 0 ? void 0 : _a.createElement) === `function`) {
            try {
                const sandbox = document.createElement('iframe');
                sandbox.hidden = true;
                document.head.appendChild(sandbox);
                if ((_b = sandbox.contentWindow) === null || _b === void 0 ? void 0 : _b.fetch) {
                    fetchImpl = sandbox.contentWindow.fetch;
                }
                document.head.removeChild(sandbox);
            }
            catch (e) {
                logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', e);
            }
        }
        return fetchImpl.bind(global);
        /* eslint-enable @typescript-eslint/unbound-method */
    }
    /** `fetch` based transport */
    class FetchTransport extends BaseTransport {
        constructor(options, fetchImpl = getNativeFetchImplementation()) {
            super(options);
            this._fetch = fetchImpl;
        }
        /**
         * @inheritDoc
         */
        sendEvent(event) {
            return this._sendRequest(eventToSentryRequest(event, this._api), event);
        }
        /**
         * @inheritDoc
         */
        sendSession(session) {
            return this._sendRequest(sessionToSentryRequest(session, this._api), session);
        }
        /**
         * @param sentryRequest Prepared SentryRequest to be delivered
         * @param originalPayload Original payload used to create SentryRequest
         */
        _sendRequest(sentryRequest, originalPayload) {
            if (this._isRateLimited(sentryRequest.type)) {
                return Promise.reject({
                    event: originalPayload,
                    type: sentryRequest.type,
                    reason: `Transport locked till ${this._disabledUntil(sentryRequest.type)} due to too many requests.`,
                    status: 429,
                });
            }
            const options = {
                body: sentryRequest.body,
                method: 'POST',
                // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
                // https://caniuse.com/#feat=referrer-policy
                // It doesn't. And it throw exception instead of ignoring this parameter...
                // REF: https://github.com/getsentry/raven-js/issues/1233
                referrerPolicy: (supportsReferrerPolicy() ? 'origin' : ''),
            };
            if (this.options.fetchParameters !== undefined) {
                Object.assign(options, this.options.fetchParameters);
            }
            if (this.options.headers !== undefined) {
                options.headers = this.options.headers;
            }
            return this._buffer.add(new SyncPromise((resolve, reject) => {
                this._fetch(sentryRequest.url, options)
                    .then(response => {
                    const headers = {
                        'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
                        'retry-after': response.headers.get('Retry-After'),
                    };
                    this._handleResponse({
                        requestType: sentryRequest.type,
                        response,
                        headers,
                        resolve,
                        reject,
                    });
                })
                    .catch(reject);
            }));
        }
    }
  
    /** `XHR` based transport */
    class XHRTransport extends BaseTransport {
        /**
         * @inheritDoc
         */
        sendEvent(event) {
            return this._sendRequest(eventToSentryRequest(event, this._api), event);
        }
        /**
         * @inheritDoc
         */
        sendSession(session) {
            return this._sendRequest(sessionToSentryRequest(session, this._api), session);
        }
        /**
         * @param sentryRequest Prepared SentryRequest to be delivered
         * @param originalPayload Original payload used to create SentryRequest
         */
        _sendRequest(sentryRequest, originalPayload) {
            if (this._isRateLimited(sentryRequest.type)) {
                return Promise.reject({
                    event: originalPayload,
                    type: sentryRequest.type,
                    reason: `Transport locked till ${this._disabledUntil(sentryRequest.type)} due to too many requests.`,
                    status: 429,
                });
            }
            return this._buffer.add(new SyncPromise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.onreadystatechange = () => {
                    if (request.readyState === 4) {
                        const headers = {
                            'x-sentry-rate-limits': request.getResponseHeader('X-Sentry-Rate-Limits'),
                            'retry-after': request.getResponseHeader('Retry-After'),
                        };
                        this._handleResponse({ requestType: sentryRequest.type, response: request, headers, resolve, reject });
                    }
                };
                request.open('POST', sentryRequest.url);
                for (const header in this.options.headers) {
                    if (this.options.headers.hasOwnProperty(header)) {
                        request.setRequestHeader(header, this.options.headers[header]);
                    }
                }
                request.send(sentryRequest.body);
            }));
        }
    }
  
  
  
    var index = /*#__PURE__*/Object.freeze({
      __proto__: null,
      BaseTransport: BaseTransport,
      FetchTransport: FetchTransport,
      XHRTransport: XHRTransport
    });
  
    /**
     * The Sentry Browser SDK Backend.
     * @hidden
     */
    class BrowserBackend extends BaseBackend {
        /**
         * @inheritDoc
         */
        eventFromException(exception, hint) {
            return eventFromException(this._options, exception, hint);
        }
        /**
         * @inheritDoc
         */
        eventFromMessage(message, level = exports.Severity.Info, hint) {
            return eventFromMessage(this._options, message, level, hint);
        }
        /**
         * @inheritDoc
         */
        _setupTransport() {
            if (!this._options.dsn) {
                // We return the noop transport here in case there is no Dsn.
                return super._setupTransport();
            }
            const transportOptions = Object.assign(Object.assign({}, this._options.transportOptions), { dsn: this._options.dsn, _metadata: this._options._metadata });
            if (this._options.transport) {
                return new this._options.transport(transportOptions);
            }
            if (supportsFetch()) {
                return new FetchTransport(transportOptions);
            }
            return new XHRTransport(transportOptions);
        }
    }
  
    let ignoreOnError = 0;
    /**
     * @hidden
     */
    function shouldIgnoreOnError() {
        return ignoreOnError > 0;
    }
    /**
     * @hidden
     */
    function ignoreNextOnError() {
        // onerror should trigger before setTimeout
        ignoreOnError += 1;
        setTimeout(() => {
            ignoreOnError -= 1;
        });
    }
    /**
     * Instruments the given function and sends an event to Sentry every time the
     * function throws an exception.
     *
     * @param fn A function to wrap.
     * @returns The wrapped function.
     * @hidden
     */
    function wrap(fn, options = {}, before) {
        if (typeof fn !== 'function') {
            return fn;
        }
        try {
            // We don't wanna wrap it twice
            if (fn.__sentry__) {
                return fn;
            }
            // If this has already been wrapped in the past, return that wrapped function
            if (fn.__sentry_wrapped__) {
                return fn.__sentry_wrapped__;
            }
        }
        catch (e) {
            // Just accessing custom props in some Selenium environments
            // can cause a "Permission denied" exception (see raven-js#495).
            // Bail on wrapping and return the function as-is (defers to window.onerror).
            return fn;
        }
        /* eslint-disable prefer-rest-params */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sentryWrapped = function () {
            const args = Array.prototype.slice.call(arguments);
            try {
                if (before && typeof before === 'function') {
                    before.apply(this, arguments);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                const wrappedArguments = args.map((arg) => wrap(arg, options));
                if (fn.handleEvent) {
                    // Attempt to invoke user-land function
                    // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
                    //       means the sentry.javascript SDK caught an error invoking your application code. This
                    //       is expected behavior and NOT indicative of a bug with sentry.javascript.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    return fn.handleEvent.apply(this, wrappedArguments);
                }
                // Attempt to invoke user-land function
                // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
                //       means the sentry.javascript SDK caught an error invoking your application code. This
                //       is expected behavior and NOT indicative of a bug with sentry.javascript.
                return fn.apply(this, wrappedArguments);
            }
            catch (ex) {
                ignoreNextOnError();
                withScope((scope) => {
                    scope.addEventProcessor((event) => {
                        const processedEvent = Object.assign({}, event);
                        if (options.mechanism) {
                            addExceptionTypeValue(processedEvent, undefined, undefined);
                            addExceptionMechanism(processedEvent, options.mechanism);
                        }
                        processedEvent.extra = Object.assign(Object.assign({}, processedEvent.extra), { arguments: args });
                        return processedEvent;
                    });
                    captureException(ex);
                });
                throw ex;
            }
        };
        /* eslint-enable prefer-rest-params */
        // Accessing some objects may throw
        // ref: https://github.com/getsentry/sentry-javascript/issues/1168
        try {
            for (const property in fn) {
                if (Object.prototype.hasOwnProperty.call(fn, property)) {
                    sentryWrapped[property] = fn[property];
                }
            }
        }
        catch (_oO) { } // eslint-disable-line no-empty
        fn.prototype = fn.prototype || {};
        sentryWrapped.prototype = fn.prototype;
        Object.defineProperty(fn, '__sentry_wrapped__', {
            enumerable: false,
            value: sentryWrapped,
        });
        // Signal that this function has been wrapped/filled already
        // for both debugging and to prevent it to being wrapped/filled twice
        Object.defineProperties(sentryWrapped, {
            __sentry__: {
                enumerable: false,
                value: true,
            },
            __sentry_original__: {
                enumerable: false,
                value: fn,
            },
        });
        // Restore original function name (not all browsers allow that)
        try {
            const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
            if (descriptor.configurable) {
                Object.defineProperty(sentryWrapped, 'name', {
                    get() {
                        return fn.name;
                    },
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (_oO) { }
        return sentryWrapped;
    }
    /**
     * Injects the Report Dialog script
     * @hidden
     */
    function injectReportDialog(options = {}) {
        if (!options.eventId) {
            logger.error(`Missing eventId option in showReportDialog call`);
            return;
        }
        if (!options.dsn) {
            logger.error(`Missing dsn option in showReportDialog call`);
            return;
        }
        const script = document.createElement('script');
        script.async = true;
        script.src = new API(options.dsn).getReportDialogEndpoint(options);
        if (options.onLoad) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            script.onload = options.onLoad;
        }
        (document.head || document.body).appendChild(script);
    }
  
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /** Global handlers */
    class GlobalHandlers {
        /** JSDoc */
        constructor(options) {
            /**
             * @inheritDoc
             */
            this.name = GlobalHandlers.id;
            /** JSDoc */
            this._onErrorHandlerInstalled = false;
            /** JSDoc */
            this._onUnhandledRejectionHandlerInstalled = false;
            this._options = Object.assign({ onerror: true, onunhandledrejection: true }, options);
        }
        /**
         * @inheritDoc
         */
        setupOnce() {
            Error.stackTraceLimit = 50;
            if (this._options.onerror) {
                logger.log('Global Handler attached: onerror');
                this._installGlobalOnErrorHandler();
            }
            if (this._options.onunhandledrejection) {
                logger.log('Global Handler attached: onunhandledrejection');
                this._installGlobalOnUnhandledRejectionHandler();
            }
        }
        /** JSDoc */
        _installGlobalOnErrorHandler() {
            if (this._onErrorHandlerInstalled) {
                return;
            }
            addInstrumentationHandler({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback: (data) => {
                    const error = data.error;
                    const currentHub = getCurrentHub();
                    const hasIntegration = currentHub.getIntegration(GlobalHandlers);
                    const isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
                    if (!hasIntegration || shouldIgnoreOnError() || isFailedOwnDelivery) {
                        return;
                    }
                    const client = currentHub.getClient();
                    const event = isPrimitive(error)
                        ? this._eventFromIncompleteOnError(data.msg, data.url, data.line, data.column)
                        : this._enhanceEventWithInitialFrame(eventFromUnknownInput(error, undefined, {
                            attachStacktrace: client && client.getOptions().attachStacktrace,
                            rejection: false,
                        }), data.url, data.line, data.column);
                    addExceptionMechanism(event, {
                        handled: false,
                        type: 'onerror',
                    });
                    currentHub.captureEvent(event, {
                        originalException: error,
                    });
                },
                type: 'error',
            });
            this._onErrorHandlerInstalled = true;
        }
        /** JSDoc */
        _installGlobalOnUnhandledRejectionHandler() {
            if (this._onUnhandledRejectionHandlerInstalled) {
                return;
            }
            addInstrumentationHandler({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback: (e) => {
                    let error = e;
                    // dig the object of the rejection out of known event types
                    try {
                        // PromiseRejectionEvents store the object of the rejection under 'reason'
                        // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                        if ('reason' in e) {
                            error = e.reason;
                        }
                        // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
                        // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
                        // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
                        // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
                        // https://github.com/getsentry/sentry-javascript/issues/2380
                        else if ('detail' in e && 'reason' in e.detail) {
                            error = e.detail.reason;
                        }
                    }
                    catch (_oO) {
                        // no-empty
                    }
                    const currentHub = getCurrentHub();
                    const hasIntegration = currentHub.getIntegration(GlobalHandlers);
                    const isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
                    if (!hasIntegration || shouldIgnoreOnError() || isFailedOwnDelivery) {
                        return true;
                    }
                    const client = currentHub.getClient();
                    const event = isPrimitive(error)
                        ? this._eventFromRejectionWithPrimitive(error)
                        : eventFromUnknownInput(error, undefined, {
                            attachStacktrace: client && client.getOptions().attachStacktrace,
                            rejection: true,
                        });
                    event.level = exports.Severity.Error;
                    addExceptionMechanism(event, {
                        handled: false,
                        type: 'onunhandledrejection',
                    });
                    currentHub.captureEvent(event, {
                        originalException: error,
                    });
                    return;
                },
                type: 'unhandledrejection',
            });
            this._onUnhandledRejectionHandlerInstalled = true;
        }
        /**
         * This function creates a stack from an old, error-less onerror handler.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _eventFromIncompleteOnError(msg, url, line, column) {
            const ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
            // If 'message' is ErrorEvent, get real message from inside
            let message = isErrorEvent(msg) ? msg.message : msg;
            let name;
            if (isString(message)) {
                const groups = message.match(ERROR_TYPES_RE);
                if (groups) {
                    name = groups[1];
                    message = groups[2];
                }
            }
            const event = {
                exception: {
                    values: [
                        {
                            type: name || 'Error',
                            value: message,
                        },
                    ],
                },
            };
            return this._enhanceEventWithInitialFrame(event, url, line, column);
        }
        /**
         * Create an event from a promise rejection where the `reason` is a primitive.
         *
         * @param reason: The `reason` property of the promise rejection
         * @returns An Event object with an appropriate `exception` value
         */
        _eventFromRejectionWithPrimitive(reason) {
            return {
                exception: {
                    values: [
                        {
                            type: 'UnhandledRejection',
                            // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
                            value: `Non-Error promise rejection captured with value: ${String(reason)}`,
                        },
                    ],
                },
            };
        }
        /** JSDoc */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _enhanceEventWithInitialFrame(event, url, line, column) {
            event.exception = event.exception || {};
            event.exception.values = event.exception.values || [];
            event.exception.values[0] = event.exception.values[0] || {};
            event.exception.values[0].stacktrace = event.exception.values[0].stacktrace || {};
            event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames || [];
            const colno = isNaN(parseInt(column, 10)) ? undefined : column;
            const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
            const filename = isString(url) && url.length > 0 ? url : getLocationHref();
            if (event.exception.values[0].stacktrace.frames.length === 0) {
                event.exception.values[0].stacktrace.frames.push({
                    colno,
                    filename,
                    function: '?',
                    in_app: true,
                    lineno,
                });
            }
            return event;
        }
    }
    /**
     * @inheritDoc
     */
    GlobalHandlers.id = 'GlobalHandlers';
  
    const DEFAULT_EVENT_TARGET = [
        'EventTarget',
        'Window',
        'Node',
        'ApplicationCache',
        'AudioTrackList',
        'ChannelMergerNode',
        'CryptoOperation',
        'EventSource',
        'FileReader',
        'HTMLUnknownElement',
        'IDBDatabase',
        'IDBRequest',
        'IDBTransaction',
        'KeyOperation',
        'MediaController',
        'MessagePort',
        'ModalWindow',
        'Notification',
        'SVGElementInstance',
        'Screen',
        'TextTrack',
        'TextTrackCue',
        'TextTrackList',
        'WebSocket',
        'WebSocketWorker',
        'Worker',
        'XMLHttpRequest',
        'XMLHttpRequestEventTarget',
        'XMLHttpRequestUpload',
    ];
    /** Wrap timer functions and event targets to catch errors and provide better meta data */
    class TryCatch {
        /**
         * @inheritDoc
         */
        constructor(options) {
            /**
             * @inheritDoc
             */
            this.name = TryCatch.id;
            this._options = Object.assign({ XMLHttpRequest: true, eventTarget: true, requestAnimationFrame: true, setInterval: true, setTimeout: true }, options);
        }
        /**
         * Wrap timer functions and event targets to catch errors
         * and provide better metadata.
         */
        setupOnce() {
            const global = getGlobalObject();
            if (this._options.setTimeout) {
                fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
            }
            if (this._options.setInterval) {
                fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
            }
            if (this._options.requestAnimationFrame) {
                fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));
            }
            if (this._options.XMLHttpRequest && 'XMLHttpRequest' in global) {
                fill(XMLHttpRequest.prototype, 'send', this._wrapXHR.bind(this));
            }
            if (this._options.eventTarget) {
                const eventTarget = Array.isArray(this._options.eventTarget) ? this._options.eventTarget : DEFAULT_EVENT_TARGET;
                eventTarget.forEach(this._wrapEventTarget.bind(this));
            }
        }
        /** JSDoc */
        _wrapTimeFunction(original) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return function (...args) {
                const originalCallback = args[0];
                args[0] = wrap(originalCallback, {
                    mechanism: {
                        data: { function: getFunctionName(original) },
                        handled: true,
                        type: 'instrument',
                    },
                });
                return original.apply(this, args);
            };
        }
        /** JSDoc */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _wrapRAF(original) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return function (callback) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return original.call(this, wrap(callback, {
                    mechanism: {
                        data: {
                            function: 'requestAnimationFrame',
                            handler: getFunctionName(original),
                        },
                        handled: true,
                        type: 'instrument',
                    },
                }));
            };
        }
        /** JSDoc */
        _wrapEventTarget(target) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const global = getGlobalObject();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const proto = global[target] && global[target].prototype;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
                return;
            }
            fill(proto, 'addEventListener', function (original) {
                return function (eventName, fn, options) {
                    try {
                        if (typeof fn.handleEvent === 'function') {
                            fn.handleEvent = wrap(fn.handleEvent.bind(fn), {
                                mechanism: {
                                    data: {
                                        function: 'handleEvent',
                                        handler: getFunctionName(fn),
                                        target,
                                    },
                                    handled: true,
                                    type: 'instrument',
                                },
                            });
                        }
                    }
                    catch (err) {
                        // can sometimes get 'Permission denied to access property "handle Event'
                    }
                    return original.call(this, eventName, 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrap(fn, {
                        mechanism: {
                            data: {
                                function: 'addEventListener',
                                handler: getFunctionName(fn),
                                target,
                            },
                            handled: true,
                            type: 'instrument',
                        },
                    }), options);
                };
            });
            fill(proto, 'removeEventListener', function (originalRemoveEventListener) {
                return function (eventName, fn, options) {
                    var _a;
                    /**
                     * There are 2 possible scenarios here:
                     *
                     * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
                     * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
                     * as a pass-through, and call original `removeEventListener` with it.
                     *
                     * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
                     * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
                     * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
                     * in order for us to make a distinction between wrapped/non-wrapped functions possible.
                     * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
                     *
                     * When someone adds a handler prior to initialization, and then do it again, but after,
                     * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
                     * to get rid of the initial handler and it'd stick there forever.
                     */
                    const wrappedEventHandler = fn;
                    try {
                        const originalEventHandler = (_a = wrappedEventHandler) === null || _a === void 0 ? void 0 : _a.__sentry_wrapped__;
                        if (originalEventHandler) {
                            originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
                        }
                    }
                    catch (e) {
                        // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                    }
                    return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
                };
            });
        }
        /** JSDoc */
        _wrapXHR(originalSend) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return function (...args) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const xhr = this;
                const xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
                xmlHttpRequestProps.forEach(prop => {
                    if (prop in xhr && typeof xhr[prop] === 'function') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        fill(xhr, prop, function (original) {
                            const wrapOptions = {
                                mechanism: {
                                    data: {
                                        function: prop,
                                        handler: getFunctionName(original),
                                    },
                                    handled: true,
                                    type: 'instrument',
                                },
                            };
                            // If Instrument integration has been called before TryCatch, get the name of original function
                            if (original.__sentry_original__) {
                                wrapOptions.mechanism.data.handler = getFunctionName(original.__sentry_original__);
                            }
                            // Otherwise wrap directly
                            return wrap(original, wrapOptions);
                        });
                    }
                });
                return originalSend.apply(this, args);
            };
        }
    }
    /**
     * @inheritDoc
     */
    TryCatch.id = 'TryCatch';
  
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /**
     * Default Breadcrumbs instrumentations
     * TODO: Deprecated - with v6, this will be renamed to `Instrument`
     */
    class Breadcrumbs {
        /**
         * @inheritDoc
         */
        constructor(options) {
            /**
             * @inheritDoc
             */
            this.name = Breadcrumbs.id;
            this._options = Object.assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
        }
        /**
         * Create a breadcrumb of `sentry` from the events themselves
         */
        addSentryBreadcrumb(event) {
            if (!this._options.sentry) {
                return;
            }
            getCurrentHub().addBreadcrumb({
                category: `sentry.${event.type === 'transaction' ? 'transaction' : 'event'}`,
                event_id: event.event_id,
                level: event.level,
                message: getEventDescription(event),
            }, {
                event,
            });
        }
        /**
         * Instrument browser built-ins w/ breadcrumb capturing
         *  - Console API
         *  - DOM API (click/typing)
         *  - XMLHttpRequest API
         *  - Fetch API
         *  - History API
         */
        setupOnce() {
            if (this._options.console) {
                addInstrumentationHandler({
                    callback: (...args) => {
                        this._consoleBreadcrumb(...args);
                    },
                    type: 'console',
                });
            }
            if (this._options.dom) {
                addInstrumentationHandler({
                    callback: (...args) => {
                        this._domBreadcrumb(...args);
                    },
                    type: 'dom',
                });
            }
            if (this._options.xhr) {
                addInstrumentationHandler({
                    callback: (...args) => {
                        this._xhrBreadcrumb(...args);
                    },
                    type: 'xhr',
                });
            }
            if (this._options.fetch) {
                addInstrumentationHandler({
                    callback: (...args) => {
                        this._fetchBreadcrumb(...args);
                    },
                    type: 'fetch',
                });
            }
            if (this._options.history) {
                addInstrumentationHandler({
                    callback: (...args) => {
                        this._historyBreadcrumb(...args);
                    },
                    type: 'history',
                });
            }
        }
        /**
         * Creates breadcrumbs from console API calls
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _consoleBreadcrumb(handlerData) {
            const breadcrumb = {
                category: 'console',
                data: {
                    arguments: handlerData.args,
                    logger: 'console',
                },
                level: exports.Severity.fromString(handlerData.level),
                message: safeJoin(handlerData.args, ' '),
            };
            if (handlerData.level === 'assert') {
                if (handlerData.args[0] === false) {
                    breadcrumb.message = `Assertion failed: ${safeJoin(handlerData.args.slice(1), ' ') || 'console.assert'}`;
                    breadcrumb.data.arguments = handlerData.args.slice(1);
                }
                else {
                    // Don't capture a breadcrumb for passed assertions
                    return;
                }
            }
            getCurrentHub().addBreadcrumb(breadcrumb, {
                input: handlerData.args,
                level: handlerData.level,
            });
        }
        /**
         * Creates breadcrumbs from DOM API calls
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _domBreadcrumb(handlerData) {
            let target;
            // Accessing event.target can throw (see getsentry/raven-js#838, #768)
            try {
                target = handlerData.event.target
                    ? htmlTreeAsString(handlerData.event.target)
                    : htmlTreeAsString(handlerData.event);
            }
            catch (e) {
                target = '<unknown>';
            }
            if (target.length === 0) {
                return;
            }
            getCurrentHub().addBreadcrumb({
                category: `ui.${handlerData.name}`,
                message: target,
            }, {
                event: handlerData.event,
                name: handlerData.name,
                global: handlerData.global,
            });
        }
        /**
         * Creates breadcrumbs from XHR API calls
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _xhrBreadcrumb(handlerData) {
            if (handlerData.endTimestamp) {
                // We only capture complete, non-sentry requests
                if (handlerData.xhr.__sentry_own_request__) {
                    return;
                }
                const { method, url, status_code, body } = handlerData.xhr.__sentry_xhr__ || {};
                getCurrentHub().addBreadcrumb({
                    category: 'xhr',
                    data: {
                        method,
                        url,
                        status_code,
                    },
                    type: 'http',
                }, {
                    xhr: handlerData.xhr,
                    input: body,
                });
                return;
            }
        }
        /**
         * Creates breadcrumbs from fetch API calls
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _fetchBreadcrumb(handlerData) {
            // We only capture complete fetch requests
            if (!handlerData.endTimestamp) {
                return;
            }
            if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
                // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
                return;
            }
            if (handlerData.error) {
                getCurrentHub().addBreadcrumb({
                    category: 'fetch',
                    data: handlerData.fetchData,
                    level: exports.Severity.Error,
                    type: 'http',
                }, {
                    data: handlerData.error,
                    input: handlerData.args,
                });
            }
            else {
                getCurrentHub().addBreadcrumb({
                    category: 'fetch',
                    data: Object.assign(Object.assign({}, handlerData.fetchData), { status_code: handlerData.response.status }),
                    type: 'http',
                }, {
                    input: handlerData.args,
                    response: handlerData.response,
                });
            }
        }
        /**
         * Creates breadcrumbs from history API calls
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _historyBreadcrumb(handlerData) {
            const global = getGlobalObject();
            let from = handlerData.from;
            let to = handlerData.to;
            const parsedLoc = parseUrl(global.location.href);
            let parsedFrom = parseUrl(from);
            const parsedTo = parseUrl(to);
            // Initial pushState doesn't provide `from` information
            if (!parsedFrom.path) {
                parsedFrom = parsedLoc;
            }
            // Use only the path component of the URL if the URL matches the current
            // document (almost all the time when using pushState)
            if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
                to = parsedTo.relative;
            }
            if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
                from = parsedFrom.relative;
            }
            getCurrentHub().addBreadcrumb({
                category: 'navigation',
                data: {
                    from,
                    to,
                },
            });
        }
    }
    /**
     * @inheritDoc
     */
    Breadcrumbs.id = 'Breadcrumbs';
  
    const DEFAULT_KEY = 'cause';
    const DEFAULT_LIMIT = 5;
    /** Adds SDK info to an event. */
    class LinkedErrors {
        /**
         * @inheritDoc
         */
        constructor(options = {}) {
            /**
             * @inheritDoc
             */
            this.name = LinkedErrors.id;
            this._key = options.key || DEFAULT_KEY;
            this._limit = options.limit || DEFAULT_LIMIT;
        }
        /**
         * @inheritDoc
         */
        setupOnce() {
            addGlobalEventProcessor((event, hint) => {
                const self = getCurrentHub().getIntegration(LinkedErrors);
                if (self) {
                    return self._handler(event, hint);
                }
                return event;
            });
        }
        /**
         * @inheritDoc
         */
        _handler(event, hint) {
            if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) {
                return event;
            }
            const linkedErrors = this._walkErrorTree(hint.originalException, this._key);
            event.exception.values = [...linkedErrors, ...event.exception.values];
            return event;
        }
        /**
         * @inheritDoc
         */
        _walkErrorTree(error, key, stack = []) {
            if (!isInstanceOf(error[key], Error) || stack.length + 1 >= this._limit) {
                return stack;
            }
            const stacktrace = computeStackTrace(error[key]);
            const exception = exceptionFromStacktrace(stacktrace);
            return this._walkErrorTree(error[key], key, [exception, ...stack]);
        }
    }
    /**
     * @inheritDoc
     */
    LinkedErrors.id = 'LinkedErrors';
  
    const global$3 = getGlobalObject();
    /** UserAgent */
    class UserAgent {
        constructor() {
            /**
             * @inheritDoc
             */
            this.name = UserAgent.id;
        }
        /**
         * @inheritDoc
         */
        setupOnce() {
            addGlobalEventProcessor((event) => {
                var _a, _b, _c;
                if (getCurrentHub().getIntegration(UserAgent)) {
                    // if none of the information we want exists, don't bother
                    if (!global$3.navigator && !global$3.location && !global$3.document) {
                        return event;
                    }
                    // grab as much info as exists and add it to the event
                    const url = ((_a = event.request) === null || _a === void 0 ? void 0 : _a.url) || ((_b = global$3.location) === null || _b === void 0 ? void 0 : _b.href);
                    const { referrer } = global$3.document || {};
                    const { userAgent } = global$3.navigator || {};
                    const headers = Object.assign(Object.assign(Object.assign({}, (_c = event.request) === null || _c === void 0 ? void 0 : _c.headers), (referrer && { Referer: referrer })), (userAgent && { 'User-Agent': userAgent }));
                    const request = Object.assign(Object.assign({}, (url && { url })), { headers });
                    return Object.assign(Object.assign({}, event), { request });
                }
                return event;
            });
        }
    }
    /**
     * @inheritDoc
     */
    UserAgent.id = 'UserAgent';
  
  
  
    var BrowserIntegrations = /*#__PURE__*/Object.freeze({
      __proto__: null,
      GlobalHandlers: GlobalHandlers,
      TryCatch: TryCatch,
      Breadcrumbs: Breadcrumbs,
      LinkedErrors: LinkedErrors,
      UserAgent: UserAgent
    });
  
    /**
     * The Sentry Browser SDK Client.
     *
     * @see BrowserOptions for documentation on configuration options.
     * @see SentryClient for usage documentation.
     */
    class BrowserClient extends BaseClient {
        /**
         * Creates a new Browser SDK instance.
         *
         * @param options Configuration options for this SDK.
         */
        constructor(options = {}) {
            options._metadata = options._metadata || {};
            options._metadata.sdk = options._metadata.sdk || {
                name: 'sentry.javascript.browser',
                packages: [
                    {
                        name: 'npm:@sentry/browser',
                        version: SDK_VERSION,
                    },
                ],
                version: SDK_VERSION,
            };
            super(BrowserBackend, options);
        }
        /**
         * Show a report dialog to the user to send feedback to a specific event.
         *
         * @param options Set individual options for the dialog
         */
        showReportDialog(options = {}) {
            // doesn't work without a document (React Native)
            const document = getGlobalObject().document;
            if (!document) {
                return;
            }
            if (!this._isEnabled()) {
                logger.error('Trying to call showReportDialog with Sentry Client disabled');
                return;
            }
            injectReportDialog(Object.assign(Object.assign({}, options), { dsn: options.dsn || this.getDsn() }));
        }
        /**
         * @inheritDoc
         */
        _prepareEvent(event, scope, hint) {
            event.platform = event.platform || 'javascript';
            return super._prepareEvent(event, scope, hint);
        }
        /**
         * @inheritDoc
         */
        _sendEvent(event) {
            const integration = this.getIntegration(Breadcrumbs);
            if (integration) {
                integration.addSentryBreadcrumb(event);
            }
            super._sendEvent(event);
        }
    }
  
    const defaultIntegrations = [
        new InboundFilters(),
        new FunctionToString(),
        new TryCatch(),
        new Breadcrumbs(),
        new GlobalHandlers(),
        new LinkedErrors(),
        new UserAgent(),
    ];
    /**
     * The Sentry Browser SDK Client.
     *
     * To use this SDK, call the {@link init} function as early as possible when
     * loading the web page. To set context information or send manual events, use
     * the provided methods.
     *
     * @example
     *
     * ```
     *
     * import { init } from '@sentry/browser';
     *
     * init({
     *   dsn: '__DSN__',
     *   // ...
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { configureScope } from '@sentry/browser';
     * configureScope((scope: Scope) => {
     *   scope.setExtra({ battery: 0.7 });
     *   scope.setTag({ user_mode: 'admin' });
     *   scope.setUser({ id: '4711' });
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { addBreadcrumb } from '@sentry/browser';
     * addBreadcrumb({
     *   message: 'My Breadcrumb',
     *   // ...
     * });
     * ```
     *
     * @example
     *
     * ```
     *
     * import * as Sentry from '@sentry/browser';
     * Sentry.captureMessage('Hello, world!');
     * Sentry.captureException(new Error('Good bye'));
     * Sentry.captureEvent({
     *   message: 'Manual',
     *   stacktrace: [
     *     // ...
     *   ],
     * });
     * ```
     *
     * @see {@link BrowserOptions} for documentation on configuration options.
     */
    function init(options = {}) {
        if (options.defaultIntegrations === undefined) {
            options.defaultIntegrations = defaultIntegrations;
        }
        if (options.release === undefined) {
            const window = getGlobalObject();
            // This supports the variable that sentry-webpack-plugin injects
            if (window.SENTRY_RELEASE && window.SENTRY_RELEASE.id) {
                options.release = window.SENTRY_RELEASE.id;
            }
        }
        if (options.autoSessionTracking === undefined) {
            options.autoSessionTracking = true;
        }
        initAndBind(BrowserClient, options);
        if (options.autoSessionTracking) {
            startSessionTracking();
        }
    }
    /**
     * Present the user with a report dialog.
     *
     * @param options Everything is optional, we try to fetch all info need from the global scope.
     */
    function showReportDialog(options = {}) {
        if (!options.eventId) {
            options.eventId = getCurrentHub().lastEventId();
        }
        const client = getCurrentHub().getClient();
        if (client) {
            client.showReportDialog(options);
        }
    }
    /**
     * This is the getter for lastEventId.
     *
     * @returns The last event id of a captured event.
     */
    function lastEventId() {
        return getCurrentHub().lastEventId();
    }
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function forceLoad() {
        // Noop
    }
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function onLoad(callback) {
        callback();
    }
    /**
     * A promise that resolves when all current events have been sent.
     * If you provide a timeout and the queue takes longer to drain the promise returns false.
     *
     * @param timeout Maximum time in ms the client should wait.
     */
    function flush(timeout) {
        const client = getCurrentHub().getClient();
        if (client) {
            return client.flush(timeout);
        }
        return SyncPromise.reject(false);
    }
    /**
     * A promise that resolves when all current events have been sent.
     * If you provide a timeout and the queue takes longer to drain the promise returns false.
     *
     * @param timeout Maximum time in ms the client should wait.
     */
    function close(timeout) {
        const client = getCurrentHub().getClient();
        if (client) {
            return client.close(timeout);
        }
        return SyncPromise.reject(false);
    }
    /**
     * Wrap code within a try/catch block so the SDK is able to capture errors.
     *
     * @param fn A function to wrap.
     *
     * @returns The result of wrapped function call.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function wrap$1(fn) {
        return wrap(fn)();
    }
    /**
     * Enable automatic Session Tracking for the initial page load.
     */
    function startSessionTracking() {
        const window = getGlobalObject();
        const document = window.document;
        if (typeof document === 'undefined') {
            logger.warn('Session tracking in non-browser environment with @sentry/browser is not supported.');
            return;
        }
        const hub = getCurrentHub();
        // The only way for this to be false is for there to be a version mismatch between @sentry/browser (>= 6.0.0) and
        // @sentry/hub (< 5.27.0). In the simple case, there won't ever be such a mismatch, because the two packages are
        // pinned at the same version in package.json, but there are edge cases where it's possible. See
        // https://github.com/getsentry/sentry-javascript/issues/3207 and
        // https://github.com/getsentry/sentry-javascript/issues/3234 and
        // https://github.com/getsentry/sentry-javascript/issues/3278.
        if (typeof hub.startSession !== 'function' || typeof hub.captureSession !== 'function') {
            return;
        }
        hub.startSession();
        hub.captureSession();
        // We want to create a session for every navigation as well
        addInstrumentationHandler({
            callback: () => {
                hub.startSession();
                hub.captureSession();
            },
            type: 'history',
        });
    }
  
    // TODO: Remove in the next major release and rely only on @sentry/core SDK_VERSION and SdkInfo metadata
    const SDK_NAME = 'sentry.javascript.browser';
  
    let windowIntegrations = {};
    // This block is needed to add compatibility with the integrations packages when used with a CDN
    const _window = getGlobalObject();
    if (_window.Sentry && _window.Sentry.Integrations) {
        windowIntegrations = _window.Sentry.Integrations;
    }
    const INTEGRATIONS = Object.assign(Object.assign(Object.assign({}, windowIntegrations), CoreIntegrations), BrowserIntegrations);
  
    exports.BrowserClient = BrowserClient;
    exports.Hub = Hub;
    exports.Integrations = INTEGRATIONS;
    exports.SDK_NAME = SDK_NAME;
    exports.SDK_VERSION = SDK_VERSION;
    exports.Scope = Scope;
    exports.Transports = index;
    exports.addBreadcrumb = addBreadcrumb;
    exports.addGlobalEventProcessor = addGlobalEventProcessor;
    exports.captureEvent = captureEvent;
    exports.captureException = captureException;
    exports.captureMessage = captureMessage;
    exports.close = close;
    exports.configureScope = configureScope;
    exports.defaultIntegrations = defaultIntegrations;
    exports.eventFromException = eventFromException;
    exports.eventFromMessage = eventFromMessage;
    exports.flush = flush;
    exports.forceLoad = forceLoad;
    exports.getCurrentHub = getCurrentHub;
    exports.getHubFromCarrier = getHubFromCarrier;
    exports.init = init;
    exports.injectReportDialog = injectReportDialog;
    exports.lastEventId = lastEventId;
    exports.makeMain = makeMain;
    exports.onLoad = onLoad;
    exports.setContext = setContext;
    exports.setExtra = setExtra;
    exports.setExtras = setExtras;
    exports.setTag = setTag;
    exports.setTags = setTags;
    exports.setUser = setUser;
    exports.showReportDialog = showReportDialog;
    exports.startTransaction = startTransaction;
    exports.withScope = withScope;
    exports.wrap = wrap$1;
  
    return exports;
  
  }({}));
  //# sourceMappingURL=bundle.es6.js.map