# GraphStream Boson

Note that this project is completely experimental. There is actually no need to publish issue, the whole project is under heavy construction.

## Install

First, you have to install Electron. You can do it globally using `npm install -g electron-prebuilt`.
Then use `bower install` to install several components.

You will need to build the sigma package. Go to `bower_components/sigma/` and run `grunt build`.

## GraphStream Server

Actually, this viewer uses the fresh new [WebSocket pipe](https://github.com/graphstream/gs-websocket) form GraphStream. You can get it and run the demo inside `src-test/`.

## Running the viewer

Once the server is running, you can run the viewer using `electron main.js` inside this directory.
