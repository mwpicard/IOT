require("dotenv").config();
const ping = require("net-ping").createSession(), axios = require("axios");
const packageInfo = require("./package.json");

throw new Error("We have to make sure that ALL the GEN1 wifi settings are getting passed!!");

const gateway = packageInfo.newWifiConfig.config.sta.gw
    , netmask = packageInfo.newWifiConfig.config.sta.netmask
    , dns = packageInfo.newWifiConfig.config.sta.nameserver;

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});

function getAllLivingIps() {
    console.log(`Hi!`);
    console.log(`Calculating IP address range for gateway "${gateway}" with subnet mask "${netmask}".`);

    const ipPromises = [];

    //TODO figure out what ip's there are for [gateway] using [netmask]
    // for (let i = 2; i < 255; i++) {
    //     const ip = `192.168.0.${i}`;
        const ip = `192.168.0.98`;
        ipPromises.push(new Promise(resolve => {
            ping.pingHost(ip, (err, target) => {
                if (!err) {
                    resolve(target);
                }
                else {
                    resolve(null);
                }
            });
        }));
    // }

    console.log(`Pinging ${ipPromises.length} ip addresses.`)
    return Promise.all(ipPromises);
}

getAllLivingIps()
    .then(ips => {
        const aliveIps = ips.filter(i => i !== null);

        console.log(`Found ${aliveIps.length} devices that are available.`)
        console.debug(aliveIps);

        const requests = [];
        aliveIps.forEach(ip => {
            requests.push(new Promise(resolve => {
                axios.get(`http://${ip}/shelly`)
                    .then(response => resolve(response))
                    .catch(() => resolve(null));
            }));
        });

        console.log(`Checking ${aliveIps.length} devices whether they are Shelly devices or not.`)
        return Promise.all(requests);
    })
    .then(requestsInfo => {
        const shellyIps = requestsInfo.filter(r => r !== null);
        let gen1counter = 0, gen2counter = 0;

        console.log(`Found ${shellyIps.length} Shelly devices.`)
        console.debug(shellyIps);

        const requests = [];
        shellyIps.forEach(shelly => {
            console.log(shelly);
            const ip = shelly.request.host;
            if (shelly.data.hasOwnProperty("gen")) {
                //gen 2
                gen2counter++;
                const rpcUrl = `http://${ip}/rpc`;
                const newConfig = packageInfo.newWifiConfig;
                if (newConfig.config.sta.ip !== null)
                    newConfig.config.sta.ip = ip;

                requests.push(new Promise(resolve => {
                    axios
                        .post(rpcUrl, {
                            "jsonrpc": "2.0",
                            "id": 1,
                            "src": "user_1",
                            "method": "Wifi.SetConfig",
                            "params": newConfig
                        })
                        .then(response => {
                            console.log("New settings successfully applied (Gen2).");
                            resolve(response.data);
                        })
                        .catch(() => {
                            console.error("New settings NOT applied.", err);
                            resolve(null);
                        });
                }));
            }
            else if (shelly.data.type.indexOf("SHMOS") === 0) {
                gen1counter++;
                //Shelly Motion has a different API
                const wifiSettingsUrl = `http://Canpicard:!$Shally99@${ip}/settings/wifi_sta`;
                const newConfig = {
                    "enabled": true,
                    "ipv4_method": packageInfo.newWifiConfig.config.sta.ipv4mode
                };
                if(packageInfo.newWifiConfig.config.sta.ipv4mode !== "dhcp") {
                    newConfig["ip"] = ip;
                    newConfig["gateway"] = gateway;
                    newConfig["mask"] = netmask;
                    newConfig["dns"] = dns;
                }
                console.debug(newConfig);
                requests.push(new Promise(resolve => {
                    return axios.get(wifiSettingsUrl, { params: newConfig })
                        .then(response => {
                            console.log("New settings successfully applied (Gen1 - Motion sensor).");
                            resolve(response.data);
                        })
                        .catch(err => {
                            console.error("New settings NOT applied.", err);
                            resolve(null);
                        });
                }));
            }
            else {
                gen1counter++;
                const wifiSettingsUrl = `http://Canpicard:!$Shally99@${ip}/settings/sta`;
                // config looks like this:
                // "enabled": true,
                // "ssid": "Castle",
                // "key": "password"
                // "ipv4_method": "dhcp",
                // "ip": null,
                // "gw": null,
                // "mask": null,
                // "dns": null
                const newConfig = {
                    "enabled": true,
                    "ssid": process.env["STATIC_IP_SSID"],
                    "key": process.env["STATIC_IP_KEY"],
                    "ipv4_method": packageInfo.newWifiConfig.config.sta.ipv4mode
                };
                if(packageInfo.newWifiConfig.config.sta.ipv4mode !== "dhcp") {
                    newConfig["ip"] = ip;
                    newConfig["gateway"] = gateway;
                    newConfig["mask"] = netmask;
                    newConfig["dns"] = dns;
                }
                console.debug(newConfig);
                requests.push(new Promise(resolve => {
                    return axios.get(wifiSettingsUrl, { params: newConfig })
                        .then(response => {
                            console.log("New settings successfully applied (Gen1).");
                            resolve(response.data);
                        })
                        .catch(err => {
                            console.error("New settings NOT applied.", err);
                            resolve(null);
                        });
                }));
            }
        });

        console.log(`Configuring ${requests.length} Shelly Gen1 devices with a static IP address.`)
        return Promise.all(requests);
    })
    .then(info => {
        console.log(`Configured ${info.length} Shelly devices.`)
        console.log(`All done here, bye!`)
    })
    .catch(err => {
        console.error(err);
    });
