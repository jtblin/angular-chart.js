/// A very simple class for complex numbers

function Complex (x, y) {
  this.x = x;
  this.y = y;
  this.add= complex_add;
  this.mul= complex_mul;
  this.toString= complex_toString;
}
function complex_toString () {
  return this.x + (this.y > 0 ? " + " + this.y + "i" : this.y < 0 ? " - " + -this.y + "i" : "");
}
function complex_add (c) {
  return new Complex(this.x + c.x, this.y + c.y);
}
function complex_mul (c) {
  return new Complex(this.x * c.x - this.y * c.y, this.x + c.y + this.y * c.x);
}

/// A class to represent a degree 2 polynomial equation with real coefficients.

function Equation (a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.toString= equation_toString;
  this.solve= equation_solve;
}
function equation_toString () {
  return this.a + "x^2 + " + this.b + "x + " + this.c
}
function equation_solve () {
  var a = this.a, b = this.b, c = this.c
  var det = b * b - 4 * a * c;
  var sdet = Math.sqrt(Math.abs(det));
  var _2a = 2 * a;
  if (det >= 0) return [new Complex((-b - sdet) / _2a, 0), new Complex((-b + sdet) / _2a, 0)];
  else return [new Complex(-b / _2a, -sdet / _2a), new Complex(-b / _2a, sdet / _2a)];
}