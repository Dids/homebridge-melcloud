/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from 'homebridge'
// import { Response, ResponseAsJSON } from 'request'
import {
  IMELCloudConfig, MELCloudLanguage, 
} from '@/config'

// import request from 'request-promise-native'
// import fetch from 'node-fetch'
import fetch from 'node-fetch-native'
// import url from 'url'

// import NodePersist, { InitOptions } from 'node-persist'
import { LocalStorage } from 'node-localstorage'
import NodeCache from 'node-cache'
import objectHash from 'object-hash'
import { Mutex } from 'async-mutex'
import path from 'path'

const MELCLOUD_API_ROOT = 'https://app.melcloud.com/Mitsubishi.Wifi.Client'
const MELCLOUD_API_LOGIN = 'Login/ClientLogin'
const MELCLOUD_API_LIST_DEVICES = 'User/ListDevices'
const MELCLOUD_API_GET_DEVICE = 'Device/Get'
const MELCLOUD_API_SET_DEVICE = 'Device/SetAta'
const MELCLOUD_API_UPDATE_OPTIONS = 'User/UpdateApplicationOptions'

export enum IErrorCode {
  InvalidCredentials = 1,
  // TODO: Add all other known error codes AND our own error codes!
}

export interface ILoginResponse {
  ErrorId: IErrorCode | null
  ErrorMessage: string | null
  LoginStatus: number | null
  UserId: number | null
  RandomKey: string | null
  AppVersionAnnouncement: string | null
  LoginData: ILoginData | null
  // FIXME: Can't test/mock Array type, need proper types instead!
  // ListPendingInvite: Array<unknown> | null
  // ListOwnershipChangeRequest: Array<unknown> | null
  // ListPendingAnnouncement: Array<unknown> | null
  LoginMinutes: number | null
  LoginAttempts: number | null
}

export interface ILoginData {
  ContextKey: string | null
  Client: number | null
  Terms: number | null
  AL: number | null
  ML: number | null
  CMI: boolean | null
  IsStaff: boolean | null
  CUTF: boolean | null
  CAA: boolean | null
  ReceiveCountryNotifications: boolean | null
  ReceiveAllNotifications: boolean | null
  CACA: boolean | null
  CAGA: boolean | null
  MaximumDevices: number | null
  ShowDiagnostics: boolean | null
  Language: MELCloudLanguage | null
  Country: number | null
  RealClient: number | null
  Name: string | null
  UseFahrenheit: boolean | null
  Duration: number | null
  Expiry: string | null // FIXME: Parse as ISO string (2022-06-09T10:40:24.27), also re-use ContextKey until hitting expiration date?
  CMSC: boolean | null
  PartnerApplicationVersion: number | null
  EmailSettingsReminderShown: boolean | null
  EmailUnitErrors: number | null
  EmailCommsErrors: number | null
  DeletePending: boolean | null
  ChartSeriesHidden: number | null
  IsImpersonated: boolean | null
  LanguageCode: string | null
  CountryName: string | null
  CurrencySymbol: string | null
  SupportEmailAddress: string | null
  DateSeperator: string | null
  TimeSeperator: string | null
  AtwLogoFile: string | null
  DECCReport: boolean | null
  CSVReport1min: boolean | null
  HidePresetPanel: boolean | null
  EmailSettingsReminderRequired: boolean | null
  TermsText: string | null
  MapView: boolean | null
  MapZoom: number | null
  MapLongitude: number | null
  MapLatitude: number | null
}

export interface IDeviceBuilding {
  // FIXME: Implement all the missing properties, there are A LOT of them!
  ID: number | null
  Structure: {
    Floors: Array<{
      Devices: Array<IDevice> | null
      Areas: Array<{
        Devices: Array<IDevice> | null
      }> | null
    }> | null
    Areas: Array<{
      Devices: Array<IDevice> | null
    }> | null
    Devices: Array<IDevice> | null
  } | null
}

export interface IDevice {
  DeviceID: number | null
  DeviceName: string | null
  BuildingID: number | null
  SerialNumber: string | null
  Device: {
    DeviceType: number | null
  } | null
}

