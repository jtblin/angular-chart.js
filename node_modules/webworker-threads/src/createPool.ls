function create-pool (n)
    T = this
    n = Math.floor n
    throw '.createPool( num ): number of threads must be a Number > 0' unless n > 0

    pool         = []
    idle-threads = []
    q            = { first: null, last: null, length: 0 }
    pool-object  = {
        on: on-event
        load: pool-load
        destroy: destroy
        pending-jobs: get-pending-jobs
        idle-threads: get-idle-threads
        total-threads: get-num-threads
        any: { eval: eval-any, emit: emit-any }
        all: { eval: eval-all, emit: emit-all }
    }

    try
        while n-- => pool[n] = idle-threads[n] = T.create!
    catch e
        destroy \rudely
        throw e

    return pool-object

    ### Helper Functions Start Here ###

    function pool-load (path, cb)
        i = pool.length
        while i--
            pool[i].load path, cb
        return

    function next-job (t)
        job = q-pull!
        if job
            if job.type is 1 # RUN
                t.eval job.src-text-or-event-type, (e, d) ->
                    next-job t
                    f = job.cb-or-data
                    if typeof f is \function
                      f.call t, e, d
                    else
                      t.emit job.src-text-or-event-type, f
            else if job.type is 2 # EMIT
                    t.emit job.src-text-or-event-type, job.cb-or-data
                    next-job t
        else
            idle-threads.push t
        return

    function q-push (src-text-or-event-type, cb-or-data, type)
        job = { src-text-or-event-type, cb-or-data, type, next: null }
        if q.last
            q.last = q.last.next = job
        else
            q.first = q.last = job
        q.length++
        return

    function q-pull
        job = q.first
        if job
            if q.last is job then q.first = q.last = null else q.first = job.next
            q.length--
        return job

    function eval-any (src, cb)
        q-push src, cb, 1 # RUN
        next-job idle-threads.pop! if idle-threads.length
        return pool-object

    function eval-all (src, cb)
        pool.for-each (v, i, o) -> v.eval src, cb
        return pool-object

    function emit-any (event, data)
        q-push event, data, 2 # EMIT
        next-job idle-threads.pop! if idle-threads.length
        return pool-object

    function emit-all (event, data)
        pool.for-each (v, i, o) -> v.emit event, data
        return pool-object

    function on-event (event, cb)
        pool.for-each (v, i, o) -> v.on event, cb
        return this

    function destroy (rudely)
        err = -> throw 'This thread pool has been destroyed'
        be-nice = -> if q.length then setTimeout be-nice, 666 else be-rude!
        be-rude = ->
            q.length = 0
            q.first = null
            pool.for-each (v, i, o) -> v.destroy!
            pool-object.eval = pool-object.total-threads = pool-object.idle-threads =
                pool-object.pendingJobs = pool-object.destroy = err
        if rudely then be-rude! else be-nice!
        return

    function get-num-threads  => pool.length
    function get-idle-threads => idle-threads.length
    function get-pending-jobs => q.length
