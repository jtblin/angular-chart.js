function Worker () => Threads = this; class
    (code) ->
        @thread = t = Threads.create!
        t.on \message (args) ~> @onmessage? data: args
        t.on \error (args) ~> @onerror? args
        t.on \close -> t.destroy!
        @terminate = -> t.destroy!
        @add-event-listener = (event, cb) ~>
            if event is \message
                @onmessage = cb
            else
                t.on event, cb
        @dispatch-event = (event) -> t.emitSerialized event.type, event
        @post-message = (data) -> t.emitSerialized \message {data}
        if typeof code is \function
            t.eval "(#code)()"
        else if code?
            t.load code