export enum DeviceOperationMode {
  HEAT = 1,
  DEHUMIDIFY = 2,
  COOL = 3,
  VENTILATION = 7,
  AUTO = 8,
}

export interface IDeviceDetails {
  // FIXME: Implement all the missing things!
  EffectiveFlags: number | null
  LocalIPAddress: string | null
  RoomTemperature: number | null
  SetTemperature: number | null
  SetFanSpeed: number | null
  OperationMode: DeviceOperationMode | null
  VaneHorizontal: number | null
  VaneVertical: number | null
  Name: string | null
  NumberOfFanSpeeds: number | null
  WeatherObservations: Array<unknown> | null
  ErrorMessage: string | null
  ErrorCode: number | null
  DefaultHeatingSetTemperature: number | null
  DefaultCoolingSetTemperature: number | null
  HideVaneControls: boolean | null
  HideDryModeControl: boolean | null
  RoomTemperatureLabel: number | null
  InStandbyMode: boolean | null
  TemperatureIncrementOverride: number | null
  ProhibitSetTemperature: boolean | null
  ProhibitOperationMode: boolean | null
  ProhibitPower: boolean | null
  DeviceID: number | null
  DeviceType: number | null
  LastCommunication: string | null
  NextCommunication: string | null
  Power: boolean | null
  HasPendingCommand: boolean | null
  Offline: boolean | null
  Scene: unknown | null
  SceneOwner: unknown | null
}

export interface IMELCloudAPIClient {
  log: Logger
  config: IMELCloudConfig
  //   storage: NodePersist.LocalStorage
  storage: LocalStorage
  cache: NodeCache | null
  mutex: Mutex | null
  ContextKey: string | null
  ContextKeyExpirationDate: Date | null
  UseFahrenheit: boolean | null
  isContextKeyValid: boolean
  isReady: boolean
  init(): Promise<void>
  get (url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }): Promise<any>
  post (url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }): Promise<any>
  login (): Promise<ILoginData | null>
  listDevices (): Promise<Array<IDeviceBuilding>>
  getDevice (deviceId: number | null, buildingId: number | null): Promise<IDeviceDetails>
  updateOptions (useFahrenheit: boolean): Promise<unknown> // FIXME: Add proper type support
  setDeviceData (data: IDeviceDetails): Promise<IDeviceDetails> // FIXME: Add proper type support
}

export class MELCloudAPIClient implements IMELCloudAPIClient {
  log: Logger
  config: IMELCloudConfig
  //   storage: NodePersist.LocalStorage = NodePersist
  storage: LocalStorage = new LocalStorage('./.node-persist/storage/melcloud')
  cache: NodeCache | null = null
  mutex: Mutex | null = null
  ContextKey: string | null = null
  ContextKeyExpirationDate: Date | null = null
  UseFahrenheit: boolean | null = null

  get isReady(): boolean {
    // FIXME: This is obviously VERY BAD design, but it should work for this specific use case..
    // Block until this.ready is true
    while (!this.ready) {
      // Let the event loop run

    }
    return this.ready
  }
  private ready: boolean = false

  // Default storage path to '<current dir>/.node-persist/storage'
  private storagePath: string = path.join(process.cwd(), '.node-persist/storage/melcloud')

  get isContextKeyValid(): boolean {
    if (!this.ContextKey || this.ContextKey.length < 1) {
      return false
    }
    if (!this.ContextKeyExpirationDate) {
      return false
    }
    const nowDate = new Date()
    nowDate.setHours(0)
    nowDate.setMinutes(0)
    nowDate.setSeconds(0)
    nowDate.setMilliseconds(0)
    if (this.ContextKeyExpirationDate <= nowDate) {
      return false
    }
    return true
  }

  // FIXME: Tweak this to get a good balance between responsiveness and caching! (eg. 60 seconds is way too much)
  private readonly requestCacheTime: number = 10 // Seconds

