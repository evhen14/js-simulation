var settings = {
    W: 1800,
    H: 1000
};
var max_val = 10000000000;
function Ball(rx, ry, vx, vy, radius, color, mass) {
    this.rx = rx;
    this.ry = ry;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.mass = mass || 1;
    this.count = -1;
    this.radius = radius;
};
Ball.prototype.draw = function(canvas) {
        canvas.beginPath();
        canvas.arc(this.rx, this.ry, this.radius, 0, Math.PI * 2, false);
        canvas.fillStyle = this.color;
        canvas.fill()
        canvas.closePath();
    };
Ball.prototype.move = function(time) {
    this.rx += this.vx * time;
    this.ry += this.vy * time;
};
Ball.prototype.timeToCollision = function(b) {
    var a = this;
    if (a == b) return max_val;
    var dx = b.rx - a.rx;
    var dy = b.ry - a.ry;
    var dvx = b.vx - a.vx;
    var dvy = b.vy - a.vy;
    var dvdr = dx * dvx + dy * dvy;
    if (dvdr > 0) return max_val;
    var dvdv = dvx * dvx + dvy * dvy;
    var drdr = dx * dx + dy * dy;
    var sigma = a.radius + b.radius;
    var d = (dvdr * dvdr) - dvdv * (drdr - sigma * sigma);
    // if (drdr < sigma*sigma) StdOut.println("overlapping particles");
    if (d < 0) return max_val;
    return -(dvdr + Math.sqrt(d)) / dvdv;
};
Ball.prototype.bounceOff = function(that) {
    var dx = that.rx - this.rx;
    var dy = that.ry - this.ry;
    var dvx = that.vx - this.vx;
    var dvy = that.vy - this.vy;
    var dvdr = dx * dvx + dy * dvy;             // dv dot dr
    var dist = this.radius + that.radius;   // distance between particle centers at collison

    // normal force F, and in x and y directions
    var F = 2 * this.mass * that.mass * dvdr / ((this.mass + that.mass) * dist);
    var fx = F * dx / dist;
    var fy = F * dy / dist;

    // update velocities according to normal force
    this.vx += fx / this.mass;
    this.vy += fy / this.mass;
    that.vx -= fx / that.mass;
    that.vy -= fy / that.mass;

    // update collision counts
    this.count++;
    that.count++;
};
Ball.prototype.bounceOfVerticalWall = function() {
    this.vx = -this.vx;
    this.count++;
};
Ball.prototype.bounceOfHorizontalWall = function() {
    this.vy = -this.vy;
    this.count++;
};
Ball.prototype.timeToHitVerticalWall = function() {
    if (this.vx > 0)      return (settings.W - this.rx - this.radius) / this.vx;
    else if (this.vx < 0) return (this.radius - this.rx) / this.vx;
    else                  return max_val;
};
Ball.prototype.timeToHitHorizontalWall = function() {
    if (this.vy > 0)      return (settings.H - this.ry - this.radius) / this.vy;
    else if (this.vy < 0) return (this.radius - this.ry) / this.vy;
    else                  return max_val;
};

