(function() {
  var SCOW;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  SCOW = (function() {
    function SCOW() {
      this.headEl = $('head');
      this.bodyEl = $('body');
      this.curFileName = this.getFileName();
      this.assets = this.getStorage('assets');
      if (this.assets === null) {
        this.assets = ['js/jquery.js', 'js/scow.js'];
        this.setStorage('assets', this.assets);
      }
      applicationCache.addEventListener('updateready', function() {
        return localStorage.clear();
      });
      if (navigator.onLine) {
        this.cacheCurrentFile();
      } else {
        this.restoreFromCache();
      }
      if (location.host.indexOf('localhost') !== -1) {
        $('#new-cache').show();
      }
      this.updateAssetsIndex();
    }
    SCOW.prototype.getFileName = function() {
      var filename, path;
      path = location.pathname.split('/');
      filename = path[path.length - 1];
      if (filename.length === 0) {
        filename = 'index.html';
      }
      return filename;
    };
    SCOW.prototype.getStorage = function(name) {
      var item;
      item = localStorage.getItem(name);
      if (item !== null) {
        item = JSON.parse(item);
      }
      return item;
    };
    SCOW.prototype.setStorage = function(name, value) {
      var item;
      item = JSON.stringify(value);
      return localStorage.setItem(name, item);
    };
    SCOW.prototype.updateAssetsIndex = function() {
      var asset, listEl, _i, _len, _ref, _results;
      listEl = $('#cached-files');
      listEl.children().remove();
      _ref = this.assets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        _results.push(listEl.append("<li>" + asset + "</li>"));
      }
      return _results;
    };
    SCOW.prototype.isAssetCached = function(path) {
      return $.inArray(path, this.assets) !== -1;
    };
    SCOW.prototype.loadAssetCallback = function(path, content) {
      if (!this.isAssetCached(path)) {
        this.assets.push(path);
        this.setStorage(path, content);
        this.setStorage('assets', this.assets);
        return this.updateAssetsIndex();
      }
    };
    SCOW.prototype.loadAsset = function(path, callback) {
      if (callback == null) {
        callback = function() {};
      }
      return $.get(path, __bind(function(content) {
        this.loadAssetCallback(path, content);
        return callback(path, content);
      }, this));
    };
    SCOW.prototype.loadAssets = function(paths) {
      var path, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        _results.push(!this.isAssetCached(path) ? this.loadAsset(path) : void 0);
      }
      return _results;
    };
    SCOW.prototype.getAssets = function(selector, src) {
      var el, retArr, _i, _len, _ref;
      retArr = [];
      _ref = this.headEl.find(selector);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        retArr.push($(el).attr(src));
      }
      return retArr;
    };
    SCOW.prototype.encodeImageBase64 = function(img) {
      var canvas, context;
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      return canvas.toDataURL('image/jpg');
    };
    SCOW.prototype.loadImageCallback = function(imgEl) {
      var encoded;
      encoded = this.encodeImageBase64(imgEl.get(0));
      return this.loadAssetCallback(imgEl.attr('src'), encoded);
    };
    SCOW.prototype.loadImages = function() {
      var images, self;
      self = this;
      images = $('img', this.bodyEl);
      return images.each(function() {
        return $(new Image()).attr('src', $(this).attr('src')).load(function() {
          return self.loadImageCallback($(this));
        });
      });
    };
    SCOW.prototype.cacheCurrentFile = function() {
      var cacheObj, cssAssets, jsAssets;
      cssAssets = this.getAssets('link[rel="stylesheet"]', 'href');
      jsAssets = this.getAssets('script', 'src');
      cacheObj = {
        bodyHtml: this.bodyEl.html(),
        title: document.title,
        stylesheets: cssAssets,
        javascripts: jsAssets
      };
      this.loadAssetCallback(this.curFileName, cacheObj);
      this.loadAssets(cssAssets);
      this.loadAssets(jsAssets);
      return this.loadImages();
    };
    SCOW.prototype.restoreHeader = function(paths, wrapper) {
      var combined, content, path, _i, _len;
      combined = '';
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        content = this.getStorage(path);
        if (content !== null) {
          combined += content;
        }
      }
      return $(wrapper).text(combined).appendTo(this.headEl);
    };
    SCOW.prototype.restoreImages = function() {
      var images, self;
      self = this;
      images = $('img', this.bodyEl);
      return images.each(function() {
        var content, imgEl;
        imgEl = $(this);
        content = self.getStorage(imgEl.attr('src'));
        if (content !== null) {
          return imgEl.attr('src', content);
        }
      });
    };
    SCOW.prototype.restoreFromCache = function() {
      var cached;
      cached = this.getStorage(this.curFileName);
      if (cached !== null) {
        this.bodyEl.html(cached.bodyHtml);
        document.title = cached.title;
        this.restoreHeader(cached.stylesheets, '<style type="text/css"/>');
        this.restoreHeader(cached.javascripts, '<script type="text/javascript"/>');
        return this.restoreImages();
      }
    };
    return SCOW;
  })();
  jQuery(function() {
    return new SCOW;
  });
}).call(this);
