var MinPQ = (function invocation() {
    
    function MinPQ() {
        this.bh = [null];
        this.n = 0;
    }
    
    MinPQ.prototype.insert = function(e) {
        this.bh[++this.n] = e;
        this.swim(this.n);
    };
    
    MinPQ.prototype.swim = function(k) {
        while (k > 1 && this.greater(parseInt(k/2), k)) {
            this.swap(k,parseInt(k/2));
            k = parseInt(k/2);
        }
    };
    
    MinPQ.prototype.delMin = function() {
        this.swap(1,this.n);
        var min = this.bh[this.n--];
        this.sink(1);
        this.bh[this.n+1] = null;
        return min;
    };
    
    MinPQ.prototype.sink = function(k) {
        while(2*k <= this.n) {
            var j = 2*k;
            if (j < this.n && this.greater(j,j+1)) j++;
            if (!this.greater(k,j)) break;
            this.swap(k,j);
            k = j;
        }
    };
    
    MinPQ.prototype.greater = function(a,b) {
        return this.bh[a].compareTo(this.bh[b]) > 0;
    };

    MinPQ.prototype.swap = function(i,j) {
        var temp = this.bh[i];
        this.bh[i] = this.bh[j];
        this.bh[j] = temp;
    };
    
    MinPQ.prototype.min = function() { return this.bh[1]; };
    
    MinPQ.prototype.size = function() { return this.n; };
    
    MinPQ.prototype.isEmpty = function() { return this.n === 0; };
    
    // The public API for this module is the MinPQ() constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside. In this case, we export the constructor
    // by returning it. It becomes the value of the assignment expression
    // on the first line above.
    return MinPQ;
    
}()); // Invoke the function immediately after defining it.