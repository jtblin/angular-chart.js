function add-event-listener (event, cb)
    @thread.on event, cb
function close ()
    @thread.emit \close
function importScripts ()
    for p in arguments
        self.eval native_fs_.readFileSync(p, \utf8)
onmessage = null
thread.on \message (args) ~> onmessage? args
