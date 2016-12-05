/// !example
/// ## Passing complex objects to threads
/// 
/// In the previous examples, we have been using threads with very simple functions and 
/// we have been passing very simple values (integers) between threads.
/// 
/// This example shows how we can pass more complex data between threads.
/// 
/// It is important to understand that objects cannot be shared across threads. 
/// This does not prevent us from passing complex objects but we have to serialize them
/// and pass them as strings. 
/// 
/// If the objects are really simple, we can use JSON serialization but if they contain 
/// information that JSON discards, like methods, we should use the JASON serializer
/// published on https://github.com/xk/JASON
/// 
/// In this example, we are going to use a thread to do computation with complex numbers.
/// We use the Complex and Equation classes defined in the ex06_complex.js file.
var Equation = require("./ex06_complex").Equation;
/// As usual, we create a thread
var t = require('webworker-threads').create();
/// We require the JASON serializer
var JASON = require("JASON");
/// We load the JASON serializer and the solve function in our thread:
t.eval("JASON= "+ JASON.stringify(JASON));
t.load(__dirname + "/ex06_complex.js");
/// Now we can pass a request to solve an equation to our thread.  
/// The expression is wrapped into a `JASON.stringify` call because we want the thread
/// to stringify the solution object before returning it to the main thread
/// The main thread calls `JASON.parse` to _de-stringify_ the solution. 
t.eval("JASON.stringify(new Equation(1, -4, 29).solve())", function(err, result) {
	if (err) throw err;
	var r = JASON.parse(result).join(', ');
	console.log("\nsolution is:\n[" + r+ "]\n");
	t.destroy();
});
/// ### Typical Output
/// 
/// ```
/// solution is:
/// [2 - 5i, 2 + 5i]
/// ```