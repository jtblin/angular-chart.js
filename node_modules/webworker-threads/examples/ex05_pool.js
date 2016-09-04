/// !example
/// ## Using the thread pool
/// 
/// Our previous examples used a single worker thread, and thus only one processor core.
/// If we want to take full advantage of multi-core processors, we need the ability to delegate
/// expensive computations to a pool of theads. This example demonstrates the pool thread that comes
/// bundled with Worker.
/// 
/// First, we create a pool
var Threads = require('webworker-threads');
var pool = Threads.createPool(3);
/// 
/// Then we load our fibonacci function in all the pool's threads:
function fibo(n) {
	return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

pool.all.eval(fibo);
/// Now, we can get fibonacci numbers from our pool
/// 
/// We request them in reverse order, to show that longer computations (`fibo(40)`) run in 
/// parallel with shorter ones (`fibo(39)`, `fibo(38)`, ...). The results won't come out in strictly decreasing order.
var remain = 11;
for (var i = 40; i >= 30; i--) {
	// extra closure to get proper scoping on 'i'
	(function(i) {
		// dispatch each request to the first available thread
		pool.any.eval('fibo(' + i + ')', function(err, val) {
			console.log('fibo(' + i + ')=' + val);
			// destroy the pool when all results have been produced
			if (--remain == 0) console.log('bye!'), pool.destroy();
		});
	})(i);
}
/// ### Typical (*) Output
/// 
/// (*) Execution is non-deterministic. So order may vary.
/// 
/// ```
/// fibo(38)=38
/// fibo(39)=39
/// fibo(37)=37
/// fibo(35)=35
/// fibo(36)=36
/// fibo(33)=33
/// fibo(34)=34
/// fibo(31)=31
/// fibo(32)=32
/// fibo(30)=30
/// fibo(40)=40
/// bye!
/// ```