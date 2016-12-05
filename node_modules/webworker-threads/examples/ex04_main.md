## Loading the worker code from a file (main side)

When writing code for threads we have both code that executes in the main thread and code that 
executes in worker threads. When the code is small, it may be handy to have all code in a single file
but it is often clearer to split the code apart when the worker code starts to grow.

This example demonstrates how we can package the worker code in a separeate file and
load it with `t.load`.

We are going to keep the same logic as in our previous 'ping pong' example, but just repackage
it slightly differently.

In this file we keep only the ping (main) side:

``` javascript
// Creating the worker thread
var Threads = require('webworker-threads');
var t = Threads.create();

// Listening to 'data' events from the worker thread
t.on('data', function(n, result) {
	console.log('fibo(' + n + ') = ' + result);
	if (n < 40) t.emit('next');
	else console.log('bye!'), t.destroy();
});
```

At this point we load the worker code:

``` javascript
t.load(__dirname + '/ex04_worker.js');
```

And we start the game by emitting the first `next` event:

``` javascript
t.emit('next');
```

### Output

```
fibo(1) = 1
fibo(2) = 2
fibo(3) = 3
fibo(4) = 5
...
fibo(39) = 102334155
fibo(40) = 165580141
bye!
```
