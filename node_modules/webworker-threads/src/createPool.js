function createPool(n){
  var T, pool, idleThreads, q, poolObject, e;
  T = this;
  n = Math.floor(n);
  if (!(n > 0)) {
    throw '.createPool( num ): number of threads must be a Number > 0';
  }
  pool = [];
  idleThreads = [];
  q = {
    first: null,
    last: null,
    length: 0
  };
  poolObject = {
    on: onEvent,
    load: poolLoad,
    destroy: destroy,
    pendingJobs: getPendingJobs,
    idleThreads: getIdleThreads,
    totalThreads: getNumThreads,
    any: {
      eval: evalAny,
      emit: emitAny
    },
    all: {
      eval: evalAll,
      emit: emitAll
    }
  };
  try {
    while (n--) {
      pool[n] = idleThreads[n] = T.create();
    }
  } catch (e$) {
    e = e$;
    destroy('rudely');
    throw e;
  }
  return poolObject;
  function poolLoad(path, cb){
    var i;
    i = pool.length;
    while (i--) {
      pool[i].load(path, cb);
    }
  }
  function nextJob(t){
    var job;
    job = qPull();
    if (job) {
      if (job.type === 1) {
        t.eval(job.srcTextOrEventType, function(e, d){
          var f;
          nextJob(t);
          f = job.cbOrData;
          if (typeof f === 'function') {
            return f.call(t, e, d);
          } else {
            return t.emit(job.srcTextOrEventType, f);
          }
        });
      } else if (job.type === 2) {
        t.emit(job.srcTextOrEventType, job.cbOrData);
        nextJob(t);
      }
    } else {
      idleThreads.push(t);
    }
  }
  function qPush(srcTextOrEventType, cbOrData, type){
    var job;
    job = {
      srcTextOrEventType: srcTextOrEventType,
      cbOrData: cbOrData,
      type: type,
      next: null
    };
    if (q.last) {
      q.last = q.last.next = job;
    } else {
      q.first = q.last = job;
    }
    q.length++;
  }
  function qPull(){
    var job;
    job = q.first;
    if (job) {
      if (q.last === job) {
        q.first = q.last = null;
      } else {
        q.first = job.next;
      }
      q.length--;
    }
    return job;
  }
  function evalAny(src, cb){
    qPush(src, cb, 1);
    if (idleThreads.length) {
      nextJob(idleThreads.pop());
    }
    return poolObject;
  }
  function evalAll(src, cb){
    pool.forEach(function(v, i, o){
      return v.eval(src, cb);
    });
    return poolObject;
  }
  function emitAny(event, data){
    qPush(event, data, 2);
    if (idleThreads.length) {
      nextJob(idleThreads.pop());
    }
    return poolObject;
  }
  function emitAll(event, data){
    pool.forEach(function(v, i, o){
      return v.emit(event, data);
    });
    return poolObject;
  }
  function onEvent(event, cb){
    pool.forEach(function(v, i, o){
      return v.on(event, cb);
    });
    return this;
  }
  function destroy(rudely){
    var err, beNice, beRude;
    err = function(){
      throw 'This thread pool has been destroyed';
    };
    beNice = function(){
      if (q.length) {
        return setTimeout(beNice, 666);
      } else {
        return beRude();
      }
    };
    beRude = function(){
      q.length = 0;
      q.first = null;
      pool.forEach(function(v, i, o){
        return v.destroy();
      });
      return poolObject.eval = poolObject.totalThreads = poolObject.idleThreads = poolObject.pendingJobs = poolObject.destroy = err;
    };
    if (rudely) {
      beRude();
    } else {
      beNice();
    }
  }
  function getNumThreads(){
    return pool.length;
  }
  function getIdleThreads(){
    return idleThreads.length;
  }
  function getPendingJobs(){
    return q.length;
  }
  return getPendingJobs;
}
