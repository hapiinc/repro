/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * Augments the Function type object's prototype with a method called "method."
 * This method allows any Constructor Function, that prototypally inherits from
 * Function.prototype (so all Constructor Functions), to easily add methods to
 * their own prototype objects.
 *
 * @param name is the name of the method passed as a String object argument.
 * @param func is the first-class function object passed in as an argument.
 * @return {*} a reference to your respective Constructor Function.
 */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Module Dependencies.
 */
var uri = require('url');

/**
 * Repro is a Reverse Proxy Route Table responsible for routing to targets based on protocol request headers.
 *
 * Routes and Targets should ideally be represented by Uniform Resource Locator (URL) syntax and semantics.
 * References:
 * - http://en.wikipedia.org/wiki/Uniform_resource_locator
 * - http://www.ietf.org/rfc/rfc2396.txt
 *
 * Every HTTP URL consists of the following, in the given order.
 * Several schemes other than HTTP also share this general format, with some variation.
 * - Scheme ("http", "https", "ssh", ...)
 * - "://"
 * - Host ("www.google.com", "173.194.34.5", ...)
 * - Port (80, 443, 22, ...)
 * - Path ("/", "/users/johndoe", ...)
 * - Query String ("?first_name=John&last_name=Doe", ...)
 * - Fragment Identifier ("#johndoe", ...)
 *
 * Scheme means HOW to connect.
 * Host, Port means WHERE to connect.
 * Path, Query String, Fragment Identifier means WHAT to ask for.
 *
 * Syntax:
 * scheme://host:port/path?query_string#fragment_id
 *
 * Details:
 * The Scheme, often referred to as protocol, defines how the resource will be obtained.
 * Schemes are case-insensitive. The canonical form is lowercase.
 *
 * The Host, domain name or IP address, gives the destination location for the URL.
 * A literal numeric IPv6 address may be given, but must be enclosed in [ ] e.g. [db8:0cec::99:123a].
 * Hosts are case-insensitive. DNS ignores case.
 *
 * The Port, given in decimal, is optional.
 * If omitted, the default for the scheme is used.
 *
 * The Path is used to specify and perhaps find the resource requested.
 * Paths are case-sensitive.
 *
 * The Query String contains data to be passed to software running on the server.
 *
 * The Fragment Identifier specifies a part or a position within the overall resource or document.
 *
 * @return {*} for chaining.
 * @constructor
 */
