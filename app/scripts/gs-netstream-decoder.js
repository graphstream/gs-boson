'use strict';

const NS_CONSTANTS = require('../scripts/gs-netstream-constants.js');

function NetstreamDecoder(buffer) {
  this.buffer = buffer;
  this.dataView = new DataView(buffer);
  this.offset = 0;
  
  this.process();
}

NetstreamDecoder.prototype.readByte = function() {
  return this.dataView.getUint8(this.offset++);
}

NetstreamDecoder.prototype.readInt = function() {
  var i = this.dataView.getUint32(this.offset);
  this.offset += 4;
  return i;
};

NetstreamDecoder.prototype.readUnsignedVarint = function() {
    try {
        var size = 0,
            data = [],
            i = 0;

        do {
            data[size] = this.dataView.getInt8(this.offset);
            this.offset += 1; // One Byte at a time
            size++;

            //int bt =data[size-1];
            //if (bt < 0) bt = (bt & 127) + (bt & 128);
            //System.out.println("test "+bt+"  -> "+(data[size - 1]& 128) );
        } while ((data[size - 1] & 128) == 128);
        
        var number = 0;
        
        for (i = 0; i < size; i++) {
            number ^= (data[i] & 127) << (i * 7);
        }

        return number;
    } catch (e) {
      console.log(e);
        throw 'readUnsignedVarintFromInteger: could not read';
    }
};

NetstreamDecoder.prototype.readString = function() {
  var len = this.readUnsignedVarint();
  var buf = new Uint8Array(this.buffer, this.offset, len);
  this.offset += len;
  
  return String.fromCharCode.apply(null, buf);
};

NetstreamDecoder.prototype.readFloat = function() {
  var d = this.dataView.getFloat32();
  this.offset += 4;
  
  return d;
};

NetstreamDecoder.prototype.readDouble = function() {
  var d = this.dataView.getFloat64();
  this.offset += 8;
  
  return d;
};

NetstreamDecoder.prototype.readValue = function() {
  var type = this.readByte();
  // TODO
};

NetstreamDecoder.prototype.process = function() {
  this.header = {
    size:     this.readInt(),
    streamId: this.readString(),
    type:     this.readByte(),
    sourceId: this.readString(),
    timeId:   this.readUnsignedVarint()
  };
  
  this.data = {};
  
  switch(this.header.type) {
  case NS_CONSTANTS.EVENT_ADD_NODE:
  case NS_CONSTANTS.EVENT_DEL_NODE:
    this.data.nodeId = this.readString();
    break;

  case NS_CONSTANTS.EVENT_ADD_EDGE:
    this.data.edgeId     = this.readString();
    this.data.fromNodeId = this.readString();
    this.data.toNodeId   = this.readString();
    this.data.directed   = this.readByte() != 0;
    break;

  case NS_CONSTANTS.EVENT_DEL_EDGE:
    this.data.edgeId = this.readString();
    break;

  case NS_CONSTANTS.EVENT_ADD_NODE_ATTR:
    this.data.nodeId    = this.readString();
    this.data.attribute = this.readString();
    this.data.value     = this.readValue();
    break;
    
  case NS_CONSTANTS.EVENT_CHG_NODE_ATTR:
    this.data.nodeId    = this.readString();
    this.data.attribute = this.readString();
    this.data.old       = this.readValue();
    this.data.value     = this.readValue();
    break;

  case NS_CONSTANTS.EVENT_DEL_NODE_ATTR:
    this.data.nodeId    = this.readString();
    this.data.attribute = this.readString();
    break;

  case NS_CONSTANTS.EVENT_ADD_EDGE_ATTR:
    this.data.edgeId    = this.readString();
    this.data.attribute = this.readString();
    this.data.value     = this.readValue();
    break;

  case NS_CONSTANTS.EVENT_CHG_EDGE_ATTR:
    this.data.edgeId    = this.readString();
    this.data.attribute = this.readString();
    this.data.old       = this.readValue();
    this.data.value     = this.readValue();
    break;

  case NS_CONSTANTS.EVENT_DEL_EDGE_ATTR:
    this.data.attribute = this.readString();
    break;

  case NS_CONSTANTS.EVENT_ADD_GRAPH_ATTR:
    this.data.attribute = this.readString();
    this.data.value     = this.readValue();
    break;

  case NS_CONSTANTS.EVENT_CHG_GRAPH_ATTR:
    this.data.attribute = this.readString();
    this.data.old       = this.readValue();
    this.data.value     = this.readValue();
    break;

  case NS_CONSTANTS.EVENT_DEL_GRAPH_ATTR:
    this.data.attribute = this.readString();
    break;

  case NS_CONSTANTS.EVENT_STEP:
    this.data.step = this.readDouble();
    break;

  case NS_CONSTANTS.EVENT_CLEARED:
    break;
  }
};

module.exports = function(buffer) {
  var dec = new NetstreamDecoder(buffer);
  
  return {
    header: dec.header,
    data: dec.data
  };
};
