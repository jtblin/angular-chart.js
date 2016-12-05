## Running a simple function in a thread

This first example demonstrates how you can run an expensive computation in
a worker thread and obtain its result.

First, we define the function that we want to execute in the worker thread:

``` javascript
function fibo(n) {
	return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}
```

Then, we create a worker thread with the `Threads.create` call:

``` javascript
var Threads = require('webworker-threads');
var t = Threads.create();
```

In the next step, we load the function into the worker thead.
We get the function's source with `fibo.toString()` and we 
call `t.eval(source)` to evalutate it into the worker thread's context:

``` javascript
t.eval(fibo);
```

Now, we are ready to call this function.
We use the `t.eval` function again, with two arguments this time.  
The first argument is the expression to evaluate.  
The second one is a callback that receives the result (or an error if there was one).

``` javascript
t.eval('fibo(10)', function(err, result) {
	if (err) throw err; // something abnormal
	// print the result
	console.log('fibo(10)=' + result);
	// chain with next step
	step2();
});
```

Let's call it again:

``` javascript
function step2() {
	t.eval('fibo(20)', function(err, result) {
		if (err) throw err;
		console.log('fibo(20)=' + result);
		step3();
	});
}
```

If the expression is invalid, we get an error through the callback

``` javascript
function step3() {
	// 'x' is not defined
	t.eval('fibo(x)', function(err, result) {
		console.log('error=' + err);
		step4();
	});
}
```

But the thread is still alive and ready to accept more calls:

``` javascript
function step4() {
	t.eval('fibo(15)', function(err, result) {
		console.log('fibo(15)=' + result);
		step5();
	});
}
```

Once we are done, we destroy the thread:

``` javascript
function step5() {
	t.destroy();
}
```

### Output

```
fibo(10)=89
fibo(20)=10946
error=Error: ReferenceError: x is not defined
fibo(15)=987
```
