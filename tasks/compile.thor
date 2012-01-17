class Compile < Thor
  desc 'js [--watch]', 'compiles coffee/*.coffee to js/*.js'
  method_options :watch => :boolean
  def js
    exec "coffee #{'--watch' if options[:watch]} --output ./js/ --compile ./coffee/"
  end
end