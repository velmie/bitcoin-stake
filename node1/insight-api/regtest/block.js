'use strict';

var expect = require('chai').expect;
var spawn = require('child_process').spawn;
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var fs = require('fs');
var async = require('async');
var RPC = require('bitcoind-rpc');
var http = require('http');
var bitcore = require('bitcore-lib');
var exec = require('child_process').exec;
var bitcore = require('bitcore-lib');
var Block = bitcore.Block;

var blocksGenerated = 0;

var rpcConfig = {
  protocol: 'http',
  user: 'local',
  pass: 'localtest',
  host: '127.0.0.1',
  port: 58332,
  rejectUnauthorized: false
};

var rpc = new RPC(rpcConfig);
var debug = true;
var bitcoreDataDir = '/tmp/bitcore';
var bitcoinDir = '/tmp/bitcoin';
var bitcoinDataDirs = [ bitcoinDir ];
var blocks= [];

var bitcoin = {
  args: {
    datadir: null,
    listen: 1,
    regtest: 1,
    server: 1,
    rpcuser: 'local',
    rpcpassword: 'localtest',
    //printtoconsole: 1,
    rpcport: 58332,
  },
  datadir: null,
  exec: 'bitcoind', //if this isn't on your PATH, then provide the absolute path, e.g. /usr/local/bin/bitcoind
  processes: []
};

var bitcore = {
  configFile: {
    file: bitcoreDataDir + '/bitcore-node.json',
    conf: {
      network: 'regtest',
      port: 53001,
      datadir: bitcoreDataDir,
      services: [
        'p2p',
        'db',
        'header',
        'block',
        'address',
        'transaction',
        'mempool',
        'web',
        'insight-api',
        'fee',
        'timestamp'
      ],
      servicesConfig: {
        'p2p': {
          'peers': [
            { 'ip': { 'v4': '127.0.0.1' }, port: 18444 }
          ]
        },
        'insight-api': {
          'routePrefix': 'api'
        },
        'block': {
          'readAheadBlockCount': 1
        }
      }
    }
  },
  httpOpts: {
    protocol: 'http:',
    hostname: 'localhost',
    port: 53001,
  },
  opts: { cwd: bitcoreDataDir },
  datadir: bitcoreDataDir,
  exec: 'bitcored',  //if this isn't on your PATH, then provide the absolute path, e.g. /usr/local/bin/bitcored
  args: ['start'],
  process: null
};

var request = function(httpOpts, callback) {

  var request = http.request(httpOpts, function(res) {

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback('Error from bitcore-node webserver: ' + res.statusCode);
    }

    var resError;
    var resData = '';

    res.on('error', function(e) {
      resError = e;
    });

    res.on('data', function(data) {
      resData += data;
    });

    res.on('end', function() {

      if (resError) {
        return callback(resError);
      }
      var data = JSON.parse(resData);
      callback(null, data);

    });

  });

  request.on('error', function(err) {
    callback(err);
  });

  if (httpOpts.body) {
    request.write(httpOpts.body);
  } else {
    request.write('');
  }
  request.end();
};

var waitForBlocksGenerated = function(callback) {

  var httpOpts = {
    hostname: 'localhost',
    port: 53001,
    path: '/api/status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  async.retry({ interval: 1000, times: 100 }, function(next) {

    request(httpOpts, function(err, data) {
      if (err) {
        return next(err);
      }
      if (data.info.blocks !== blocksGenerated) {
        return next(data);
      }
      next();
    });

  }, callback);
};

var resetDirs = function(dirs, callback) {

  async.each(dirs, function(dir, next) {

    rimraf(dir, function(err) {

      if(err) {
        return next(err);
      }

      mkdirp(dir, next);

    });

  }, callback);

};

var startBitcoind = function(callback) {

  var args = bitcoin.args;
  var argList = Object.keys(args).map(function(key) {
    return '-' + key + '=' + args[key];
  });

  var bitcoinProcess = spawn(bitcoin.exec, argList, bitcoin.opts);
  bitcoin.processes.push(bitcoinProcess);

  bitcoinProcess.stdout.on('data', function(data) {

    if (debug) {
      process.stdout.write(data.toString());
    }

  });

  bitcoinProcess.stderr.on('data', function(data) {

    if (debug) {
      process.stderr.write(data.toString());
    }

  });

  callback();
};


var reportBitcoindsStarted = function() {
  var pids = bitcoin.processes.map(function(process) {
    return process.pid;
  });

  console.log(pids.length + ' bitcoind\'s started at pid(s): ' + pids);
};

