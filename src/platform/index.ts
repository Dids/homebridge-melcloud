import {
  API,
  APIEvent,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformAccessoryEvent,
  PlatformConfig,
  Characteristic,
  Service,
} from 'homebridge'
import {
  IDeviceBuilding, IDevice, IMELCloudAPIClient, MELCloudAPIClient, 
} from '@/api/client'
import {
  IMELCloudConfig, PLATFORM_NAME, PLUGIN_NAME, validateMELCloudConfig, 
} from '@/config'
import MELCloudBridgedAccessory from '@/accessory'

export interface IMELCloudPlatform extends DynamicPlatformPlugin {
  readonly log: Logger
  readonly config: IMELCloudConfig
  readonly api: API

  readonly Service: typeof Service
  readonly Characteristic: typeof Characteristic

  /*readonly*/ accessories: Array<PlatformAccessory>

  readonly client: IMELCloudAPIClient

  discoverDevices(): Promise<void>
  getDevices(): Promise<void>
  createAccessories(building: IDeviceBuilding, devices: Array<IDevice> | null): Promise<void>

  // TODO: Re-enable
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
  // airInfoExecutionPending: Array<any>

  // updateAccessories (): Promise<any>
  // getDevices (): Promise<Array<any>>
  // createAccessories (building: any, devices: any, foundAccessories: Array<any>): void
  // proxyAirInfo (callback: any, characteristic: Characteristic, service: Service, homebridgeAccessory: IMELCloudBridgedAccessory, value: any, operation: any): Promise<any>
  // getAccessoryValue (callback: any, characteristic: Characteristic, service: Service, homebridgeAccessory: IMELCloudBridgedAccessory, value: any): void
  // setAccessoryValue (callback: any, characteristic: Characteristic, service: Service, homebridgeAccessory: IMELCloudBridgedAccessory, value: any): Promise<any>
  // updateApplicationOptions (UseFahrenheit: boolean): Promise<any>
  // getInformationService (homebridgeAccessory: IMELCloudBridgedAccessory): any
  // bindCharacteristicEvents (characteristic: Characteristic, service: Service, homebridgeAccessory: IMELCloudBridgedAccessory): void
  // getServices (homebridgeAccessory: IMELCloudBridgedAccessory): Array<any>
}

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export default class MELCloudPlatform implements IMELCloudPlatform {
  // #region DynamicPlatformPlugin
  public readonly log: Logger
  public readonly config: IMELCloudConfig
  public readonly api: API

  public readonly Service: typeof Service
  public readonly Characteristic: typeof Characteristic

  public /*readonly*/ accessories: Array<PlatformAccessory> = []
  // #endregion

  // #region MELCloudPlatform - Configuration
  public readonly client: IMELCloudAPIClient
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

  constructor(log: Logger, config: PlatformConfig | IMELCloudConfig, api: API) {
    // Store a reference to the logger
    if (!log) {
      throw new Error('Invalid or null Homebridge logger')
    }
    this.log = log

    // Store a reference to the config
    if (!config) {
      throw new Error('Invalid or null Homebridge platform config')
    }
    validateMELCloudConfig(config as IMELCloudConfig)
    this.config = config as IMELCloudConfig

    // Store a reference to the HAP API
    if (!api) {
      throw new Error('Invalid or null Homebridge API')
    }
    this.api = api

    this.Service = this.api.hap.Service
    this.Characteristic = this.api.hap.Characteristic

    // Create a new MELCloud API client
    this.client = new MELCloudAPIClient(this.log, this.config, this.api.user.storagePath())
    if (!this.client) {
      throw new Error('Failed to create MELCloud API client')
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

    if (this.config.debug) { this.log.info('Finished initializing platform:', this.config.name) }

    /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      if (this.config.debug) { this.log.info('Executed didFinishLaunching callback') }

      this.client.init()
        .then(() => {
          // run the method to discover / register your devices as accessories
          this.discoverDevices()
            .then(() => {
              if (this.config.debug) { this.log.info('Device discovery successful') }
            })
            .catch((err: Error) => {
              this.log.error('Device discovery failed:', err)
            })
        })
        .catch((err: Error) => {
          this.log.error('Failed to initialize MELCloud API client:', err)
        })
    })
  }

  /*
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  // FIXME: How can se use MELCloudBridgedAccessory her instead of PlatformAccessory?
  configureAccessory(accessory: PlatformAccessory): void {
    if (this.config.debug) { this.log.info('Loading accessory from cache:', accessory.displayName) }

    // identify the accessory
    accessory.on(PlatformAccessoryEvent.IDENTIFY, () => {
      this.log.info('%s identified!', accessory.displayName)
    })

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory)
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async discoverDevices(): Promise<void> {
    this.log.info('Discovering devices as accessories')

    // TODO: UPDATE: This is now a part of client.UseFahrenheit (FIXME: The value is ONLY updated on login though?!)
    // TODO: Set UseFahrenheit from loginResponse.UseFahrenheit
    // loginResponse.UseFahrenheit

    // Get devices from MELCloud and add them as HomeKit accessories
    await this.getDevices()

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
  }

  // FIXME: This should re-use existing accessories and not always recreate them?!
  //        See here for an example: https://github.com/homebridge/homebridge-plugin-template/blob/master/src/platform.ts
  async getDevices(): Promise<void> {
    if (this.config.debug) { this.log.info('Getting devices..') }
    return this.client.listDevices()
      .then(buildings => {
        // Prepare an array of accessories
        // const foundAccessories = [] as Array<PlatformAccessory>

        // Parse and loop through all buildings
        for (const building of buildings) {
          if (building) {
            if (this.config.debug) { this.log.info('Building:', building) }

            // (Re)create the accessories
            if (building.Structure) {
              this.createAccessories(building, building.Structure.Devices)

              // Parse and loop through all floors
              if (building.Structure.Floors) {
                for (const floor of building.Structure.Floors) {
                  if (this.config.debug) { this.log.info('Floor:', floor) }

                  // (Re)create the accessories
                  this.createAccessories(building, floor.Devices)

                  // Parse and loop through all floor areas
                  if (floor.Areas) {
                    for (const floorArea of floor.Areas) {
                      if (this.config.debug) { this.log.info('Floor area:', floorArea) }

                      // (Re)create the accessories
                      this.createAccessories(building, floorArea.Devices)
                    }
                  }
                }
              }

              // Parse and loop through all building areas
              if (building.Structure.Areas) {
                for (const buildingArea of building.Structure.Areas) {
                  if (this.config.debug) { this.log.info('Building area:', buildingArea) }

                  // (Re)create the accessories
                  this.createAccessories(building, buildingArea.Devices)
                }
              }
            }
          }
        }
      })
  }

  async createAccessories(building: IDeviceBuilding, devices: Array<IDevice> | null): Promise<void> {
    if (this.config.debug) { this.log.info('Creating accessories..') }

    // Loop through all MELCloud devices
    if (devices) {
      for (const device of devices) {
        // generate a unique id for the accessory this should be generated from
        // something globally unique, but constant, for example, the device serial
        // number or MAC address
        if (device.DeviceID) {
          const uuid = this.api.hap.uuid.generate(device.DeviceID.toString())

          // see if an accessory with the same uuid has already been registered and restored from
          // the cached devices we stored in the `configureAccessory` method above
          const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)

          if (existingAccessory) {
            // the accessory already exists
            if (this.config.debug) { this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName) }

            // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
            // existingAccessory.context.device = device;
            // this.api.updatePlatformAccessories([existingAccessory]);

            // TODO: Do we need to do this?
            // Update existing accessory context
            existingAccessory.context.device = device
            existingAccessory.context.deviceDetails = await this.client.getDevice(device.DeviceID, device.BuildingID)
            this.api.updatePlatformAccessories([ existingAccessory ])

            // create the accessory handler for the restored accessory
            // this is imported from `platformAccessory.ts`
            new MELCloudBridgedAccessory(this, existingAccessory)

            // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
            // remove platform accessories when no longer present
            // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
            // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
          } else if (device.DeviceName) {
            // the accessory does not yet exist, so we need to create it
            if (this.config.debug) { this.log.info('Adding new accessory:', device.DeviceName) }

            // create a new accessory
            const accessory = new this.api.platformAccessory(device.DeviceName, uuid)

            // store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the accessory you may need
            accessory.context.device = device
            accessory.context.deviceDetails = await this.client.getDevice(device.DeviceID, device.BuildingID)

            // create the accessory handler for the newly create accessory
            // this is imported from `platformAccessory.ts`
            new MELCloudBridgedAccessory(this, accessory)

            // link the accessory to your platform
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [ accessory ])
          }

          // Create an accessory for each device
          // const accessory = new MELCloudBridgedAccessory(
          //   // Platform
          //   this,

          //   // Services
          //   [
          //     {
          //       controlService: new hap.Service.Thermostat(device.DeviceName),
          //       characteristics: [
          //         new hap.Characteristic.CurrentHeatingCoolingState,
          //         new hap.Characteristic.TargetHeatingCoolingState,
          //         new hap.Characteristic.CurrentTemperature,
          //         new hap.Characteristic.TargetTemperature,
          //         new hap.Characteristic.TemperatureDisplayUnits,
          //         new hap.Characteristic.RotationSpeed,
          //         new hap.Characteristic.CurrentHorizontalTiltAngle,
          //         new hap.Characteristic.TargetHorizontalTiltAngle,
          //         new hap.Characteristic.CurrentVerticalTiltAngle,
          //         new hap.Characteristic.TargetVerticalTiltAngle
          //       ]
          //     }
          //   ]
          // )

          // // Further setup the accessory
          // // accessory.platform = this
          // accessory.remoteAccessory = device
          // accessory.id = device.DeviceID
          // accessory.name = device.DeviceName
          // accessory.model = ''
          // accessory.manufacturer = 'Mitsubishi'
          // accessory.serialNumber = device.SerialNumber
          // accessory.airInfo = null
          // accessory.buildingId = building.ID
          // if (this.config.debug) { this.log.info('Found device:', device.DeviceName) }

          // Add the accessory to our array
          // foundAccessories.push(accessory)
        }
      }
    }
  }
}
