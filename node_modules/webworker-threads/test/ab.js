

var http= require('http');
http.globalAgent.maxSockets= 16384;

var options= {
  port: +process.argv[2] || 1200
};

var results= {
  requestsPerSecond: 0,
  "duration(ms)": 0,
  sent: 0,
  connected: 0,
  completed: 0,
  errors: 0,
  " QUICK": 1,
  " 14930352": 1
};


var dsp= "";
function display () {
  process.stdout.write(dsp);
  dsp= "";
}

//var displayInterval= setInterval(display, 333);

function run (i) {
  var now= Date.now();
  if (now < (t+ duration)) {
    if (results.sent <= (results.connected + results.errors)) {
      i= 200;
      while (i--) {
        anotherOne();
      }
    }
    setTimeout(run, 100);
  }
  else {
    results["duration(ms)"]= now- t;
    results.requestsPerSecond= (results.completed*1e3/(now-t)).toFixed(1);
    //clearInterval(displayInterval);
    display();
    console.log("\n", results);
    process.exit();
  }
  
}

function anotherOne () {
  results.sent++;
  http.get(options, onConnect).on('error', onERR);
}

function onConnect (res) {
  anotherOne();
  res.on('data', onData);
  results.connected++;
  dsp+= ".";
}

function onData (txt) {
  results[txt]++;
  results.completed++;
}

function onERR (err) {
  results.errors++;
  dsp+= "❚";
  console.log(err);
}



var t;
var duration= 1000;
(function wait () {
  var exec= require('child_process').exec;
  exec('netstat -f inet | grep -c TIME_WAIT', function (err, o, e) {
    o= Math.floor(o+ e);
    console.log("Sockets in TIME_WAIT: "+ o);
    if (o) {
      setTimeout(wait, 1500);
    }
    else {
      console.log("GO!");
      t= Date.now();
      run();
    }
  });
})();



