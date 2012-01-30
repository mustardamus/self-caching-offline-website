require 'sinatra'

configure do
  mime_type :appcache , 'text/cache-manifest'           #content_type for the cache manifest
  set       :port     , 10042                           #to fully reset the last cache change port
  set       :timestamp, nil                             #hold the current cache time
end

def set_new_timestamp
  #http://blog.10to1.be/rails/2009/06/10/generate-timestamp-in-ruby/#disqus_thread
  settings.timestamp = Time.now.utc.iso8601.gsub(/\W/, '')
end

def read_file(filepath)
  if File.exist?(filepath)                              #check if file exist
    File.open(filepath).read                            #return file content
  else
    404                                                 #return a 404 code
  end
end

def serve_file(filename, content_type, in_sub_path = false)
  path     = in_sub_path ? content_type : ''            #serve file from a subpath
  filepath = "./#{path}/#{filename}.#{content_type}"    #full path to file
  
  content_type content_type                             #set proper content_type
  read_file filepath                                    #return file content
end

set_new_timestamp                                       #initially set timestamp

get '/' do                                              #serve index.html on root request
  serve_file 'index', 'html'
end

get '/*.html' do                                        #serve html pages in root dir
  serve_file params[:splat], 'html'
end

get '/css/*.css' do                                     #serve stylesheets
  serve_file params[:splat], 'css', true
end

get '/js/*.js' do                                       #serve javascripts
  serve_file params[:splat], 'js', true
end

get '/images/*.jpg' do                                  #serve jpg's
  content_type :jpg
  read_file "./images/#{params[:splat]}.jpg"
end

get '/offline.appcache' do                              #serve manifest
  content = read_file 'offline.appcache'                #read manifest content
  
  content_type :appcache                                #set proper content_type
  "#{content}\n\n##{settings.timestamp}"                #return current timestamp and content
end

get '/new_cache' do                                     #reset the manifest cache
  set_new_timestamp                                     #generate new timestamp
  redirect '/'                                          #browse back to root and use new manifest
end