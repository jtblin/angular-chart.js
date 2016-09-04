function Worker(){
  var Threads;
  Threads = this;
  return (function(){
    var prototype = constructor.prototype;
    function constructor(code){
      var t, this$ = this;
      this.thread = t = Threads.create();
      t.on('message', function(args){
        return typeof this$.onmessage === 'function' ? this$.onmessage({
          data: args
        }) : void 8;
      });
      t.on('error', function(args){
        return typeof this$.onerror === 'function' ? this$.onerror(args) : void 8;
      });
      t.on('close', function(){
        return t.destroy();
      });
      this.terminate = function(){
        return t.destroy();
      };
      this.addEventListener = function(event, cb){
        if (event === 'message') {
          return this$.onmessage = cb;
        } else {
          return t.on(event, cb);
        }
      };
      this.dispatchEvent = function(event){
        return t.emitSerialized(event.type, event);
      };
      this.postMessage = function(data){
        return t.emitSerialized('message', {
          data: data
        });
      };
      if (typeof code === 'function') {
        t.eval("(" + code + ")()");
      } else if (code != null) {
        t.load(code);
      }
    }
    return constructor;
  }());
}
