module.exports = function(RED) {
    "use strict";
    const NODE_TYPE = "google-cloud-text-to-speech";
    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');
    const util = require('util');

    function TextToSpeechNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let textToSpeechClient = null;
        let credentials = null;

        const languageCode       = config.languageCode       || "ja";
        const voiceName          = config.voiceName          || "ja-JP-Wavenet-B";
        const voicePitch         = config.voicePitch         || -3.1;
        const voiceSpeakingRate  = config.voiceSpeakingRate  || 1.1;
        const voiceAudioEncoding = config.voiceAudioEncoding || "MP3";
        const voiceDir           = config.voiceDir           || "/home/pi/";
        const voiceFileName      = config.voiceFileName      || "audio.mp3";

        if (config.account) {
            credentials = GetCredentials(config.account);
        }
        const keyFilename = config.keyFilename;

        // 認証情報の取得
        function GetCredentials(node) {
            return JSON.parse(RED.nodes.getCredentials(node).account);
        }

        async function Input(msg) {

            const text = msg.payload;
            node.log(text);
            if(!text){
                node.error('Payload is empty');
            }

            const request = {
                input: {
                    text: text
                },
                voice: {
                    languageCode: languageCode, 
                    name: voiceName,
                    ssmlGender: 'NEUTRAL'
                },
                audioConfig: {
                    audioEncoding: voiceAudioEncoding,
                    effectsProfileId: ['medium-bluetooth-speaker-class-device'],
                    pitch: voicePitch,
                    speakingRate: voiceSpeakingRate,
                    sampleRateHertz: 24000
                }
            };

            try {
                node.status({fill: "blue", shape: "dot", text: "processing"});
                const [response] = await textToSpeechClient.synthesizeSpeech(request);
                node.status({});
                const writeFile = util.promisify(fs.writeFile);
                await writeFile(voiceDir + voiceFileName, response.audioContent, 'binary');
                node.log(msg);
                msg.payload = voiceDir + voiceFileName;
                node.send(msg);
            }
            catch(exp) {
                node.status({});
                node.error(exp);
            }
        } // Input

        if (credentials) {
            textToSpeechClient = new textToSpeech.TextToSpeechClient({
                "credentials": credentials
            });
        } else if (keyFilename) {
            textToSpeechClient = new textToSpeech.TextToSpeechClient({
                "keyFilename": keyFilename
            });
        } else {
            textToSpeechClient = new textToSpeech.TextToSpeechClient({});
        }

        node.on("input", Input);
    }

    RED.nodes.registerType(NODE_TYPE, TextToSpeechNode);
}