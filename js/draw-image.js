var DrawImage = (function invocation() {
    
    function DrawImage(canvas) {
        this.c      = canvas.getContext("2d");
        this.canvas                            = canvas;
        this.particleQ                             = [];
        this.canvas2 = document.createElement("canvas");
        this.canvas2.width =          this.canvas.width;
        this.canvas2.height =        this.canvas.height;
        this.c2 =         this.canvas2.getContext("2d");
    }

    DrawImage.prototype.simulate = function() {
    	this.c.globalCompositeOperation = "destination-over";
    	var self = this;
        var blob = new Blob([document.querySelector('#worker1').textContent]);
    	var worker = new Worker(window.URL.createObjectURL(blob)); // Create worker
    	worker.postMessage({
            url: document.location.href,
            0: this.canvas.width,
            1: this.canvas.height
        }); // Copy and send particle dimensions
    	
    	requestAnimationFrame(function(){
    		self.animate();
    	});

    	// Register a handler to get the worker's response
		worker.onmessage = function(e) {
			self.particleQ.push(e.data);
		};
    };
    
    DrawImage.prototype.animate = function() {
    	var self = this;
    	if (self.particleQ) {
			var particles = self.particleQ.shift();
		}
		if (particles) {
	        // buffer canvas
	        var width = self.canvas.width;
	        var height = self.canvas.height;

	        self.c2.clearRect(0, 0, width, height);
	        self.c2.drawImage(self.c.canvas, 0, 0);
	        
	        self.c.clearRect(0, 0, width, height);
			
	        for (var i = 0; i < particles.length; i++) {
	            var p = particles[i];
                self.c2.fillStyle = p.color;
                self.c2.lineWidth = p.radius*2;
		        self.c2.beginPath();
		        self.c2.arc(p.rx,p.ry,p.radius,0,rads(360),true);
		        self.c2.fill();
	        }
	        
	        self.c.fillStyle = "rgba(0,0,0,0.1)";
	        self.c.fillRect(0, 0, width, height);
	        self.c.drawImage(self.canvas2, 0, 0);    	
	    }

    	requestAnimationFrame(function(){
    		self.animate();
    	});
    };

    function rads(x) {
        return Math.PI*x/180;
    }

    return DrawImage;
})();