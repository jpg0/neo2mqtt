# neo2mqtt
Bridge between MQTT and [Neo Smart Controller](http://neosmartblinds.com/smartcontroller/) for Blinds

# Setup
- `git clone https://github.com/jpg0/neo2mqtt`
- `cd neo2mqtt`
- `npm install`
- `node app.js`

# MQTT message structure

Send commands:
Topic:
`/cmnd/blinds/neo/<controller ip address>/<controller id (get from the phone app)>/<blind or room id (get from the phone app)`
Message body:
- `up` : blinds move UP
- `dn` : blinds move DOWN
- `sp` : blinds STOP moving
- `gp` : go to favorite position
- `mu` : micro step up
- `md` : micro step down

Message will be echoed at:
`/cmnd/blinds/neo/<controller ip address>/<controller id (get from the phone app)>/<blind or room id (get from the phone app)`
if sent successfully.
