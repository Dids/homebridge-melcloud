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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
/* eslint-disable no-console */
var intermock_1 = require("intermock");
var fs_1 = require("fs");
var client_1 = require("../src/api/client");
var config_1 = require("../src/config");
var with_local_tmp_dir_1 = require("with-local-tmp-dir");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
// Get API credentials (if any)
var APICredentials = {
    Username: process.env.MELCLOUD_EMAIL,
    Password: process.env.MELCLOUD_PASSWORD
};
var HasAPICredentials = (APICredentials.Username !== undefined && APICredentials.Password !== undefined);
// FIXME: This plugin is mostly working, but the online/offline status is NOT working for some reason?!
describe('Mock API', function () {
    describe('Login Response', function () {
        // TODO: It's going to suck, but we're going to need to
        //       test all of the API responses and properties..
        var loginResponse = (0, intermock_1.mock)({
            files: [
                [
                    './src/api/client.ts',
                    fs_1["default"].readFileSync('./src/api/client.ts').toString(),
                ],
                [
                    './src/config/index.ts',
                    fs_1["default"].readFileSync('./src/config/index.ts').toString(),
                ],
            ],
            interfaces: [
                'ILoginResponse',
                'ILoginData',
                // 'IMELCloudConfig',
                'MELCloudLanguage',
            ],
            isOptionalAlwaysEnabled: true
        });
        console.log('loginResponse:', loginResponse);
        it('should have a valid login response', function (done) {
            // Test that loginResponse is an object and not empty
            expect(loginResponse).toBeDefined();
            expect(loginResponse).not.toBeNull();
            expect(loginResponse).toBeInstanceOf(Object);
            expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2);
            done();
        });
        // TODO: Now that we have the "mocked" type from the interface(s),
        //       we need to somehow be able to compare recursively
        //       that every property and type is the same in the response!
        // const mock = jest.fn<ILoginResponse, []>(() => {
        //   return {
        //     ErrorId: 0,
        //     ErrorMessage: '',
        //     LoginStatus: 0,
        //     UserId: 0,
        //     RandomKey: '',
        //     AppVersionAnnouncement: '',
        //     LoginData: null, // TODO: This should be tested too..
        //     ListPendingInvite: null,
        //     ListOwnershipChangeRequest: null,
        //     ListPendingAnnouncement: null,
        //     LoginMinutes: 0,
        //     LoginAttempts: 0
        //   }
        // })
        // it('should return properties', () => {
        //   const response = mock()
        //   expect(response.ErrorId).toEqual(0)
        //   expect(response.LoginData).toEqual(null)
        // })
    });
});
// Only include real API tests if we have the API credentials available
if (HasAPICredentials) {
    describe('Real API', function () {
        describe('Login Response', function () {
            // TODO: Test the real API here, so long as we have the credentials etc.
            //       otherwise just skip this test if the credentials are not set?
            var logger = {
                info: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return console.info.apply(console, __spreadArray(['INFO:'], args, false));
                },
                warn: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return console.warn.apply(console, __spreadArray(['WARNING:'], args, false));
                },
                error: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return console.error.apply(console, __spreadArray(['ERROR:'], args, false));
                },
                debug: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return console.debug.apply(console, __spreadArray(['DEBUG:'], args, false));
                },
                log: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return console.log.apply(console, __spreadArray(['LOG:'], args, false));
                }
            };
            var validConfig = {
                username: APICredentials.Username,
                password: APICredentials.Password,
                language: config_1.MELCloudLanguage.English,
                debug: true
            };
            var invalidConfig = {
                username: 'foo@bar',
                password: 'foobar',
                language: config_1.MELCloudLanguage.English,
                debug: true
            };
            // Create a 
            // const storagePath = './tmp'
            // TODO: Test creating the client without a logger, config and storage path, all separate tests
            it('should be able to create a valid client', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, with_local_tmp_dir_1["default"])(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var storagePath, client;
                                return __generator(this, function (_a) {
                                    storagePath = process.cwd();
                                    client = new client_1.MELCloudAPIClient(logger, invalidConfig, storagePath);
                                    // Test that loginResponse is an object and not empty
                                    expect(client).toBeDefined();
                                    expect(client).not.toBeNull();
                                    expect(client).toBeInstanceOf(Object);
                                    return [2 /*return*/];
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should fail login with invalid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, with_local_tmp_dir_1["default"])(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var storagePath, client;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            storagePath = process.cwd();
                                            client = new client_1.MELCloudAPIClient(logger, invalidConfig, storagePath);
                                            // const loginResponse = await client.login()
                                            // await expect(client.login()).rejects.toMatch('errror')
                                            return [4 /*yield*/, expect(client.login()).rejects.toThrowError('Login failed due to invalid credentials.')];
                                        case 1:
                                            // const loginResponse = await client.login()
                                            // await expect(client.login()).rejects.toMatch('errror')
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should succeed login with valid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, with_local_tmp_dir_1["default"])(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var storagePath, client, loginResponse;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            storagePath = process.cwd();
                                            client = new client_1.MELCloudAPIClient(logger, validConfig, storagePath);
                                            return [4 /*yield*/, client.login()
                                                // const loginResponse = await expect(client.login()).resolves.toBeDefined()
                                                // Test that loginResponse is an object and not empty
                                            ];
                                        case 1:
                                            loginResponse = _a.sent();
                                            // const loginResponse = await expect(client.login()).resolves.toBeDefined()
                                            // Test that loginResponse is an object and not empty
                                            expect(loginResponse).toBeDefined();
                                            expect(loginResponse).not.toBeNull();
                                            expect(loginResponse).toBeInstanceOf(Object);
                                            expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should be able to list and get devices', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, with_local_tmp_dir_1["default"])(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var storagePath, client, devices, firstBuilding, firstDeviceID, deviceDetails;
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            storagePath = process.cwd();
                                            client = new client_1.MELCloudAPIClient(logger, validConfig, storagePath);
                                            return [4 /*yield*/, client.login()];
                                        case 1:
                                            _d.sent();
                                            return [4 /*yield*/, client.listDevices()]; // TODO: Rename this to "listBuildings" etc. to match the underlying data!
                                        case 2:
                                            devices = _d.sent() // TODO: Rename this to "listBuildings" etc. to match the underlying data!
                                            ;
                                            console.log('DEVICES:', devices);
                                            // Test that device list is an array and not empty
                                            expect(devices).toBeDefined();
                                            expect(devices).not.toBeNull();
                                            expect(devices).toBeInstanceOf(Array);
                                            expect(JSON.stringify(devices).length).toBeGreaterThan(2);
                                            firstBuilding = devices[0];
                                            console.log('FIRST BUILDING:', firstBuilding);
                                            expect(firstBuilding).toBeDefined();
                                            expect(firstBuilding).not.toBeNull();
                                            expect(firstBuilding).toBeInstanceOf(Object);
                                            expect(JSON.stringify(firstBuilding).length).toBeGreaterThan(2);
                                            firstDeviceID = (_c = (_b = (_a = firstBuilding.Structure) === null || _a === void 0 ? void 0 : _a.Devices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.DeviceID;
                                            console.log('FIRST DEVICE ID:', firstDeviceID);
                                            expect(firstDeviceID).toBeDefined();
                                            expect(firstDeviceID).not.toBeNull();
                                            expect(firstDeviceID).toEqual(expect.any(Number));
                                            expect(firstDeviceID).toBeGreaterThan(0);
                                            return [4 /*yield*/, client.getDevice(firstDeviceID !== null && firstDeviceID !== void 0 ? firstDeviceID : null, firstBuilding.ID)];
                                        case 3:
                                            deviceDetails = _d.sent();
                                            console.log('DEVICE DETAILS:', deviceDetails);
                                            expect(deviceDetails).toBeDefined();
                                            expect(deviceDetails).not.toBeNull();
                                            expect(deviceDetails).toBeInstanceOf(Object);
                                            expect(JSON.stringify(deviceDetails).length).toBeGreaterThan(2);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // const loginResponse = mock({
            //   files: [
            //     [
            //       './src/api/client.ts',
            //       fs.readFileSync('./src/api/client.ts').toString()
            //     ],
            //     [
            //       './src/config/index.ts',
            //       fs.readFileSync('./src/config/index.ts').toString()
            //     ]
            //   ],
            //   interfaces: [
            //     'ILoginResponse',
            //     'ILoginData',
            //     // 'IMELCloudConfig',
            //     'MELCloudLanguage'
            //   ],
            //   isOptionalAlwaysEnabled: true
            // }) as unknown as ILoginResponse
            // console.log('loginResponse:', loginResponse)
            // it('should have a valid login response', (done) => {
            //   // Test that loginResponse is an object and not empty
            //   expect(loginResponse).toBeDefined()
            //   expect(loginResponse).not.toBeNull()
            //   expect(loginResponse).toBeInstanceOf(Object)
            //   expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2)
            //   done()
            // })
        });
    });
}
// describe('should do stuff', () => {
//   beforeAll(() => {
//     console.log('beforeAll')
//   })
//   it('should do foo', (done) => {
//     console.log('foo')
//     done()
//   })
//   it('should do bar', (done) => {
//     console.log('bar')
//     // const res = mock()
//     // console.log('res', res)
//     request('https://jsonplaceholder.typicode.com/todos/1')
//       .get('/')
//       .expect(200)
//       .end((err, res) => {
//         if (err) return done(err)
//         expect(res.body).toMatchObject({
//           'userId': 1,
//           'id': 1,
//           'title': 'delectus aut autem',
//           'completed': false
//         })
//         done()
//       })
//   })
// })
