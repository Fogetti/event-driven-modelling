var CollisionSystem = (function invocation() {
    
    function CollisionSystem(particles,canvas) {
        this.limit               = 1000000;
        this.pq              = new MinPQ();
        this.t                       = 0.0;
        this.hz                   = 1000.0;
        this.particles         = particles;
        this.c   = canvas.getContext("2d");
        this.canvas               = canvas;
    }

    CollisionSystem.prototype.simulate = function() {
        var self = this;
        
        this.c.globalCompositeOperation = "destination-over";
        
        // initialize PQ with collision events and redraw event
        for (var i = 0; i < this.particles.length; i++) {
            this.predict(this.particles[i]);
        }
        this.pq.insert(new Event(0, null, null));        // redraw event
        
        setTimeout(function() {
            self.move();
        }, 0);
    };
    
    CollisionSystem.prototype.move = function() {
        var self = this;
        
        // the main event-driven simulation loop
        if (!self.pq.isEmpty()) {
            // get impending event, discard if invalidated
            var e = self.pq.delMin();
            if (e.isValid()) {
                var a = e.a;
                var b = e.b;
    
                // physical collision, so update positions, and then simulation clock
                for (var i = 0; i < self.particles.length; i++) {
                    self.particles[i].move(e.time - self.t);
                }
                self.t = e.time;
    
                // process event
                if      (a != null && b != null) a.bounceOff(b);              // particle-particle collision
                else if (a != null && b == null) a.bounceOffVerticalWall();   // particle-wall collision
                else if (a == null && b != null) b.bounceOffHorizontalWall(); // particle-wall collision
                else if (a == null && b == null) self.redraw();               // redraw event
    
                // update the priority queue with new collisions involving a or b
                self.predict(a);
                self.predict(b);
            }
        }

        setTimeout(function() {
            self.move();
        }, 0);
    };
    
    CollisionSystem.prototype.redraw = function() {
        // buffer canvas
        var canvas2 = document.createElement("canvas");
        canvas2.width = this.canvas.width;
        canvas2.height = this.canvas.height;
        var cx2 = canvas2.getContext("2d");
        cx2.fillStyle = "rgba(0,0,0,0.01)";
        cx2.fillRect(0, 0, this.c.canvas.width, this.c.canvas.height);
        cx2.drawImage(this.c.canvas, 0, 0);
        
        this.c.clearRect(0, 0, this.c.canvas.width, this.c.canvas.height);

        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(cx2);
        }
        
        this.c.fillStyle = "rgba(0,0,0,0.08)";
        this.c.fillRect(0, 0, this.c.canvas.width, this.c.canvas.height);
        this.c.drawImage(canvas2, 0, 0);

        if (this.t < this.limit) this.pq.insert(new Event(this.t + 1.0 / this.hz, null, null));
    };

    CollisionSystem.prototype.predict = function(a) {
        if (a == null) return;

        // particle-particle collisions
        for (var i = 0; i < this.particles.length; i++) {
            var dt = a.timeToHit(this.particles[i]);
            if (this.t + dt <= this.limit) this.pq.insert(new Event(this.t + dt, a, this.particles[i]));
        }

        // particle-wall collisions
        var dtX = a.timeToHitVerticalWall();
        var dtY = a.timeToHitHorizontalWall();
        if (this.t + dtX <= this.limit) this.pq.insert(new Event(this.t + dtX, a, null));
        if (this.t + dtY <= this.limit) this.pq.insert(new Event(this.t + dtY, null, a));
    };

    var Event = (function(){
        
        function Event(t,a,b) {
            this.time = t;                          // time that event is scheduled to occur
            this.a = a, this.b = b;                 // particles involved in event, possibly null
            this.countA = 0, this.countB = 0;       // collision counts at event creation
            if (a != null) this.countA = a.count();
            else           this.countA = -1;
            if (b != null) this.countB = b.count();
            else           this.countB = -1;
        }
        
        Event.prototype.compareTo = function(that) {
            if      (this.time < that.time) return -1;
            else if (this.time > that.time) return +1;
            else                            return  0;
        };
        
        Event.prototype.isValid = function() {
            if (this.a != null && this.a.count() != this.countA) return false;
            if (this.b != null && this.b.count() != this.countB) return false;
            return true;
        };
        
        return Event;
    })();
    
    var fps = 60;
    
    return CollisionSystem;
})();
