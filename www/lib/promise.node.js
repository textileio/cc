let PromiseNode
define(function () {
  PromiseNode = {
    init: function() {
      this.node = new Ipfs()
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