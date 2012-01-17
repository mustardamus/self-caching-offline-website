class SCOW
  constructor: ->
    @headEl      = $ 'head'                 #snapshot of the head element
    @bodyEl      = $ 'body'                 #snapshot of the body element
    @curFileName = @getFileName()           #get the requested path
    @assets      = @getStorage('assets')    #initialize assets index
    
    if @assets is null                      #if there is no assets index yet
      @assets = ['js/jquery.js', 'js/scow.js'] #create it, these two assets are cached by appcache
      @setStorage 'assets', @assets         #and store it
      
    applicationCache.addEventListener 'updateready', -> #if the manifest files are newly cached
      localStorage.clear()                  #clear also local store
    
    if navigator.onLine                     #check if there is a internet connection
      @cacheCurrentFile()                   #if so cache the current file
    else
      @restoreFromCache()                   #try to restore the requested file from cache
      
    if location.host.indexOf('localhost') isnt -1 #check if we are in dev mode
      $('#new-cache').show()                #if so show the link to trigger a new cache via /new_cache 
    
    @updateAssetsIndex()                    #output the current asset index
  
  getFileName: ->
    path     = location.pathname.split('/') #get current pathname and split it by /
    filename = path[path.length - 1]        #last part in array is filename
    
    if filename.length is 0                 #check if the root path / is requested
      filename = 'index.html'               #fallback to index.html

    filename                                #return filename
                                                                                               
  getStorage: (name) ->                     #helper function to read/decode JSON from local storage
    item = localStorage.getItem(name)       #try to read from local storage                        
                                                                                               
    if item isnt null                       #item was found in storage                             
      item = JSON.parse(item)               #json encoded object                                   
                                                                                               
    item                                    #return the object or null if not found                
                                                                                               
  setStorage: (name, value) ->              #helper function to write/encode JSON to local storage 
    item = JSON.stringify(value)            #create json string                                    
                                                                                               
    localStorage.setItem name, item         #write json string to local storage                    
  
  updateAssetsIndex: ->                     #output cached files in a list for the demo
    listEl = $ '#cached-files'              #we dont cache this list element globally because it could change in $body
    
    listEl.children().remove()              #remove all previously added list items
    for asset in @assets                    #for every path in the assets index
      listEl.append "<li>#{asset}</li>"     #append a list item containing the path
      
  isAssetCached: (path) ->                  #check if a asset is already cached - in the assets index
    $.inArray(path, @assets) isnt -1        #return true if already cached otherwise false
                                                                                               
  loadAssetCallback: (path, content) ->     #is called when a file is fully loaded
    unless @isAssetCached(path)             #check if asset already cached
      @assets.push path                     #add path to assets index
      @setStorage path, content             #cache the file with the path as key
      @setStorage 'assets', @assets         #store the new assets index array
      @updateAssetsIndex()                  #update the demo list of the assets index
  
  loadAsset: (path) ->                      #load a asset with $.get    
    $.get path, (content) =>                #get the file content
      @loadAssetCallback path, content      #content loaded, invoke the callback
  
  loadAssets: (paths) ->                    #cache either css or scripts
    for path in paths                       #go through all paths
      unless @isAssetCached(path)           #check if asset already cached
        @loadAsset path                     #start loading the asset
    
  getAssets: (selector, src) ->             #extract the assets from the header and return array
    retArr = []                             #array to return
    
    for el in @headEl.find(selector)        #all elements matching the selector
      retArr.push $(el).attr(src)           #read the attribute containing the source path and store it in array
      
    retArr                                  #return a array of the file paths
    
  cacheCurrentFile: ->                      #cache the requested .html file
    cssAssets = @getAssets('link[rel="stylesheet"]', 'href') #get array of stylesheets
    jsAssets  = @getAssets('script', 'src') #get array of javascripts
    cacheObj  =                             #this will hold the cached page and all assets references
      bodyHtml   : @bodyEl.html()           #cache the content of the current file
      title      : document.title           #cache the title
      stylesheets: cssAssets                #array with all stlesheets
      javascripts: jsAssets                 #array with all javascripts
    
    @loadAssetCallback(@curFileName, cacheObj) #manually invoke the callback and save the object
    @loadAssets cssAssets                   #begin to load all the css assets
    @loadAssets jsAssets                    #same with the javascripts

  restoreHeader: (paths, wrapper) ->        #reassemble and include the cached files
    combined  = ''                          #include all in one string
      
    for path in paths                       #go through all cached assets
      content = @getStorage(path)           #try to get the content from local storage
      
      if content isnt null                  #check if the requested file is cached
        combined += content                 #add the cached content

    $(wrapper)                              #create a jquery object from the wrapper markup
      .text(combined)                       #set the content
      .appendTo @headEl                     #and append it to the head
  
  restoreFromCache: ->                      #restore requested file and assets from cache
    cached = @getStorage(@curFileName)      #get the cached object with body, title and assets refs
    
    if cached isnt null                     #check if the file is cached
      @bodyEl.html     cached.bodyHtml      #restore body with original dom
      document.title = cached.title         #restore original title
      
      #restore all stylesheets via including them into the header
      @restoreHeader cached.stylesheets, '<style type="text/css"/>'
      
      #restore all javascripts
      @restoreHeader cached.javascripts, '<script type="text/javascript"/>'

jQuery -> (new SCOW)                        #initially create the class when the DOM is ready