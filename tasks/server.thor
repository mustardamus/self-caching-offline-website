class Server < Thor
  desc 'start', 'start the sinatra development server'
  def start
    exec "ruby -rubygems ./server/start.rb"
  end
end