  constructor(log: Logger, config: IMELCloudConfig, storagePath: string) {
    // Validate and store a reference to the logger
    if (!log) {
      // FIXME: Add proper error handling
      throw new Error('Invalid or null Homebridge logger')
    }
    this.log = log

    // Validate and store the config
    if (!config) {
      // FIXME: Add proper error handling
      throw new Error('Invalid or missing config')
    }
    this.config = config

    if (!storagePath) {
      throw new Error('Invalid or missing storage path')
    }
    this.storagePath = storagePath
  }

  async init() {
    if (this.ready) {
      if (this.config.debug) {this.log.info('Already initialized, skipping initialization') }
      return
    }

    if (this.config.debug) { this.log.info('Asynchronous initialization started') }

    // Initialize storage
    this.log.info('Initializing persistent storage with path:', this.storagePath)
    if (this.storagePath) {
      this.storage = new LocalStorage(this.storagePath)
    }
    // // this.storage = NodePersist.create({
    // //   dir: this.storagePath ?? './.node-persist/storage',
    // // })
    // // this.storage = NodePersist
    // await this.storage.init({
    //   dir: this.storagePath ?? './.node-persist/storage',
    //   ttl: false, // Never expire (otherwise set to milliseconds)
    //   writeQueue: true, // Enable the new write queue system
    //   logging: this.config.debug, // Enable logging when debugging
    // } as unknown as InitOptions)
    // if (this.config.debug) { this.log.info('Available storage values:', this.storage.values()) }

    // Load settings from storage
    this.ContextKey = this.storage.getItem('ContextKey')
    if (this.config.debug) { this.log.info('Loaded ContextKey from storage:', this.ContextKey) }
    
    const contextKeyExpirationDate = this.storage.getItem('ContextKeyExpirationDate')
    this.ContextKeyExpirationDate = contextKeyExpirationDate ? new Date(contextKeyExpirationDate) : null
    if (this.config.debug) { this.log.info('Loaded ContextKeyExpirationDate from storage:', this.ContextKeyExpirationDate) }
    
    const useFahrenheit = this.storage.getItem('UseFahrenheit')
    this.UseFahrenheit = useFahrenheit ? true : false
    if (this.config.debug) { this.log.info('Loaded UseFahrenheit from storage:', this.UseFahrenheit) }
    
    // Initialize in-memory cache
    if (this.config.cacheGetRequests || this.config.cachePostRequests) {
      if (this.config.debug) { this.log.info('Initializing request caching') }
      this.cache = new NodeCache({
        useClones: true, // False disables cloning of variables and uses direct references instead (faster than copying)
        deleteOnExpire: true, // Delete after expiration
        checkperiod: this.requestCacheTime, // 60, // Check and delete expired items in seconds
        stdTTL: this.requestCacheTime, // 0, // Default cache time in seconds (0 = unlimited)
      })
    }

    // Initialize mutex
    if (this.config.enableMutexLock) {
      if (this.config.debug) { this.log.info('Initializing request mutex locking') }
      this.mutex = new Mutex()
    }

    if (this.config.debug) { this.log.info('Asynchronous initialization finished') }
    this.ready = true
  }

