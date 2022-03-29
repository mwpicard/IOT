# How to use this
Set the desired new configuration in package.json, like so:

    "newWifiConfig": {
      "config": {
        "sta": {
          "ipv4mode": "static",
          "ip": "this will get replaced",
          "netmask": "255.255.255.0",
          "gw": "192.168.0.1",
          "nameserver": "1.1.1.1"
        }
      }
    }

Or, if you want to revert back to DHCP:

    "newWifiConfig": {
      "config": {
        "sta": {
          "ipv4mode": "dhcp",
          "ip": null,
          "netmask": null,
          "gw": null,
          "nameserver": null
        }
      }
    }

Then, to run the program execute

    npm i
    npm start [name of csv file cfr example.csv]