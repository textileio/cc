define(function (require) {
  require('jquery');
  require('fancybox');
  require('justified');
  require('ipfs');
  require('promiseNode');
  require('textile');

  require(['ipfs'], function(){
    PromiseNode.init();
    PromiseNode.onReady().then(function(){
      Textile.init()
    })
  });
  let humandate = require('humandate')

  $('.gallery').justifiedGallery({rowHeight:200});
  $('.gallery').justifiedGallery('norewind');

  // Listen for dynamic images
  $().fancybox({
    selector : '[data-fancybox="gallery"]',
    loop     : true
  });
  //
  $(document).on('beforeLoad.fb', function( e, instance ) {
    let hash = instance.currentHash
    let meta = Textile.data[hash].meta.data
    let container = $("#full-image .ipfs-image")
    let column = container.find(".main-obj")
    let explainer = container.find(".explainer")
    let image = container.find(".original-image")

    container.find('.image-title').html(meta.original.title)
    console.log(meta.original.taken)
    container.find('.image-description').html(
        'Taken on ' + humandate.prettyPrint(new Date(meta.original.taken.replace(" ", "T"))) + '.' +
        ' Access <a href="https://gateway.textile.photos/ipfs/' + hash + '/meta">full metadata</a>.'
    )

    container.find('.highlight.original').html(hash)
    container.find('.highlight.large').html(hash)
    container.find('.highlight.thumb').html(hash)
    container.find('.highlight.meta').html(hash)

    container.find('.http-link').text("https://gateway.textile.photos/ipfs/" + hash + "/large.jpg")
    container.find('.http-link').attr("href", "https://gateway.textile.photos/ipfs/" + hash + "/large.jpg")

    container.find('.credits').html(
        '<a href="https://www.flickr.com/people/' + meta.source.alias + '">' +
        meta.source.name + '</a> ' + meta.source.service + ' account, licensed under ' +
        '<a href="' + meta.original.license.url + '">' + meta.original.license.longname + '</a>.'
    )

    let dimensions = meta.derivatives.large.info.dimensions
    if (dimensions[0] * 0.8 < dimensions[1]) {
      column.removeClass("twelve")
      column.addClass("one-half")
      // explainer.removeClass("column")
      // explainer.addClass("row")
      explainer.addClass("u-max-full-width")
      explainer.removeClass("three")
      image.removeClass("zoom-image-wide")
      image.addClass("zoom-image-tall")
      image.attr("src", "https://gateway.textile.photos/ipfs/"+Textile.data[hash]['large.jpg'].hash)
    } else {
      column.addClass("twelve")
      column.removeClass("one-half")

      explainer.removeClass("u-max-full-width")
      explainer.addClass("three")

      image.addClass("zoom-image-wide")
      image.removeClass("zoom-image-tall")
      image.attr("src", "https://gateway.textile.photos/ipfs/"+Textile.data[hash]['large.jpg'].hash)
    }
  });
});
