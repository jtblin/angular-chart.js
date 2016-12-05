var onmessage, this$ = this;
function addEventListener(event, cb){
  return this.thread.on(event, cb);
}
function close(){
  return this.thread.emit('close');
}
function importScripts(){
  var i$, len$, p, results$ = [];
  for (i$ = 0, len$ = arguments.length; i$ < len$; ++i$) {
    p = arguments[i$];
    results$.push(self.eval(native_fs_.readFileSync(p, 'utf8')));
  }
  return results$;
}
onmessage = null;
thread.on('message', function(args){
  return typeof onmessage === 'function' ? onmessage(args) : void 8;
});
