/*global document, window, alert, console, require, Ball, MaxHeap*/
(function () { 'use strict'; }());
var Simulation = (function () {
    var W = 1800, H = 1000;
    var Event = function (time, ball1, ball2) {
        this.time = time;
        this.ball1 = ball1;
        this.ball2 = ball2;
        this.count1 = ball1 ? this.ball1.count : -1;
        this.count2 = ball2 ? this.ball2.count : -1;

    };

    Event.prototype.getValue = function () {
        return this.time;
    };

    Event.prototype.isValid = function () {
        if (this.ball1 !== null && this.ball1.count !== this.count1) { return false; }
        if (this.ball2 !== null && this.ball2.count !== this.count2) { return false; }
        return true;
    };

    var Simulation = function (balls, settings) {
        this.balls = balls;
        this.clockTime = 0;
        this.priorityQueue = new MaxHeap();

        this.predict = function (ball, limit) {
            if (!ball) { return; }
            var i, len, deltaTime, dtX, dtY;
            for (i = 0, len = this.balls.length; i < len; i += 1) {
                deltaTime = ball.timeToCollision(this.balls[i]);
                if (deltaTime + this.clockTime < limit) {
                    this.priorityQueue.insert(new Event(deltaTime + this.clockTime, ball, this.balls[i]));
                }
                dtX = ball.timeToHitVerticalWall(settings.W);
                dtY = ball.timeToHitHorizontalWall(settings.H);

                if (this.clockTime + dtX <= limit) {
                    this.priorityQueue.insert(new Event(this.clockTime + dtX, ball, null));
                }
                if (this.clockTime + dtY <= limit) {
                    this.priorityQueue.insert(new Event(this.clockTime + dtY, null, ball));
                }
            }
        };
        this.redraw = function (limit) {
            settings.ctx.clearRect(0, 0, W, H);
            var i, len;
            for (i = 0, len = this.balls.length; i < len; i += 1) {
                this.balls[i].draw(settings.ctx, settings.image);
            }
            if (this.clockTime < limit) {
                this.priorityQueue.insert(new Event(this.clockTime + 1.0 / 0.5, null, null));
            }
        };
        this.simulate = function (limit) {
            var i, len;
            for (i = 0, len = this.balls.length; i < len; i += 1) {
                this.predict(this.balls[i], limit);
            }
            this.priorityQueue.insert(new Event(20, null, null));        // redraw event

            this.redraw(limit);

            var that = this;
            var cycle = function () {
                if (that.priorityQueue.size() <= 0) { return; }

                // get impending event, discard if invalidated
                // update the priority queue with new collisions involving a or b
                var event = that.priorityQueue.delMax();

                if (!event.isValid()) {
                    cycle();
                    return;
                }
                var ball1 = event.ball1;
                var ball2 = event.ball2;

                // physical collision, so update positions, and then simulation clock
                for (i = 0, len = that.balls.length; i < len; i += 1) {
                    that.balls[i].move(event.time - that.clockTime);
                }
                that.clockTime = event.time;

                // process event
                if (ball1 === null && ball2 === null) {
                    that.redraw(limit);
                    that.predict(ball1, limit);
                    that.predict(ball2, limit);
                    setTimeout(cycle, 10);
                } else {
                    if (ball1 && ball2) {
                        ball1.bounceOff(ball2);
                    } else if (ball1 && !ball2) {
                        ball1.bounceOfVerticalWall();
                    } else if (!ball1 && ball2) {
                        ball2.bounceOfHorizontalWall();
                    }
                    that.predict(ball1, limit);
                    that.predict(ball2, limit);
                    cycle();
                }

            };
            cycle();
        };
    };

    return Simulation;

}());

(function () {
    var settings = {
        W: 1800,
        H: 1000
    };

    var W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 4;
    var canvas = document.getElementById("canvas");
    settings.W = canvas.width = W;
    settings.H = canvas.height = H;
    var ctx = canvas.getContext("2d");
    settings.ctx = ctx;
    var color = '#4A93B8';
    var balls = [];
    var i, rx, ry, vx, vy, radius;
    for (i = 0; i < 50; i += 1) {
        rx = Math.random() * W;
        ry = Math.random() * H;
        vx = Math.random() * 2 * (Math.random() < 0.5 ? -1 : 1);
        vy = Math.random() * 2 * (Math.random() < 0.5 ? -1 : 1);
        radius = Math.random() * 20 + 10;
        balls.push(new Ball(rx, ry, vx, vy, radius, color, radius));
    }

    window.onresize = function () {
        W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 4;
        settings.H = H;
        settings.W = W;
        canvas.width = W;
        canvas.height = H;
    };

    window.onload = function () {
        settings.image = document.getElementById("test-image");
        var simulation = new Simulation(balls, settings);
        simulation.simulate(10000);
    };
}());