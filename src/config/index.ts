import {
  AccessoryConfig, PlatformConfig, 
} from 'homebridge'

/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'MELCloud'

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-melcloud-ts'

export enum MELCloudLanguage {
  English = 0,
  Български,
  Čeština,
  Dansk,
  Deutsch,
  Eesti,
  Español,
  Français,
  Հայերեն,
  Latviešu,
  Lietuvių,
  Magyar,
  Nederlands,
  Norwegian,
  Polski,
  Português,
  Русский,
  Suomi,
  Svenska,
  Italiano,
  Українська,
  Türkçe,
  Ελληνικά,
  Hrvatski,
  Română,
  Slovenščina
}

export interface IMELCloudConfig extends PlatformConfig {
  language: MELCloudLanguage
  username: string
  password: string
  debug: boolean
  cacheTime: number
  cacheGetRequests: boolean
  cachePostRequests: boolean
  enableMutexLock: boolean
}

export function validateMELCloudConfig(config: IMELCloudConfig): void {
  if (!config.language) {
    config.language = MELCloudLanguage.English
  }
  if (!config.username) {
    throw new Error('MELCloud config is missing username')
  }
  if (!config.password) {
    throw new Error('MELCloud config is missing password')
  }
  if (!config.debug) {
    config.debug = false
  }
  if (!config.cacheTime) {
    config.cacheTime = 10
  }
  if (!config.cacheGetRequests) {
    config.cacheGetRequests = false
  }
  if (!config.cachePostRequests) {
    config.cachePostRequests = false
  }
  if (!config.useMutexLock) {
    config.useMutexLock = false
  }
}

export interface IMELCloudAccessoryConfig extends AccessoryConfig {
  manufacturer: string
  model: string
  serial: string
}

export function validateMELCloudAccessoryConfig(config: IMELCloudAccessoryConfig): void {
  if (!config.name) {
    throw new Error('MELCloud accessory config is missing name')
  }

  if (!config.manufacturer) {
    config.manufacturer = 'Mitsubishi'
  }
  if (!config.model) {
    throw new Error('MELCloud accessory config is missing model')
  }
  if (!config.serial) {
    config.serial = ''
  }
}

// export class MELCloudConfig implements IMELCloudConfig {
//   language: MELCloudLanguage
//   username: string
//   password: string
//   validate () {
//     if (!this.language) {
//       this.language = MELCloudLanguage.English
//     }
//     if (!this.username) {
//       throw new Error('MELCloud config is missing username')
//     }
//     if (!this.password) {
//       throw new Error('MELCloud config is missing password')
//     }
//   }
// }
