function DispatchEvents(thread){
  thread = (this.on = function(e, f, q){
    if (q = thread._on[e]) {
      q.push(f);
    } else {
      thread._on[e] = [f];
    }
    return thread;
  }, this.once = function(e, f, q){
    !(q = thread._on[e]) && (q = thread._on[e] = []);
    if (q.once) {
      q.once.push(f);
    } else {
      q.once = [f];
    }
    return thread;
  }, this.removeAllListeners = function(e){
    if (arguments_.length) {
      delete thread._on[e];
    } else {
      thread._on = {};
    }
    return thread;
  }, this.dispatchEvents = function(event, args, q, i, len){
    var e, results$ = [];
    if (q = thread._on[event]) {
      try {
        i = 0;
        len = q.length;
        while (i < len) {
          q[i++].apply(thread, args);
        }
        if (q = q.once) {
          q.once = undefined;
          i = 0;
          len = q.length;
          while (i < len) {
            results$.push(q[i++].apply(thread, args));
          }
          return results$;
        }
      } catch (e$) {
        e = e$;
        return __postError({
          message: e,
          filename: '',
          lineno: 0
        });
      }
    }
  }, this._on = {}, this);
  return this.dispatchEvents;
}
