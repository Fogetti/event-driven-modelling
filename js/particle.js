var Particle = (function invocation() {
    
    function Particle(rx,ry,vx,vy,radius,mass,color,c,screenW,screenH) {
        this.screenW = screenW;        // screen width
        this.screenH = screenH;        // screen height
        this.rx = rx, this.ry = ry;    // position
        this.vx = vx, this.vy = vy;    // velocity
        this.radius = radius;          // radius
        this.mass = mass;              // mass
        this.color = color;            // color
        this.cnt = 0;                  // number of collisions so far
        this.c = c;                    // 2d canvas context
    }
    
    Particle.prototype.move = function(dt) {
        this.rx += this.vx * dt;
        this.ry += this.vy * dt;
    };
    
    Particle.prototype.draw = function(cx) {
        cx.beginPath();
        cx.fillStyle = this.color;
        cx.lineWidth = this.radius*2;
        cx.moveTo(this.rx,this.ry);
        cx.arc(this.rx,this.ry,this.radius,0,rads(360),true);
        cx.closePath();
        cx.fill();
    };
    
    Particle.prototype.count = function() {
        return this.cnt;
    };
    
    Particle.prototype.timeToHit = function(that) {
        if (this == that) return INFINITY;
        var dx  = that.rx - this.rx;
        var dy  = that.ry - this.ry;
        var dvx = that.vx - this.vx;
        var dvy = that.vy - this.vy;
        var dvdr = dx*dvx + dy*dvy;
        if (dvdr > 0) return INFINITY;
        var dvdv = dvx*dvx + dvy*dvy;
        var drdr = dx*dx + dy*dy;
        var sigma = this.radius + that.radius;
        var d = (dvdr*dvdr) - dvdv * (drdr - sigma*sigma);
        // if (drdr < sigma*sigma) console.log("overlapping particles");
        if (d < 0) return INFINITY;
        return -(dvdr + Math.sqrt(d)) / dvdv;
    };

    Particle.prototype.timeToHitVerticalWall = function() {
        if      (this.vx > 0) return (this.screenW - this.rx - this.radius) / this.vx;
        else if (this.vx < 0) return (this.radius - this.rx) / this.vx;  
        else                  return INFINITY;
    };
    
    Particle.prototype.timeToHitHorizontalWall = function() {
        if      (this.vy > 0) return (this.screenH - this.ry - this.radius) / this.vy;
        else if (this.vy < 0) return (this.radius - this.ry) / this.vy;
        else                  return INFINITY;
    };
    
    Particle.prototype.bounceOff = function(that) {
        var dx  = that.rx - this.rx;
        var dy  = that.ry - this.ry;
        var dvx = that.vx - this.vx;
        var dvy = that.vy - this.vy;
        var dvdr = dx*dvx + dy*dvy;             // dv dot dr
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
        this.cnt++;
        that.cnt++;
    };
    
    Particle.prototype.bounceOffVerticalWall = function() {
        this.vx = -this.vx;
        this.cnt++;
    };
    
    Particle.prototype.bounceOffHorizontalWall = function() {
        this.vy = -this.vy;
        this.cnt++;
    };
    
    Particle.prototype.kineticEnergy = function() {
        return 0.5 * this.mass * (this.vx*this.vx + this.vy*this.vy);
    };
    
    Particle.generate = function(c,n,screenW,screenH) {
        var particles = [];
        for (var j = 0; j < n; j++) {
            var rx = Math.floor(Math.random()*screenW);                              // position x
            var ry = Math.floor(Math.random()*screenH);                              // position y
            var vx = undefined;                                                      // velocity x
            var vy = undefined;                                                      // velocity y
            var mag = undefined;                                                     // velocity magnitude
            (function monteCarlo() {
                var mag = 0;
                while (mag == 0 || mag > 1) {
                    vx = uniform(-1, 1);
                    vy = uniform(-1, 1);
                    mag = magnitude(vx,vy);
                }
                vx = (vx / mag) * 1500;
                vy = (vy / mag) * 1500;
            })();
            var radius = 5;                                                           // radius
            var c = c;                                                                // 2d canvas context
            var color = '#' + (Math.random() * 0x00eaff + 0xff0000 | 0).toString(16); // color
            var mass = 0.5;                                                           // mass
            particles[j] = new Particle(rx,ry,vx,vy,radius,mass,color,c,screenW,screenH);
            particles[j].draw(c);
        }
        return particles;
    };
    
    function uniform(a,b) {
        return a + Math.random() * (b-a);
    };
    
    function magnitude(x,y) {
        return Math.sqrt(x*x + y*y);
    }
    
    function rads(x) {
        return Math.PI*x/180;
    }
    
    var INFINITY = Number.POSITIVE_INFINITY;
    
    return Particle;
})();
