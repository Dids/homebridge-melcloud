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
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
var MELCloudBridgedAccessory = /** @class */ (function () {
    // public readonly log: Logging
    // public readonly config: IMELCloudAccessoryConfig
    // public readonly api: API
    // public readonly name: string
    // public readonly thermostatService: Service
    // public readonly informationService: Service
    function MELCloudBridgedAccessory(platform, accessory) {
        var _this = this;
        this.useThermostat = true;
        if (!platform) {
            throw new Error('Invalid or missing platform');
        }
        this.platform = platform;
        if (!platform.log) {
            throw new Error('Invalid or missing platform logger');
        }
        this.log = platform.log;
        if (!platform.api) {
            throw new Error('Invalid or missing platform API');
        }
        this.api = platform.api;
        if (!accessory) {
            throw new Error('Invalid or missing accessory');
        }
        this.accessory = accessory;
        // FIXME: Load these from storage? Or forcibly wait for client update to set them instead?
        // initialize accessory state
        this.active = this.api.hap.Characteristic.Active.INACTIVE;
        this.currentHeaterCoolerState = this.api.hap.Characteristic.CurrentHeaterCoolerState.INACTIVE;
        this.targetHeaterCoolerState = this.api.hap.Characteristic.TargetHeaterCoolerState.AUTO;
        this.currentHeatingCoolingState = this.api.hap.Characteristic.CurrentHeatingCoolingState.OFF;
        this.targetHeatingCoolingState = this.api.hap.Characteristic.TargetHeatingCoolingState.OFF;
        this.currentTemperature = -270;
        this.targetTemperature = 10;
        this.temperatureDisplayUnits = this.api.hap.Characteristic.TemperatureDisplayUnits.CELSIUS;
        // this.lockPhysicalControls = this.api.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED
        this.rotationSpeed = 0;
        this.swingMode = 0;
        this.coolingThresholdTemperature = 10;
        this.heatingThresholdTemperature = 0;
        this.currentHorizontalTiltAngle = -90;
        this.targetHorizontalTiltAngle = -90;
        this.currentVerticalTiltAngle = -90;
        this.targetVerticalTiltAngle = -90;
        this.updateDeviceInfo()["catch"](function (err) {
            _this.log.error('Failed to update device info, reverting to default values:', err);
        });
        // set accessory information
        var device = accessory.context.device;
        var informationService = this.accessory.getService(this.platform.Service.AccessoryInformation);
        if (informationService) {
            informationService
                .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Mitsubishi')
                .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
                .setCharacteristic(this.platform.Characteristic.Name, /*accessory.displayName ||*/ device.DeviceName || 'Not Set')
                .setCharacteristic(this.platform.Characteristic.SerialNumber, device.SerialNumber || 'Not Set');
        }
        else {
            throw new Error('Failed to set accessory information');
        }
        // get the Thermostat service if it exists, otherwise create a new LightBulb service
        // you can create multiple services for each accessory
        // FIXME: Consider trying the HeaterCooler approach as well (maybe as a separate accessory?):
        //        https://developers.homebridge.io/#/service/HeaterCooler
        var service = this.useThermostat ? this.platform.Service.Thermostat : this.platform.Service.HeaterCooler;
        this.service = this.accessory.getService(service) || this.accessory.addService(service);
        // this.service = this.accessory.getService(this.platform.Service.HeaterCooler) || this.accessory.addService(this.platform.Service.HeaterCooler)
        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        // FIXME: Use the accessory.context to pass arbitrary data, such as model, serial and name
        // this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName)
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);
        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Thermostat
        // Setup service specific characteristic handlers
        if (this.useThermostat) { // Thermostat
            // Register handlers for current heating/cooling state
            this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
                .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));
            // Register handlers for target heating/cooling state
            this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
                .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
                .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));
            // Register handlers for target temperature
            this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
                .onGet(this.handleTargetTemperatureGet.bind(this))
                .onSet(this.handleTargetTemperatureSet.bind(this));
            // Register handlers for current horizontal tilt angle
            this.service.getCharacteristic(this.platform.Characteristic.CurrentHorizontalTiltAngle)
                .onGet(this.handleCurrentHorizontalTiltAngleGet.bind(this));
            // Register handlers for target horizontal tilt angle
            this.service.getCharacteristic(this.platform.Characteristic.TargetHorizontalTiltAngle)
                .onGet(this.handleTargetHorizontalTiltAngleGet.bind(this))
                .onSet(this.handleTargetHorizontalTiltAngleSet.bind(this));
            // Register handlers for current vertical tilt angle
            this.service.getCharacteristic(this.platform.Characteristic.CurrentVerticalTiltAngle)
                .onGet(this.handleCurrentVerticalTiltAngleGet.bind(this));
            // Register handlers for target vertical tilt angle
            this.service.getCharacteristic(this.platform.Characteristic.TargetVerticalTiltAngle)
                .onGet(this.handleTargetVerticalTiltAngleGet.bind(this))
                .onSet(this.handleTargetVerticalTiltAngleSet.bind(this));
        }
        else { // Heater Cooler
            // Register handlers for active
            this.service.getCharacteristic(this.platform.Characteristic.Active)
                .onGet(this.handleActiveGet.bind(this))
                .onSet(this.handleActiveSet.bind(this));
            // Register handlers for current heater/cooler state
            this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
                .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));
            // Register handlers for target heater/cooler state
            this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
                .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
                .onSet(this.handleTargetHeaterCoolerStateSet.bind(this));
            // Register handlers for cooling threshold temperature
            this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
                .onGet(this.handleCoolingThresholdTemperatureGet.bind(this))
                .onSet(this.handleCoolingThresholdTemperatureSet.bind(this));
            // Register handlers for heating threshold temperature
            this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
                .onGet(this.handleHeatingThresholdTemperatureGet.bind(this))
                .onSet(this.handleHeatingThresholdTemperatureSet.bind(this));
            // Register handlers for locking physical controls
            // this.service.getCharacteristic(this.platform.Characteristic.LockPhysicalControls)
            //   .onGet(this.handleLockPhysicalControlsGet.bind(this))
            //   .onSet(this.handleLockPhysicalControlsSet.bind(this))
            // Register handlers for rotatin speed
            this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
                .onGet(this.handleRotationSpeedGet.bind(this))
                .onSet(this.handleRotationSpeedSet.bind(this));
            // Register handlers for swing mode
            this.service.getCharacteristic(this.platform.Characteristic.SwingMode)
                .onGet(this.handleSwingModeGet.bind(this))
                .onSet(this.handleSwingModeSet.bind(this));
        }
        // Register handlers for current temperature
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTemperatureGet.bind(this));
        // Register handlers for temperature display units
        this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
            .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
    }
    /**
     * Handle requests to get the current value of the "Active" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleActiveGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minActive, maxActive, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET Active');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minActive = 0;
                        maxActive = 1;
                        currentValue = Math.min(maxActive, Math.max(minActive, this.active));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning Active with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Active" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleActiveSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minActive, maxActive, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET Active:', value);
                        }
                        minActive = 0;
                        maxActive = 1;
                        currentValue = Math.min(maxActive, Math.max(minActive, value));
                        // FIXME: This may also be where our issue lies?!
                        this.active = currentValue;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending Active with value:', currentValue);
                        }
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.Active.UUID, this.active)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Current Heater Cooler State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCurrentHeaterCoolerStateGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentHeaterCoolerState, maxCurrentHeaterCoolerState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CurrentHeaterCoolerState');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCurrentHeaterCoolerState = 0;
                        maxCurrentHeaterCoolerState = 3;
                        currentValue = Math.min(maxCurrentHeaterCoolerState, Math.max(minCurrentHeaterCoolerState, this.currentHeaterCoolerState));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CurrentHeaterCoolerState with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Target Heater Cooler State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHeaterCoolerStateGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHeaterCoolerState, maxTargetHeaterCoolerState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TargetHeaterCoolerState');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTargetHeaterCoolerState = 0;
                        maxTargetHeaterCoolerState = 2;
                        currentValue = Math.min(maxTargetHeaterCoolerState, Math.max(minTargetHeaterCoolerState, this.targetHeaterCoolerState));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TargetHeaterCoolerState with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Target Heater Cooler State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHeaterCoolerStateSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHeaterCoolerState, maxTargetHeaterCoolerState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TargetHeaterCoolerState:', value);
                        }
                        minTargetHeaterCoolerState = 0;
                        maxTargetHeaterCoolerState = 2;
                        currentValue = Math.min(maxTargetHeaterCoolerState, Math.max(minTargetHeaterCoolerState, value));
                        this.targetHeaterCoolerState = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.TargetHeaterCoolerState.UUID, this.targetHeaterCoolerState)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCurrentHeatingCoolingStateGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentHeatingCoolingState, maxCurrentHeatingCoolingState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CurrentHeatingCoolingState');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCurrentHeatingCoolingState = 0;
                        maxCurrentHeatingCoolingState = 2;
                        currentValue = Math.min(maxCurrentHeatingCoolingState, Math.max(minCurrentHeatingCoolingState, this.currentHeatingCoolingState));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CurrentHeatingCoolingState with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHeatingCoolingStateGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHeatingCoolingState, maxTargetHeatingCoolingState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TargetHeatingCoolingState');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTargetHeatingCoolingState = 0;
                        maxTargetHeatingCoolingState = 3;
                        currentValue = Math.min(maxTargetHeatingCoolingState, Math.max(minTargetHeatingCoolingState, this.targetHeatingCoolingState));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TargetHeatingCoolingState with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Target Heating Cooling State" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHeatingCoolingStateSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHeatingCoolingState, maxTargetHeatingCoolingState, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
                        }
                        minTargetHeatingCoolingState = 0;
                        maxTargetHeatingCoolingState = 3;
                        currentValue = Math.min(maxTargetHeatingCoolingState, Math.max(minTargetHeatingCoolingState, value));
                        this.targetHeatingCoolingState = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.TargetHeatingCoolingState.UUID, this.targetHeatingCoolingState)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCurrentTemperatureGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentTemperature, maxCurrentTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CurrentTemperature');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCurrentTemperature = -270;
                        maxCurrentTemperature = 100;
                        currentValue = Math.min(maxCurrentTemperature, Math.max(minCurrentTemperature, this.currentTemperature));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CurrentTemperature with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetTemperatureGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetTemperature, maxTargetTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TargetTemperature');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTargetTemperature = 10;
                        maxTargetTemperature = 38;
                        currentValue = Math.min(maxTargetTemperature, Math.max(minTargetTemperature, this.targetTemperature));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TargetTemperature with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Target Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetTemperatureSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentTemperature, maxCurrentTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TargetTemperature:', value);
                        }
                        minCurrentTemperature = 10;
                        maxCurrentTemperature = 38;
                        currentValue = Math.min(maxCurrentTemperature, Math.max(minCurrentTemperature, value));
                        this.targetTemperature = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.TargetTemperature.UUID, this.targetTemperature)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTemperatureDisplayUnitsGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTemperatureDisplayUnits, maxTemperatureDisplayUnits, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TemperatureDisplayUnits');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTemperatureDisplayUnits = 0;
                        maxTemperatureDisplayUnits = 1;
                        currentValue = Math.min(maxTemperatureDisplayUnits, Math.max(minTemperatureDisplayUnits, this.temperatureDisplayUnits));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TemperatureDisplayUnits with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTemperatureDisplayUnitsSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minTemperatureDisplayUnits, maxTemperatureDisplayUnits, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
                        }
                        minTemperatureDisplayUnits = 0;
                        maxTemperatureDisplayUnits = 1;
                        currentValue = Math.min(maxTemperatureDisplayUnits, Math.max(minTemperatureDisplayUnits, value));
                        this.temperatureDisplayUnits = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.TemperatureDisplayUnits.UUID, this.temperatureDisplayUnits)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // /**
    //  * Handle requests to get the current value of the "Current Relative Humidity" characteristic
    //  */
    // handleCurrentRelativeHumidityGet(): number {
    //   if (this.platform.config.debug) { this.log.debug('Triggered GET CurrentRelativeHumidity') }
    //   const minCurrentRelativeHumidity = 0
    //   const maxCurrentRelativeHumidity = 100
    //   const currentValue = Math.min(maxCurrentRelativeHumidity, Math.max(minCurrentRelativeHumidity, this.currentRelativeHumidity))
    //   if (this.platform.config.debug) { this.log.debug('Returning CurrentRelativeHumidity with value:', currentValue) }
    //   return currentValue
    // }
    // /**
    //  * Handle requests to get the current value of the "Target Relative Humidity" characteristic
    //  */
    // handleTargetRelativeHumidityGet(): number {
    //   if (this.platform.config.debug) { this.log.debug('Triggered GET TargetRelativeHumidity') }
    //   const minTargetRelativeHumidity = 0
    //   const maxTargetRelativeHumidity = 100
    //   const currentValue = Math.min(maxTargetRelativeHumidity, Math.max(minTargetRelativeHumidity, this.targetRelativeHumidity))
    //   if (this.platform.config.debug) { this.log.debug('Returning TargetRelativeHumidity with value:', currentValue) }
    //   return currentValue
    // }
    // /**
    //  * Handle requests to set the "Target Relative Humidity" characteristic
    //  */
    // handleTargetRelativeHumiditySet(value: CharacteristicValue): void {
    //   if (this.platform.config.debug) { this.log.debug('Triggered SET TargetRelativeHumidity:', value) }
    //   const minTargetRelativeHumidity = 0
    //   const maxTargetRelativeHumidity = 100
    //   const currentValue = Math.min(maxTargetRelativeHumidity, Math.max(minTargetRelativeHumidity, value as number))
    //   this.targetRelativeHumidity = currentValue
    // }
    /**
     * Handle requests to get the current value of the "Cooling Threshold Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCoolingThresholdTemperatureGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCoolingThresholdTemperature, maxCoolingThresholdTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CoolingThresholdTemperature');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCoolingThresholdTemperature = 10;
                        maxCoolingThresholdTemperature = 35;
                        currentValue = Math.min(maxCoolingThresholdTemperature, Math.max(minCoolingThresholdTemperature, this.coolingThresholdTemperature));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CoolingThresholdTemperature with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Cooling Threshold Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCoolingThresholdTemperatureSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minCoolingThresholdTemperature, maxCoolingThresholdTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET CoolingThresholdTemperature:', value);
                        }
                        minCoolingThresholdTemperature = 10;
                        maxCoolingThresholdTemperature = 35;
                        currentValue = Math.min(maxCoolingThresholdTemperature, Math.max(minCoolingThresholdTemperature, value));
                        this.coolingThresholdTemperature = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.CoolingThresholdTemperature.UUID, this.coolingThresholdTemperature)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Heating Threshold Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleHeatingThresholdTemperatureGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minHeatingThresholdTemperature, maxHeatingThresholdTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET HeatingThresholdTemperature');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minHeatingThresholdTemperature = 0;
                        maxHeatingThresholdTemperature = 25;
                        currentValue = Math.min(maxHeatingThresholdTemperature, Math.max(minHeatingThresholdTemperature, this.heatingThresholdTemperature));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning HeatingThresholdTemperature with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Heating Threshold Temperature" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleHeatingThresholdTemperatureSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minHeatingThresholdTemperature, maxHeatingThresholdTemperature, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET HeatingThresholdTemperature:', value);
                        }
                        minHeatingThresholdTemperature = 0;
                        maxHeatingThresholdTemperature = 25;
                        currentValue = Math.min(maxHeatingThresholdTemperature, Math.max(minHeatingThresholdTemperature, value));
                        this.heatingThresholdTemperature = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.HeatingThresholdTemperature.UUID, this.heatingThresholdTemperature)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // /**
    //  * Handle requests to get the current value of the "Lock Physical Controls" characteristic
    //  */
    // async handleLockPhysicalControlsGet(): Promise<number> {
    //   if (this.platform.config.debug) { this.log.debug('Triggered GET LockPhysicalControls') }
    //   // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    //   // Update device info
    //   await this.updateDeviceInfo()
    //   const minLockPhysicalControls = 0
    //   const maxLockPhysicalControls = 1
    //   const currentValue = Math.min(maxLockPhysicalControls, Math.max(minLockPhysicalControls, this.lockPhysicalControls))
    //   if (this.platform.config.debug) { this.log.debug('Returning LockPhysicalControls with value:', currentValue) }
    //   return currentValue
    // }
    // /**
    //  * Handle requests to set the "Lock Physical Controls" characteristic
    //  */
    // async handleLockPhysicalControlsSet(value: CharacteristicValue): Promise<void> {
    //   if (this.platform.config.debug) { this.log.debug('Triggered SET LockPhysicalControls:', value) }
    //   const minLockPhysicalControls = 0
    //   const maxLockPhysicalControls = 1
    //   const currentValue = Math.min(maxLockPhysicalControls, Math.max(minLockPhysicalControls, value as number))
    //   this.lockPhysicalControls = currentValue
    //   await this.sendDeviceData(this.api.hap.Characteristic.LockPhysicalControls.UUID, this.lockPhysicalControls)
    // }
    /**
     * Handle requests to get the current value of the "Rotation Speed" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleRotationSpeedGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minRotationSpeed, maxRotationSpeed, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET RotationSpeed');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minRotationSpeed = 0;
                        maxRotationSpeed = 100;
                        currentValue = Math.min(maxRotationSpeed, Math.max(minRotationSpeed, this.rotationSpeed));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning RotationSpeed with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Rotation Speed" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleRotationSpeedSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minRotationSpeed, maxRotationSpeed, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET RotationSpeed:', value);
                        }
                        minRotationSpeed = 0;
                        maxRotationSpeed = 100;
                        currentValue = Math.min(maxRotationSpeed, Math.max(minRotationSpeed, value));
                        this.rotationSpeed = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.rotationSpeed)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Swing Mode" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleSwingModeGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minSwingMode, maxSwingMode, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET SwingMode');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minSwingMode = 0;
                        maxSwingMode = 1;
                        currentValue = Math.min(maxSwingMode, Math.max(minSwingMode, this.swingMode));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning SwingMode with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Swing Mode" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleSwingModeSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minSwingMode, maxSwingMode, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET SwingMode:', value);
                        }
                        minSwingMode = 0;
                        maxSwingMode = 1;
                        currentValue = Math.min(maxSwingMode, Math.max(minSwingMode, value));
                        this.swingMode = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.swingMode)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Current Horizontal Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCurrentHorizontalTiltAngleGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentHorizontalTiltAngle, maxCurrentHorizontalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CurrentHorizontalTiltAngle');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCurrentHorizontalTiltAngle = -90;
                        maxCurrentHorizontalTiltAngle = 90;
                        currentValue = Math.min(maxCurrentHorizontalTiltAngle, Math.max(minCurrentHorizontalTiltAngle, this.currentHorizontalTiltAngle));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CurrentHorizontalTiltAngle with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Target Horizontal Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHorizontalTiltAngleGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHorizontalTiltAngle, maxTargetHorizontalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TargetHorizontalTiltAngle');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTargetHorizontalTiltAngle = -90;
                        maxTargetHorizontalTiltAngle = 90;
                        currentValue = Math.min(maxTargetHorizontalTiltAngle, Math.max(minTargetHorizontalTiltAngle, this.targetHorizontalTiltAngle));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TargetHorizontalTiltAngle with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Target Horizontal Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetHorizontalTiltAngleSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetHorizontalTiltAngle, maxTargetHorizontalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TargetHorizontalTiltAngle:', value);
                        }
                        minTargetHorizontalTiltAngle = -90;
                        maxTargetHorizontalTiltAngle = 90;
                        currentValue = Math.min(maxTargetHorizontalTiltAngle, Math.max(minTargetHorizontalTiltAngle, value));
                        this.targetHorizontalTiltAngle = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.targetHorizontalTiltAngle)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Current Vertical Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleCurrentVerticalTiltAngleGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minCurrentVerticalTiltAngle, maxCurrentVerticalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET CurrentVerticalTiltAngle');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minCurrentVerticalTiltAngle = -90;
                        maxCurrentVerticalTiltAngle = 90;
                        currentValue = Math.min(maxCurrentVerticalTiltAngle, Math.max(minCurrentVerticalTiltAngle, this.currentVerticalTiltAngle));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning CurrentVerticalTiltAngle with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to get the current value of the "Target Vertical Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetVerticalTiltAngleGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetVerticalTiltAngle, maxTargetVerticalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered GET TargetVerticalTiltAngle');
                        }
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        return [4 /*yield*/, this.updateDeviceInfo()];
                    case 1:
                        // FIXME: This shouldn't be done with every GET request! Or wait, should it?
                        // Update device info
                        _a.sent();
                        minTargetVerticalTiltAngle = -90;
                        maxTargetVerticalTiltAngle = 90;
                        currentValue = Math.min(maxTargetVerticalTiltAngle, Math.max(minTargetVerticalTiltAngle, this.targetVerticalTiltAngle));
                        if (this.platform.config.debug) {
                            this.log.debug('Returning TargetVerticalTiltAngle with value:', currentValue);
                        }
                        return [2 /*return*/, currentValue];
                }
            });
        });
    };
    /**
     * Handle requests to set the "Target Vertical Tilt Angle" characteristic
     */
    MELCloudBridgedAccessory.prototype.handleTargetVerticalTiltAngleSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var minTargetVerticalTiltAngle, maxTargetVerticalTiltAngle, currentValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.platform.config.debug) {
                            this.log.debug('Triggered SET TargetVerticalTiltAngle:', value);
                        }
                        minTargetVerticalTiltAngle = -90;
                        maxTargetVerticalTiltAngle = 90;
                        currentValue = Math.min(maxTargetVerticalTiltAngle, Math.max(minTargetVerticalTiltAngle, value));
                        this.targetVerticalTiltAngle = currentValue;
                        return [4 /*yield*/, this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.targetVerticalTiltAngle)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MELCloudBridgedAccessory.prototype.updateDeviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deviceInfo, Active, CurrentHeaterCoolerState, TargetHeaterCoolerState, CurrentHeatingCoolingState, TargetHeatingCoolingState, TemperatureDisplayUnits, SwingMode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDeviceInfo()];
                    case 1:
                        deviceInfo = _a.sent();
                        Active = this.api.hap.Characteristic.Active;
                        CurrentHeaterCoolerState = this.api.hap.Characteristic.CurrentHeaterCoolerState;
                        TargetHeaterCoolerState = this.api.hap.Characteristic.TargetHeaterCoolerState;
                        CurrentHeatingCoolingState = this.api.hap.Characteristic.CurrentHeatingCoolingState;
                        TargetHeatingCoolingState = this.api.hap.Characteristic.TargetHeatingCoolingState;
                        TemperatureDisplayUnits = this.api.hap.Characteristic.TemperatureDisplayUnits;
                        SwingMode = this.api.hap.Characteristic.SwingMode;
                        // FIXME: This might be where our issue is with the device showing up as "ON" when it's actually off!?
                        // Update active
                        this.active = deviceInfo.Power != null && deviceInfo.Power ? Active.ACTIVE : Active.INACTIVE;
                        if (this.platform.config.debug) {
                            this.log.debug('Updated Active with value:', this.active, 'from device info:', deviceInfo);
                        }
                        // Update current heater/heating cooler/cooling state
                        if (deviceInfo.Power != null) {
                            if (!deviceInfo.Power) {
                                this.currentHeatingCoolingState = CurrentHeatingCoolingState.OFF;
                                if (this.platform.config.debug) {
                                    this.log.debug('Device Power is OFF, setting CurrentHeatingCoolingState to OFF');
                                }
                            }
                            else {
                                if (this.platform.config.debug) {
                                    this.log.debug('Device Power is ON');
                                }
                                switch (deviceInfo.OperationMode) {
                                    case 1:
                                        this.currentHeaterCoolerState = CurrentHeaterCoolerState.HEATING;
                                        this.currentHeatingCoolingState = CurrentHeatingCoolingState.HEAT;
                                        if (this.platform.config.debug) {
                                            this.log.debug('currentHeaterCoolerState/currentHeatingCoolingState changed:', this.currentHeaterCoolerState, this.currentHeatingCoolingState);
                                        }
                                        break;
                                    case 3:
                                        this.currentHeaterCoolerState = CurrentHeaterCoolerState.COOLING;
                                        this.currentHeatingCoolingState = CurrentHeatingCoolingState.COOL;
                                        if (this.platform.config.debug) {
                                            this.log.debug('currentHeaterCoolerState/CurrentHeatingCoolingState changed:', this.currentHeaterCoolerState, this.currentHeatingCoolingState);
                                        }
                                        break;
                                    default:
                                        // MELCloud can return also 2 (dehumidify), 7 (Ventilation) and 8 (auto)
                                        // We return 5 which is undefined in HomeKit
                                        // FIXME: This no longer applies as we're clamping the values in getters/setters!
                                        this.currentHeaterCoolerState = 5;
                                        this.currentHeatingCoolingState = 5;
                                        if (this.platform.config.debug) {
                                            this.log.debug('Unknown OperationMode:', deviceInfo.OperationMode);
                                        }
                                        break;
                                }
                            }
                        }
                        else {
                            if (this.platform.config.debug) {
                                this.log.debug('DeviceInfo.Power is null, assuming OFF');
                            }
                        }
                        // Update target heater/heating cooler/cooling state
                        if (deviceInfo.Power != null) {
                            if (!deviceInfo.Power) {
                                this.currentHeaterCoolerState = CurrentHeaterCoolerState.INACTIVE;
                                this.currentHeatingCoolingState = TargetHeatingCoolingState.OFF;
                            }
                            else {
                                switch (deviceInfo.OperationMode) {
                                    case 1:
                                        this.targetHeaterCoolerState = TargetHeaterCoolerState.HEAT;
                                        this.targetHeatingCoolingState = TargetHeatingCoolingState.HEAT;
                                        break;
                                    case 3:
                                        this.targetHeaterCoolerState = TargetHeaterCoolerState.COOL;
                                        this.targetHeatingCoolingState = TargetHeatingCoolingState.COOL;
                                        break;
                                    case 8:
                                        this.targetHeaterCoolerState = TargetHeaterCoolerState.AUTO;
                                        this.targetHeatingCoolingState = TargetHeatingCoolingState.AUTO;
                                        break;
                                    default:
                                        // MELCloud can return also 2 (dehumidify), 7 (Ventilation) and 8 (auto)
                                        // We return 5 which is undefined in HomeKit
                                        // FIXME: This no longer applies as we're clamping the values in getters/setters!
                                        this.targetHeaterCoolerState = 5;
                                        this.targetHeatingCoolingState = 5;
                                        break;
                                }
                            }
                        }
                        // Update current temperature
                        if (deviceInfo.RoomTemperature) {
                            this.currentTemperature = deviceInfo.RoomTemperature;
                        }
                        // Update target temperature
                        if (deviceInfo.SetTemperature) {
                            this.targetTemperature = deviceInfo.SetTemperature;
                            this.coolingThresholdTemperature = deviceInfo.SetTemperature;
                            this.heatingThresholdTemperature = deviceInfo.SetTemperature;
                        }
                        // Update temperature display units
                        if (this.platform.client.UseFahrenheit) {
                            this.temperatureDisplayUnits = this.platform.client.UseFahrenheit ? TemperatureDisplayUnits.FAHRENHEIT : TemperatureDisplayUnits.CELSIUS;
                        }
                        // TODO: Add LockPhysicalControls
                        // Update rotation speed
                        if (deviceInfo.SetFanSpeed && deviceInfo.NumberOfFanSpeeds) {
                            this.rotationSpeed = deviceInfo.SetFanSpeed / deviceInfo.NumberOfFanSpeeds * 100.0;
                        }
                        // Update horizontal tilt angle
                        if (deviceInfo.VaneHorizontal) {
                            this.currentHorizontalTiltAngle = -90.0 + 45.0 * (deviceInfo.VaneHorizontal - 1);
                        }
                        // Update vertical tilt angle
                        if (deviceInfo.VaneVertical) {
                            this.currentVerticalTiltAngle = 90.0 - 45.0 * (5 - deviceInfo.VaneVertical);
                        }
                        // Update swing mode
                        if (deviceInfo.VaneHorizontal && deviceInfo.VaneVertical) {
                            // VaneHorizontal
                            // - 0 (Automatic)
                            // - 5 (Last, rightmost position)
                            // - 12 (Continuous)
                            // VaneVertical
                            // - 0 (Automatic)
                            // - 1 (First, upmost position)
                            // - 7 (Continuous)
                            this.swingMode = deviceInfo.VaneHorizontal == 12 && deviceInfo.VaneVertical == 7 ? SwingMode.SWING_ENABLED : SwingMode.SWING_DISABLED;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MELCloudBridgedAccessory.prototype.getDeviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var device, deviceDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        device = this.accessory.context.device;
                        return [4 /*yield*/, this.platform.client.getDevice(device.DeviceID, device.BuildingID)];
                    case 1:
                        deviceDetails = _a.sent();
                        if (this.platform.config.debug) {
                            this.platform.log.debug("[".concat(this.accessory.displayName, "] Get device details: ").concat(JSON.stringify(deviceDetails)));
                        }
                        this.accessory.context.deviceDetails = deviceDetails;
                        return [2 /*return*/, deviceDetails];
                }
            });
        });
    };
    MELCloudBridgedAccessory.prototype.sendDeviceData = function (characteristicUUID, value) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        data = this.accessory.context.deviceDetails;
                        if (!data) {
                            this.log.warn('Unable to update device data, missing device details');
                            return [2 /*return*/];
                        }
                        _b = characteristicUUID;
                        switch (_b) {
                            case this.api.hap.Characteristic.Active.UUID: return [3 /*break*/, 1];
                            case this.api.hap.Characteristic.TargetHeaterCoolerState.UUID: return [3 /*break*/, 2];
                            case this.api.hap.Characteristic.TargetHeatingCoolingState.UUID: return [3 /*break*/, 3];
                            case this.api.hap.Characteristic.TargetTemperature.UUID: return [3 /*break*/, 4];
                            case this.api.hap.Characteristic.CoolingThresholdTemperature.UUID: return [3 /*break*/, 5];
                            case this.api.hap.Characteristic.HeatingThresholdTemperature.UUID: return [3 /*break*/, 6];
                            case this.api.hap.Characteristic.TemperatureDisplayUnits.UUID: return [3 /*break*/, 7];
                            case this.api.hap.Characteristic.RotationSpeed.UUID: return [3 /*break*/, 9];
                            case this.api.hap.Characteristic.SwingMode.UUID: return [3 /*break*/, 10];
                            case this.api.hap.Characteristic.TargetHorizontalTiltAngle.UUID: return [3 /*break*/, 11];
                            case this.api.hap.Characteristic.TargetVerticalTiltAngle.UUID: return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 13];
                    case 1:
                        switch (value) {
                            case this.api.hap.Characteristic.Active.INACTIVE:
                                data.Power = false;
                                data.EffectiveFlags = 1;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for Active.INACTIVE:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.Active.ACTIVE:
                                data.Power = true;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for Active.ACTIVE:', data);
                                }
                                break;
                            default:
                                break;
                        }
                        return [3 /*break*/, 14];
                    case 2:
                        switch (value) {
                            case this.api.hap.Characteristic.TargetHeaterCoolerState.HEAT:
                                data.Power = true;
                                data.OperationMode = 1;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeaterCoolerState.HEAT:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.TargetHeaterCoolerState.COOL:
                                data.Power = true;
                                data.OperationMode = 3;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeaterCoolerState.COOL:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.TargetHeaterCoolerState.AUTO:
                                data.Power = true;
                                data.OperationMode = 8;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeaterCoolerState.AUTO:', data);
                                }
                                break;
                            default:
                                break;
                        }
                        return [3 /*break*/, 14];
                    case 3:
                        switch (value) {
                            case this.api.hap.Characteristic.TargetHeatingCoolingState.OFF:
                                data.Power = false;
                                data.EffectiveFlags = 1;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeatingCoolingState.OFF:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT:
                                data.Power = true;
                                data.OperationMode = 1;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeatingCoolingState.HEAT:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.TargetHeatingCoolingState.COOL:
                                data.Power = true;
                                data.OperationMode = 3;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeatingCoolingState.COOL:', data);
                                }
                                break;
                            case this.api.hap.Characteristic.TargetHeatingCoolingState.AUTO:
                                data.Power = true;
                                data.OperationMode = 8;
                                data.EffectiveFlags = 1 + 2;
                                if (this.platform.config.debug) {
                                    this.log.debug('Sending device data for TargetHeatingCoolingState.AUTO:', data);
                                }
                                break;
                            default:
                                break;
                        }
                        return [3 /*break*/, 14];
                    case 4:
                        data.SetTemperature = value;
                        data.EffectiveFlags = 4;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for TargetTemperature:', data);
                        }
                        return [3 /*break*/, 14];
                    case 5:
                        data.SetTemperature = value;
                        data.EffectiveFlags = 4;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for CoolingThresholdTemperature:', data);
                        }
                        return [3 /*break*/, 14];
                    case 6:
                        data.SetTemperature = value;
                        data.EffectiveFlags = 4;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for HeatingThresholdTemperature:', data);
                        }
                        return [3 /*break*/, 14];
                    case 7: return [4 /*yield*/, this.platform.client.updateOptions(value)
                        // TODO: What is this and do we need it?
                        // this.api.platformAccessory.updateApplicationOptions(value == this.api.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
                    ];
                    case 8:
                        _c.sent();
                        // TODO: What is this and do we need it?
                        // this.api.platformAccessory.updateApplicationOptions(value == this.api.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for TemperatureDisplayUnits:', data, 'NOTICE! Triggering platform update with value:', value);
                        }
                        return [3 /*break*/, 14];
                    case 9:
                        data.SetFanSpeed = parseInt((value / 100.0 * ((_a = data.NumberOfFanSpeeds) !== null && _a !== void 0 ? _a : 0)).toFixed(0));
                        data.EffectiveFlags = 8;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for RotationSpeed:', data);
                        }
                        return [3 /*break*/, 14];
                    case 10:
                        // TODO: Unconfirmed prototype code, test properly!
                        data.VaneHorizontal = value == this.api.hap.Characteristic.SwingMode.SWING_ENABLED ? 12 : 0;
                        data.VaneVertical = value == this.api.hap.Characteristic.SwingMode.SWING_ENABLED ? 7 : 0;
                        data.EffectiveFlags = 256 + 16; // Combine the tilt angle flags to set them both
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for SwingMode:', data);
                        }
                        return [3 /*break*/, 14];
                    case 11:
                        data.VaneHorizontal = parseInt(((value + 90.0) / 45.0 + 1.0).toFixed(0));
                        data.EffectiveFlags = 256;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for TargetHorizontalTiltAngle:', data);
                        }
                        return [3 /*break*/, 14];
                    case 12:
                        data.VaneVertical = parseInt(((value + 90.0) / 45.0 + 1.0).toFixed(0));
                        data.EffectiveFlags = 16;
                        if (this.platform.config.debug) {
                            this.log.debug('Sending device data for TargetVerticalTiltAngle:', data);
                        }
                        return [3 /*break*/, 14];
                    case 13: return [3 /*break*/, 14];
                    case 14: 
                    // Send the data payload to the MELCloud API
                    return [4 /*yield*/, this.platform.client.setDeviceData(data)];
                    case 15:
                        // Send the data payload to the MELCloud API
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MELCloudBridgedAccessory;
}());
exports["default"] = MELCloudBridgedAccessory;
