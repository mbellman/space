var Render = function(label, context, destination, width, height) {
    this.lbl = label;
    this.ctx  = context;
    this.dest = destination;
    this.w    = width;
    this.h    = height;

    this.pointDisplace = {
        pincushion: function(px, py) {
            var x = (px-width/2) / 1.5;
            var y = (py-height/2) / 1.5;
            var r = Math.sqrt(x*x+y*y);
            var maxr = width / 2;
            if (r>maxr) return {'x':px,'y':py}
            var a = Math.atan2(y,x);
            var k = (r/maxr)*(r/maxr)*0.5+0.5;
            var dx = Math.cos(a)*r/k;
            var dy = Math.sin(a)*r/k;
            return {
                'x': dx * 1 + width/2,
                'y': dy * 1 + height/2
            }
        },
        twirl: function(px, py) {
            var x = px-width/2;
            var y = py-height/2;
            var r = Math.sqrt(x*x+y*y);
            var maxr = width/2;
            if (r>maxr) return {
                'x':px,
                'y':py
            }
            var a = Math.atan2(y,x);
            a += 1-r/maxr;
            var dx = Math.cos(a)*r;
            var dy = Math.sin(a)*r;
            return {
                'x': dx+width/2,
                'y': dy+height/2
            }
        },
        none: function(px, py) {
            return {
                'x': px,
                'y': py
            }
        }
    }

    this.filter = function(filterType) {
        if(!this.pointDisplace.hasOwnProperty(filterType)) {
            console.error('Invalid filter ' + filterType.toUpperCase() + ' applied for render object ' + this.lbl);
        }

        var imageData = this.ctx.getImageData(0, 0, width, height);
        var imageDataT = this.ctx.createImageData(width, height);

        var colorat = function(x, y, channel) {
            return imageData.data[(x + y * height) * 4 + channel];
        }

        var bilinearFilter = function(x, y, dx, dy, c) {
            return (colorat(x,y,c)*(1 - dx) + colorat(x+1,y,c)*dx) * (1-dy) + (colorat(x,y+1,c)*(1-dx) + colorat(x+1,y+1,c)*dx)*dy;
        }

        for(var y = 0 ; y < height ; y++) {
            for(var x = 0 ; x < width ; x++) {
                var transform = this.pointDisplace[filterType](x, y);

                var ax = Math.floor(transform.x);
                var ay = Math.floor(transform.y);

                var dx = transform.x - ax;
                var dy = transform.y - ax;

                for(var c = 0 ; c < 4 ; c++) {
                    imageDataT.data[(x + y * width) * 4 + c] = imageData.data[(ax + ay * width) * 4 + c];
                }
            }
        }

        this.dest.clearRect(0, 0, width, height);
        this.dest.putImageData(imageDataT, 0, 0, 0, 0, width, height);
    }

    this.render = function(arguments) {
        for(key in arguments) {
            if(!arguments.hasOwnProperty(key)) {
                continue;
            }

            switch(key) {
                case 'filter':
                    this.filter(arguments[key]);
                    break;
                case 'update':
                    // Set infinite render interval in ms
                    var obj = this;
                    var args = arguments;

                    setTimeout(function(){
                        obj.render(args);
                    }, arguments[key]);
                    break;
                default:
                    break;
            }
        }
    }
}

function initRenderLoop() {
    var starBG = new Render('starBG', DOM.stars.prerender.ctx, DOM.stars.main.ctx, 500, 500);

    starBG.render({
        filter: 'pincushion',
        update: 20
    });
}