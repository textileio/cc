let PromiseNode
define(function () {
  PromiseNode = {
    init: function() {
      this.node = new Ipfs({
        config: {
          "Addresses": {
            "Swarm": [
            ],
            "API": "",
            "Gateway": ""
          },
          "Discovery": {
            "MDNS": {
              "Enabled": false,
              "Interval": 10
            },
            "webRTCStar": {
              "Enabled": true
            }
          },
          "Bootstrap": [
            "/dns4/ec2-52-204-1-97.compute-1.amazonaws.com/tcp/9999/ws/ipfs/QmPYxbNHdCN3ervZobHSDrN9v9XkzUL8QxDJSpATJLCwki",
            "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
            "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
            "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
            "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
            "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
            "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
            "/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
            "/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6"
          ]
        }
      });
    },
    onReady: function() {
      return new Promise((res, rej) => {
        this.node.on('ready', function() {
          return res()
        })
      })
    },
    getFiles: function(hash) {
      return new Promise((res, rej) => {
        this.node.files.get(hash, (err, obj) => {
          if (err) {
            rej(err)
          }
          res(obj)
        })
      })
    },
    getObject: function(hash) {
      return new Promise((res, rej) => {
        this.node.object.get(hash, (err, obj) => {
          if (err) {
            rej('err', err)
          }
          res(obj)
        })
      })
    }
  }
})