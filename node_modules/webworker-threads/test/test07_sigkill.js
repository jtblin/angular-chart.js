

var Thread= require('../');


function cb (e,m) {
  this.ctr= this.ctr ? this.ctr+1 : 1;
  console.log('['+ this.id+ '] -> '+ this.ctr);
  if (this.ctr >= 9) this.destroy();
  else this.eval('0', cb);
}


var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

while (i--) {
  Thread.create().eval('0', cb);
}


process.on('exit', function () {
  console.log("process.on('exit') -> BYE!");
});
