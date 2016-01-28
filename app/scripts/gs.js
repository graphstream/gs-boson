'use strict';

const NetstreamWebSocket = require('../scripts/gs-netstream-websocket.js');
const LAYOUT_DELAY = 1000;
const REFRESH_TIMEOUT = 500;
const ipcRenderer = require('electron').ipcRenderer;

class GraphStream {
  constructor(container) {
    this.sigma = new sigma({
        container: container
    });
    
    this.layoutConfig = {};
    this.refreshTimeout = false;
  }
  
  nodeAdded(sourceId, timeId, nodeId) {
    this.sigma.graph.addNode({
      id: nodeId,
      
      size: Math.random() * 50 + 1,
      
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100
    });
    
    this.postUpdateAction();
  }
  
  nodeRemoved(sourceId, timeId, nodeId) {
    this.sigma.graph.dropNode(nodeId);
    this.postUpdateAction();
  }
  
  edgeAdded(sourceId, timeId, edgeId, fromNodeId, toNodeId, directed) {
    this.sigma.graph.addEdge({
      id: edgeId,
      
      source: fromNodeId,
      target: toNodeId,
      
      type: 'curve'
    });
    
    this.postUpdateAction();
  }
  
  edgeRemoved(sourceId, timeId, edgeId) {
    this.sigma.graph.dropEdge(edgeId);
    this.postUpdateAction();
  }
  
  postUpdateAction() {
    //
    // Avoid too many calls to refresh by adding a timeout.
    //
    if (!this.refreshTimeout) {
      this.refreshTimeout = setTimeout(() => {
        this.sigma.refresh();
        this.refreshTimeout = false;
      }, REFRESH_TIMEOUT);
    }
  }
  
  computeLayout() {
    if (!this.sigma.isForceAtlas2Running()) {
      this.sigma.startForceAtlas2(this.layoutConfig);
      
      setTimeout(() => {
        this.sigma.killForceAtlas2();
      }, LAYOUT_DELAY);
    }
  }
}

(function() {
  var graphstream = new GraphStream("graph-container")
    , netstream   = new NetstreamWebSocket(graphstream);
    
  netstream.connect("ws://localhost:10042");
  
  ipcRenderer.on('compute-layout', () => {
    graphstream.computeLayout();
  });
})();
