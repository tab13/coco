/* eslint-disable */

import $ from 'jquery';

/*
 * Copyright (c) 2003 - 2012 Tyro Payments Limited.
 * 125 York St, Sydney NSW 2000.
 * All rights reserved.
 */
let TYRO = function () {

    var exports = {};
    /*
     * js_channel is a very lightweight abstraction on top of
     * postMessage which defines message formats and semantics
     * to support interactions more rich than just message passing
     * js_channel supports:
     *  + query/response - traditional rpc
     *  + query/update/response - incremental async return of results
     *    to a query
     *  + notifications - fire and forget
     *  + error handling
     *
     * js_channel is based heavily on json-rpc, but is focused at the
     * problem of inter-iframe RPC.
     *
     * Message types:
     *  There are 5 types of messages that can flow over this channel,
     *  and you may determine what type of message an object is by
     *  examining its parameters:
     *  1. Requests
     *    + integer id
     *    + string method
     *    + (optional) any params
     *  2. Callback Invocations (or just "Callbacks")
     *    + integer id
     *    + string callback
     *    + (optional) params
     *  3. Error Responses (or just "Errors)
     *    + integer id
     *    + string error
     *    + (optional) string message
     *  4. Responses
     *    + integer id
     *    + (optional) any result
     *  5. Notifications
     *    + string method
     *    + (optional) any params
     */

    ;var Channel = (function () {
        "use strict";

        // current transaction id, start out at a random *odd* number between 1 and a million
        // There is one current transaction counter id per page, and it's shared between
        // channel instances.  That means of all messages posted from a single javascript
        // evaluation context, we'll never have two with the same id.
        var s_curTranId = Math.floor(Math.random() * 1000001);

        // no two bound channels in the same javascript evaluation context may have the same origin, scope, and window.
        // futher if two bound channels have the same window and scope, they may not have *overlapping* origins
        // (either one or both support '*').  This restriction allows a single onMessage handler to efficiently
        // route messages based on origin and scope.  The s_boundChans maps origins to scopes, to message
        // handlers.  Request and Notification messages are routed using this table.
        // Finally, channels are inserted into this table when built, and removed when destroyed.
        var s_boundChans = {};

        // add a channel to s_boundChans, throwing if a dup exists
        function s_addBoundChan(win, origin, scope, handler) {
            function hasWin(arr) {
                for (var i = 0; i < arr.length; i++) if (arr[i].win === win) return true;
                return false;
            }

            // does she exist?
            var exists = false;


            if (origin === '*') {
                // we must check all other origins, sadly.
                for (var k in s_boundChans) {
                    if (!s_boundChans.hasOwnProperty(k)) continue;
                    if (k === '*') continue;
                    if (typeof s_boundChans[k][scope] === 'object') {
                        exists = hasWin(s_boundChans[k][scope]);
                        if (exists) break;
                    }
                }
            } else {
                // we must check only '*'
                if ((s_boundChans['*'] && s_boundChans['*'][scope])) {
                    exists = hasWin(s_boundChans['*'][scope]);
                }
                if (!exists && s_boundChans[origin] && s_boundChans[origin][scope]) {
                    exists = hasWin(s_boundChans[origin][scope]);
                }
            }
            if (exists) throw "A channel is already bound to the same window which overlaps with origin '" + origin + "' and has scope '" + scope + "'";

            if (typeof s_boundChans[origin] != 'object') s_boundChans[origin] = {};
            if (typeof s_boundChans[origin][scope] != 'object') s_boundChans[origin][scope] = [];
            s_boundChans[origin][scope].push({win: win, handler: handler});
        }

        function s_removeBoundChan(win, origin, scope) {
            var arr = s_boundChans[origin][scope];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].win === win) {
                    arr.splice(i, 1);
                }
            }
            if (s_boundChans[origin][scope].length === 0) {
                delete s_boundChans[origin][scope];
            }
        }

        function s_isArray(obj) {
            if (Array.isArray) return Array.isArray(obj);
            else {
                return (obj.constructor.toString().indexOf("Array") != -1);
            }
        }

        // No two outstanding outbound messages may have the same id, period.  Given that, a single table
        // mapping "transaction ids" to message handlers, allows efficient routing of Callback, Error, and
        // Response messages.  Entries are added to this table when requests are sent, and removed when
        // responses are received.
        var s_transIds = {};

        // class singleton onMessage handler
        // this function is registered once and all incoming messages route through here.  This
        // arrangement allows certain efficiencies, message data is only parsed once and dispatch
        // is more efficient, especially for large numbers of simultaneous channels.
        var s_onMessage = function (e) {
            try {
                var m = JSON.parse(e.data);
                if (typeof m !== 'object' || m === null) throw "malformed";
            } catch (e) {
                // just ignore any posted messages that do not consist of valid JSON
                return;
            }

            var w = e.source;
            var o = e.origin;
            var s, i, meth;

            if (typeof m.method === 'string') {
                var ar = m.method.split('::');
                if (ar.length == 2) {
                    s    = ar[0];
                    meth = ar[1];
                } else {
                    meth = m.method;
                }
            }

            if (typeof m.id !== 'undefined') i = m.id;

            // w is message source window
            // o is message origin
            // m is parsed message
            // s is message scope
            // i is message id (or undefined)
            // meth is unscoped method name
            // ^^ based on these factors we can route the message

            // if it has a method it's either a notification or a request,
            // route using s_boundChans
            if (typeof meth === 'string') {
                var delivered = false;
                if (s_boundChans[o] && s_boundChans[o][s]) {
                    for (var j = 0; j < s_boundChans[o][s].length; j++) {
                        if (s_boundChans[o][s][j].win === w) {
                            s_boundChans[o][s][j].handler(o, meth, m);
                            delivered = true;
                            break;
                        }
                    }
                }

                if (!delivered && s_boundChans['*'] && s_boundChans['*'][s]) {
                    for (var j = 0; j < s_boundChans['*'][s].length; j++) {
                        if (s_boundChans['*'][s][j].win === w) {
                            s_boundChans['*'][s][j].handler(o, meth, m);
                            break;
                        }
                    }
                }
            }
            // otherwise it must have an id (or be poorly formed
            else if (typeof i != 'undefined') {
                if (s_transIds[i]) s_transIds[i](o, meth, m);
            }
        };

        // Setup postMessage event listeners
        if (window.addEventListener) window.addEventListener('message', s_onMessage, false);
        else if (window.attachEvent) window.attachEvent('onmessage', s_onMessage);

        /* a messaging channel is constructed from a window and an origin.
         * the channel will assert that all messages received over the
         * channel match the origin
         *
         * Arguments to Channel.build(cfg):
         *
         *   cfg.window - the remote window with which we'll communicate
         *   cfg.origin - the expected origin of the remote window, may be '*'
         *                which matches any origin
         *   cfg.scope  - the 'scope' of messages.  a scope string that is
         *                prepended to message names.  local and remote endpoints
         *                of a single channel must agree upon scope. Scope may
         *                not contain double colons ('::').
         *   cfg.debugOutput - A boolean value.  If true and window.console.log is
         *                a function, then debug strings will be emitted to that
         *                function.
         *   cfg.postMessageObserver - A function that will be passed two arguments,
         *                an origin and a message.  It will be passed these immediately
         *                before messages are posted.
         *   cfg.gotMessageObserver - A function that will be passed two arguments,
         *                an origin and a message.  It will be passed these arguments
         *                immediately after they pass scope and origin checks, but before
         *                they are processed.
         *   cfg.onReady - A function that will be invoked when a channel becomes "ready",
         *                this occurs once both sides of the channel have been
         *                instantiated and an application level handshake is exchanged.
         *                the onReady function will be passed a single argument which is
         *                the channel object that was returned from build().
         *   cfg.sendPing - An optional boolean value. If true (or absent) this side of the
         *                channel will initiate the handshake. At least one side of the
         *                channel must send a ping for the handshake to succeed. This flag
         *                is useful to prevent 'Unable to post message to ...' due to the
         *                other end of the channel not being loaded yet. Eg when setting up a
         *                channel with a dynamically loaded iframe.
         */
        return {
            build                            : function (cfg) {
                var debug = function (m) {
                    if (cfg.debugOutput && window.console && window.console.log) {
                        // try to stringify, if it doesn't work we'll let javascript's built in toString do its magic
                        try {
                            if (typeof m !== 'string') m = JSON.stringify(m);
                        } catch (e) {
                        }
                        console.log("[" + chanId + "] " + m);
                    }
                };

                /* browser capabilities check */
                if (!window.postMessage) throw("jschannel cannot run this browser, no postMessage");
                if (!window.JSON || !window.JSON.stringify || !window.JSON.parse) {
                    throw("jschannel cannot run this browser, no JSON parsing/serialization");
                }

                /* basic argument validation */
                if (typeof cfg != 'object') throw("Channel build invoked without a proper object argument");

                if (!cfg.window || !cfg.window.postMessage) throw("Channel.build() called without a valid window argument");

                /* we'd have to do a little more work to be able to run multiple channels that intercommunicate the same
                 * window...  Not sure if we care to support that */
                if (window === cfg.window) throw("target window is same as present window -- not allowed");

                // let's require that the client specify an origin.  if we just assume '*' we'll be
                // propagating unsafe practices.  that would be lame.
                var validOrigin = false;
                if (typeof cfg.origin === 'string') {
                    var oMatch;
                    if (cfg.origin === "*") validOrigin = true;
                    // allow valid domains under http and https.  Also, trim paths off otherwise valid origins.
                    else if (null !== (oMatch = cfg.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/))) {
                        cfg.origin  = oMatch[0].toLowerCase();
                        validOrigin = true;
                    }
                }

                // jgroth/wcurrie commented for DEV-? to allow the iclient to work on phonegap apps which have file://
                // as the origin
//            if (!validOrigin) throw ("Channel.build() called with an invalid origin");

                if (typeof cfg.scope !== 'undefined') {
                    if (typeof cfg.scope !== 'string') throw 'scope, when specified, must be a string';
                    if (cfg.scope.split('::').length > 1) throw "scope may not contain double colons: '::'";
                }

                /* private variables */
                // generate a random and psuedo unique id for this channel
                var chanId = (function () {
                    var text  = "";
                    var alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    for (var i = 0; i < 5; i++) text += alpha.charAt(Math.floor(Math.random() * alpha.length));
                    return text;
                })();

                // registrations: mapping method names to call objects
                var regTbl       = {};
                // current oustanding sent requests
                var outTbl       = {};
                // current oustanding received requests
                var inTbl        = {};
                // are we ready yet?  when false we will block outbound messages.
                var ready        = false;
                var pendingQueue = [];

                var createTransaction = function (id, origin, callbacks) {
                    var shouldDelayReturn = false;
                    var completed         = false;

                    return {
                        origin     : origin,
                        invoke     : function (cbName, v) {
                            // verify in table
                            if (!inTbl[id]) throw "attempting to invoke a callback of a nonexistent transaction: " + id;
                            // verify that the callback name is valid
                            var valid = false;
                            for (var i = 0; i < callbacks.length; i++) if (cbName === callbacks[i]) {
                                valid = true;
                                break;
                            }
                            if (!valid) throw "request supports no such callback '" + cbName + "'";

                            // send callback invocation
                            postMessage({id: id, callback: cbName, params: v});
                        },
                        error      : function (error, message) {
                            completed = true;
                            // verify in table
                            if (!inTbl[id]) throw "error called for nonexistent message: " + id;

                            // remove transaction from table
                            delete inTbl[id];

                            // send error
                            postMessage({id: id, error: error, message: message});
                        },
                        complete   : function (v) {
                            completed = true;
                            // verify in table
                            if (!inTbl[id]) throw "complete called for nonexistent message: " + id;
                            // remove transaction from table
                            delete inTbl[id];
                            // send complete
                            postMessage({id: id, result: v});
                        },
                        delayReturn: function (delay) {
                            if (typeof delay === 'boolean') {
                                shouldDelayReturn = (delay === true);
                            }
                            return shouldDelayReturn;
                        },
                        completed  : function () {
                            return completed;
                        }
                    };
                };

                var setTransactionTimeout = function (transId, timeout, method) {
                    return window.setTimeout(function () {
                        if (outTbl[transId]) {
                            // XXX: what if client code raises an exception here?
                            var msg = "timeout (" + timeout + "ms) exceeded on method '" + method + "'";
                            (1, outTbl[transId].error)("timeout_error", msg);
                            delete outTbl[transId];
                            delete s_transIds[transId];
                        }
                    }, timeout);
                };

                var onMessage = function (origin, method, m) {
                    // if an observer was specified at allocation time, invoke it
                    if (typeof cfg.gotMessageObserver === 'function') {
                        // pass observer a clone of the object so that our
                        // manipulations are not visible (i.e. method unscoping).
                        // This is not particularly efficient, but then we expect
                        // that message observers are primarily for debugging anyway.
                        try {
                            cfg.gotMessageObserver(origin, m);
                        } catch (e) {
                            debug("gotMessageObserver() raised an exception: " + e.toString());
                        }
                    }

                    // now, what type of message is this?
                    if (m.id && method) {
                        // a request!  do we have a registered handler for this request?
                        if (regTbl[method]) {
                            var trans   = createTransaction(m.id, origin, m.callbacks ? m.callbacks : []);
                            inTbl[m.id] = {};
                            try {
                                // callback handling.  we'll magically create functions inside the parameter list for
                                // each callback
                                if (m.callbacks && s_isArray(m.callbacks) && m.callbacks.length > 0) {
                                    for (var i = 0; i < m.callbacks.length; i++) {
                                        var path      = m.callbacks[i];
                                        var obj       = m.params;
                                        var pathItems = path.split('/');
                                        for (var j = 0; j < pathItems.length - 1; j++) {
                                            var cp = pathItems[j];
                                            if (typeof obj[cp] !== 'object') obj[cp] = {};
                                            obj = obj[cp];
                                        }
                                        obj[pathItems[pathItems.length - 1]] = (function () {
                                            var cbName = path;
                                            return function (params) {
                                                return trans.invoke(cbName, params);
                                            };
                                        })();
                                    }
                                }
                                var resp = regTbl[method](trans, m.params);
                                if (!trans.delayReturn() && !trans.completed()) trans.complete(resp);
                            } catch (e) {
                                // automagic handling of exceptions:
                                var error   = "runtime_error";
                                var message = null;
                                // * if it's a string then it gets an error code of 'runtime_error' and string is the
                                // message
                                if (typeof e === 'string') {
                                    message = e;
                                } else if (typeof e === 'object') {
                                    // either an array or an object
                                    // * if it's an array of length two, then  array[0] is the code, array[1] is the
                                    // error message
                                    if (e && s_isArray(e) && e.length == 2) {
                                        error   = e[0];
                                        message = e[1];
                                    }
                                    // * if it's an object then we'll look form error and message parameters
                                    else if (typeof e.error === 'string') {
                                        error = e.error;
                                        if (!e.message) message = "";
                                        else if (typeof e.message === 'string') message = e.message;
                                        else e = e.message; // let the stringify/toString message give us a reasonable
                                                            // verbose error string
                                    }
                                }

                                // message is *still* null, let's try harder
                                if (message === null) {
                                    try {
                                        message = JSON.stringify(e);
                                        /* On MSIE8, this can result in 'out of memory', which
                                         * leaves message undefined. */
                                        if (typeof(message) == 'undefined')
                                            message = e.toString();
                                    } catch (e2) {
                                        message = e.toString();
                                    }
                                }

                                trans.error(error, message);
                            }
                        }
                    } else if (m.id && m.callback) {
                        if (!outTbl[m.id] || !outTbl[m.id].callbacks || !outTbl[m.id].callbacks[m.callback]) {
                            debug("ignoring invalid callback, id:" + m.id + " (" + m.callback + ")");
                        } else {
                            // XXX: what if client code raises an exception here?
                            outTbl[m.id].callbacks[m.callback](m.params);
                        }
                    } else if (m.id) {
                        if (!outTbl[m.id]) {
                            debug("ignoring invalid response: " + m.id);
                        } else {
                            // XXX: what if client code raises an exception here?
                            if (m.error) {
                                (1, outTbl[m.id].error)(m.error, m.message);
                            } else {
                                if (m.result !== undefined) (1, outTbl[m.id].success)(m.result);
                                else (1, outTbl[m.id].success)();
                            }
                            delete outTbl[m.id];
                            delete s_transIds[m.id];
                        }
                    } else if (method) {
                        // tis a notification.
                        if (regTbl[method]) {
                            // yep, there's a handler for that.
                            // transaction is null for notifications.
                            regTbl[method](null, m.params);
                            // if the client throws, we'll just let it bubble out
                            // what can we do?  Also, here we'll ignore return values
                        }
                    }
                };

                // now register our bound channel for msg routing
                s_addBoundChan(cfg.window, cfg.origin, ((typeof cfg.scope === 'string') ? cfg.scope : ''), onMessage);

                // scope method names based on cfg.scope specified when the Channel was instantiated
                var scopeMethod = function (m) {
                    if (typeof cfg.scope === 'string' && cfg.scope.length) m = [cfg.scope, m].join("::");
                    return m;
                };

                // a small wrapper around postmessage whose primary function is to handle the
                // case that clients start sending messages before the other end is "ready"
                var postMessage = function (msg, force) {
                    if (!msg) throw "postMessage called with null message";

                    // delay posting if we're not ready yet.
                    var verb = (ready ? "post  " : "queue ");
                    debug(verb + " message: " + JSON.stringify(msg));
                    if (!force && !ready) {
                        pendingQueue.push(msg);
                    } else {
                        if (typeof cfg.postMessageObserver === 'function') {
                            try {
                                cfg.postMessageObserver(cfg.origin, msg);
                            } catch (e) {
                                debug("postMessageObserver() raised an exception: " + e.toString());
                            }
                        }

                        cfg.window.postMessage(JSON.stringify(msg), cfg.origin);
                    }
                };

                var onReady = function (trans, type) {
                    debug('ready msg received');
                    if (ready) throw "received ready message while in ready state.  help!";

                    if (type === 'ping') {
                        chanId += '-R';
                    } else {
                        chanId += '-L';
                    }

                    obj.unbind('__ready'); // now this handler isn't needed any more.
                    ready = true;
                    debug('ready msg accepted.');

                    if (type === 'ping') {
                        obj.notify({method: '__ready', params: 'pong'});
                    }

                    // flush queue
                    while (pendingQueue.length) {
                        postMessage(pendingQueue.pop());
                    }

                    // invoke onReady observer if provided
                    if (typeof cfg.onReady === 'function') cfg.onReady(obj);
                };

                var obj = {
                    // tries to unbind a bound message handler.  returns false if not possible
                    unbind : function (method) {
                        if (regTbl[method]) {
                            if (!(delete regTbl[method])) throw ("can't delete method: " + method);
                            return true;
                        }
                        return false;
                    },
                    bind   : function (method, cb) {
                        if (!method || typeof method !== 'string') throw "'method' argument to bind must be string";
                        if (!cb || typeof cb !== 'function') throw "callback missing from bind params";

                        if (regTbl[method]) throw "method '" + method + "' is already bound!";
                        regTbl[method] = cb;
                        return this;
                    },
                    call   : function (m) {
                        if (!m) throw 'missing arguments to call function';
                        if (!m.method || typeof m.method !== 'string') throw "'method' argument to call must be string";
                        if (!m.success || typeof m.success !== 'function') throw "'success' callback missing from call";

                        // now it's time to support the 'callback' feature of jschannel.  We'll traverse the argument
                        // object and pick out all of the functions that were passed as arguments.
                        var callbacks     = {};
                        var callbackNames = [];

                        var pruneFunctions = function (path, obj) {
                            if (typeof obj === 'object') {
                                for (var k in obj) {
                                    if (!obj.hasOwnProperty(k)) continue;
                                    var np = path + (path.length ? '/' : '') + k;
                                    if (typeof obj[k] === 'function') {
                                        callbacks[np] = obj[k];
                                        callbackNames.push(np);
                                        delete obj[k];
                                    } else if (typeof obj[k] === 'object') {
                                        pruneFunctions(np, obj[k]);
                                    }
                                }
                            }
                        };
                        pruneFunctions("", m.params);

                        // build a 'request' message and send it
                        var msg = {id: s_curTranId, method: scopeMethod(m.method), params: m.params};
                        if (callbackNames.length) msg.callbacks = callbackNames;

                        if (m.timeout)
                        // XXX: This function returns a timeout ID, but we don't do anything with it.
                        // We might want to keep track of it so we can cancel it using clearTimeout()
                        // when the transaction completes.
                            setTransactionTimeout(s_curTranId, m.timeout, scopeMethod(m.method));

                        // insert into the transaction table
                        outTbl[s_curTranId]     = {callbacks: callbacks, error: m.error, success: m.success};
                        s_transIds[s_curTranId] = onMessage;

                        // increment current id
                        s_curTranId++;

                        postMessage(msg);
                    },
                    notify : function (m) {
                        if (!m) throw 'missing arguments to notify function';
                        if (!m.method || typeof m.method !== 'string') throw "'method' argument to notify must be string";

                        // no need to go into any transaction table
                        postMessage({method: scopeMethod(m.method), params: m.params});
                    },
                    destroy: function () {
                        s_removeBoundChan(cfg.window, cfg.origin, ((typeof cfg.scope === 'string') ? cfg.scope : ''));
                        if (window.removeEventListener) window.removeEventListener('message', onMessage, false);
                        else if (window.detachEvent) window.detachEvent('onmessage', onMessage);
                        ready        = false;
                        regTbl       = {};
                        inTbl        = {};
                        outTbl       = {};
                        cfg.origin   = null;
                        pendingQueue = [];
                        debug("channel destroyed");
                        chanId = "";
                    }
                };

                obj.bind('__ready', onReady);
                if (typeof cfg.sendPing === 'undefined' || cfg.sendPing) {
                    setTimeout(function () {
                        postMessage({method: scopeMethod('__ready'), params: "ping"}, true);
                    }, 0);
                }

                return obj;
            },
            // wcurrie: added this method
            bindGlobalMessageListenerToWindow: function (window) {
                if (window.addEventListener) window.addEventListener('message', s_onMessage, false);
                else if (window.attachEvent) window.attachEvent('onmessage', s_onMessage);
            }
        };
    })();


    /**
     *
     * @param val
     * @return {boolean}
     */
    function containsOnlyNumbers(val) {
        return (/^\d+$/).test(val);
    }

    function validateTerminalBusinessDay(terminalBusinessDay, failureCallback) {
        if (!terminalBusinessDay || !containsOnlyNumbers(terminalBusinessDay) || (terminalBusinessDay.length !== 8)) {
            failureCallback({result: "failure", error: "Valid terminal business day must be provided"});
            throw new TypeError("reconciliationReport: terminalBusinessDay must be a date in format yyyyMMdd");
        }
    }

    function validateReportFormat(reportFormat, failureCallback) {
        if (!reportFormat || (reportFormat !== "xml" && reportFormat !== "txt")) {
            failureCallback({result: "failure", error: "Valid report format must be provided"});
            throw new TypeError("reconciliationReport: format must be a string matching either 'xml' or 'txt'");
        }
    }

    function validateReportType(reportType, failureCallback) {
        if (!reportType || (reportType !== "summary" && reportType !== "detail")) {
            failureCallback({result: "failure", error: "Valid report type must be provided"});
            throw new TypeError("reconciliationReport: type must be a string matching either 'summary' or 'detail'");
        }
    }

    /**
     A mixin used by both versions of the iClient. We'd hide this but yuidoc doesn't make that easy. See in the {{#crossLinkModule "TYRO"}}{{/crossLinkModule}} module description.
     @class BaseIClient
     @namespace TYRO
     @private
     */
    var SHARED_INTERFACE                          = {};
    SHARED_INTERFACE.addSharedApiBindingsVersion1 = function (tta, channelGetter, channelDestroyer) {
        "use strict";
        /**
         Close a previously opened bar tab ({{#crossLink "TYRO.IClient/initiateOpenTab"}}{{/crossLink}}) with a final amount. The customer will be charged.
         @method closeTab
         @param completionReference {String} Transaction identifier from the original transaction.
         @param amount {String} The final amount to charge the customer.
         @param responseReceivedCallback {Function} Invoked to indicate success or failure.
         Called with a single Object containing the following properties:
         <ul>
         <li><code class="param-name">result</code><span class="type">String</span>
         <br/> One of the following values: success, failure.
         </li>
         <li><code class="param-name">message</code><span class="type">String</span>
         <br/>Message to show the merchant.
         </li>
         </ul>
         @example
         // to close the tab with completion reference 543123 and bill a customer $120.01
         iclient.closeTab("543123", "12001", yourPosCode.handleResponse);
         */
        tta.closeTab = function (completionReference, amount, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("closeTab", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "closeTabResponse", responseReceivedCallback);
            channel.notify({
                method: "closeTab",
                params: {
                    completionReference: completionReference,
                    amount             : amount,
                    posProductData     : tta.posProductData
                }
            });
        };

        /**
         Void a previously opened bar tab ({{#crossLink "TYRO.IClient/initiateOpenTab"}}{{/crossLink}}). This discards the hold on funds in the customer's account.
         @method voidTab
         @param completionReference {String} Transaction identifier from the original transaction.
         @param responseReceivedCallback {Function} Invoked to indicate success or failure.
         Called with a single Object containing the following properties:
         <ul>
         <li><code class="param-name">result</code><span class="type">String</span>
         <br/> One of the following values: success, failure.
         </li>
         <li><code class="param-name">message</code><span class="type">String</span>
         <br/>Message to show the merchant.
         </li>
         </ul>
         @example
         // to void a bar tab with completion reference 543123
         iclient.voidTab("543123", yourPosCode.handleResponse);
         */
        tta.voidTab = function (completionReference, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("voidTab", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "voidTabResponse", responseReceivedCallback);
            channel.notify({
                method: "voidTab",
                params: {completionReference: completionReference, posProductData: tta.posProductData}
            });
        };


        tta.completePreAuth = function (requestParams, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("completePreAuth", responseReceivedCallback);
            SHARED_INTERFACE.validateTransactionAmount("completePreAuth", "amount", requestParams.amount);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "completePreAuthResponse", responseReceivedCallback);
            channel.notify({
                method: "completePreAuth",
                params: $.extend(requestParams, {posProductData: tta.posProductData})
            });
        };


        tta.voidPreAuth = function (requestParams, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("voidPreAuth", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "voidPreAuthResponse", responseReceivedCallback);
            channel.notify({
                method: "voidPreAuth",
                params: $.extend(requestParams, {posProductData: tta.posProductData})
            });
        };


        tta.addTip = function (completionReference, tipAmount, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("addTip", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "tipCompletionResponse", responseReceivedCallback);
            channel.notify({
                method: "addTip",
                params: {completionReference: completionReference, tipAmount: tipAmount}
            });
        };


        tta.reconciliationReport = function (requestParams, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("reconciliationReport", responseReceivedCallback);
            validateTerminalBusinessDay(requestParams.terminalBusinessDay, responseReceivedCallback);
            validateReportType(requestParams.type, responseReceivedCallback);
            validateReportFormat(requestParams.format, responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "reconciliationReportResponse", responseReceivedCallback);
            channel.notify({
                method: "reconciliationReport", params: {
                    terminalBusinessDay: requestParams.terminalBusinessDay,
                    reportFormat       : requestParams.format,
                    reportType         : requestParams.type,
                    integrationKey     : requestParams.integrationKey,
                    mid                : requestParams.mid,
                    tid                : requestParams.tid
                }
            });
        };


        tta.manualSettlement = function (responseReceivedCallback, options) {
            SHARED_INTERFACE.validateCallback("manualSettlement", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "manualSettlementResponse", responseReceivedCallback);
            channel.notify({method: "manualSettlement", params: options});
        };

        tta.healthpointReconciliationReport = function (parameters, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("healthpointReconciliationReport", responseReceivedCallback);
            var channel = channelGetter();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, channelDestroyer, "healthpointReconciliationReportResponse", responseReceivedCallback);
            channel.notify({method: "healthpointReconciliationReport", params: parameters});
        };
    };

    SHARED_INTERFACE.bindReceiveMessage = function (channel, method, callback) {
        "use strict";

        var ignoreTransactionParameter = function (t, param) {
            callback(param);
        };
        channel.bind(method, ignoreTransactionParameter);
    };

    SHARED_INTERFACE.bindReceiveMessageAndCleanUpIfDone = function (channel, channelDestroyer, method, callback) {
        "use strict";

        var ignoreTransactionParameterAndCleanupIfDone = function (t, param) {
            if (param.status !== "inProgress") {
                channelDestroyer();
            }
            callback(param);
        };
        channel.bind(method, ignoreTransactionParameterAndCleanupIfDone);
    };

    SHARED_INTERFACE.bindReceiveLastMessageFromChannel = function (channel, channelDestroyer, method, callback) {
        "use strict";

        var ignoreTransactionParameterAndCleanup = function (t, param) {
            channelDestroyer();
            callback(param);
        };
        channel.bind(method, ignoreTransactionParameterAndCleanup);
    };

    SHARED_INTERFACE.bindReceiveMessageAddingAnswerCallback = function (channel, method, posQuestionChangedCallback, ttaAnswerCallback) {
        "use strict";

        var ignoreTransactionParameterAndPassAnswerCallback = function (t, param) {
            posQuestionChangedCallback(param, ttaAnswerCallback);
        };
        channel.bind(method, ignoreTransactionParameterAndPassAnswerCallback);
    };


    SHARED_INTERFACE.getOriginOfPos = function () {
        "use strict";

        return window.location.protocol + "//" + window.location.host;
    };

    SHARED_INTERFACE.isFunction = function (functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };

    SHARED_INTERFACE.validateCallback = function (methodName, callback) {
        if (!SHARED_INTERFACE.isFunction(callback)) {
            throw new TypeError(methodName + ": Callback parameter must be a function");
        }
    };

    SHARED_INTERFACE.validateTransactionAmount = function (methodName, parameterName, parameter) {
        if (typeof parameter !== "string" || !containsOnlyNumbers(parameter) || parameter.charAt(0) === '0') {
            throw new TypeError(methodName + ": " + parameterName + " must be a string containing the amount in cents.");
        }
    };

    SHARED_INTERFACE.validateCompletionReference = function (methodName, parameterName, parameter) {
        if (typeof parameter !== "string" || parameter === "") {
            throw new TypeError(methodName + ": " + parameterName + " must be a string containing the completion reference of initial pre-authorisation.");
        }
    };

    SHARED_INTERFACE.validateTransactionAmounts = function (methodName, amount, cashout) {
        if (typeof amount === "string" && containsOnlyNumbers(amount)) {
            if (amount.charAt(0) === '0') {
                if (typeof cashout !== "string" || !containsOnlyNumbers(cashout)) {
                    throw new TypeError(methodName + ": cashout must be a string containing the amount in cents.");
                }
                if (cashout.charAt(0) === '0') {
                    throw new TypeError(methodName + ": amount or cashout must be > 0.");
                }
            } else {
                if (typeof cashout === "string" && !containsOnlyNumbers(cashout)) {
                    throw new TypeError(methodName + ": cashout must be a string containing the amount in cents.");
                }
            }
        } else {
            throw new TypeError(methodName + ": amount must be a string containing the amount in cents.");
        }
    };

    SHARED_INTERFACE.validateAmountThatCanBeZero = function (methodName, parameterName, parameter) {
        if (typeof parameter !== "string" || !containsOnlyNumbers(parameter)) {
            throw new TypeError(methodName + ": " + parameterName + " must be a string containing the amount in cents.");
        }
    };

    SHARED_INTERFACE.validateTransactionCallbacks = function (methodName, transactionCallbacks, integratedReceiptParameter, expectedCallbacks) {
        if (typeof transactionCallbacks === "undefined") {
            throw new TypeError(methodName + ": Second parameter is required");
        }
        if (typeof integratedReceiptParameter !== "boolean") {
            throw new TypeError(methodName + ": integratedReceipt must be a boolean");
        }
        if (integratedReceiptParameter) {
            expectedCallbacks.push('receiptCallback');
        }
        for (var i = 0; i < expectedCallbacks.length; i++) {
            var expectedCallback = expectedCallbacks[i];
            if (!SHARED_INTERFACE.isFunction(transactionCallbacks[expectedCallback])) {
                throw new TypeError(methodName + ": " + expectedCallback + " must be a function");
            }
        }
    };

    SHARED_INTERFACE.validateEnableSurchargeParameter = function (methodName, enableSurchargeParameter) {
        if (typeof enableSurchargeParameter !== 'undefined' && typeof enableSurchargeParameter !== "boolean") {
            throw new TypeError(methodName + ": enableSurcharge must be a boolean");
        }
    };

    SHARED_INTERFACE.validateRequestCardTokenParameter = function (methodName, requestCardTokenParameter) {
        if (typeof requestCardTokenParameter !== 'undefined' && typeof requestCardTokenParameter !== "boolean") {
            throw new TypeError(methodName + ": requestCardToken must be a boolean");
        }
    };

    SHARED_INTERFACE.validateIntegratedReceiptWidth = function (methodName, parameter) {
        if (typeof parameter !== 'undefined' && (typeof parameter !== "string" || !containsOnlyNumbers(parameter) || parameter.charAt(0) === '0')) {
            throw new TypeError(methodName + ": integratedReceiptWidth must be a string containing the width of the receipt in characters.");
        }
    };


    /*
     * Copyright (c) 2003 - 2012 Tyro Payments Limited.
     * 125 York St, Sydney NSW 2000.
     * All rights reserved.
     */
    /*global exports,jQuery,SHARED_INTERFACE,Channel*/
    exports.IClient = function (apiKey, posProductData, documentToBindTo) {
        "use strict";

        var doc               = documentToBindTo || document;
        var channel;
        var expectedCallbacks = ['transactionCompleteCallback', 'questionCallback', 'statusMessageCallback'];

        if (!apiKey || typeof(apiKey) !== "string") {
            throw new TypeError("API key needs to be provided");
        } else if (!posProductData || !(posProductData.posProductName && posProductData.posProductVendor && posProductData.posProductVersion)) {
            throw new TypeError("POS data needs to be provided");
        }
        this.posProductData   = posProductData;
        this.initiatePurchase = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiatePurchase", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
            SHARED_INTERFACE.validateEnableSurchargeParameter("initiatePurchase", requestParams.enableSurcharge);
            SHARED_INTERFACE.validateRequestCardTokenParameter("initiatePurchase", requestParams.requestCardToken);
            SHARED_INTERFACE.validateTransactionAmount("initiatePurchase", "amount", requestParams.amount);
            if (requestParams.cashout) {
                SHARED_INTERFACE.validateAmountThatCanBeZero("initiatePurchase", "cashout", requestParams.cashout);
            }
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "purchase",
                params: $.extend(requestParams, {posProductData: this.posProductData})
            });
        };

        /**
         *
         * @param url
         * @param requestParams
         * @param transactionCallbacks
         */
        this.customInitiatePurchase = function (url, requestParams, transactionCallbacks) {
            try {
                SHARED_INTERFACE.validateTransactionCallbacks("initiatePurchase", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
                SHARED_INTERFACE.validateEnableSurchargeParameter("initiatePurchase", requestParams.enableSurcharge);
                SHARED_INTERFACE.validateRequestCardTokenParameter("initiatePurchase", requestParams.requestCardToken);
                SHARED_INTERFACE.validateTransactionAmount("initiatePurchase", "amount", requestParams.amount);
                if (requestParams.cashout) {
                    SHARED_INTERFACE.validateAmountThatCanBeZero("initiatePurchase", "cashout", requestParams.cashout);
                }
                customCreateChannel(url);
                bindTransactionCallbacks(channel, transactionCallbacks);
                channel.notify({
                    method: "purchase",
                    params: $.extend(requestParams, {posProductData: this.posProductData})
                });
            } catch (e) {
                console.log(e)
            }
        };


        this.initiateRefund = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateRefund", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
            SHARED_INTERFACE.validateTransactionAmount("initiateRefund", "amount", requestParams.amount);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({method: "refund", params: $.extend(requestParams, {posProductData: this.posProductData})});
        };

        /**
         *
         * @param url
         * @param requestParams
         * @param transactionCallbacks
         */
        this.customInitiateRefund = function (url, requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateRefund", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
            SHARED_INTERFACE.validateTransactionAmount("initiateRefund", "amount", requestParams.amount);
            customCreateChannel(url);
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({method: "refund", params: $.extend(requestParams, {posProductData: this.posProductData})});
        };


        this.initiateOpenTab = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateOpenTab", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
            SHARED_INTERFACE.validateTransactionAmount("initiateOpenTab", "amount", requestParams.amount);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({method: "openTab", params: $.extend(requestParams, {posProductData: this.posProductData})});
        };


        this.initiateOpenPreAuth = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateOpenPreAuth", transactionCallbacks, requestParams.integratedReceipt, expectedCallbacks);
            SHARED_INTERFACE.validateTransactionAmount("initiateOpenPreAuth", "amount", requestParams.amount);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "openPreAuth",
                params: $.extend(requestParams, {posProductData: this.posProductData})
            });
        };


        this.initiateIncrementPreAuth = function (requestParams, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("initiateIncrementPreAuth", responseReceivedCallback);
            SHARED_INTERFACE.validateTransactionAmount("initiateIncrementPreAuth", "amount", requestParams.amount);
            SHARED_INTERFACE.validateCompletionReference("initiateIncrementPreAuth", "completionReference", requestParams.completionReference);
            createChannel();
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, destroyChannel, "incrementPreAuthResponse", responseReceivedCallback);
            channel.notify({
                method: "incrementPreAuth",
                params: $.extend(requestParams, {posProductData: posProductData})
            });
        };


        this.continueLastTransaction = function (transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("continueLastTransaction", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({method: "continueLastTransaction"});
        };


        this.initiateFullyPaidEasyclaim = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateEasyclaim", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "easyclaim",
                params: $.extend(requestParams, {posProductData: posProductData, type: "fullypaid"})
            });
        };

        this.initiatePartPaidEasyclaim = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateEasyclaim", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "easyclaim",
                params: $.extend(requestParams, {posProductData: posProductData, type: "partpaid"})
            });
        };


        this.initiateBulkBillEasyclaim = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateEasyclaim", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "easyclaim",
                params: $.extend(requestParams, {posProductData: posProductData, type: "bulkbill"})
            });
        };


        this.cancelCurrentTransaction = function () {
            if (!channel) {
                throw new Error("cancelCurrentTransaction: There is no in-progress transaction to cancel.");
            }
            channel.notify({method: "cancelTransaction"});
        };


        this.initiateHealthPointClaim = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("initiateHealthPointClaim", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "healthpointClaim",
                params: $.extend(requestParams, {posProductData: posProductData, type: "healthpointClaim"})
            });
        };


        this.cancelHealthPointClaim = function (requestParams, transactionCallbacks) {
            SHARED_INTERFACE.validateTransactionCallbacks("cancelHealthPointClaim", transactionCallbacks, false, expectedCallbacks);
            createChannel();
            bindTransactionCallbacks(channel, transactionCallbacks);
            channel.notify({
                method: "healthpointCancel",
                params: $.extend(requestParams, {posProductData: posProductData, type: "healthpointCancel"})
            });
        };


        this.pairTerminal = function (mid, tid, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("pairTerminal", responseReceivedCallback);
            createChannel();
            SHARED_INTERFACE.bindReceiveMessageAndCleanUpIfDone(channel, destroyChannel, "pairingStatus", responseReceivedCallback);
            channel.notify({method: "pairTerminal", params: {mid: mid, tid: tid}});
        };


        this.customPairTerminal = function (url, mid, tid, responseReceivedCallback) {
            SHARED_INTERFACE.validateCallback("pairTerminal", responseReceivedCallback);
            customCreateChannel(url);
            SHARED_INTERFACE.bindReceiveMessageAndCleanUpIfDone(channel, destroyChannel, "pairingStatus", responseReceivedCallback);
            channel.notify({method: "pairTerminal", params: {mid: mid, tid: tid}});
        };


        this.terminalInfo = function (responseReceivedCallback, requestParams) {
            SHARED_INTERFACE.validateCallback("terminalInfo", responseReceivedCallback);
            createChannel();
            SHARED_INTERFACE.bindReceiveMessageAndCleanUpIfDone(channel, destroyChannel, "terminalInfoResponse", responseReceivedCallback);
            channel.notify({method: "terminalInfo", params: requestParams});
        };

        /**
         *
         * @param url
         * @param responseReceivedCallback
         * @param requestParams
         */
        this.customTerminalInfo = function (url, responseReceivedCallback, requestParams) {
            SHARED_INTERFACE.validateCallback("terminalInfo", responseReceivedCallback);
            customCreateChannel(url);
            SHARED_INTERFACE.bindReceiveMessageAndCleanUpIfDone(channel, destroyChannel, "terminalInfoResponse", responseReceivedCallback);
            channel.notify({method: "terminalInfo", params: requestParams});
        };


        this.getConfiguration = function (callback) {
            SHARED_INTERFACE.validateCallback("getConfiguration", callback);
            createChannel();
            var notifyPosAndDestroyChannel = function (configuration) {
                destroyChannel();
                callback(configuration);
            };
            channel.call({method: "getConfiguration", success: notifyPosAndDestroyChannel});
        };

        function bindTransactionCallbacks(channel, transactionCallbacks) {
            function answerQuestion(answer) {
                channel.notify({method: "answerQuestion", params: answer});
            }

            SHARED_INTERFACE.bindReceiveMessageAddingAnswerCallback(channel, "question", transactionCallbacks.questionCallback, answerQuestion);
            SHARED_INTERFACE.bindReceiveMessage(channel, "transactionStatus", transactionCallbacks.statusMessageCallback);
            SHARED_INTERFACE.bindReceiveMessage(channel, "receiptReceived", transactionCallbacks.receiptCallback);
            SHARED_INTERFACE.bindReceiveLastMessageFromChannel(channel, destroyChannel, "transactionComplete", transactionCallbacks.transactionCompleteCallback);
        }

        function createChannel() {
            var iframeSourceUrl = "http://localhost?URL_TO_BE_REPLACED_BY_SPRING_CONTROLLER_WHEN_SERVING_MINIFIED_JS_FILE";
            return customCreateChannel(iframeSourceUrl);
        }

        function customCreateChannel(iframeSourceUrl) {
            if (channel) {
                throw new Error("Transaction already in progress.");
            }

            var iframe = doc.createElement("iframe");
            iframe.setAttribute("src", iframeSourceUrl + "iclient.html?apiKey=" + apiKey + "&originOfPos=" + encodeURIComponent(SHARED_INTERFACE.getOriginOfPos()));
            iframe.setAttribute("style", "display: none");
            iframe.setAttribute("id", "iclient-headless-iframe");
            doc.body.appendChild(iframe);
            channel           = Channel.build({
                window  : iframe.contentWindow,
                origin  : iframeSourceUrl,
                scope   : 'tyroIclient',
                sendPing: false
            });
            channel.posDomain = SHARED_INTERFACE.getOriginOfPos();
            return channel;
        }

        function destroyChannel() {
            var iframe = doc.getElementById("iclient-headless-iframe");
            doc.body.removeChild(iframe);
            channel.destroy();
            channel = null;
        }

        SHARED_INTERFACE.addSharedApiBindingsVersion1(this, createChannel, destroyChannel);
    };

    return exports;
}();

export default TYRO;