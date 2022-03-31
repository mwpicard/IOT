# How to use this
step 1.  Clone this repository onto your local machine.  To do that you need Git installed on your machine
step 2.

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

Step 3.  Then, to run the program execute in command line (on mac that's the console and on pc that is command prompt

    npm i
    npm start [name of csv file cfr example.csv]
