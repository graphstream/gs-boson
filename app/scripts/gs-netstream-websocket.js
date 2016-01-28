'use strict';

const NS_CONSTANTS     = require('../scripts/gs-netstream-constants.js');
const netstreamDecoder = require('../scripts/gs-netstream-decoder.js');
const EventEmitter     = require('events').EventEmitter;

class NetstreamWebSocket {
  constructor(gs) {
    this.socket = null;
    this.gs     = gs;
  }
  
  connect(url) {
    if (this.socket) {
      this.socket.close();
    }
    
    this.url = url;
    
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";
    
    this.socket.onerror = (error) => {
      console.log(error);
    };
    
    this.socket.onopen = () => {
      console.log("connection opened");
    };
    
    this.socket.onclose = () => {
      
    };
    
    this.socket.onmessage = (event) => {
      var gsEvent = netstreamDecoder(event.data);
      
      if (gsEvent.error) {
        console.log(gsEvent.error);
      }
      else {
        switch(gsEvent.header.type) {
        case NS_CONSTANTS.EVENT_ADD_NODE:
          this.gs.nodeAdded(gsEvent.header.sourceId, gsEvent.header.timeId, gsEvent.data.nodeId);
          break;
        case NS_CONSTANTS.EVENT_DEL_NODE:
          this.gs.nodeRemoved(gsEvent.header.sourceId, gsEvent.header.timeId, gsEvent.data.nodeId);
          break;
        case NS_CONSTANTS.EVENT_ADD_EDGE:
          this.gs.edgeAdded(gsEvent.header.sourceId, gsEvent.timeId, gsEvent.data.edgeId, gsEvent.data.fromNodeId, gsEvent.data.toNodeId);
          break;
        case NS_CONSTANTS.EVENT_DEL_EDGE:
          this.gs.edgeRemoved(gsEvent.header.sourceId, gsEvent.timeId, gsEvent.data.edgeId);
          break;
        }
      }
    };
  }
}

module.exports = NetstreamWebSocket;
