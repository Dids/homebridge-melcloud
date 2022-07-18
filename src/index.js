"use strict";
var config_1 = require("./config");
var platform_1 = require("./platform");
module.exports = function (api) {
    api.registerPlatform(config_1.PLUGIN_NAME, config_1.PLATFORM_NAME, platform_1["default"]);
};
