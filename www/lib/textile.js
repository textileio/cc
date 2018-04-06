var didScroll = false;

let Textile
define(function () {
  Textile = {
    init: function () {
      this.onScreen = 0
      let rows = Math.max(Math.ceil($(window).height() / 500), 3)
      let cols = Math.max(Math.ceil($(window).width() / 500), 1)
      this.initPageSize = rows * cols * 4
      this.bufferSize = rows * cols * 2
      this.loading = true
      this.data = {}
      this.hashes = this.getHashes() 
      for (hash of this.hashes) {
        this.data[hash] = {'hash': hash}
      }
      this.renderFirstPage()
    },
    renderFirstPage: function() {
      this.populateData()
          .then(Textile.drawScreen.bind(this))
          .then(Textile.renderAndListen)
          .then(Textile.getMeta.bind(this))
          .then(()=>{console.log('great')})
    },
    populateData: function () {
      // populate 2x screensize more worth of data
      let promises = []
      for (let i = this.onScreen; i < Math.min(this.onScreen + this.initPageSize * 2, this.hashes.length); i+=1) {
        let hash = this.hashes[i]
        if (!("meta" in this.data[hash])) {
          promises.push(
              this.getPathID(hash)
                  .catch(console.log)
                  .then(Textile.storeObject)
                  .catch(console.log)
          )
        }
      }
      return Promise.all(promises.map(p => p.catch(e => e)))
          .then(() => { Textile.loading = false})
          .catch(e => console.log(e));
    },
    drawScreen: function() {
      console.log("screen", this.onScreen, this.initPageSize, this.hashes.length)
      let promises = []
      for (let i = this.onScreen; i < Math.min(this.onScreen + this.initPageSize, this.hashes.length); i+=1) {
        let hash = this.hashes[i]
        promises.push(
            this.getImageData(hash)
                .then(this.draw.bind(this))
        )
      }
      return Promise.all(promises.map(p => p.catch(e => e)))
          .then(() => { Textile.loading = false})
          .catch(e => console.log("error:", e))
    },
    getMeta: function() {
      let promises = []
      for (let i = 0; i < Math.min(this.onScreen + this.initPageSize, this.hashes.length); i+=1) {
        let hash = this.hashes[i]
        if (this.data[hash].hasOwnProperty("meta") && !this.data[hash]['meta'].hasOwnProperty("data")) {
          let metaHash = this.data[hash]["meta"]["hash"]
          promises.push(
              PromiseNode.getFiles(metaHash)
                  .then((files) => {
                    let content = JSON.parse(files[0].content)
                    Textile.data[hash]["meta"]['data'] = content
                    return hash
                  })
          )
        }
      }
      return Promise.all(promises.map(p => p.catch(e => e)))
          .catch(e => console.log(e))
    },
    storeObject: function(obj) {
      let hash = obj.multihash.toString()
      let links = obj.links
      for (link of links){
        Textile.data[hash][link.name] = {"hash": link.multihash}
      }
      return obj
    },
    getPathID: function(hash) {
      return PromiseNode.getObject(hash)
          .then((obj) => { return obj.toJSON() })
          .catch(console.log)
    },
    renderAndListen: function() {
      console.log("render and listen")
      this.loading = false
      this.onScreen += this.initPageSize
      $('#gallery').imagesLoaded()
          .always( function( ) {
            console.log('okay')
            $('.gallery').justifiedGallery('norewind');
            // Adds more rows of images if user is approaching bottom of page
            window.onscroll = Textile.scrollFunction
          })
      // $(window).on("scroll", Textile.scrollFunction);
    },
    scrollFunction: function() {
      if($(window).scrollTop() + $(window).height() >= $(document).height() * 0.90) {
        didScroll = true;
        Textile.bufferImages()
      }
    },
    bufferImages: function() {
      // $(window).off("scroll", Textile.scrollFunction);
      window.onscroll = null
      if(!Textile.loading && this.onScreen < this.hashes.length) {
        Textile.loading = true
        Textile.initPageSize = Textile.bufferSize
        this.populateData()
            .then(this.drawScreen.bind(this))
            .catch(console.log)
            .then(this.renderAndListen)
            .catch(console.log)
            .then(this.getMeta.bind(this))
            .catch(console.log)
      }
    },
    getImageData: function(hash) {
      if ("thumb.jpg" in this.data[hash] && !("data" in this.data[hash]['thumb.jpg'])) {
        let multihash = this.data[hash]['thumb.jpg'].hash
        return PromiseNode.getFiles(multihash)
            .then((files) => {
              return files[0].content
            })
            .catch(console.log)
            .then((image) => {
              Textile.data[hash]['thumb.jpg']['data'] = image
              return hash
            })
      }
      return Promise.resolve(hash)
    },
    draw: function(hash) {
      if (!($('.'+hash).length)) {
        var b64encoded = btoa(String.fromCharCode.apply(null, this.data[hash]['thumb.jpg']['data']));
        var datajpg = "data:image/jpg;base64," + b64encoded;
        let img = $('<img>')
        img.attr('id', hash);
        img.attr('src', datajpg);
        // data-src="#hidden-content" href="javascript:;"
        $('.gallery').append(
            $('<a>')
                .attr("id", hash)
                .attr("data-options", JSON.stringify({"hash": hash}))
                .attr("class", "gallery-item zoom")
                .attr("data-fancybox", '')
                .attr("data-src", '#full-image')
                .attr("href","javascript:;")
                .append(img)
        )
      }
      return Promise.resolve(hash)
    },
    getHashes: function () {
      return [
        "Qmdw7BemUUz93pVv4WSWm1pGHN5thWY18T4Yr28KePa38D",
        "QmTfX4TeAyYKFHq7fnoRkywbfzLEN7Fbcu2NpbgSwodYvW",
        "QmSKMtWnG1Wda7aosUUuaFgsTNVjdWcYNw1rdMsAFptuUc",
        "Qmc6k6JgLxsGNSuZ5TXRAd93f59Au7E4T8Dn1TRGQQsNZ4",
        "QmcqLQB6FuyDDgevACG52raHPXk23U6r3wQJ6p95MoHi3R",
        "QmUf2Q3ftZPG5TdvbtZvZRM9sQwkQNvrXyH9Sru4vwySvv",
        "Qme36NpcVYMKJxbou6Sn984ZQoiKYRHPygoHjDWckmMx1f",
        "QmdDuLqFnQ1poo5h6zGxz9NT6hvyEcooGbtdtxiFrhaSEz",
        "QmYVtSfpwVkJ6WsPSLruw3QCpxaPJaemPsZzYGMUZFTyXf",
        "QmSBPqA98SGncMCJjr7LakLKeT8WFgs2UHuuGfuHVrGkmM",
        "QmdCCqhcyHeMPp7D9UUGfL824A1QrpLWTaTPcVPHQY6PNk",
        "QmXmWCFV9rSLnfTGB4G5b4kmFDyPeD83vi7KuajG18BQTv",
        "QmT1USDbvGbSHcvKUD8iEWWKqiyLPgYNtbDC2hppbF4cFs",
        "QmeyF1JeRbomfErtrS8mtXYCVyeQHh1H5wDzxzm8tDaBgr",
        "QmWV6SpFwdXxKvY4a7aHNAeE74ZvJk1XyA3JvEQvQzbxGf",
        "QmabNWv7vHrJ6k4zKFgUFiv6QF7NnE4r2bKZ2qQyk78jzN",
        "QmXJ2NT3d7L8tsYrdjUggu2JNK1AuKZFmNmJBwg515CW9S",
        "QmdQcetRhZeLxU2LPGheihcqNqZ2CfWq2Mi9NpEz5B7miQ",
        "QmQR9L6XeDuHvM2yFGJn33KKqkcocPvqkRR2WtvkM4DPyg",
        "QmcxKdTvzgbwitY5ZQottmsQHuv2TjnWZPpeuKcvq3XpVY",
        "QmZDy4hvTnVXShwSuiJZWFj2k8TCHGgfru3AL42Eh1cYCu",
        "QmbbHcGxrUAcqBSyavcGfWsYMJ5hVGptughaWTusTyDpFB",
        "QmV3cQYEQmED15tjrq3QvZ1bkmDA4UVHzie2DctrsdFwBz",
        "QmS8sM2B4BGMDNyAe8t71UuxiEpZWno7pcAfNuQfBjDvti",
        "QmZqnUqvTWKvwvun8XseLFzSVupnZnd8StthiR6uBqQCGk",
        "QmYZshEPfR7hK6Nc3WLNjqqjrCNrtWqjHdDN5LPBg7rAQh",
        "QmPjGYAfFw3BR3LhwRRAfDP6g2fQaS2fhDzeh8Ea7n7jTz",
        "QmYau1WoYFSCLPk6Mtz9VP3q5Keny6sERyMpprjozGQmGA",
        "QmZjUiuMcusZjqEBY1uwo1XX7QN9acEDXrJ5pxv363aXxN",
        "Qmc1X2KunbbtaCh8pHMczw6b6iUcDX6eNzBfBJBUdHqT4d",
        "QmZKW2MsrKNMC1g86dZgAGZi2At9CuHmDg6RbznsgpwGnV",
        "QmQgmLUa1YJdmY2Gw3AKZ59RTEwZRKBi8BazhMSCkn1VrU",
        "QmTWtJwSV2aFmusrikzjhixbXin5jZudPHSvv4hQ6xQArh",
        "QmTjfPTf7eFmHtT6ViwjKZhN5bpX2k571zZfPGn7phNXfT",
        "QmcqW1viHjTPhMKNtCGDCSr3UQi86uAjYfy7f8LBJW7fab",
        "QmTgvZnBjWWXgsdv9bc4Yob1hSGSwQDEPANz8XYFbJ83rZ",
        "QmWeRCuDLgUmGS8inpyw9PKfsF353iqeSvmUXvA23ASnYc",
        "QmPxneTs7LzkjT8geRemtRWgWDxnEa91Gndg68Wcud2efB",
        "QmScq96qsL7pfGHvdtgMtsnixkG64f6NianCjqZem3FhJr",
        "QmdJQTAatmSgkgVRwhUi86UHVvNxPf4pJYc1A39RSEdykA",
        "QmbVuDpCcEcFCknjL5DQ7ALUUWrr1xUv8rQdh1HCTQ2kAQ",
        "QmZfpRKjvfmuHgqGu4USSye3SBAT2vDCLtMUjGNdQNT5cJ",
        "QmVjZ8VZpCVioB6E4WPfr9yQK7Hpy5bb72sD5LV4trZZe6",
        "QmWywMhAufFWTdeT58iM2YdZLvzH3jUZa6eoRzrfYDMRqt",
        "QmVSpdxrCtsUzVeWU96zCAn5XpwQZz9dy6HsJGsGehhKRe",
        "QmZbYMKCuxZmmXn66tEq1LWjnDKEdZ5eiSDAZtZj1vFhSu",
        "QmdUdJQ52t52CpMapboobGRkvUussXTwSfMFoHFp7NwVTN",
        "QmdfCMM7juGB4mTugBqdtBuHCG6UcLk9AZadLkTfEgJypw",
        "QmRKrjL6gzKJFvYwv3jysRCBKSAszduGvc6SkGKCwxUYby",
        "QmaQ5zFAnr7GEw2MVKcq8Dz5rntffgvRytCrLTevR9S7nG",
        "QmXdkQb2Sh2qVJZWWYgDuAkFHeYns43o6GFQ3qapHfzGwL",
        "QmZwsB1JZEfatDG2WK56exKxmoCX3Vwvd45v3ApcqmxhC8",
        "QmTEjAmTHShsmtMzn2qR7LbmPNAkcr3YtwmJsmzKwB7okg",
        "QmYmgLdVzsqQjEv3v64f5gYSHkVWrr4Lc3nRNcRWUVpGqA",
        "QmTZx2s7FZv9RyNFhrWbytsi649JDtP4qGRwFmjJLkzzAi",
        "QmPBsUcXUNF6boKNvH2km4CWAUwX2GBEUPHqGferXs4zR1",
        "QmVT22ZRY4fveEmhvn2f3NW2aoLhiqZSqWdmbCtXVuQAY7",
        "QmPyuNLsw394FLmS27Phmv7iEyGEFs4YWeAKGpnBGSd6yn",
        "QmZMtzxYbAfsSGSvBCoWFvE3ngrnYbRjDYZ1Bi3g544iKq",
        "QmYduUGcDMc1nWJjiMiFPeBPcRZoLAYqM6xsfTNfsFNwaw",
        "QmXFpnyWBPfJaJjkAduAFpp5y8sfy4cBikAVJCt5bASQud",
        "QmakE6Wm4b73Zx5NpYLkmHcCvJCisXkasvqJ4bwgcdbVcC",
        "QmauZWvgSZfGQKXsrxLbY7ENm3cHSzzzhJ8TFSSxnu6txw",
        "QmRC69jsTBWFhj2ZHTLy2FgyKrzfmCVzJ62HrjKuKGtusM",
        "QmUrPbTb7oqdTBChN6itDVkHegAL8RgRzqVGdQjwwB4nEi",
        "QmWczTGFvzosYvfTLYZQyRvuDXTJ1wT7YFpyrPMnFiKB7c",
        "QmQ91XZouMBVpjnKwPDa4RgoZiHKXWhZkvKFKD42pd5qSU",
        "QmZ1KpN1xeQXjewg8xasDZvTfZqb9AkivWdY3vHWV6Y17k",
        "QmdKf1oE58UaBZoYMG2QxQutf6ZmryKNUcTR8LnGZ7w7Zc",
        "QmfWkG97uZ1cRSaXxbm1GaqAGRCv518H4PGBxjp2dDD4ge",
        "QmdDAusSYT5tfnpG1Jyy5kThWeRoTeyRTP4VYtJykamD6d",
        "Qmb2wrfTcSSAfhhQpndZVxrWgGGZUJi5bJy8LTLMGqsU8W",
        "QmV9LuTNox8thnxs7KkfjYSBoRPjPQy2iXB8MrGrQij3pt",
        "QmR6Q5UjjGuV3SDh9opffQWejUW1BU6X1wqYshdPzoP3bu",
        "QmcdhZJTzP1W7d7ZQDR8uU996EpYdFEzG3Zsq9bhkPGZpn",
        "Qme1fSVDJfuQCrJuxbbhhc9u5rXMPjnKMWmdCLH5TWK7wM",
        "QmWJg5nu7G6jyVH2d8eCTKth6mBkMxTLZpDtMSboibejYE",
        "Qmb7xQaG1CwvxYrW6pmS2UMzihKEn3LJt98EskTdT6vRuX",
        "QmZPdrcRfjoUSgUnoZb43MXYG2LSyddLwPknH2ifvD4LYz"
      ]
    }
  }
});

// Only executes the onscroll action at most once every 100 milliseconds
// setInterval(function() {
//     if(didScroll) {
//         didScroll = false;
//         Textile.bufferImages()
//     }
// }, 100);