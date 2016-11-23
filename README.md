# Fire Detection System

Developed by [aahz](http://aahz.pro/)  
Licensed under [MIT License](http://opensource.org/licenses/MIT)

## Description

This project is an implementation of CV-based fire detector build upon [NodeJS](https://nodejs.org/) and [nw.js](http://nwjs.io/) with a help of [OpenCV](http://opencv.org/) bindings.
FDS consists of server-side detector and client. Connection between them is based on WebSocet protocol.

## Installation

1. Download and install MinGW
2. Install pkg-config like it described here http://stackoverflow.com/a/22363820
3. Update node-gyp according to this article https://github.com/TooTallNate/node-gyp/wiki/Updating-npm%27s-bundled-node-gyp
4. Set up Python 2.7
5. Set up Visual Studio 2013 Express
6. set PKG_CONFIG_PATH={PATH_TO_opencv.cp_FOLDER}
7. npm install --msvs_version=2013
