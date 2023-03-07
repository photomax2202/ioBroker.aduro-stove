'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const { Http2ServerRequest } = require('http2');
const axios = require('axios').default;

// Load your modules here, e.g.:
// const fs = require("fs");

class AduroStove extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'aduro-stove',
        });

        this.httpsClient = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }


    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        this.httpsClient = axios.create({
            baseURL: `https://adurocloud.com/api`,
            timeout: 4000,
            responseType: 'json',
            responseEncoding: 'utf8'
        });

        try{
            const clientAuthResponse = await this.httpsClient.post('/auth/login', {email: this.config.loginName , password: this.config.loginPasskey});
            this.log.debug(`clientAuthResponse ${JSON.stringify(clientAuthResponse.status)}: ${JSON.stringify(clientAuthResponse.data)}`);

            if (clientAuthResponse.status === 200) {
                const clientAuth = clientAuthResponse.data;

                await this.setStateAsync('accountInfo.token', {val: clientAuth.token, ack: true});
            }

            const tokenState = await this.getStateAsync('accountInfo.token');
            const value = tokenState ? tokenState.val : undefined;
            //this.log.debug(value);

            const clientDeviceResponse = await this.httpsClient.get('/groups/devices', {headers: {'Authorization': `Bearer ${value}`}});
            this.log.debug(`clientDeviceResponse ${JSON.stringify(clientDeviceResponse.status)}: ${JSON.stringify(clientDeviceResponse.data)}`);

            if (clientDeviceResponse.status === 200) {
                const  clientDevice = clientDeviceResponse.data;

                for (let deviceIndex = 0; deviceIndex < clientDevice.devices.length; deviceIndex++) {
                    const clientSerialResponse = await this.httpsClient.get(`stove/${clientDevice.devices[deviceIndex].serial}`, {headers: {'Authorization': `Bearer ${value}`}});
                    this.log.debug(`clientSerialResponse ${JSON.stringify(clientSerialResponse.status)}: ${JSON.stringify(clientSerialResponse.data)}`);

                    //this.log.debug(JSON.stringify(clientDevice.devices[deviceIndex]));
                    const deviceName = `Stove_${clientDevice.devices[deviceIndex].id}`;
                    const deviceChannel = 'Data';
                    await this.createDeviceAsync(deviceName);
                    await this.createChannelAsync(deviceName,deviceChannel,);
                    let stateName = 'Model';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].model, ack: true});
                    stateName = 'Serial';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].serial, ack: true});
                    stateName = 'Runtime';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].runtime, ack: true});
                    stateName = 'Version';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: null, ack: true});
                    stateName = 'lastSeen';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: this.formatDate(String(new Date (Number(clientDevice.devices[deviceIndex].lastSeen))), 'DD.MM.YYYY hh:mm'), ack: true});
                    stateName = 'z00';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'number');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z00, ack: true});
                    stateName = 'z02';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'number');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z02, ack: true});
                    stateName = 'z03';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'number');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z03, ack: true});
                    stateName = 'z04';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'number');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z04, ack: true});
                    stateName = 'z05';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'number');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z05, ack: true});
                    stateName = 'z10';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z10, ack: true});
                    stateName = 'z110';
                    await this.createStateAsync(deviceName,deviceChannel,stateName,'text');
                    await this.setStateAsync(`${deviceName}.${deviceChannel}.${stateName}`, {val: clientDevice.devices[deviceIndex].z110, ack: true});

                    if (clientSerialResponse.status === 200) {
                        const  clientSerial = clientSerialResponse.data;
                        stateName = 'Runtime';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.runtime, ack: true});
                        stateName = 'Version';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.ver, ack: true});
                        stateName = 'z00';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z00, ack: true});
                        stateName = 'z02';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z02, ack: true});
                        stateName = 'z03';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z03, ack: true});
                        stateName = 'z04';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z04, ack: true});
                        stateName = 'z05';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z05, ack: true});
                        stateName = 'z10';
                        await this.setStateChangedAsync(`${deviceName}.${deviceChannel}.${stateName}`,{val: clientSerial.z10, ack: true});
                    }
                }
                await this.setStateAsync('info.connection', {val: true, ack: true});
            }

        } catch (err) {
            this.log.error(err);
            await this.setStateAsync('info.connection', {val: false, ack: true});
        }

        // Reset the connection indicator during startup
        // this.setState('info.connection', false, true);

        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        /*
       await this.setObjectNotExistsAsync('testVariable', {
            type: 'state',
            common: {
                name: 'testVariable',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });
        */

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        // this.subscribeStates('testVariable');
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates('lights.*');
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates('*');

        /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        /// await this.setStateAsync('testVariable', true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        // await this.setStateAsync('testVariable', { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        // await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        // let result = await this.checkPasswordAsync('admin', 'iobroker');
        // this.log.info('check user admin pw iobroker: ' + result);

        // result = await this.checkGroupAsync('admin', 'admin');
        // this.log.info('check group user admin group admin: ' + result);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === 'object' && obj.message) {
    //         if (obj.command === 'send') {
    //             // e.g. send email or pushover or whatever
    //             this.log.info('send command');

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    //         }
    //     }
    // }

}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new AduroStove(options);
} else {
    // otherwise start the instance directly
    new AduroStove();
}