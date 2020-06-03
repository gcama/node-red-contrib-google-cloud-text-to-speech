module.exports = function(RED) {
  "use strict";

  function GoogleCloudCredentialsNode(config) {
      RED.nodes.createNode(this, config);
      this.name = config.name;
  }
  RED.nodes.registerType("google-cloud-text-to-speech-credentials", GoogleCloudCredentialsNode, {
      credentials: {
          name: {
              type: "text",
              required: true
          },
          account: {
              type: "password",
              required: true
          }
      }
  });

};