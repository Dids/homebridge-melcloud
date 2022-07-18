/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from 'homebridge'
// import { Response, ResponseAsJSON } from 'request'
import {
  IMELCloudConfig, MELCloudLanguage, 
} from '../config'

// import request from 'request-promise-native'
import fetch from 'node-fetch'
// import url from 'url'

import NodePersist from 'node-persist'
import NodeCache from 'node-cache'
import objectHash from 'object-hash'
import { Mutex } from 'async-mutex'

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

export interface IDeviceDetails {
  // FIXME: Implement all the missing things!
  EffectiveFlags: number | null
  LocalIPAddress: string | null
  RoomTemperature: number | null
  SetTemperature: number | null
  SetFanSpeed: number | null
  OperationMode: number | null
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
  // StoragePath: string | null
  storage: NodePersist.LocalStorage
  cache: NodeCache
  mutex: Mutex
  ContextKey: string | null
  ContextKeyExpirationDate: Date | null
  UseFahrenheit: boolean | null
  isContextKeyValid: boolean
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
  // StoragePath: string | null
  storage: NodePersist.LocalStorage
  cache: NodeCache
  mutex: Mutex
  ContextKey: string | null
  ContextKeyExpirationDate: Date | null
  UseFahrenheit: boolean | null

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

    // MELCloud login token (or "context key")
    // this.StoragePath = storagePath
    this.ContextKey = null
    this.ContextKeyExpirationDate = null
    this.UseFahrenheit = null

    // Initialize storage
    if (this.config.debug) { this.log.debug('Initializing API client storage with path:', storagePath) }
    this.storage = NodePersist.create({
      dir: storagePath,
    })

    // Load settings from storage
    this.storage.getItem('ContextKey')
      .then(value => {
        this.ContextKey = value
        if (this.config.debug) { this.log.debug('Loaded ContextKey from storage:', this.ContextKey) }
      })
    this.storage.getItem('ContextKeyExpirationDate')
      .then(value => {
        this.ContextKeyExpirationDate = value
        if (this.config.debug) { this.log.debug('Loaded ContextKeyExpirationDate from storage:', this.ContextKeyExpirationDate) }
      })
    this.storage.getItem('UseFahrenheit')
      .then(value => {
        this.UseFahrenheit = value
        if (this.config.debug) { this.log.debug('Loaded UseFahrenheit from storage:', this.UseFahrenheit) }
      })

    // Initialize in-memory cache
    this.cache = new NodeCache({
      useClones: true, // False disables cloning of variables and uses direct references instead (faster than copying)
      deleteOnExpire: true, // Delete after expiration
      checkperiod: 60, // Check and delete expired items in seconds
      stdTTL: 0, // Default cache time in seconds (0 = unlimited)
    })

