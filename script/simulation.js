(function(){
    var W = 1800, H = 1000;
    var Event = function(time, ball1, ball2) {
        this.time = time;
        this.ball1 = ball1;
        this.ball2 = ball2;
        this.count1 = ball1 ? this.ball1.count : -1;
        this.count2 = ball2 ? this.ball2.count : -1;

    };

    Event.prototype.getValue = function() {
        return this.time;
    };

    Event.prototype.isValid = function() {
        if (this.ball1 != null && this.ball1.count != this.count1) return false;
        if (this.ball2 != null && this.ball2.count != this.count2) return false;
        return true;
    };

    var Simulation = function(balls, canvas) {
        this.balls = balls;
        this.clockTime = 0;
        this.priorityQueue = new MaxHeap();
        this.canvas = canvas;

        this.predict = function(ball, limit) {
            if (!ball) return;
            for (var i = 0, len = this.balls.length; i < len; ++i) {
                var deltaTime = ball.timeToCollision(this.balls[i]);
                if (deltaTime + this.clockTime < limit) {
                    this.priorityQueue.insert(new Event(deltaTime + this.clockTime, ball, this.balls[i]));
                }
                var dtX = ball.timeToHitVerticalWall();
                var dtY = ball.timeToHitHorizontalWall();

                if (this.clockTime + dtX <= limit) {
                    this.priorityQueue.insert(new Event(this.clockTime + dtX, ball, undefined));
                }
                if (this.clockTime + dtY <= limit) {
                    this.priorityQueue.insert(new Event(this.clockTime + dtY, undefined, ball));
                }
            }
        };
        this.redraw = function(limit){
            ctx.clearRect(0, 0, W, H);
            for (var i = 0, len = this.balls.length; i < len; i++) {
                this.balls[i].draw(this.canvas);
            }
            if (this.clockTime < limit) {
                this.priorityQueue.insert(new Event(this.clockTime + 1.0 / 0.5, undefined, undefined));
            }
        };
        this.simulate = function(limit) {
            for (var i = 0, len = this.balls.length; i < len; i++) {
                this.predict(this.balls[i], limit);
            }
            this.priorityQueue.insert(new Event(20, undefined, undefined));        // redraw event

            this.redraw(limit);

            var that = this;
            var cycle = function() {
                if (that.priorityQueue.size() <= 0)
                    return;

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
                for (var i = 0, len = that.balls.length; i < len; i++)
                    that.balls[i].move(event.time - that.clockTime);
                that.clockTime = event.time;

                // process event
                if (ball1 == null && ball2 == null) {
                    that.redraw(limit);
                    that.predict(ball1, limit);
                    that.predict(ball2, limit);
                    setTimeout(cycle, 10);
                }
                else {
                    if      (ball1 && ball2) ball1.bounceOff(ball2);              // particle-particle collision
                    else if (ball1 && !ball2) ball1.bounceOfVerticalWall();   // particle-wall collision
                    else if (!ball1 && ball2) ball2.bounceOfHorizontalWall(); // particle-wall collision
                    that.predict(ball1, limit);
                    that.predict(ball2, limit);
                    cycle();
                }

            };
            cycle();
        };
    };

    var W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 4;
    settings.H = H;
    settings.W = W;
    var canvas = document.getElementById("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    var color = 'red';
    var balls = [];
    for (var i = 0; i < 100; ++i) {
        var rx, ry, vx, vy, radius;
        rx = Math.random() * W;
        ry = Math.random() * H;
        vx = Math.random() * 2 * (Math.random() < 0.5 ? -1 : 1);
        vy = Math.random() * 2 * (Math.random() < 0.5 ? -1 : 1);
        radius = Math.random() * 3 + 6;
        balls.push(new Ball(rx, ry, vx, vy, radius, color, radius));
    }

    //balls.push(new Ball(W / 2, H / 2, 0, 0, H / 3, color, H / 3));
    var simulation = new Simulation(balls, ctx);
    simulation.simulate(10000);
})();