function Repro() {
    this._scheme = 'http';
    this._host = '127.0.0.1';
    this._port = '80';
    this._isScheme = /^[a-zA-Z]([a-zA-Z0-9\+\-\.])*$/;
    this._isHost =
        /^(([a-zA-Z0-9](?:([a-zA-Z0-9\-])*[a-zA-Z0-9])?\.)*[a-zA-Z](?:([a-zA-Z0-9\-])*[a-zA-Z0-9])?\.?|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/;
    this._isPort = /^[0-9]+$/;
    this._isHostPort =
        /^(([a-zA-Z0-9](?:([a-zA-Z0-9\-])*[a-zA-Z0-9])?\.)*[a-zA-Z](?:([a-zA-Z0-9\-])*[a-zA-Z0-9])?\.?|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)(?::[0-9]+)?$/;
    this._routes = {};
    return this;
}

/**
 * Accessor method that allows for the setting of the default scheme (protocol) for all routes and targets.
 *
 * @param scheme is a {String} indicative of the Scheme, or protocol, stating HOW to connect requests in a proxy.
 * The default is http.
 * @return {*} for chaining.
 */
Repro.method('setScheme', function (scheme) {
    this._scheme = (!!this._isScheme.exec(scheme)) ? scheme : this._scheme;
    return this;
});

/**
 * Accessor method that allows for the setting of the default host (domain name or IP address) for all routes and
 * targets.
 *
 * @param host is a {String} indicative of Host domain or IP address to default to in case one is not specified in a
 * route or target.
 * The default is 127.0.0.1.
 * @return {*} for chaining.
 */
Repro.method('setHost', function (host) {
    this._host = (!!this._isHost.exec(host)) ? host : this._host;
    return this;
});

/**
 * Accessor method that allows for the setting of the default port number associated with the scheme registry with
 * IANA.
 *
 * @param port is a {String} indicative of the Port number registered with IANA for the default Scheme.
 * The default is 80.
 * @return {*} for chaining.
 */
Repro.method('setPort', function (port) {
    this._port = (!!this._isPort.exec(port)) ? port : this._port;
    return this;
});

/**
 * Default, prototype delegate method used to encode a route Port or HostPort {String} argument into a URL {String}
 * based on default settings such as scheme, host, and port.
 *
 * @param route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * Examples:
 * - 8080
 * - api.example.co
 * - 127.0.0.1
 * - api.example.co:80
 * - 127.0.0.1:80
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 * @return is an encoded URL {String}, if successful; otherwise, empty {String}.
 */
Repro.method('onShouldFormatUrl', function (route, options) {
    /**
     * If the argument is a {String} that looks like:
     * - Port: 22, 80, 443
     * - HostPort: www.google.com, 206.181.8.246, www.google.com:80, 206.181.8.246:80
     * Then, it is a valid argument.
     *
     * Set stack frame references to the default scheme, host, and port.
     * Initialize an empty URL {String}.
     */
    var isPort = !!this._isPort.exec(route),
        isHostPort = !!this._isHostPort.exec(route),
        hasOptions = !!options && typeof options === 'object',
        scheme = hasOptions && !!this._isScheme.exec(options.scheme) ? options.scheme : this._scheme,
        host = hasOptions && !!this._isHost.exec(options.host) ? options.host : this._host,
        port = hasOptions && !!this._isPort.exec(options.port) ? options.port : this._port,
        url = '';
    if (isPort || isHostPort) {
        /**
         * Create a URL {String} based on the default scheme, host, port, and argument values.
         * Parse it, and use its tokens to format a new URL {String}.
         */
        var parsedUrl = uri.parse(
            isPort
                ? (scheme + '://' + host + ':' + route)
                : (scheme + '://' + route),
            true,
            true
        );
        url = uri.format({
            'protocol': (!!parsedUrl.protocol ? parsedUrl.protocol : scheme),
            'hostname': (!!parsedUrl.hostname ? parsedUrl.hostname : host),
            'port': (!!parsedUrl.port ? parsedUrl.port : port),
            'slashes': true
        });
    }
    /**
     * If the argument was legal,
     * Then return a formatted URL {String}.
     * Else, return an empty {String}.
     */
    return url;
});

/**
 * Accessor method to allow for the setting of the format URL delegate function.
 *
 * @param delegate should be a delegate function with an arity of two. See the default delegate above.
 *
 * Example:
 * function (route, options) {
 *     return url;
 * }
 * Route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * Options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Url is an encoded URL {String}, if successful; otherwise, empty {String}.
 *
 * @return {*} for chaining.
 */
Repro.method('setShouldFormatUrlDelegate', function (delegate) {
    this.onShouldFormatUrl = (typeof delegate === 'function') ? delegate : this.onShouldFormatUrl;
    return this;
});

/**
 * Convenience method to allow for adding a whole table of Routes and Targets.
 *
 * @param routes is an {Object} route table meant to define known routes for a particular reverse proxy.
 * The keys and values of the {Object} should be {String} host:port, host, or port.
 *
 * An example route table may look like:
 * {
 *     "api.example.com": "127.0.0.1:8080",
 *     "www.example.com": "127.0.0.1:8081"
 * }
 *
 * In this example, the Host domains may yield the same IP Address from a DNS lookup, but the reverse proxy route table
 * expects the protocol Host headers to distinguish what Host the request was meant for, and route to the
 * respective, internal Port.
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return {*} for chaining.
 */
Repro.method('addRoutes', function (routes, options) {
    if (!!routes && typeof routes === 'object') {
        for (var route in routes) {
            this.addRoute(route, routes[route], options);
        }
    }
    return this;
});

/**
 * Convenience method to allow for resetting the route table to an empty table.
 *
 * @return {*} for chaining.
 */
Repro.method('removeRoutes', function () {
    this._routes = {};
    return this;
});

/**
 * Convenience method that allows for replacing an existing route table with a new route table.
 *
 * @param routes is an {Object} route table meant to define known routes for a particular reverse proxy.
 * The keys and values of the {Object} should be {String} host:port, host, or port.
 *
 * An example route table may look like:
 * {
 *     "api.example.com": "127.0.0.1:8080",
 *     "www.example.com": "127.0.0.1:8081"
 * }
 *
 * In this example, the Host domains may yield the same IP Address from a DNS lookup, but the reverse proxy route table
 * expects the protocol Host headers to distinguish what Host the request was meant for, and route to the
 * respective, internal Port.
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return {*} for chaining.
 */
Repro.method('replaceRoutes', function (routes, options) {
    if (!!routes && typeof routes === 'object') {
        this
            .removeRoutes()
            .addRoutes(routes, options);
    }
    return this;
});

/**
 * Convenience method to allow for adding an individual route to the route table.
 * Routes are only added if they format to valid URL {String}s.
 *
 * @param route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * @param target is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 *
 * Example Route and Target:
 * - api.example.com:80
 * - 127.0.0.1:80
 * - api.example.com
 * - 127.0.0.1
 * - 8080
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return {*} for chaining.
 */
Repro.method('addRoute', function (route, target, options) {
    var routeUrl = this.onShouldFormatUrl(route, options),
        targetUrl = this.onShouldFormatUrl(target, options);
    if (!!routeUrl && !!targetUrl) {
        this._routes[routeUrl] = targetUrl;
    }
    return this;
});

/**
 * Convenience method to allow for removing a specific route from the route table based on the route and not the
 * target.
 *
 * @param route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * Example Route:
 * - api.example.com:80
 * - 127.0.0.1:80
 * - api.example.com
 * - 127.0.0.1
 * - 8080
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return {*} for chaining.
 */
Repro.method('removeRoute', function (route, options) {
    var routeUrl = this.onShouldFormatUrl(route, options);
    if (!!routeUrl) {
        delete this._routes[routeUrl];
    }
    return this;
});

/**
 * Convenience method to allow for retrieval of a target based on a route. The target indicates a destination address
 * encoded as a URL {String} that a reverse proxy should forward requests to.
 *
 * @param route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * Example Route:
 * - api.example.com:80
 * - 127.0.0.1:80
 * - api.example.com
 * - 127.0.0.1
 * - 8080
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return should be a URL {String} if a target destination exists; {undefined}, otherwise.
 */
Repro.method('getTarget', function (route, options) {
    return this._routes[this.onShouldFormatUrl(route, options)];
});

/**
 * Convenience method to allow for introspection of a route table to decide if a route has a target.
 * The target indicates a destination address encoded as a URL {String} that a reverse proxy should forward requests
 * to.
 *
 * @param route is a {String} indicative of an RFC 2396 grammar compliant port or host:port.
 * Example Route:
 * - api.example.com:80
 * - 127.0.0.1:80
 * - api.example.com
 * - 127.0.0.1
 * - 8080
 *
 * @param options is an {Object} indicative of settings to be used when encoding a URL {String}. These may be used to
 * override the default settings. It is optional.
 * Example:
 * {
 *     scheme: 'ssh',
 *     host: '127.0.0.1',
 *     port: '22'
 * }
 *
 * @return should be a {Boolean} true if a target destination exists; {Boolean} false, otherwise.
 */
Repro.method('hasTarget', function (route, options) {
    return !!this._routes[this.onShouldFormatUrl(route, options)];
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Repro}
 */
function repro() {
    return new Repro();
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
repro.isPrototypeOf = function (object) {
    return object instanceof Repro;
};

module.exports = exports = repro;
