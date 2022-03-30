const ping = require("net-ping"), axios = require("axios");
const packageInfo = require("./package.json");

const gateway = packageInfo.newWifiConfig.config.sta.gw
    , netmask = packageInfo.newWifiConfig.config.sta.netmask
    , dns = packageInfo.newWifiConfig.config.sta.nameserver;

function getAllLivingIps() {
    console.log(`Hi!`);
    console.log(`Calculating IP address range for gateway "${gateway}" with subnet mask "${netmask}".`)

    const ipPromises = [];
    const session = ping.createSession();

    //TODO figure out what ip's there are for [gateway] using [netmask]
    for (let i = 2; i < 255; i++) {
        const ip = `192.168.0.${i}`;
        // const ip = `192.168.0.149`;
        ipPromises.push(new Promise(resolve => {
            session.pingHost(ip, (err, target) => {
                if (!err) {
                    resolve(target);
                }
                else {
                    resolve(null);
                }
            });
        }));
    }

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
                    .then(response => {
                        if (response.data.hasOwnProperty("gen")) {
                            resolve(null); //gen 2+ 
                        } else {
                            resolve(response);
                        }
                    })
                    .catch(() => resolve(null));
            }));
        });

        console.log(`Checking ${aliveIps.length} devices whether they are Shelly Gen1 devices or not.`)
        return Promise.all(requests);
    })
    .then(requestsInfo => {
        const shellyIps = requestsInfo.filter(r => r !== null);

        console.log(`Found ${shellyIps.length} Shelly Gen1 devices.`)
        console.debug(shellyIps);

        const requests = [];
        shellyIps.forEach(shelly => {
            console.log(shelly);
            const ip = shelly.request.host;
            if (shelly.data.type.indexOf("SHMOS") === 0) {
                //Shelly Motion has a different API
                const wifiSettingsUrl = `http://Canpicard:!$Shally99@${ip}/settings/wifi_sta`;
                const newConfig = {
                    "enabled": true,
                    "ipv4_method": packageInfo.newWifiConfig.config.sta.ipv4mode,
                    "ip": ip,
                    // "gw": gateway, //<=== shelly documentation is off the parameter name is "gateway"
                    "gateway": gateway,
                    "mask": netmask,
                    "dns": dns
                };
                console.debug(newConfig);
                requests.push(new Promise(resolve => {
                    return axios.get(wifiSettingsUrl, { params: newConfig })
                        .then(response => {
                            console.log("New settings successfully applied.");
                            resolve(response.data);
                        })
                        .catch(err => {
                            console.error("New settings NOT applied.", err);
                            resolve(null);
                        });
                }));
            }
            else {
                const wifiSettingsUrl = `http://Canpicard:!$Shally99@${ip}/settings/sta`;
                const newConfig = {
                    "enabled": true,
                    "ipv4_method": packageInfo.newWifiConfig.config.sta.ipv4mode,
                    "ip": ip,
                    // "gw": gateway, //<=== shelly documentation is off the parameter name is "gateway"
                    "gateway": gateway,
                    "mask": netmask,
                    "dns": dns
                };
                console.debug(newConfig);
                requests.push(new Promise(resolve => {
                    return axios.get(wifiSettingsUrl, { params: newConfig })
                        .then(response => {
                            console.log("New settings successfully applied.");
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
        console.log(`Configured ${info.length} Shelly Gen1 devices.`)
        console.log(`All done here, bye!`)
    })
    .catch(() => {
        console.error("error");
    });
