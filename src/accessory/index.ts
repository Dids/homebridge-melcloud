import {
  API,
  CharacteristicValue,
  Logger,
  PlatformAccessory,
  Service,
} from 'homebridge'
// import {
//   CurrentHeatingCoolingState,
//   TargetHeatingCoolingState,
//   TemperatureDisplayUnits,
//   RotationSpeed,
//   CurrentHorizontalTiltAngle,
//   TargetHorizontalTiltAngle,
//   CurrentVerticalTiltAngle,
//   TargetVerticalTiltAngle
// } from 'hap-nodejs/dist/lib/definitions/CharacteristicDefinitions'
// import { IMELCloudAccessoryConfig, validateMELCloudAccessoryConfig } from '../config'
import { IMELCloudPlatform } from '@/platform'
import {
  IDevice, IDeviceDetails, 
} from '@/api/client'

export interface IMELCloudBridgedAccessory extends Partial<PlatformAccessory> {
  readonly service: Service
  readonly platform: IMELCloudPlatform
  readonly accessory: PlatformAccessory

  readonly log: Logger
  readonly api: API

  readonly useThermostat: boolean

  active: number
  currentHeaterCoolerState: number
  targetHeaterCoolerState: number
  currentHeatingCoolingState: number
  targetHeatingCoolingState: number
  currentTemperature: number
  targetTemperature: number
  temperatureDisplayUnits: number
  // currentRelativeHumidity: number
  // targetRelativeHumidity: number
  coolingThresholdTemperature: number // FIXME: We're missing implementations for this entirely!
  heatingThresholdTemperature: number // FIXME: We're missing implementations for this entirely!
  // lockPhysicalControls: number
  rotationSpeed: number
  swingMode: number
  currentHorizontalTiltAngle: number
  targetHorizontalTiltAngle: number
  currentVerticalTiltAngle: number
  targetVerticalTiltAngle: number

  handleActiveGet(): Promise<number>
  handleActiveSet(value: CharacteristicValue): Promise<void>

  handleCurrentHeaterCoolerStateGet(): Promise<number>
  handleTargetHeaterCoolerStateGet(): Promise<number>
  handleTargetHeaterCoolerStateSet(value: CharacteristicValue): Promise<void>

  handleCurrentHeatingCoolingStateGet(): Promise<number>
  handleTargetHeatingCoolingStateGet(): Promise<number>
  handleTargetHeatingCoolingStateSet(value: CharacteristicValue): Promise<void>

  handleCurrentTemperatureGet(): Promise<number>
  handleTargetTemperatureGet(): Promise<number>
  handleTargetTemperatureSet(value: CharacteristicValue): Promise<void>

  handleTemperatureDisplayUnitsGet(): Promise<number>
  handleTemperatureDisplayUnitsSet(value: CharacteristicValue): Promise<void>

  // handleCurrentRelativeHumidityGet(): number
  // handleTargetRelativeHumidityGet(): number
  // handleTargetRelativeHumiditySet(value: CharacteristicValue): void

  handleCoolingThresholdTemperatureGet(): Promise<number>
  handleCoolingThresholdTemperatureSet(value: CharacteristicValue): Promise<void>

  handleHeatingThresholdTemperatureGet(): Promise<number>
  handleHeatingThresholdTemperatureSet(value: CharacteristicValue): Promise<void>

  // handleLockPhysicalControlsGet(): Promise<number>
  // handleLockPhysicalControlsSet(value: CharacteristicValue): Promise<void>

  handleRotationSpeedGet(): Promise<number>
  handleRotationSpeedSet(value: CharacteristicValue): Promise<void>

  handleSwingModeGet(): Promise<number>
  handleSwingModeSet(value: CharacteristicValue): Promise<void>

  handleCurrentHorizontalTiltAngleGet(): Promise<number>
  handleTargetHorizontalTiltAngleGet(): Promise<number>
  handleTargetHorizontalTiltAngleSet(value: CharacteristicValue): Promise<void>

  handleCurrentVerticalTiltAngleGet(): Promise<number>
  handleTargetVerticalTiltAngleGet(): Promise<number>
  handleTargetVerticalTiltAngleSet(value: CharacteristicValue): Promise<void>

  updateDeviceInfo(): Promise<void>
  getDeviceInfo(): Promise<IDeviceDetails>
  sendDeviceData(characteristicUUID: string, value: CharacteristicValue): Promise<void>

  // readonly log: Logging
  // readonly config: IMELCloudAccessoryConfig
  // readonly api: API

  // readonly name: string;

  // readonly thermostatService: Service
  // readonly informationService: Service

  // platform: IMELCloudPlatform
  // remoteAccessory: any
  // id: any
  // model: any
  // manufacturer: any
  // serialNumber: any
  // airInfo: any
  // airInfoRequestSent: boolean
  // buildingId: any
  // services: Array<Service>

