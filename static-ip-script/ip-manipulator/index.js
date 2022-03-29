module.exports = {
    setStaticIps: list => {
        console.log(`Setting static IP's for ${list.length} Shelly4ProPM devices...`)
        const axios = require("axios");

        list.forEach((ip, i, arr) => {
            const rpcUrl = `http://${ip.ip_address}/rpc`;
            axios
                .post(rpcUrl, {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "src": "user_1",
                    "method": "Wifi.SetConfig",
                    "params": {
                        config: {
                            sta: {
                                "ipv4mode": "static",
                                "ip": ip.ip_address,
                                "netmask": "255.255.255.0",
                                "gw": "192.168.0.1",
                                "nameserver": "1.1.1.1"
                            }
                        }
                    }
                })
                .then(function (response) {
                    const wifiConfig = response.data;
                    console.debug(wifiConfig);
                    console.log(`New configuration successfully applied? ${i + 1} of ${arr.length}`);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

    }
}