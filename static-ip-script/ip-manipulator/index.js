function configureShellyGen1(deviceInfo) {
    return new Promise((resolve) => {
        console.log(`I don't know how to deal with gen 1 yet: ${deviceInfo.ip_address}`);
        resolve();
    });
}

function configureShellyGen2(deviceInfo, newConfig) {
    if (parseInt(deviceInfo.generation, 10) !== 2) return;
    const axios = require("axios");

    const rpcUrl = `http://${deviceInfo.ip_address}/rpc`;
    if (newConfig.config.sta.ip !== null)
        newConfig.config.sta.ip = deviceInfo.ip_address;

    return axios
        .post(rpcUrl, {
            "jsonrpc": "2.0",
            "id": 1,
            "src": "user_1",
            "method": "Wifi.SetConfig",
            "params": newConfig
        })
        .then(() => {    
            console.log(`New configuration successfully applied. ${deviceInfo.ip_address}`);    
        });
}

module.exports = {
    setStaticIps: list => {
        console.log(`Setting static IP's for ${list.length} Shelly devices...`)
        const packageInfo = require("../package.json");
        const newConfig = packageInfo.newWifiConfig;

        if (!newConfig) throw new Error("Invalid new WiFi configuration specified, add 'newWifiConfig' parameter to package.json");

        let configurations = [];
        list.forEach(deviceInfo => {
            switch (parseInt(deviceInfo.generation, 10)) {
                case 2:
                    configurations.push(configureShellyGen2(deviceInfo, newConfig));
                    return;
                case 1:
                    configurations.push(configureShellyGen1(deviceInfo));
                    return;
                default:
                    return;
            }
        });

        return Promise.all(configurations);
    }
}