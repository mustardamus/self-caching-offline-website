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
    SCOW.prototype.loadAsset = function(path) {
      return $.get(path, __bind(function(content) {
        return this.loadAssetCallback(path, content);
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
      return this.loadAssets(jsAssets);
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
    SCOW.prototype.restoreFromCache = function() {
      var cached;
      cached = this.getStorage(this.curFileName);
      if (cached !== null) {
        this.bodyEl.html(cached.bodyHtml);
        document.title = cached.title;
        this.restoreHeader(cached.stylesheets, '<style type="text/css"/>');
        return this.restoreHeader(cached.javascripts, '<script type="text/javascript"/>');
      }
    };
    return SCOW;
  })();
  jQuery(function() {
    return new SCOW;
  });
}).call(this);
