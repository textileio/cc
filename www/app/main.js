define(function (require) {
  require('jquery');
  require('justified');
  let imagesLoaded = require('imagesLoaded');
  require('ipfs');
  require('promiseNode');
  require('fancybox');
  require('textile');
  let humandate = require('humandate')
  
  require(['ipfs'], function(){ 
    PromiseNode.init();
    PromiseNode.onReady().then(function(){
      Textile.init();
    });
  });

  $('.gallery').justifiedGallery({rowHeight:200});
  $('.gallery').justifiedGallery('norewind');

  // Listen for dynamic images
  $().fancybox({
    selector: '[data-fancybox="gallery"]',
    loop: true
  });

  function showInfo(meta) {
    let container = $("#full-image .ipfs-image")
    let column = container.find(".main-obj")
    let explainer = container.find(".explainer")
    let image = container.find(".original-image")
    const large = meta.derivatives.large.info
    const original = meta.original
    const hash = meta.multihash
    container.find('.image-title').html(meta.original.title)
    container.find('.image-description').html(
        'Taken on ' + humandate.prettyPrint(new Date(original.taken.replace(" ", "T"))) + '.' +
        ' Access <a href="https://gateway.textile.photos/ipfs/' + hash + '/meta" target="_blank">full metadata</a>.'
    )

    container.find('.highlight.original').html(hash)
    container.find('.highlight.large').html(hash)
    container.find('.highlight.thumb').html(hash)
    container.find('.highlight.meta').html(hash)
    
    container.find('.http-link').text("https://gateway.textile.photos/ipfs/" + hash + "/large." + large.format)
    container.find('.http-link').attr("href", "https://gateway.textile.photos/ipfs/" + hash + "/large." + large.format)

    container.find('.credits').html(
        '<a href="https://www.flickr.com/people/' + meta.source.alias + '" target="_blank">' +
        meta.source.name + '</a> ' + meta.source.service + ' account, licensed under ' +
        '<a href="' + original.license.url + '" target="_blank">' + original.license.longname + '</a>.'
    )

    let dimensions = large.dimensions
    if (dimensions[0] * 0.8 < dimensions[1]) {
      column.removeClass("twelve")
      column.addClass("one-half")
      explainer.addClass("u-max-full-width")
      explainer.removeClass("three")
      image.removeClass("zoom-image-wide")
      image.addClass("zoom-image-tall")
      image.attr("src", "https://gateway.textile.photos/ipfs/" + large.multihash)
    } else {
      column.addClass("twelve")
      column.removeClass("one-half")
      explainer.removeClass("u-max-full-width")
      explainer.addClass("three")
      image.addClass("zoom-image-wide")
      image.removeClass("zoom-image-tall")
      image.attr("src", "https://gateway.textile.photos/ipfs/" + large.multihash)
    }
  };
  
  $(document).on('beforeLoad.fb', function(e, instance) {
    Textile.getMeta(instance.currentHash)
      .then(showInfo)
  });
});
