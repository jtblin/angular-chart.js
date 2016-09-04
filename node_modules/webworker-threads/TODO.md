* Worker API
    * `setTimeout` / `clearTimeout` / `setInterval` / `clearInterval`
        Forwarding to the default implementation (in NativeModule TimerWrap).

      Alternately, we can integrate this with our own `tick` function:

        http://code.google.com/p/v8-juice/source/browse/branches/edge/src/client/shell/js/MockTimer.js
        (derived from https://github.com/esbie/js-mock-timers)

    * `onerror` handler
        Catch runtime errors; also addEventListener 'error'.
    * `dispatchEvent`?
