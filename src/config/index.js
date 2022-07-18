"use strict";
exports.__esModule = true;
exports.validateMELCloudAccessoryConfig = exports.validateMELCloudConfig = exports.MELCloudLanguage = exports.PLUGIN_NAME = exports.PLATFORM_NAME = void 0;
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
exports.PLATFORM_NAME = 'MELCloud';
/**
 * This must match the name of your plugin as defined the package.json
 */
exports.PLUGIN_NAME = 'homebridge-melcloud-ts';
var MELCloudLanguage;
(function (MELCloudLanguage) {
    MELCloudLanguage[MELCloudLanguage["English"] = 0] = "English";
    MELCloudLanguage[MELCloudLanguage["\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438"] = 1] = "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438";
    MELCloudLanguage[MELCloudLanguage["\u010Ce\u0161tina"] = 2] = "\u010Ce\u0161tina";
    MELCloudLanguage[MELCloudLanguage["Dansk"] = 3] = "Dansk";
    MELCloudLanguage[MELCloudLanguage["Deutsch"] = 4] = "Deutsch";
    MELCloudLanguage[MELCloudLanguage["Eesti"] = 5] = "Eesti";
    MELCloudLanguage[MELCloudLanguage["Espa\u00F1ol"] = 6] = "Espa\u00F1ol";
    MELCloudLanguage[MELCloudLanguage["Fran\u00E7ais"] = 7] = "Fran\u00E7ais";
    MELCloudLanguage[MELCloudLanguage["\u0540\u0561\u0575\u0565\u0580\u0565\u0576"] = 8] = "\u0540\u0561\u0575\u0565\u0580\u0565\u0576";
    MELCloudLanguage[MELCloudLanguage["Latvie\u0161u"] = 9] = "Latvie\u0161u";
    MELCloudLanguage[MELCloudLanguage["Lietuvi\u0173"] = 10] = "Lietuvi\u0173";
    MELCloudLanguage[MELCloudLanguage["Magyar"] = 11] = "Magyar";
    MELCloudLanguage[MELCloudLanguage["Nederlands"] = 12] = "Nederlands";
    MELCloudLanguage[MELCloudLanguage["Norwegian"] = 13] = "Norwegian";
    MELCloudLanguage[MELCloudLanguage["Polski"] = 14] = "Polski";
    MELCloudLanguage[MELCloudLanguage["Portugu\u00EAs"] = 15] = "Portugu\u00EAs";
    MELCloudLanguage[MELCloudLanguage["\u0420\u0443\u0441\u0441\u043A\u0438\u0439"] = 16] = "\u0420\u0443\u0441\u0441\u043A\u0438\u0439";
    MELCloudLanguage[MELCloudLanguage["Suomi"] = 17] = "Suomi";
    MELCloudLanguage[MELCloudLanguage["Svenska"] = 18] = "Svenska";
    MELCloudLanguage[MELCloudLanguage["Italiano"] = 19] = "Italiano";
    MELCloudLanguage[MELCloudLanguage["\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430"] = 20] = "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430";
    MELCloudLanguage[MELCloudLanguage["T\u00FCrk\u00E7e"] = 21] = "T\u00FCrk\u00E7e";
    MELCloudLanguage[MELCloudLanguage["\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC"] = 22] = "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC";
    MELCloudLanguage[MELCloudLanguage["Hrvatski"] = 23] = "Hrvatski";
    MELCloudLanguage[MELCloudLanguage["Rom\u00E2n\u0103"] = 24] = "Rom\u00E2n\u0103";
    MELCloudLanguage[MELCloudLanguage["Sloven\u0161\u010Dina"] = 25] = "Sloven\u0161\u010Dina";
})(MELCloudLanguage = exports.MELCloudLanguage || (exports.MELCloudLanguage = {}));
function validateMELCloudConfig(config) {
    if (!config.language) {
        config.language = MELCloudLanguage.English;
    }
    if (!config.username) {
        throw new Error('MELCloud config is missing username');
    }
    if (!config.password) {
        throw new Error('MELCloud config is missing password');
    }
    if (!config.debug) {
        config.debug = false;
    }
}
exports.validateMELCloudConfig = validateMELCloudConfig;
function validateMELCloudAccessoryConfig(config) {
    if (!config.name) {
        throw new Error('MELCloud accessory config is missing name');
    }
    if (!config.manufacturer) {
        config.manufacturer = 'Mitsubishi';
    }
    if (!config.model) {
        throw new Error('MELCloud accessory config is missing model');
    }
    if (!config.serial) {
        config.serial = '';
    }
}
exports.validateMELCloudAccessoryConfig = validateMELCloudAccessoryConfig;
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