var startBitcoinds = function(datadirs, callback) {

  var listenCount = 0;
  async.eachSeries(datadirs, function(datadir, next) {

    bitcoin.datadir = datadir;
    bitcoin.args.datadir = datadir;

    if (listenCount++ > 0) {
      bitcoin.args.listen = 0;
      bitcoin.args.rpcport = bitcoin.args.rpcport + 1;
      bitcoin.args.connect = '127.0.0.1';
    }

    startBitcoind(next);

  }, function(err) {
    if (err) {
      return callback(err);
    }
    reportBitcoindsStarted();
    callback();
  });
};

var waitForBitcoinReady = function(rpc, callback) {
  async.retry({ interval: 1000, times: 1000 }, function(next) {
    rpc.getInfo(function(err) {
      if (err) {
        return next(err);
      }
      next();
    });
  }, function(err) {
    if (err) {
      return callback(err);
    }
    setTimeout(callback, 2000);
  });
};

var shutdownBitcoind = function(callback) {
  var process;
  do {
    process = bitcoin.processes.shift();
    if (process) {
      process.kill();
    }
  } while(process);
  setTimeout(callback, 3000);
};

var shutdownBitcore = function(callback) {
  if (bitcore.process) {
    bitcore.process.kill();
  }
  callback();
};

var writeBitcoreConf = function() {
  fs.writeFileSync(bitcore.configFile.file, JSON.stringify(bitcore.configFile.conf));
};

var startBitcore = function(callback) {

  var args = bitcore.args;
  console.log('Using bitcored from: ');
  async.series([
    function(next) {
      exec('which bitcored', function(err, stdout, stderr) {
        if(err) {
          return next(err);
        }
        console.log(stdout.toString('hex'), stderr.toString('hex'));
        next();
      });
    },
    function(next) {
      bitcore.process = spawn(bitcore.exec, args, bitcore.opts);

      bitcore.process.stdout.on('data', function(data) {

        if (debug) {
          process.stdout.write(data.toString());
        }

      });
      bitcore.process.stderr.on('data', function(data) {

        if (debug) {
          process.stderr.write(data.toString());
        }

      });

      waitForBlocksGenerated(next);
    }
  ], callback);

};

describe('Block', function() {

  this.timeout(60000);

  before(function(done) {

    async.series([
      function(next) {
        console.log('step 0: setting up directories.');
        var dirs = bitcoinDataDirs.concat([bitcoreDataDir]);
        resetDirs(dirs, function(err) {
          if (err) {
            return next(err);
          }
          writeBitcoreConf();
          next();
        });
      },
      function(next) {
        startBitcoinds(bitcoinDataDirs, function(err) {
          if (err) {
            return next(err);
          }
          waitForBitcoinReady(rpc, function(err) {
            if (err) {
              return next(err);
            }
            blocksGenerated += 10;
            rpc.generate(10, function(err, res) {
              if (err) {
                return next(err);
              }
              blocks = res.result;
              next();
            });
          });
        });
      },
      function(next) {
        startBitcore(next);
      }
    ], done);

  });

  after(function(done) {
    shutdownBitcore(function() {
      shutdownBitcoind(done);
    });
  });

  it('should get blocks: /blocks', function(done) {

    var httpOpts = {
      hostname: 'localhost',
      port: 53001,
      path: 'http://localhost:53001/api/blocks',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(httpOpts, function(err, data) {

      if(err) {
        return done(err);
      }

      expect(data.length).to.equal(10);
      expect(data.blocks.length).to.equal(10);
      done();
    });

  });

  it('should get a block: /block/:hash', function(done) {

    var httpOpts = {
      hostname: 'localhost',
      port: 53001,
      path: 'http://localhost:53001/api/block/' + blocks[0],
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(httpOpts, function(err, data) {

      if(err) {
        return done(err);
      }

      expect(data.hash).to.equal(blocks[0]);
      expect(data.height).to.equal(1);
      done();
    });
  });

  it('should get a block-index: /block-index/:height', function(done) {

    var httpOpts = {
      hostname: 'localhost',
      port: 53001,
      path: 'http://localhost:53001/api/block-index/7',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(httpOpts, function(err, data) {

      if(err) {
        return done(err);
      }

      expect(data.blockHash).to.equal(blocks[6]);
      done();
    });

  });

  it('should get a raw block: /rawblock/:hash', function(done) {

    var httpOpts = {
      hostname: 'localhost',
      port: 53001,
      path: 'http://localhost:53001/api/rawblock/' + blocks[4],
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(httpOpts, function(err, data) {

      if(err) {
        return done(err);
      }

      var block = new Block(new Buffer(data.rawblock, 'hex'));
      expect(block.hash).to.equal(blocks[4]);
      done();
    });
  });

});
