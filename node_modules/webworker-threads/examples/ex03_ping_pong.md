## Sending events both ways between the main thread and a worker thread

This third example demonstrates how we can use events to communicate in both directions
between main thread and worker thread.

Like before, we create a worker thread and we define the fibonacci function:

``` javascript
var Threads = require('webworker-threads');
var t = Threads.create();

function fibo(n) {
	return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}
```

In the previous example we were running a loop that generates fibonacci numbers in the worker thread.  
This is fine if the generator produces the number at a slower rate than the main thread can consume them 
but it will hog memory if the main thread is too busy and cannot consume the data events fast enough.  
We can improve this by controlling the flow with events in both directions.

The `thread` global variable that **webworker-threads** predefines in every worker thread is also an `EventEmitter`.  
So we will use it to send events in the other direction, from the main thread to the worker thread.

Our modified generator does not use a loop any more. Instead, it generates numbers in response to `next` events
sent from the main thread. Here is the new generator:

``` javascript
function generateFibos() {
	var i = 1;
	thread.on('next', function() {
		thread.emit('data', i, fibo(i));
		i++;
	});
}
```

From the main thread, we listen for the `data` events emitted by the worker thread.  
Every time we get a `data` event from the worker thread, we print the result and we `emit` a 
`next` event into the worker thread (stopping at 40): 

``` javascript
t.on('data', function(n, result) {
	console.log('fibo(' + n + ') = ' + result);
	if (n < 40) t.emit('next');
	else console.log('bye!'), t.destroy();
});
```

We now have all we need for our little ping-pong game. We load the two functions into the thread:

``` javascript
t.eval(fibo);
t.eval(generateFibos);
```

We start the generator in the worker thread:

``` javascript
t.eval("generateFibos()");
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
