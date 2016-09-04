#!/usr/bin/env ruby

def pi(i)
  pi= 0
  num= 4.0
  den= 1
  plus= true

  while den < 5e7
    if plus
      pi+= num/den
      plus= false
    else
      pi-= num/den
      plus= true
    end
    den+= 2
  end
  puts "#{pi} -> #{i}"
end

threads=[]
count=ARGV.shift || 1
puts "Using #{count} threads"

t= Time.new
count.to_i.times do |i|
  threads << Thread.new{pi(i)}  
end

threads.each do |j|
  j.join
end

t= (Time.new- t)* 1e3
tps= Integer(count) * 1e3 / t
puts "\nTiempo total (ms) -> %.0f" % t
puts "Threads por segundo -> %.1f" % tps
puts "Total de threads ejecutadas -> #{count}"
