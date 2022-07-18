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
var client_1 = require("../api/client");
var config_1 = require("../config");
var accessory_1 = require("../accessory");
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
var MELCloudPlatform = /** @class */ (function () {
    // #endregion
    // TODO: Re-enable
    // #region MELCloudPlatform - Properties
    // UseFahrenheit: boolean
    // CurrentHeatingCoolingStateUUID: any
    // TargetHeatingCoolingStateUUID: any
    // CurrentTemperatureUUID: any
    // TargetTemperatureUUID: any
    // TemperatureDisplayUnitsUUID: any
    // RotationSpeedUUID: any
    // CurrentHorizontalTiltAngleUUID: any
    // TargetHorizontalTiltAngleUUID: any
    // CurrentVerticalTiltAngleUUID: any
    // TargetVerticalTiltAngleUUID: any
    // currentAirInfoExecution: number
    // airInfoExecutionPending: Array<{ callback: any, characteristic: Characteristic, service: Service, homebridgeAccessory: IMELCloudBridgedAccessory, value: any, operation: any }>
    // #endregion
    function MELCloudPlatform(log, config, api) {
        var _this = this;
        this.accessories = [];
        // Store a reference to the logger
        if (!log) {
            throw new Error('Invalid or null Homebridge logger');
        }
        this.log = log;
        // Store a reference to the config
        if (!config) {
            throw new Error('Invalid or null Homebridge platform config');
        }
        (0, config_1.validateMELCloudConfig)(config);
        this.config = config;
        // Store a reference to the HAP API
        if (!api) {
            throw new Error('Invalid or null Homebridge API');
        }
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // Create a new MELCloud API client
        this.client = new client_1.MELCloudAPIClient(this.log, this.config, this.api.user.storagePath());
        if (!this.client) {
            throw new Error('Failed to create MELCloud API client');
        }
        // TODO: Re-enable
        // Setup MELCloud specific accessory/service information
        // this.UseFahrenheit = false
        // this.CurrentHeatingCoolingStateUUID = (new api.hap.Characteristic.CurrentHeatingCoolingState()).UUID
        // this.TargetHeatingCoolingStateUUID = (new api.hap.Characteristic.TargetHeatingCoolingState()).UUID
        // this.CurrentTemperatureUUID = (new api.hap.Characteristic.CurrentTemperature()).UUID
        // this.TargetTemperatureUUID = (new api.hap.Characteristic.TargetTemperature()).UUID
        // this.TemperatureDisplayUnitsUUID = (new api.hap.Characteristic.TemperatureDisplayUnits()).UUID
        // this.RotationSpeedUUID = (new api.hap.Characteristic.RotationSpeed()).UUID
        // this.CurrentHorizontalTiltAngleUUID = (new api.hap.Characteristic.CurrentHorizontalTiltAngle()).UUID
        // this.TargetHorizontalTiltAngleUUID = (new api.hap.Characteristic.TargetHorizontalTiltAngle()).UUID
        // this.CurrentVerticalTiltAngleUUID = (new api.hap.Characteristic.CurrentVerticalTiltAngle()).UUID
        // this.TargetVerticalTiltAngleUUID = (new api.hap.Characteristic.TargetVerticalTiltAngle()).UUID
        // this.currentAirInfoExecution = 0
        // this.airInfoExecutionPending = []
        if (this.config.debug) {
            this.log.debug('Finished initializing platform:', this.config.name);
        }
        /*
         * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
         * after this event was fired, in order to ensure they weren't added to homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        this.api.on("didFinishLaunching" /* APIEvent.DID_FINISH_LAUNCHING */, function () {
            if (_this.config.debug) {
                _this.log.debug('Executed didFinishLaunching callback');
            }
            // run the method to discover / register your devices as accessories
            _this.discoverDevices()
                .then(function () {
                if (_this.config.debug) {
                    _this.log.debug('Device discovery successful');
                }
            })["catch"](function (err) {
                _this.log.error('Device discovery failed:', err);
            });
        });
    }
    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    // FIXME: How can se use MELCloudBridgedAccessory her instead of PlatformAccessory?
    MELCloudPlatform.prototype.configureAccessory = function (accessory) {
        var _this = this;
        if (this.config.debug) {
            this.log.debug('Loading accessory from cache:', accessory.displayName);
        }
        // identify the accessory
        accessory.on("identify" /* PlatformAccessoryEvent.IDENTIFY */, function () {
            _this.log.info('%s identified!', accessory.displayName);
        });
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    };
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    MELCloudPlatform.prototype.discoverDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.info('Discovering devices as accessories');
                        // TODO: UPDATE: This is now a part of client.UseFahrenheit (FIXME: The value is ONLY updated on login though?!)
                        // TODO: Set UseFahrenheit from loginResponse.UseFahrenheit
                        // loginResponse.UseFahrenheit
                        // Get devices from MELCloud and add them as HomeKit accessories
                        return [4 /*yield*/, this.getDevices()
                            // TODO: Now just add all accessories to this.accessories and register them with Homebridge?
                            //       But what about potential duplicates?!
                            // TODO: If we discover devices at a set interval, we should DEFINITELY protect against duplicates, removals etc.
                            // EXAMPLE ONLY
                            // A real plugin you would discover accessories from the local network, cloud services
                            // or a user-defined array in the platform config.
                            // const exampleDevices = [
                            //   {
                            //     exampleUniqueId: 'ABCD',
                            //     exampleDisplayName: 'Bedroom'
                            //   },
                            //   {
                            //     exampleUniqueId: 'EFGH',
                            //     exampleDisplayName: 'Kitchen'
                            //   }
                            // ]
                            // // loop over the discovered devices and register each one if it has not already been registered
                            // for (const device of exampleDevices) {
                            //   // generate a unique id for the accessory this should be generated from
                            //   // something globally unique, but constant, for example, the device serial
                            //   // number or MAC address
                            //   const uuid = this.api.hap.uuid.generate(device.exampleUniqueId)
                            //   // see if an accessory with the same uuid has already been registered and restored from
                            //   // the cached devices we stored in the `configureAccessory` method above
                            //   const existingAccessory: IMELCloudBridgedAccessory = this.accessories.find(accessory => accessory.UUID === uuid) as IMELCloudBridgedAccessory
                            //   if (existingAccessory) {
                            //     // the accessory already exists
                            //     this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName)
                            //     // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                            //     // existingAccessory.context.device = device;
                            //     // this.api.updatePlatformAccessories([existingAccessory]);
                            //     // create the accessory handler for the restored accessory
                            //     // this is imported from `platformAccessory.ts`
                            //     new MELCloudBridgedAccessory(this, existingAccessory)
                            //     // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                            //     // remove platform accessories when no longer present
                            //     // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
                            //     // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
                            //   } else {
                            //     // the accessory does not yet exist, so we need to create it
                            //     this.log.info('Adding new accessory:', device.exampleDisplayName)
                            //     // create a new accessory
                            //     const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid)
                            //     // store a copy of the device object in the `accessory.context`
                            //     // the `context` property can be used to store any data about the accessory you may need
                            //     accessory.context.device = device
                            //     // create the accessory handler for the newly create accessory
                            //     // this is imported from `platformAccessory.ts`
                            //     new MELCloudBridgedAccessory(this, accessory)
                            //     // link the accessory to your platform
                            //     this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
                            //   }
                        ];
                    case 1:
                        // TODO: UPDATE: This is now a part of client.UseFahrenheit (FIXME: The value is ONLY updated on login though?!)
                        // TODO: Set UseFahrenheit from loginResponse.UseFahrenheit
                        // loginResponse.UseFahrenheit
                        // Get devices from MELCloud and add them as HomeKit accessories
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // FIXME: This should re-use existing accessories and not always recreate them?!
    //        See here for an example: https://github.com/homebridge/homebridge-plugin-template/blob/master/src/platform.ts
    MELCloudPlatform.prototype.getDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.config.debug) {
                    this.log.debug('Getting devices..');
                }
                return [2 /*return*/, this.client.listDevices()
                        .then(function (buildings) {
                        // Prepare an array of accessories
                        // const foundAccessories = [] as Array<PlatformAccessory>
                        // Parse and loop through all buildings
                        for (var _i = 0, buildings_1 = buildings; _i < buildings_1.length; _i++) {
                            var building = buildings_1[_i];
                            if (building) {
                                if (_this.config.debug) {
                                    _this.log.debug('Building:', building);
                                }
                                // (Re)create the accessories
                                if (building.Structure) {
                                    _this.createAccessories(building, building.Structure.Devices);
                                    // Parse and loop through all floors
                                    if (building.Structure.Floors) {
                                        for (var _a = 0, _b = building.Structure.Floors; _a < _b.length; _a++) {
                                            var floor = _b[_a];
                                            if (_this.config.debug) {
                                                _this.log.debug('Floor:', floor);
                                            }
                                            // (Re)create the accessories
                                            _this.createAccessories(building, floor.Devices);
                                            // Parse and loop through all floor areas
                                            if (floor.Areas) {
                                                for (var _c = 0, _d = floor.Areas; _c < _d.length; _c++) {
                                                    var floorArea = _d[_c];
                                                    if (_this.config.debug) {
                                                        _this.log.debug('Floor area:', floorArea);
                                                    }
                                                    // (Re)create the accessories
                                                    _this.createAccessories(building, floorArea.Devices);
                                                }
                                            }
                                        }
                                    }
                                    // Parse and loop through all building areas
                                    if (building.Structure.Areas) {
                                        for (var _e = 0, _f = building.Structure.Areas; _e < _f.length; _e++) {
                                            var buildingArea = _f[_e];
                                            if (_this.config.debug) {
                                                _this.log.debug('Building area:', buildingArea);
                                            }
                                            // (Re)create the accessories
                                            _this.createAccessories(building, buildingArea.Devices);
                                        }
                                    }
                                }
                            }
                        }
                    })];
            });
        });
    };
    MELCloudPlatform.prototype.createAccessories = function (building, devices) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, devices_1, device;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config.debug) {
                            this.log.debug('Creating accessories..');
                        }
                        if (!devices) return [3 /*break*/, 4];
                        _loop_1 = function (device) {
                            var uuid_1, existingAccessory, _b, accessory, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!device.DeviceID) return [3 /*break*/, 4];
                                        uuid_1 = this_1.api.hap.uuid.generate(device.DeviceID.toString());
                                        existingAccessory = this_1.accessories.find(function (accessory) { return accessory.UUID === uuid_1; });
                                        if (!existingAccessory) return [3 /*break*/, 2];
                                        // the accessory already exists
                                        if (this_1.config.debug) {
                                            this_1.log.debug('Restoring existing accessory from cache:', existingAccessory.displayName);
                                        }
                                        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                                        // existingAccessory.context.device = device;
                                        // this.api.updatePlatformAccessories([existingAccessory]);
                                        // TODO: Do we need to do this?
                                        // Update existing accessory context
                                        existingAccessory.context.device = device;
                                        _b = existingAccessory.context;
                                        return [4 /*yield*/, this_1.client.getDevice(device.DeviceID, device.BuildingID)];
                                    case 1:
                                        _b.deviceDetails = _d.sent();
                                        this_1.api.updatePlatformAccessories([existingAccessory]);
                                        // create the accessory handler for the restored accessory
                                        // this is imported from `platformAccessory.ts`
                                        new accessory_1["default"](this_1, existingAccessory);
                                        return [3 /*break*/, 4];
                                    case 2:
                                        if (!device.DeviceName) return [3 /*break*/, 4];
                                        // the accessory does not yet exist, so we need to create it
                                        if (this_1.config.debug) {
                                            this_1.log.debug('Adding new accessory:', device.DeviceName);
                                        }
                                        accessory = new this_1.api.platformAccessory(device.DeviceName, uuid_1);
                                        // store a copy of the device object in the `accessory.context`
                                        // the `context` property can be used to store any data about the accessory you may need
                                        accessory.context.device = device;
                                        _c = accessory.context;
                                        return [4 /*yield*/, this_1.client.getDevice(device.DeviceID, device.BuildingID)
                                            // create the accessory handler for the newly create accessory
                                            // this is imported from `platformAccessory.ts`
                                        ];
                                    case 3:
                                        _c.deviceDetails = _d.sent();
                                        // create the accessory handler for the newly create accessory
                                        // this is imported from `platformAccessory.ts`
                                        new accessory_1["default"](this_1, accessory);
                                        // link the accessory to your platform
                                        this_1.api.registerPlatformAccessories(config_1.PLUGIN_NAME, config_1.PLATFORM_NAME, [accessory]);
                                        _d.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, devices_1 = devices;
                        _a.label = 1;
                    case 1:
                        if (!(_i < devices_1.length)) return [3 /*break*/, 4];
                        device = devices_1[_i];
                        return [5 /*yield**/, _loop_1(device)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MELCloudPlatform;
}());
exports["default"] = MELCloudPlatform;
