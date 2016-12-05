#!/usr/bin/env lsc
# Same as multiThreadEvented.ls, but with 5 workers

{ Worker } = require \webworker-threads

for til 5 => (new Worker ->
    fibo = (n) -> if n > 1 then fibo(n - 1) + fibo(n - 2) else 1
    @onmessage = ({ data }) -> postMessage fibo data
)
    ..onmessage = ({ data }) ->
        console.log "[#{ @thread.id }] #data"
        @postMessage Math.ceil Math.random! * 30
    ..postMessage Math.ceil Math.random! * 30

do spin = -> setImmediate spin