    // Initialize mutex
    this.mutex = new Mutex()
  }

  async get(url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }, skipCache?: boolean): Promise<any> {
    if (this.config.debug) { this.log.debug('GET', url, formData, headers) }

    // Validate the inputs
    formData = JSON.stringify(formData) as any
    if (!headers) {
      headers = {
        'Content-Type': 'application/json',
      }
    }

    // Generate a hash from the request
    const requestHash = objectHash({
      url,
      formData,
      headers,
    })
    if (this.config.debug) { this.log.debug('Generated GET request hash:', requestHash) }

    // Lock the call until caching is complete and before checking the cache
    return this.mutex.runExclusive(async() => {
      // Return the cached response (if any)
      const cachedResponseJSON = this.cache.get(requestHash)
      if (cachedResponseJSON && !skipCache) {
        if (this.config.debug) { this.log.debug('Returning cached response:', cachedResponseJSON) }
        return cachedResponseJSON
      } else if (skipCache) {
        if (this.config.debug) { this.log.debug('Cache skip enabled, skipping response caching') }
      }

      // Run the request and get the response
      const response = await fetch(url, {
        method: 'GET',
        body: formData as any,
        headers: headers as any,
      })

      // Convert the response to a JSON string
      const responseJSON = await response.json()

      // Cache the request response
      if (!skipCache) {
        this.cache.set(requestHash, responseJSON, this.requestCacheTime)
        if (this.config.debug) { this.log.debug('Caching response for', this.requestCacheTime, 'seconds:', responseJSON) }
      }

      return responseJSON
    })
  }

  async post(url: string, formData?: { [key: string]: unknown }, headers?: { [key: string]: unknown }, body?: unknown, skipCache?: boolean): Promise<any> {
    if (this.config.debug) { this.log.debug('POST', url, formData, headers, body) }

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
    const requestHash = objectHash({
      url,
      formData,
      headers,
      body,
    })
    if (this.config.debug) { this.log.debug('Generated POST request hash:', requestHash) }

    // Lock the call until caching is complete and before checking the cache
    return this.mutex.runExclusive(async() => {
      // Return the cached response (if any)
      const cachedResponseJSON = this.cache.get(requestHash)
      if (cachedResponseJSON && !skipCache) {
        if (this.config.debug) { this.log.debug('Returning cached response:', cachedResponseJSON) }
        return cachedResponseJSON
      } else if (skipCache) {
        if (this.config.debug) { this.log.debug('Cache skip enabled, skipping response caching') }
      }

      // Run the request and get the response
      const response = await fetch(url, {
        method: 'POST',
        body: formData as any,
        headers: headers as any,
      })

      // Convert the response to a JSON string
      const responseJSON = await response.json()

      // Cache the request response
      if (!skipCache) {
        this.cache.set(requestHash, responseJSON, this.requestCacheTime)
        if (this.config.debug) { this.log.debug('Caching response for', this.requestCacheTime, 'seconds:', responseJSON) }
      }

      return responseJSON
    })
  }

  async login(): Promise<ILoginData | null> {
    if (this.config.debug) { this.log.debug('Logging in') }

    // this.log('LOGIN')
    // Return immediately if the API key is still valid
    if (this.isContextKeyValid) {
      if (this.config.debug) { this.log.debug('ContextKey is still valid, skipping login') }
      return null
    } else {
      this.log.info('No existing login information found, attempting to login with supplied credentials')
    }

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
    if (this.config.debug) { this.log.debug('login -> response:', JSON.stringify(response)) }
    if (response.LoginData) {
      this.ContextKey = response.LoginData.ContextKey
      await this.storage.setItem('ContextKey', this.ContextKey)
      if (response.LoginData.Expiry) {
        this.ContextKeyExpirationDate = new Date(response.LoginData.Expiry)
        this.ContextKeyExpirationDate.setHours(0)
        this.ContextKeyExpirationDate.setMinutes(0)
        this.ContextKeyExpirationDate.setSeconds(0)
        this.ContextKeyExpirationDate.setMilliseconds(0)
        await this.storage.setItem('ContextKeyExpirationDate', this.ContextKeyExpirationDate)
      }
      // FIXME: This is NEVER updated until ContextKey expires, which takes 1 whole year to happen..
      this.UseFahrenheit = response.LoginData.UseFahrenheit
      await this.storage.setItem('UseFahrenheit', this.UseFahrenheit)
    } else {
      if (response.ErrorId === IErrorCode.InvalidCredentials) {
        throw new Error(`Login failed due to invalid credentials. Received response: ${JSON.stringify(response)}`)
      }
      // FIXME: Add proper error handling
      throw new Error(`Login failed due to an unknown or unhandled error. Received response: ${JSON.stringify(response)}`)
    }
    return response.LoginData
  }

  async listDevices(): Promise<Array<IDeviceBuilding>> {
    if (this.config.debug) { this.log.debug('Getting list of devices') }

    // Check if we need to login first
    await this.login()

    // this.log('LIST DEVICES')
    const response = await this.get(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_LIST_DEVICES}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 
    }) as Array<IDeviceBuilding>
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to list devices: invalid JSON response: ${JSON.stringify(response)}`)
    }
    if (this.config.debug) { this.log.debug('listDevices:', JSON.stringify(response)) }
    return response
  }

  async getDevice(deviceId: number | null, buildingId: number | null): Promise<IDeviceDetails> {
    if (this.config.debug) { this.log.debug('Getting device with DeviceID', deviceId, 'and BuildingID', buildingId) }

    // Check if we need to login first
    await this.login()

    // this.log('GET DEVICE', deviceId, buildingId)
    const response = await this.get(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_GET_DEVICE}?id=${deviceId}&BuildingID=${buildingId}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 
    }) as IDeviceDetails
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to get device: invalid JSON response: ${JSON.stringify(response)}`)
    }
    if (this.config.debug) { this.log.debug('Get Device response:', JSON.stringify(response)) }
    return response
  }

  // FIXME: Actually call this and implement it!
  // TODO: Add proper type support
  async updateOptions(useFahrenheit: boolean): Promise<unknown> {
    if (this.config.debug) { this.log.debug('Updating options: useFahrenheit ->', useFahrenheit) }

    // Check if we need to login first
    await this.login()

    // this.log('UPDATE OPTIONS', useFahrenheit)
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
    if (this.config.debug) { this.log.debug('updateOptions -> response:', JSON.stringify(response)) }
    this.UseFahrenheit = useFahrenheit
    return response
  }

  async setDeviceData(data: IDeviceDetails): Promise<IDeviceDetails> {
    if (this.config.debug) { this.log.debug('Setting device data:', data) }

    // Check if we need to login first
    await this.login()

    // this.log('SET DEVICE DATA', data)
    const response = await this.post(`${MELCLOUD_API_ROOT}/${MELCLOUD_API_SET_DEVICE}`, undefined, {
      'X-MitsContextKey': this.ContextKey, 'content-type': 'application/json', 
    }, data, true) as IDeviceDetails
    if (!response) {
      // FIXME: Add proper error handling
      throw new Error(`Failed to set device data: invalid JSON response: ${response}`)
    }
    if (this.config.debug) { this.log.debug('setDeviceData -> response:', JSON.stringify(response)) }
    return response
  }
}