  // getServices (): Array<Service>
}

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export default class MELCloudBridgedAccessory implements IMELCloudBridgedAccessory {
  public readonly service: Service
  public readonly platform: IMELCloudPlatform
  public readonly accessory: PlatformAccessory

  public readonly log: Logger
  public readonly api: API

  public readonly useThermostat: boolean = true

  public active: number
  public currentHeaterCoolerState: number
  public targetHeaterCoolerState: number
  public currentHeatingCoolingState: number
  public targetHeatingCoolingState: number
  public currentTemperature: number
  public targetTemperature: number
  public temperatureDisplayUnits: number

  // TODO: These aren't included in the API response, so humidity is probably not supported?
  // public currentRelativeHumidity: number
  // public targetRelativeHumidity: number
  public coolingThresholdTemperature: number
  public heatingThresholdTemperature: number

  // public lockPhysicalControls: number
  public rotationSpeed: number
  public swingMode: number
  public currentHorizontalTiltAngle: number
  public targetHorizontalTiltAngle: number
  public currentVerticalTiltAngle: number
  public targetVerticalTiltAngle: number

  // public readonly log: Logging
  // public readonly config: IMELCloudAccessoryConfig
  // public readonly api: API

  // public readonly name: string

  // public readonly thermostatService: Service
  // public readonly informationService: Service

  constructor(platform: IMELCloudPlatform, accessory: PlatformAccessory) {
    if (!platform) {
      throw new Error('Invalid or missing platform')
    }
    this.platform = platform

    if (!platform.log) {
      throw new Error('Invalid or missing platform logger')
    }
    this.log = platform.log

    if (!platform.api) {
      throw new Error('Invalid or missing platform API')
    }
    this.api = platform.api

    if (!accessory) {
      throw new Error('Invalid or missing accessory')
    }
    this.accessory = accessory

    // FIXME: Load these from storage? Or forcibly wait for client update to set them instead?
    // initialize accessory state
    this.active = this.api.hap.Characteristic.Active.INACTIVE
    this.currentHeaterCoolerState = this.api.hap.Characteristic.CurrentHeaterCoolerState.INACTIVE
    this.targetHeaterCoolerState = this.api.hap.Characteristic.TargetHeaterCoolerState.AUTO
    this.currentHeatingCoolingState = this.api.hap.Characteristic.CurrentHeatingCoolingState.OFF
    this.targetHeatingCoolingState = this.api.hap.Characteristic.TargetHeatingCoolingState.OFF
    this.currentTemperature = -270
    this.targetTemperature = 10
    this.temperatureDisplayUnits = this.api.hap.Characteristic.TemperatureDisplayUnits.CELSIUS
    // this.lockPhysicalControls = this.api.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED
    this.rotationSpeed = 0
    this.swingMode = 0
    this.coolingThresholdTemperature = 10
    this.heatingThresholdTemperature = 0
    this.currentHorizontalTiltAngle = -90
    this.targetHorizontalTiltAngle = -90
    this.currentVerticalTiltAngle = -90
    this.targetVerticalTiltAngle = -90
    this.updateDeviceInfo()
      .catch(err => {
        this.log.error('Failed to update device info, reverting to default values:', err)
      })


    // set accessory information
    const device = accessory.context.device as IDevice
    const informationService = this.accessory.getService(this.platform.Service.AccessoryInformation)
    if (informationService) {
      informationService
        .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Mitsubishi')
        .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
        .setCharacteristic(this.platform.Characteristic.Name, /*accessory.displayName ||*/ device.DeviceName || 'Not Set')
        .setCharacteristic(this.platform.Characteristic.SerialNumber, device.SerialNumber || 'Not Set')
    } else {
      throw new Error('Failed to set accessory information')
    }

    // get the Thermostat service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    // FIXME: Consider trying the HeaterCooler approach as well (maybe as a separate accessory?):
    //        https://developers.homebridge.io/#/service/HeaterCooler
    const service = this.useThermostat ? this.platform.Service.Thermostat : this.platform.Service.HeaterCooler
    this.service = this.accessory.getService(service) || this.accessory.addService(service)
    // this.service = this.accessory.getService(this.platform.Service.HeaterCooler) || this.accessory.addService(this.platform.Service.HeaterCooler)

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    // FIXME: Use the accessory.context to pass arbitrary data, such as model, serial and name
    // this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName)
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName)

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Thermostat

    // Setup service specific characteristic handlers
    if (this.useThermostat) { // Thermostat
      // Register handlers for current heating/cooling state
      this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
        .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this))

      // Register handlers for target heating/cooling state
      this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
        .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
        .onSet(this.handleTargetHeatingCoolingStateSet.bind(this))

      // Register handlers for target temperature
      this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
        .onGet(this.handleTargetTemperatureGet.bind(this))
        .onSet(this.handleTargetTemperatureSet.bind(this))

      // Register handlers for current horizontal tilt angle
      this.service.getCharacteristic(this.platform.Characteristic.CurrentHorizontalTiltAngle)
        .onGet(this.handleCurrentHorizontalTiltAngleGet.bind(this))

      // Register handlers for target horizontal tilt angle
      this.service.getCharacteristic(this.platform.Characteristic.TargetHorizontalTiltAngle)
        .onGet(this.handleTargetHorizontalTiltAngleGet.bind(this))
        .onSet(this.handleTargetHorizontalTiltAngleSet.bind(this))

      // Register handlers for current vertical tilt angle
      this.service.getCharacteristic(this.platform.Characteristic.CurrentVerticalTiltAngle)
        .onGet(this.handleCurrentVerticalTiltAngleGet.bind(this))

      // Register handlers for target vertical tilt angle
      this.service.getCharacteristic(this.platform.Characteristic.TargetVerticalTiltAngle)
        .onGet(this.handleTargetVerticalTiltAngleGet.bind(this))
        .onSet(this.handleTargetVerticalTiltAngleSet.bind(this))
    } else { // Heater Cooler
      // Register handlers for active
      this.service.getCharacteristic(this.platform.Characteristic.Active)
        .onGet(this.handleActiveGet.bind(this))
        .onSet(this.handleActiveSet.bind(this))

      // Register handlers for current heater/cooler state
      this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
        .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this))

      // Register handlers for target heater/cooler state
      this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
        .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
        .onSet(this.handleTargetHeaterCoolerStateSet.bind(this))

      // Register handlers for cooling threshold temperature
      this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
        .onGet(this.handleCoolingThresholdTemperatureGet.bind(this))
        .onSet(this.handleCoolingThresholdTemperatureSet.bind(this))

      // Register handlers for heating threshold temperature
      this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
        .onGet(this.handleHeatingThresholdTemperatureGet.bind(this))
        .onSet(this.handleHeatingThresholdTemperatureSet.bind(this))

      // Register handlers for locking physical controls
      // this.service.getCharacteristic(this.platform.Characteristic.LockPhysicalControls)
      //   .onGet(this.handleLockPhysicalControlsGet.bind(this))
      //   .onSet(this.handleLockPhysicalControlsSet.bind(this))

      // Register handlers for rotatin speed
      this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
        .onGet(this.handleRotationSpeedGet.bind(this))
        .onSet(this.handleRotationSpeedSet.bind(this))

      // Register handlers for swing mode
      this.service.getCharacteristic(this.platform.Characteristic.SwingMode)
        .onGet(this.handleSwingModeGet.bind(this))
        .onSet(this.handleSwingModeSet.bind(this))
    }

    // Register handlers for current temperature
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this))

    // Register handlers for temperature display units
    this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
      .onSet(this.handleTemperatureDisplayUnitsSet.bind(this))
  }

  /**
   * Handle requests to get the current value of the "Active" characteristic
   */
  async handleActiveGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET Active') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minActive = 0
    const maxActive = 1
    const currentValue = Math.min(maxActive, Math.max(minActive, this.active))

    if (this.platform.config.debug) { this.log.info('Returning Active with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Active" characteristic
   */
  async handleActiveSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET Active:', value) }

    const minActive = 0
    const maxActive = 1
    const currentValue = Math.min(maxActive, Math.max(minActive, value as number))

    // FIXME: This may also be where our issue lies?!
    this.active = currentValue

    if (this.platform.config.debug) { this.log.info('Sending Active with value:', currentValue) }

    await this.sendDeviceData(this.api.hap.Characteristic.Active.UUID, this.active)
  }

  /**
   * Handle requests to get the current value of the "Current Heater Cooler State" characteristic
   */
  async handleCurrentHeaterCoolerStateGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CurrentHeaterCoolerState') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCurrentHeaterCoolerState = 0
    const maxCurrentHeaterCoolerState = 3
    const currentValue = Math.min(maxCurrentHeaterCoolerState, Math.max(minCurrentHeaterCoolerState, this.currentHeaterCoolerState))

    if (this.platform.config.debug) { this.log.info('Returning CurrentHeaterCoolerState with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Heater Cooler State" characteristic
   */
  async handleTargetHeaterCoolerStateGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TargetHeaterCoolerState') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTargetHeaterCoolerState = 0
    const maxTargetHeaterCoolerState = 2
    const currentValue = Math.min(maxTargetHeaterCoolerState, Math.max(minTargetHeaterCoolerState, this.targetHeaterCoolerState))

    if (this.platform.config.debug) { this.log.info('Returning TargetHeaterCoolerState with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Target Heater Cooler State" characteristic
   */
  async handleTargetHeaterCoolerStateSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TargetHeaterCoolerState:', value) }

    const minTargetHeaterCoolerState = 0
    const maxTargetHeaterCoolerState = 2
    const currentValue = Math.min(maxTargetHeaterCoolerState, Math.max(minTargetHeaterCoolerState, value as number))

    this.targetHeaterCoolerState = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.TargetHeaterCoolerState.UUID, this.targetHeaterCoolerState)
  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   */
  async handleCurrentHeatingCoolingStateGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CurrentHeatingCoolingState') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCurrentHeatingCoolingState = 0
    const maxCurrentHeatingCoolingState = 2
    const currentValue = Math.min(maxCurrentHeatingCoolingState, Math.max(minCurrentHeatingCoolingState, this.currentHeatingCoolingState))

    if (this.platform.config.debug) { this.log.info('Returning CurrentHeatingCoolingState with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  async handleTargetHeatingCoolingStateGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TargetHeatingCoolingState') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTargetHeatingCoolingState = 0
    const maxTargetHeatingCoolingState = 3
    const currentValue = Math.min(maxTargetHeatingCoolingState, Math.max(minTargetHeatingCoolingState, this.targetHeatingCoolingState))

    if (this.platform.config.debug) { this.log.info('Returning TargetHeatingCoolingState with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  async handleTargetHeatingCoolingStateSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TargetHeatingCoolingState:', value) }

    const minTargetHeatingCoolingState = 0
    const maxTargetHeatingCoolingState = 3
    const currentValue = Math.min(maxTargetHeatingCoolingState, Math.max(minTargetHeatingCoolingState, value as number))

    this.targetHeatingCoolingState = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.TargetHeatingCoolingState.UUID, this.targetHeatingCoolingState)
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CurrentTemperature') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCurrentTemperature = -270
    const maxCurrentTemperature = 100
    const currentValue = Math.min(maxCurrentTemperature, Math.max(minCurrentTemperature, this.currentTemperature))

    if (this.platform.config.debug) { this.log.info('Returning CurrentTemperature with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  async handleTargetTemperatureGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TargetTemperature') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTargetTemperature = 10
    const maxTargetTemperature = 38
    const currentValue = Math.min(maxTargetTemperature, Math.max(minTargetTemperature, this.targetTemperature))

    if (this.platform.config.debug) { this.log.info('Returning TargetTemperature with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  async handleTargetTemperatureSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TargetTemperature:', value) }

    const minCurrentTemperature = 10
    const maxCurrentTemperature = 38
    const currentValue = Math.min(maxCurrentTemperature, Math.max(minCurrentTemperature, value as number))

    this.targetTemperature = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.TargetTemperature.UUID, this.targetTemperature)
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  async handleTemperatureDisplayUnitsGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TemperatureDisplayUnits') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTemperatureDisplayUnits = 0
    const maxTemperatureDisplayUnits = 1
    const currentValue = Math.min(maxTemperatureDisplayUnits, Math.max(minTemperatureDisplayUnits, this.temperatureDisplayUnits))

    if (this.platform.config.debug) { this.log.info('Returning TemperatureDisplayUnits with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  async handleTemperatureDisplayUnitsSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TemperatureDisplayUnits:', value) }

    const minTemperatureDisplayUnits = 0
    const maxTemperatureDisplayUnits = 1
    const currentValue = Math.min(maxTemperatureDisplayUnits, Math.max(minTemperatureDisplayUnits, value as number))

    this.temperatureDisplayUnits = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.TemperatureDisplayUnits.UUID, this.temperatureDisplayUnits)
  }

  // /**
  //  * Handle requests to get the current value of the "Current Relative Humidity" characteristic
  //  */
  // handleCurrentRelativeHumidityGet(): number {
  //   if (this.platform.config.debug) { this.log.info('Triggered GET CurrentRelativeHumidity') }

  //   const minCurrentRelativeHumidity = 0
  //   const maxCurrentRelativeHumidity = 100
  //   const currentValue = Math.min(maxCurrentRelativeHumidity, Math.max(minCurrentRelativeHumidity, this.currentRelativeHumidity))

  //   if (this.platform.config.debug) { this.log.info('Returning CurrentRelativeHumidity with value:', currentValue) }
  //   return currentValue
  // }

  // /**
  //  * Handle requests to get the current value of the "Target Relative Humidity" characteristic
  //  */
  // handleTargetRelativeHumidityGet(): number {
  //   if (this.platform.config.debug) { this.log.info('Triggered GET TargetRelativeHumidity') }

  //   const minTargetRelativeHumidity = 0
  //   const maxTargetRelativeHumidity = 100
  //   const currentValue = Math.min(maxTargetRelativeHumidity, Math.max(minTargetRelativeHumidity, this.targetRelativeHumidity))

  //   if (this.platform.config.debug) { this.log.info('Returning TargetRelativeHumidity with value:', currentValue) }
  //   return currentValue
  // }

  // /**
  //  * Handle requests to set the "Target Relative Humidity" characteristic
  //  */
  // handleTargetRelativeHumiditySet(value: CharacteristicValue): void {
  //   if (this.platform.config.debug) { this.log.info('Triggered SET TargetRelativeHumidity:', value) }

  //   const minTargetRelativeHumidity = 0
  //   const maxTargetRelativeHumidity = 100
  //   const currentValue = Math.min(maxTargetRelativeHumidity, Math.max(minTargetRelativeHumidity, value as number))

  //   this.targetRelativeHumidity = currentValue
  // }

  /**
   * Handle requests to get the current value of the "Cooling Threshold Temperature" characteristic
   */
  async handleCoolingThresholdTemperatureGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CoolingThresholdTemperature') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCoolingThresholdTemperature = 10
    const maxCoolingThresholdTemperature = 35
    const currentValue = Math.min(maxCoolingThresholdTemperature, Math.max(minCoolingThresholdTemperature, this.coolingThresholdTemperature))

    if (this.platform.config.debug) { this.log.info('Returning CoolingThresholdTemperature with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Cooling Threshold Temperature" characteristic
   */
  async handleCoolingThresholdTemperatureSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET CoolingThresholdTemperature:', value) }

    const minCoolingThresholdTemperature = 10
    const maxCoolingThresholdTemperature = 35
    const currentValue = Math.min(maxCoolingThresholdTemperature, Math.max(minCoolingThresholdTemperature, value as number))

    this.coolingThresholdTemperature = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.CoolingThresholdTemperature.UUID, this.coolingThresholdTemperature)
  }

  /**
   * Handle requests to get the current value of the "Heating Threshold Temperature" characteristic
   */
  async handleHeatingThresholdTemperatureGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET HeatingThresholdTemperature') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minHeatingThresholdTemperature = 0
    const maxHeatingThresholdTemperature = 25
    const currentValue = Math.min(maxHeatingThresholdTemperature, Math.max(minHeatingThresholdTemperature, this.heatingThresholdTemperature))

    if (this.platform.config.debug) { this.log.info('Returning HeatingThresholdTemperature with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Heating Threshold Temperature" characteristic
   */
  async handleHeatingThresholdTemperatureSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET HeatingThresholdTemperature:', value) }

    const minHeatingThresholdTemperature = 0
    const maxHeatingThresholdTemperature = 25
    const currentValue = Math.min(maxHeatingThresholdTemperature, Math.max(minHeatingThresholdTemperature, value as number))

    this.heatingThresholdTemperature = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.HeatingThresholdTemperature.UUID, this.heatingThresholdTemperature)
  }

  // /**
  //  * Handle requests to get the current value of the "Lock Physical Controls" characteristic
  //  */
  // async handleLockPhysicalControlsGet(): Promise<number> {
  //   if (this.platform.config.debug) { this.log.info('Triggered GET LockPhysicalControls') }

  //   // FIXME: This shouldn't be done with every GET request! Or wait, should it?
  //   // Update device info
  //   await this.updateDeviceInfo()

  //   const minLockPhysicalControls = 0
  //   const maxLockPhysicalControls = 1
  //   const currentValue = Math.min(maxLockPhysicalControls, Math.max(minLockPhysicalControls, this.lockPhysicalControls))

  //   if (this.platform.config.debug) { this.log.info('Returning LockPhysicalControls with value:', currentValue) }
  //   return currentValue
  // }

  // /**
  //  * Handle requests to set the "Lock Physical Controls" characteristic
  //  */
  // async handleLockPhysicalControlsSet(value: CharacteristicValue): Promise<void> {
  //   if (this.platform.config.debug) { this.log.info('Triggered SET LockPhysicalControls:', value) }

  //   const minLockPhysicalControls = 0
  //   const maxLockPhysicalControls = 1
  //   const currentValue = Math.min(maxLockPhysicalControls, Math.max(minLockPhysicalControls, value as number))

  //   this.lockPhysicalControls = currentValue

  //   await this.sendDeviceData(this.api.hap.Characteristic.LockPhysicalControls.UUID, this.lockPhysicalControls)
  // }

  /**
   * Handle requests to get the current value of the "Rotation Speed" characteristic
   */
  async handleRotationSpeedGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET RotationSpeed') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minRotationSpeed = 0
    const maxRotationSpeed = 100
    const currentValue = Math.min(maxRotationSpeed, Math.max(minRotationSpeed, this.rotationSpeed))

    if (this.platform.config.debug) { this.log.info('Returning RotationSpeed with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Rotation Speed" characteristic
   */
  async handleRotationSpeedSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET RotationSpeed:', value) }

    const minRotationSpeed = 0
    const maxRotationSpeed = 100
    const currentValue = Math.min(maxRotationSpeed, Math.max(minRotationSpeed, value as number))

    this.rotationSpeed = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.rotationSpeed)
  }

  /**
   * Handle requests to get the current value of the "Swing Mode" characteristic
   */
  async handleSwingModeGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET SwingMode') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minSwingMode = 0
    const maxSwingMode = 1
    const currentValue = Math.min(maxSwingMode, Math.max(minSwingMode, this.swingMode))

    if (this.platform.config.debug) { this.log.info('Returning SwingMode with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Swing Mode" characteristic
   */
  async handleSwingModeSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET SwingMode:', value) }

    const minSwingMode = 0
    const maxSwingMode = 1
    const currentValue = Math.min(maxSwingMode, Math.max(minSwingMode, value as number))

    this.swingMode = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.swingMode)
  }

  /**
   * Handle requests to get the current value of the "Current Horizontal Tilt Angle" characteristic
   */
  async handleCurrentHorizontalTiltAngleGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CurrentHorizontalTiltAngle') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCurrentHorizontalTiltAngle = -90
    const maxCurrentHorizontalTiltAngle = 90
    const currentValue = Math.min(maxCurrentHorizontalTiltAngle, Math.max(minCurrentHorizontalTiltAngle, this.currentHorizontalTiltAngle))

    if (this.platform.config.debug) { this.log.info('Returning CurrentHorizontalTiltAngle with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Horizontal Tilt Angle" characteristic
   */
  async handleTargetHorizontalTiltAngleGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TargetHorizontalTiltAngle') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTargetHorizontalTiltAngle = -90
    const maxTargetHorizontalTiltAngle = 90
    const currentValue = Math.min(maxTargetHorizontalTiltAngle, Math.max(minTargetHorizontalTiltAngle, this.targetHorizontalTiltAngle))

    if (this.platform.config.debug) { this.log.info('Returning TargetHorizontalTiltAngle with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Target Horizontal Tilt Angle" characteristic
   */
  async handleTargetHorizontalTiltAngleSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TargetHorizontalTiltAngle:', value) }

    const minTargetHorizontalTiltAngle = -90
    const maxTargetHorizontalTiltAngle = 90
    const currentValue = Math.min(maxTargetHorizontalTiltAngle, Math.max(minTargetHorizontalTiltAngle, value as number))

    this.targetHorizontalTiltAngle = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.targetHorizontalTiltAngle)
  }

  /**
   * Handle requests to get the current value of the "Current Vertical Tilt Angle" characteristic
   */
  async handleCurrentVerticalTiltAngleGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET CurrentVerticalTiltAngle') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minCurrentVerticalTiltAngle = -90
    const maxCurrentVerticalTiltAngle = 90
    const currentValue = Math.min(maxCurrentVerticalTiltAngle, Math.max(minCurrentVerticalTiltAngle, this.currentVerticalTiltAngle))

    if (this.platform.config.debug) { this.log.info('Returning CurrentVerticalTiltAngle with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Vertical Tilt Angle" characteristic
   */
  async handleTargetVerticalTiltAngleGet(): Promise<number> {
    if (this.platform.config.debug) { this.log.info('Triggered GET TargetVerticalTiltAngle') }

    // FIXME: This shouldn't be done with every GET request! Or wait, should it?
    // Update device info
    await this.updateDeviceInfo()

    const minTargetVerticalTiltAngle = -90
    const maxTargetVerticalTiltAngle = 90
    const currentValue = Math.min(maxTargetVerticalTiltAngle, Math.max(minTargetVerticalTiltAngle, this.targetVerticalTiltAngle))

    if (this.platform.config.debug) { this.log.info('Returning TargetVerticalTiltAngle with value:', currentValue) }
    return currentValue
  }

  /**
   * Handle requests to set the "Target Vertical Tilt Angle" characteristic
   */
  async handleTargetVerticalTiltAngleSet(value: CharacteristicValue): Promise<void> {
    if (this.platform.config.debug) { this.log.info('Triggered SET TargetVerticalTiltAngle:', value) }

    const minTargetVerticalTiltAngle = -90
    const maxTargetVerticalTiltAngle = 90
    const currentValue = Math.min(maxTargetVerticalTiltAngle, Math.max(minTargetVerticalTiltAngle, value as number))

    this.targetVerticalTiltAngle = currentValue

    await this.sendDeviceData(this.api.hap.Characteristic.RotationSpeed.UUID, this.targetVerticalTiltAngle)
  }

  async updateDeviceInfo(): Promise<void> {
    const deviceInfo = await this.getDeviceInfo()

    const Active = this.api.hap.Characteristic.Active

    const CurrentHeaterCoolerState = this.api.hap.Characteristic.CurrentHeaterCoolerState
    const TargetHeaterCoolerState = this.api.hap.Characteristic.TargetHeaterCoolerState

    const CurrentHeatingCoolingState = this.api.hap.Characteristic.CurrentHeatingCoolingState
    const TargetHeatingCoolingState = this.api.hap.Characteristic.TargetHeatingCoolingState

    const TemperatureDisplayUnits = this.api.hap.Characteristic.TemperatureDisplayUnits

    // const LockPhysicalControls = this.api.hap.Characteristic.LockPhysicalControls
    // const RotationSpeed = this.api.hap.Characteristic.RotationSpeed
    const SwingMode = this.api.hap.Characteristic.SwingMode

    // FIXME: This might be where our issue is with the device showing up as "ON" when it's actually off!?
    // Update active
    this.active = deviceInfo.Power != null && deviceInfo.Power ? Active.ACTIVE : Active.INACTIVE
    if (this.platform.config.debug) {
      this.log.info('Updated Active with value:', this.active, 'from device info:', deviceInfo)
    }

    // Update current heater/heating cooler/cooling state
    if (deviceInfo.Power != null) {
      if (!deviceInfo.Power) {
        this.currentHeatingCoolingState = CurrentHeatingCoolingState.OFF
        if (this.platform.config.debug) { this.log.info('Device Power is OFF, setting CurrentHeatingCoolingState to OFF') }
      } else {
        if (this.platform.config.debug) {this.log.info('Device Power is ON') }
        switch (deviceInfo.OperationMode) {
          case 1:
            this.currentHeaterCoolerState = CurrentHeaterCoolerState.HEATING
            this.currentHeatingCoolingState = CurrentHeatingCoolingState.HEAT
            if (this.platform.config.debug) {
              this.log.info('currentHeaterCoolerState/currentHeatingCoolingState changed:', this.currentHeaterCoolerState, this.currentHeatingCoolingState)
            }
            break
          case 3:
            this.currentHeaterCoolerState = CurrentHeaterCoolerState.COOLING
            this.currentHeatingCoolingState = CurrentHeatingCoolingState.COOL
            if (this.platform.config.debug) {
              this.log.info('currentHeaterCoolerState/CurrentHeatingCoolingState changed:', this.currentHeaterCoolerState, this.currentHeatingCoolingState)
            }
            break

          default:
            // MELCloud can return also 2 (dehumidify), 7 (Ventilation) and 8 (auto)
            // We return 5 which is undefined in HomeKit
            // FIXME: This no longer applies as we're clamping the values in getters/setters!
            this.currentHeaterCoolerState = 5
            this.currentHeatingCoolingState = 5
            if (this.platform.config.debug) { this.log.info('Unknown OperationMode:', deviceInfo.OperationMode) }
            break
        }
      }
    } else {
      if (this.platform.config.debug) {
        this.log.info('DeviceInfo.Power is null, assuming OFF')
      }
    }

    // Update target heater/heating cooler/cooling state
    if (deviceInfo.Power != null) {
      if (!deviceInfo.Power) {
        this.currentHeaterCoolerState = CurrentHeaterCoolerState.INACTIVE
        this.currentHeatingCoolingState = TargetHeatingCoolingState.OFF
      } else {
        switch (deviceInfo.OperationMode) {
          case 1:
            this.targetHeaterCoolerState = TargetHeaterCoolerState.HEAT
            this.targetHeatingCoolingState = TargetHeatingCoolingState.HEAT
            break
          case 3:
            this.targetHeaterCoolerState = TargetHeaterCoolerState.COOL
            this.targetHeatingCoolingState = TargetHeatingCoolingState.COOL
            break
          case 8:
            this.targetHeaterCoolerState = TargetHeaterCoolerState.AUTO
            this.targetHeatingCoolingState = TargetHeatingCoolingState.AUTO
            break

          default:
            // MELCloud can return also 2 (dehumidify), 7 (Ventilation) and 8 (auto)
            // We return 5 which is undefined in HomeKit
            // FIXME: This no longer applies as we're clamping the values in getters/setters!
            this.targetHeaterCoolerState = 5
            this.targetHeatingCoolingState = 5
            break
        }
      }
    }

    // Update current temperature
    if (deviceInfo.RoomTemperature) {
      this.currentTemperature = deviceInfo.RoomTemperature
    }

    // Update target temperature
    if (deviceInfo.SetTemperature) {
      this.targetTemperature = deviceInfo.SetTemperature
      this.coolingThresholdTemperature = deviceInfo.SetTemperature
      this.heatingThresholdTemperature = deviceInfo.SetTemperature
    }

    // Update temperature display units
    if (this.platform.client.UseFahrenheit) {
      this.temperatureDisplayUnits = this.platform.client.UseFahrenheit ? TemperatureDisplayUnits.FAHRENHEIT : TemperatureDisplayUnits.CELSIUS
    }

    // TODO: Add LockPhysicalControls

    // Update rotation speed
    if (deviceInfo.SetFanSpeed && deviceInfo.NumberOfFanSpeeds) {
      this.rotationSpeed = deviceInfo.SetFanSpeed / deviceInfo.NumberOfFanSpeeds * 100.0
    }

    // Update horizontal tilt angle
    if (deviceInfo.VaneHorizontal) {
      this.currentHorizontalTiltAngle = -90.0 + 45.0 * (deviceInfo.VaneHorizontal - 1)
    }

    // Update vertical tilt angle
    if (deviceInfo.VaneVertical) {
      this.currentVerticalTiltAngle = 90.0 - 45.0 * (5 - deviceInfo.VaneVertical)
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
      this.swingMode = deviceInfo.VaneHorizontal == 12 && deviceInfo.VaneVertical == 7 ? SwingMode.SWING_ENABLED : SwingMode.SWING_DISABLED
    }
  }

  async getDeviceInfo(): Promise<IDeviceDetails> {
    const device: IDevice = this.accessory.context.device
    const deviceDetails: IDeviceDetails = await this.platform.client.getDevice(device.DeviceID, device.BuildingID)
    if (this.platform.config.debug) {
      this.platform.log.debug(`[${this.accessory.displayName}] Get device details: ${JSON.stringify(deviceDetails)}`)
    }
    this.accessory.context.deviceDetails = deviceDetails
    return deviceDetails
  }

  async sendDeviceData(characteristicUUID: string, value: CharacteristicValue): Promise<void> {
    // TODO: The payload may need more properties than what we're providing it!
    const data: IDeviceDetails = this.accessory.context.deviceDetails

    if (!data) {
      this.log.warn('Unable to update device data, missing device details')
      return
    }

    // NOTE: EffectiveFlags seem to determine the type of data/change even being processed (some kind of bitmask?)

    // Prepare the data payload based on the input
    switch (characteristicUUID) {
      case this.api.hap.Characteristic.Active.UUID:
        switch (value) {
          case this.api.hap.Characteristic.Active.INACTIVE:
            data.Power = false
            data.EffectiveFlags = 1
            if (this.platform.config.debug) {
              this.log.info('Sending device data for Active.INACTIVE:', data)
            }
            break

          case this.api.hap.Characteristic.Active.ACTIVE:
            data.Power = true
            if (this.platform.config.debug) {
              this.log.info('Sending device data for Active.ACTIVE:', data)
            }
            break

          default:
            break
        }
        break

      case this.api.hap.Characteristic.TargetHeaterCoolerState.UUID:
        switch (value) {
          case this.api.hap.Characteristic.TargetHeaterCoolerState.HEAT:
            data.Power = true
            data.OperationMode = 1
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeaterCoolerState.HEAT:', data)
            }
            break

          case this.api.hap.Characteristic.TargetHeaterCoolerState.COOL:
            data.Power = true
            data.OperationMode = 3
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeaterCoolerState.COOL:', data)
            }
            break

          case this.api.hap.Characteristic.TargetHeaterCoolerState.AUTO:
            data.Power = true
            data.OperationMode = 8
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeaterCoolerState.AUTO:', data)
            }
            break

          default:
            break
        }
        break

      case this.api.hap.Characteristic.TargetHeatingCoolingState.UUID:
        switch (value) {
          case this.api.hap.Characteristic.TargetHeatingCoolingState.OFF:
            data.Power = false
            data.EffectiveFlags = 1
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeatingCoolingState.OFF:', data)
            }
            break

          case this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT:
            data.Power = true
            data.OperationMode = 1
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeatingCoolingState.HEAT:', data)
            }
            break

          case this.api.hap.Characteristic.TargetHeatingCoolingState.COOL:
            data.Power = true
            data.OperationMode = 3
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeatingCoolingState.COOL:', data)
            }
            break

          case this.api.hap.Characteristic.TargetHeatingCoolingState.AUTO:
            data.Power = true
            data.OperationMode = 8
            data.EffectiveFlags = 1 + 2
            if (this.platform.config.debug) {
              this.log.info('Sending device data for TargetHeatingCoolingState.AUTO:', data)
            }
            break

          default:
            break
        }
        break

      case this.api.hap.Characteristic.TargetTemperature.UUID:
        data.SetTemperature = value as number
        data.EffectiveFlags = 4
        if (this.platform.config.debug) {
          this.log.info('Sending device data for TargetTemperature:', data)
        }
        break

      case this.api.hap.Characteristic.CoolingThresholdTemperature.UUID:
        data.SetTemperature = value as number
        data.EffectiveFlags = 4
        if (this.platform.config.debug) {
          this.log.info('Sending device data for CoolingThresholdTemperature:', data)
        }
        break

      case this.api.hap.Characteristic.HeatingThresholdTemperature.UUID:
        data.SetTemperature = value as number
        data.EffectiveFlags = 4
        if (this.platform.config.debug) {
          this.log.info('Sending device data for HeatingThresholdTemperature:', data)
        }
        break

      case this.api.hap.Characteristic.TemperatureDisplayUnits.UUID:
        await this.platform.client.updateOptions(value as boolean)
        // TODO: What is this and do we need it?
        // this.api.platformAccessory.updateApplicationOptions(value == this.api.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
        if (this.platform.config.debug) {
          this.log.info('Sending device data for TemperatureDisplayUnits:', data, 'NOTICE! Triggering platform update with value:', value)
        }
        break

      case this.api.hap.Characteristic.RotationSpeed.UUID:
        data.SetFanSpeed = parseInt((value as number/100.0 * (data.NumberOfFanSpeeds ?? 0)).toFixed(0))
        data.EffectiveFlags = 8
        if (this.platform.config.debug) {
          this.log.info('Sending device data for RotationSpeed:', data)
        }
        break

      case this.api.hap.Characteristic.SwingMode.UUID:
        // TODO: Unconfirmed prototype code, test properly!
        data.VaneHorizontal = value == this.api.hap.Characteristic.SwingMode.SWING_ENABLED ? 12 : 0
        data.VaneVertical = value == this.api.hap.Characteristic.SwingMode.SWING_ENABLED ? 7 : 0
        data.EffectiveFlags = 256 + 16 // Combine the tilt angle flags to set them both
        if (this.platform.config.debug) {
          this.log.info('Sending device data for SwingMode:', data)
        }
        break

      case this.api.hap.Characteristic.TargetHorizontalTiltAngle.UUID:
        data.VaneHorizontal = parseInt(((value as number + 90.0)/45.0 + 1.0).toFixed(0))
        data.EffectiveFlags = 256
        if (this.platform.config.debug) {
          this.log.info('Sending device data for TargetHorizontalTiltAngle:', data)
        }
        break

      case this.api.hap.Characteristic.TargetVerticalTiltAngle.UUID:
        data.VaneVertical = parseInt(((value as number + 90.0) / 45.0 + 1.0).toFixed(0))
        data.EffectiveFlags = 16
        if (this.platform.config.debug) {
          this.log.info('Sending device data for TargetVerticalTiltAngle:', data)
        }
        break

      default:
        break
    }

    // Send the data payload to the MELCloud API
    await this.platform.client.setDeviceData(data)
  }
}