  async get(url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }, skipCache?: boolean): Promise<any> {
    if (this.config.debug) { this.log.info('GET', url, formData, headers) }

    // Validate the inputs
    formData = JSON.stringify(formData) as any
    if (!headers) {
      headers = {
        'Content-Type': 'application/json',
      }
    }

    // Generate a hash from the request
    const requestHash = this.config.cacheGetRequests ? objectHash({
      url,
      formData,
      headers,
    }) : null
    if (this.config.debug && this.config.cacheGetRequests) { this.log.info('Generated GET request hash:', requestHash) }

    // Return the cached response (if any)
    if (!skipCache && this.cache && this.config.cacheGetRequests && requestHash) {
      if (this.config.debug) { this.log.info('Checking for cached GET request for hash:', requestHash) }
      const cachedResponseJSON = this.cache.get(requestHash)
      if (cachedResponseJSON) {
        if (this.config.debug) { this.log.info('Returning cached response:', cachedResponseJSON) }
        return cachedResponseJSON
      }
    }

    // Prepare the API call
    const apiCall = async() => {
      // Run the request and get the response
      const response = await fetch(url, {
        method: 'GET',
        body: formData as any,
        headers: headers as any,
      })

      // Convert the response to a JSON string
      const responseJSON = await response.json()

      // Cache the request response
      if (!skipCache && this.cache && this.config.cacheGetRequests && requestHash) {
        if (this.config.debug) { this.log.info('Storing cached GET request response for hash:', requestHash) }
        this.cache.set(requestHash, responseJSON, this.requestCacheTime)
        if (this.config.debug) { this.log.info('Caching response for', this.requestCacheTime, 'seconds:', responseJSON) }
      }

      return responseJSON
    }

    // Lock the call until caching is complete and before checking the cache
    return this.config.enableMutexLock && this.mutex ? this.mutex.runExclusive(apiCall) : apiCall()
  }

  async post(url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }, body?: unknown, skipCache?: boolean): Promise<any> {
    if (this.config.debug) { this.log.info('POST', url, formData, headers, body) }

    // Validate the inputs
    if (!formData) {
      formData = body as any
    }
    formData = JSON.stringify(formData) as any
    if (!headers) {
      headers = {
        'Content-Type': 'application/json',
      }
    }

    // Generate a hash from the request
    const requestHash = this.config.cachePostRequests ? objectHash({
      url,
      formData,
      headers,
      body,
    }) : null
    if (this.config.debug && this.config.cachePostRequests) { this.log.info('Generated POST request hash:', requestHash) }

    // Return the cached response (if any)
    if (!skipCache && this.cache && this.config.cachePostRequests && requestHash) {
      if (this.config.debug) { this.log.info('Checking for cached POST request for hash:', requestHash) }
      const cachedResponseJSON = this.cache.get(requestHash)
      if (cachedResponseJSON && !skipCache) {
        if (this.config.debug) { this.log.info('Returning cached response:', cachedResponseJSON) }
        return cachedResponseJSON
      }
    }

    // Prepare the API call
    const apiCall = async() => {
      // Run the request and get the response
      const response = await fetch(url, {
        method: 'POST',
        body: formData as any,
        headers: headers as any,
      })

      // Convert the response to a JSON string
      const responseJSON = await response.json()

      // Cache the request response
      if (!skipCache && this.cache && this.config.cachePostRequests && requestHash) {
        if (this.config.debug) { this.log.info('Storing cached POST request response for hash:', requestHash) }
        this.cache.set(requestHash, responseJSON, this.requestCacheTime)
        if (this.config.debug) { this.log.info('Caching response for', this.requestCacheTime, 'seconds:', responseJSON) }
      }

      return responseJSON
    }

    // Lock the call until caching is complete
    return this.config.enableMutexLock && this.mutex ? this.mutex.runExclusive(apiCall) : apiCall()
  }

  async login(): Promise<ILoginData | null> {
    if (this.config.debug) { this.log.info('Logging in') }

    // this.log('LOGIN')
    // Return immediately if the API key is still valid
    if (this.isContextKeyValid) {
      if (this.config.debug) { this.log.info('ContextKey is still valid, skipping login') }
      return null
    } else {
      this.log.info('No existing login information found, attempting to login with supplied credentials')
    }

    // Process the login response
    const response = await this.post(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_LOGIN}`, {
      AppVersion: '1.19.0.8',
      CaptchaChallenge: '',
      CaptchaResponse: '',
      Email: this.config.username,
      Language: this.config.language,
      Password: this.config.password,
      Persist: 'true',
    }) as ILoginResponse
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to login: invalid JSON response: ${JSON.stringify(response)}`)
    }

    // Process the login data
    if (this.config.debug) { this.log.info('Processing login response:', JSON.stringify(response)) }
    const loginData = response.LoginData
    if (loginData) {
      // FIXME: This renews the ContextKey on every boot, which should NOT be necessary at all!
      this.ContextKey = loginData.ContextKey
      this.storage.setItem('ContextKey', JSON.stringify(this.ContextKey))

      if (loginData.Expiry) {
        this.ContextKeyExpirationDate = new Date(loginData.Expiry)
        this.ContextKeyExpirationDate.setHours(0)
        this.ContextKeyExpirationDate.setMinutes(0)
        this.ContextKeyExpirationDate.setSeconds(0)
        this.ContextKeyExpirationDate.setMilliseconds(0)
        this.storage.setItem('ContextKeyExpirationDate', JSON.stringify(this.ContextKeyExpirationDate))
      }

      // FIXME: This is NEVER updated until ContextKey expires, which takes 1 whole year to happen, unless the plugin or Homebridge is restarted..
      this.UseFahrenheit = loginData.UseFahrenheit
      this.storage.setItem('UseFahrenheit', JSON.stringify(this.UseFahrenheit))
    } else {
      if (response.ErrorId === IErrorCode.InvalidCredentials) {
        throw new Error(`Login failed due to invalid credentials. Received response: ${JSON.stringify(response)}`)
      }
      // FIXME: Add proper error handling
      throw new Error(`Login failed due to an unknown or unhandled error. Received response: ${JSON.stringify(response)}`)
    }

    if (this.config.debug) { this.log.info('Login Data response:', JSON.stringify(loginData)) }
    return loginData
  }

  async listDevices(): Promise<Array<IDeviceBuilding>> {
    if (this.config.debug) { this.log.info('Getting list of devices') }

    // Check if we need to login first
    await this.login()

    // Get the list of devices from the API
    const response = await this.get(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_LIST_DEVICES}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 
    }) as Array<IDeviceBuilding>
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to list devices: invalid JSON response: ${JSON.stringify(response)}`)
    }
    if (this.config.debug) { this.log.info('List Device response:', JSON.stringify(response)) }
    return response
  }

  async getDevice(deviceId: number | null, buildingId: number | null): Promise<IDeviceDetails> {
    if (this.config.debug) { this.log.info('Getting device with DeviceID', deviceId, 'and BuildingID', buildingId) }

    // Check if we need to login first
    await this.login()

    // Get the device from the API
    const response = await this.get(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_GET_DEVICE}?id=${deviceId}&BuildingID=${buildingId}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 
    }) as IDeviceDetails
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to get device: invalid JSON response: ${JSON.stringify(response)}`)
    }
    if (this.config.debug) { this.log.info('Get Device response:', JSON.stringify(response)) }
    return response
  }

  // FIXME: Actually call this and implement it!
  // TODO: Add proper type support
  async updateOptions(useFahrenheit: boolean): Promise<unknown> {
    if (this.config.debug) { this.log.info('Updating options: useFahrenheit ->', useFahrenheit) }

    // Check if we need to login first
    await this.login()

    // Post the updated options to the API
    // FIXME: Why were we trying to send this as a string instead of as an object, like every other request?
    const response = await this.post(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_UPDATE_OPTIONS}`, {
      // FIXME: Most of these properties seem either incorrect or unnecessary
      UseFahrenheit: useFahrenheit,
      EmailOnCommsError: false,
      EmailOnUnitError: false,
      EmailCommsErrors: 1,
      EmailUnitErrors: 1,
      RestorePages: false,
      MarketingCommunication: false,
      AlternateEmailAddress: '',
      Fred: 4,
    }, {
      'X-MitsContextKey': this.ContextKey, 'Content-Type': 'application/json', 
    }, null, true)
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to update options: invalid JSON response: ${response}`)
    }
    if (this.config.debug) { this.log.info('updateOptions -> response:', JSON.stringify(response)) }
    this.UseFahrenheit = useFahrenheit
    return response
  }

  async setDeviceData(data: IDeviceDetails): Promise<IDeviceDetails> {
    if (this.config.debug) { this.log.info('Setting device data:', data) }

    // Check if we need to login first
    await this.login()

    // Post the updated device data to the API
    const response = await this.post(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_SET_DEVICE}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 'content-type': 'application/json', 
    }, data, true) as IDeviceDetails
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to set device data: invalid JSON response: ${response}`)
    }
    if (this.config.debug) { this.log.info('setDeviceData -> response:', JSON.stringify(response)) }
    return response
  }
}
