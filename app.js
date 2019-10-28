'use strict'

const MQTT_TOPIC = "/blinds/neo"
const MQTT_STATE_TOPIC = "/stat" + MQTT_TOPIC
const MQTT_COMMAND_TOPIC = "/cmnd" + MQTT_TOPIC

const argv = require('yargs')
    .usage('Usage: $0 --mqtt <mqtt url>')
    .demandOption(['mqtt'])
    .argv;

const mqtt_url = argv.mqtt;

const request = require('request-promise');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const mqtt = require('mqtt')

//todo detect connection failures
const mqttClient = mqtt.connect(mqtt_url)
mqttClient.on('error', function (error) {
    logger.error("Error from mqtt broker: %v", error)
});
mqttClient.on('connect', function () {
    logger.info("Connected to mqtt broker")
});

const neoController = function (ip, controller_id) {

    var buildUrl = function (roomOrBlindCode, operation) {
        return `http://${ip}:8838/neo/v1/transmit?id=${controller_id}&command=${roomOrBlindCode}-${operation}`
    };

    return {
        //returns a promise
        send: function (roomOrBlindCode, operation) {
            var url = buildUrl(roomOrBlindCode, operation);
            logger.debug("Sending command to Neo: " + url);
            return request(url);
        }
    }
}

const cmdToNeoStr = function (cmd) {
    return {
        "up": "up",
        "down": "dn",
        "stop": "sp",
        "fav": "gp"
    }[cmd.toString().toLowerCase()];
}

const runMqtt2Neo = function (mqttClient, neo) {
    mqttClient.subscribe(MQTT_COMMAND_TOPIC + "/#")

    mqttClient.on('message', function (topic, message) {

        var cmd = cmdToNeoStr(message);

        var [_, _, _, _, controller_ip, controller_id, blind_or_group_id] = topic.split("/");

        var controller = neoController(controller_ip, controller_id);

        controller.send(blind_or_group_id, cmd).then(_ => {
            mqttClient.publish(`${MQTT_STATE_TOPIC}/${controller_ip}/${controller_id}/${blind_or_group_id}`, message);
        }).error(e => {
            logger.error("Failed to send command to to neo: %v", error);
        });
    })
};


runMqtt2Neo(mqttClient, runMqtt2Neo);