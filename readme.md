# Bitcoin Stake
Bitcoin Stake is an experimental digital currency that enables instant payments to anyone, anywhere in the world. Bitcoin Stake uses peer-to-peer technology to operate with no central authority: managing transactions and issuing money are carried out collectively by the network. For protocol implementation was used Bcoin, written in node.js. 

# Prerequisites
- Node.js v8.2.0+
- ~500GB of disk storage
- ~4GB of RAM
- Configuration

### Configuration
The main configuration file is called "bitcore-node.json". This file instructs node for the following options:
- location of database files (datadir)
- tcp port for web services, if configured (port)
- bitcoin network type (e.g. mainnet, testnet3, regtest), (network)
- what services to include (services)
- the services' configuration (servicesConfig)

### Installation
Install the dependencies and devDependencies and start the server.
```sh
$ git clone git://github.com/bcoin-org/bitcoin-stake.git
$ cd bitcoin-stake/node1
$ npm install
```

### Start node
```sh
$ node ./bitcore-node/bin/bitcore-node -- start
```

### Implements
- Full Node
- SPV Node
- Wallet Backend
- Mining Backend
- Increasing block size
