#!/usr/bin/env lsc
{ Worker } = (require './')
w = new Worker ->
  # This also works, but less elegant:
  # ``onmessage`` = (data: {max}) ->
  @onmessage = (data: {max}) ->
    :search for n from 2 to max
      for i from 2 to Math.sqrt n
        continue search unless n % i
      postMessage { result: n }
    throw \done
w.onmessage = (data: {result}) ->
  console.log "#result is a prime"
w.onerror = ({message}) ->
  console.log "Caught:", message
  <~ (setImmediate ? setTimeout _, 100ms)
  @terminate!
w.postMessage max: 100
