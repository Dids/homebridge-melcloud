import { API } from 'homebridge'
import {
  PLATFORM_NAME, PLUGIN_NAME, 
} from './config'
import MELCloudPlatform from './platform'

// Export to Homebridge
export = (api: API): void => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, MELCloudPlatform)
}
