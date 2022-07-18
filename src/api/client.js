"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MELCloudAPIClient = exports.IErrorCode = void 0;
// import request from 'request-promise-native'
var node_fetch_1 = require("node-fetch");
// import url from 'url'
var node_persist_1 = require("node-persist");
var node_cache_1 = require("node-cache");
var object_hash_1 = require("object-hash");
var async_mutex_1 = require("async-mutex");
var MELCLOUD_API_ROOT = 'https://app.melcloud.com/Mitsubishi.Wifi.Client';
var MELCLOUD_API_LOGIN = 'Login/ClientLogin';
var MELCLOUD_API_LIST_DEVICES = 'User/ListDevices';
var MELCLOUD_API_GET_DEVICE = 'Device/Get';
var MELCLOUD_API_SET_DEVICE = 'Device/SetAta';
var MELCLOUD_API_UPDATE_OPTIONS = 'User/UpdateApplicationOptions';
var IErrorCode;
(function (IErrorCode) {
    IErrorCode[IErrorCode["InvalidCredentials"] = 1] = "InvalidCredentials";
    // TODO: Add all other known error codes AND our own error codes!
})(IErrorCode = exports.IErrorCode || (exports.IErrorCode = {}));
var MELCloudAPIClient = /** @class */ (function () {
    function MELCloudAPIClient(log, config, storagePath) {
        var _this = this;
        // FIXME: Tweak this to get a good balance between responsiveness and caching! (eg. 60 seconds is way too much)
        this.requestCacheTime = 10; // Seconds
        // Validate and store a reference to the logger
        if (!log) {
            // FIXME: Add proper error handling
            throw new Error('Invalid or null Homebridge logger');
        }
        this.log = log;
        // Validate and store the config
        if (!config) {
            // FIXME: Add proper error handling
            throw new Error('Invalid or missing config');
        }
        this.config = config;
        // MELCloud login token (or "context key")
        // this.StoragePath = storagePath
        this.ContextKey = null;
        this.ContextKeyExpirationDate = null;
        this.UseFahrenheit = null;
        // Initialize storage
        if (this.config.debug) {
            this.log.debug('Initializing API client storage with path:', storagePath);
        }
        this.storage = node_persist_1["default"].create({
            dir: storagePath
        });
        // Load settings from storage
        this.storage.getItem('ContextKey')
            .then(function (value) {
            _this.ContextKey = value;
            if (_this.config.debug) {
                _this.log.debug('Loaded ContextKey from storage:', _this.ContextKey);
            }
        });
        this.storage.getItem('ContextKeyExpirationDate')
            .then(function (value) {
            _this.ContextKeyExpirationDate = value;
            if (_this.config.debug) {
                _this.log.debug('Loaded ContextKeyExpirationDate from storage:', _this.ContextKeyExpirationDate);
            }
        });
        this.storage.getItem('UseFahrenheit')
            .then(function (value) {
            _this.UseFahrenheit = value;
            if (_this.config.debug) {
                _this.log.debug('Loaded UseFahrenheit from storage:', _this.UseFahrenheit);
            }
        });
        // Initialize in-memory cache
        this.cache = new node_cache_1["default"]({
            useClones: true,
            deleteOnExpire: true,
            checkperiod: 60,
            stdTTL: 0
        });
        // Initialize mutex
        this.mutex = new async_mutex_1.Mutex();
    }
    Object.defineProperty(MELCloudAPIClient.prototype, "isContextKeyValid", {
        get: function () {
            if (!this.ContextKey || this.ContextKey.length < 1) {
                return false;
            }
            if (!this.ContextKeyExpirationDate) {
                return false;
            }
            var nowDate = new Date();
            nowDate.setHours(0);
            nowDate.setMinutes(0);
            nowDate.setSeconds(0);
            nowDate.setMilliseconds(0);
            if (this.ContextKeyExpirationDate <= nowDate) {
                return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    MELCloudAPIClient.prototype.get = function (url, formData, headers, skipCache) {
        return __awaiter(this, void 0, void 0, function () {
            var requestHash;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.config.debug) {
                    this.log.debug('GET', url, formData, headers);
                }
                // Validate the inputs
                formData = JSON.stringify(formData);
                if (!headers) {
                    headers = {
                        'Content-Type': 'application/json'
                    };
                }
                requestHash = (0, object_hash_1["default"])({
                    url: url,
                    formData: formData,
                    headers: headers
                });
                if (this.config.debug) {
                    this.log.debug('Generated GET request hash:', requestHash);
                }
                // Lock the call until caching is complete and before checking the cache
                return [2 /*return*/, this.mutex.runExclusive(function () { return __awaiter(_this, void 0, void 0, function () {
                        var cachedResponseJSON, response, responseJSON;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    cachedResponseJSON = this.cache.get(requestHash);
                                    if (cachedResponseJSON && !skipCache) {
                                        if (this.config.debug) {
                                            this.log.debug('Returning cached response:', cachedResponseJSON);
                                        }
                                        return [2 /*return*/, cachedResponseJSON];
                                    }
                                    else if (skipCache) {
                                        if (this.config.debug) {
                                            this.log.debug('Cache skip enabled, skipping response caching');
                                        }
                                    }
                                    return [4 /*yield*/, (0, node_fetch_1["default"])(url, {
                                            method: 'GET',
                                            body: formData,
                                            headers: headers
                                        })
                                        // Convert the response to a JSON string
                                    ];
                                case 1:
                                    response = _a.sent();
                                    return [4 /*yield*/, response.json()
                                        // Cache the request response
                                    ];
                                case 2:
                                    responseJSON = _a.sent();
                                    // Cache the request response
                                    if (!skipCache) {
                                        this.cache.set(requestHash, responseJSON, this.requestCacheTime);
                                        if (this.config.debug) {
                                            this.log.debug('Caching response for', this.requestCacheTime, 'seconds:', responseJSON);
                                        }
                                    }
                                    return [2 /*return*/, responseJSON];
                            }
                        });
                    }); })];
            });
        });
    };
    MELCloudAPIClient.prototype.post = function (url, formData, headers, body, skipCache) {
        return __awaiter(this, void 0, void 0, function () {
            var requestHash;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.config.debug) {
                    this.log.debug('POST', url, formData, headers, body);
                }
                // Validate the inputs
                if (!formData) {
                    formData = body;
                }
                formData = JSON.stringify(formData);
                if (!headers) {
                    headers = {
                        'Content-Type': 'application/json'
                    };
                }
                requestHash = (0, object_hash_1["default"])({
                    url: url,
                    formData: formData,
                    headers: headers,
                    body: body
                });
                if (this.config.debug) {
                    this.log.debug('Generated POST request hash:', requestHash);
                }
                // Lock the call until caching is complete and before checking the cache
                return [2 /*return*/, this.mutex.runExclusive(function () { return __awaiter(_this, void 0, void 0, function () {
                        var cachedResponseJSON, response, responseJSON;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    cachedResponseJSON = this.cache.get(requestHash);
                                    if (cachedResponseJSON && !skipCache) {
                                        if (this.config.debug) {
                                            this.log.debug('Returning cached response:', cachedResponseJSON);
                                        }
                                        return [2 /*return*/, cachedResponseJSON];
                                    }
                                    else if (skipCache) {
                                        if (this.config.debug) {
                                            this.log.debug('Cache skip enabled, skipping response caching');
                                        }
                                    }
                                    return [4 /*yield*/, (0, node_fetch_1["default"])(url, {
                                            method: 'POST',
                                            body: formData,
                                            headers: headers
                                        })
                                        // Convert the response to a JSON string
                                    ];
                                case 1:
                                    response = _a.sent();
                                    return [4 /*yield*/, response.json()
                                        // Cache the request response
                                    ];
                                case 2:
                                    responseJSON = _a.sent();
                                    // Cache the request response
                                    if (!skipCache) {
                                        this.cache.set(requestHash, responseJSON, this.requestCacheTime);
                                        if (this.config.debug) {
                                            this.log.debug('Caching response for', this.requestCacheTime, 'seconds:', responseJSON);
                                        }
                                    }
                                    return [2 /*return*/, responseJSON];
                            }
                        });
                    }); })];
            });
        });
    };
    MELCloudAPIClient.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Logging in');
                        }
                        // this.log('LOGIN')
                        // Return immediately if the API key is still valid
                        if (this.isContextKeyValid) {
                            if (this.config.debug) {
                                this.log.debug('ContextKey is still valid, skipping login');
                            }
                            return [2 /*return*/, null];
                        }
                        else {
                            this.log.info('No existing login information found, attempting to login with supplied credentials');
                        }
                        return [4 /*yield*/, this.post("".concat(MELCLOUD_API_ROOT, "/").concat(MELCLOUD_API_LOGIN), {
                                AppVersion: '1.19.0.8',
                                CaptchaChallenge: '',
                                CaptchaResponse: '',
                                Email: this.config.username,
                                Language: this.config.language,
                                Password: this.config.password,
                                Persist: 'true'
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response) {
                            // FIXME: Add proper error handling
                            throw new Error("Failed to login: invalid JSON response: ".concat(JSON.stringify(response)));
                        }
                        if (this.config.debug) {
                            this.log.debug('login -> response:', JSON.stringify(response));
                        }
                        if (!response.LoginData) return [3 /*break*/, 6];
                        this.ContextKey = response.LoginData.ContextKey;
                        return [4 /*yield*/, this.storage.setItem('ContextKey', this.ContextKey)];
                    case 2:
                        _a.sent();
                        if (!response.LoginData.Expiry) return [3 /*break*/, 4];
                        this.ContextKeyExpirationDate = new Date(response.LoginData.Expiry);
                        this.ContextKeyExpirationDate.setHours(0);
                        this.ContextKeyExpirationDate.setMinutes(0);
                        this.ContextKeyExpirationDate.setSeconds(0);
                        this.ContextKeyExpirationDate.setMilliseconds(0);
                        return [4 /*yield*/, this.storage.setItem('ContextKeyExpirationDate', this.ContextKeyExpirationDate)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // FIXME: This is NEVER updated until ContextKey expires, which takes 1 whole year to happen..
                        this.UseFahrenheit = response.LoginData.UseFahrenheit;
                        return [4 /*yield*/, this.storage.setItem('UseFahrenheit', this.UseFahrenheit)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        if (response.ErrorId === IErrorCode.InvalidCredentials) {
                            throw new Error("Login failed due to invalid credentials. Received response: ".concat(JSON.stringify(response)));
                        }
                        // FIXME: Add proper error handling
                        throw new Error("Login failed due to an unknown or unhandled error. Received response: ".concat(JSON.stringify(response)));
                    case 7: return [2 /*return*/, response.LoginData];
                }
            });
        });
    };
    MELCloudAPIClient.prototype.listDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Getting list of devices');
                        }
                        // Check if we need to login first
                        return [4 /*yield*/, this.login()
                            // this.log('LIST DEVICES')
                        ];
                    case 1:
                        // Check if we need to login first
                        _a.sent();
                        return [4 /*yield*/, this.get("".concat(MELCLOUD_API_ROOT, "/").concat(MELCLOUD_API_LIST_DEVICES), undefined, {
                                'X-MitsContextKey': this.ContextKey
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            // FIXME: Add proper error handling
                            throw new Error("Failed to list devices: invalid JSON response: ".concat(JSON.stringify(response)));
                        }
                        if (this.config.debug) {
                            this.log.debug('listDevices:', JSON.stringify(response));
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    MELCloudAPIClient.prototype.getDevice = function (deviceId, buildingId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Getting device with DeviceID', deviceId, 'and BuildingID', buildingId);
                        }
                        // Check if we need to login first
                        return [4 /*yield*/, this.login()
                            // this.log('GET DEVICE', deviceId, buildingId)
                        ];
                    case 1:
                        // Check if we need to login first
                        _a.sent();
                        return [4 /*yield*/, this.get("".concat(MELCLOUD_API_ROOT, "/").concat(MELCLOUD_API_GET_DEVICE, "?id=").concat(deviceId, "&BuildingID=").concat(buildingId), undefined, {
                                'X-MitsContextKey': this.ContextKey
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            // FIXME: Add proper error handling
                            throw new Error("Failed to get device: invalid JSON response: ".concat(JSON.stringify(response)));
                        }
                        if (this.config.debug) {
                            this.log.debug('Get Device response:', JSON.stringify(response));
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // FIXME: Actually call this and implement it!
    // TODO: Add proper type support
    MELCloudAPIClient.prototype.updateOptions = function (useFahrenheit) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Updating options: useFahrenheit ->', useFahrenheit);
                        }
                        // Check if we need to login first
                        return [4 /*yield*/, this.login()
                            // this.log('UPDATE OPTIONS', useFahrenheit)
                            // FIXME: Why were we trying to send this as a string instead of as an object, like every other request?
                        ];
                    case 1:
                        // Check if we need to login first
                        _a.sent();
                        return [4 /*yield*/, this.post("".concat(MELCLOUD_API_ROOT, "/").concat(MELCLOUD_API_UPDATE_OPTIONS), {
                                // FIXME: Most of these properties seem either incorrect or unnecessary
                                UseFahrenheit: useFahrenheit,
                                EmailOnCommsError: false,
                                EmailOnUnitError: false,
                                EmailCommsErrors: 1,
                                EmailUnitErrors: 1,
                                RestorePages: false,
                                MarketingCommunication: false,
                                AlternateEmailAddress: '',
                                Fred: 4
                            }, {
                                'X-MitsContextKey': this.ContextKey, 'Content-Type': 'application/json'
                            }, null, true)];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            // FIXME: Add proper error handling
                            throw new Error("Failed to update options: invalid JSON response: ".concat(response));
                        }
                        if (this.config.debug) {
                            this.log.debug('updateOptions -> response:', JSON.stringify(response));
                        }
                        this.UseFahrenheit = useFahrenheit;
                        return [2 /*return*/, response];
                }
            });
        });
    };
    MELCloudAPIClient.prototype.setDeviceData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Setting device data:', data);
                        }
                        // Check if we need to login first
                        return [4 /*yield*/, this.login()
                            // this.log('SET DEVICE DATA', data)
                        ];
                    case 1:
                        // Check if we need to login first
                        _a.sent();
                        return [4 /*yield*/, this.post("".concat(MELCLOUD_API_ROOT, "/").concat(MELCLOUD_API_SET_DEVICE), undefined, {
                                'X-MitsContextKey': this.ContextKey, 'content-type': 'application/json'
                            }, data, true)];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            // FIXME: Add proper error handling
                            throw new Error("Failed to set device data: invalid JSON response: ".concat(response));
                        }
                        if (this.config.debug) {
                            this.log.debug('setDeviceData -> response:', JSON.stringify(response));
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    return MELCloudAPIClient;
}());
exports.MELCloudAPIClient = MELCloudAPIClient;
