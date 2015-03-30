var _scene;
var fov = 90;

var canvasRatio = 600 / 360;
var angleRatio = 4;

var Render = function(label, source, destination, width, height, filter) {
    this.lbl    = label;
    this.srce   = source;
    this.dest   = destination;
    this.w      = width;
    this.h      = height;
    this.mapped = false;
    this.locked = false;

    var hW = width / 2;
    var hH = height / 2;

    var map = [];

    this.pointDisplace = {
        pincushion: function(px, py) {
            var x = (px - hW) / 1.2;
            var y = (py - hH) / 1.2;
            var r = Math.sqrt(x*x + y*y);
            var maxr = hW;

            if (r > maxr) {
                return {
                    'x': px,
                    'y': py
                }
            }

            var a = Math.atan2(y, x);
            var k = (r/maxr) * (r/maxr) * 0.5 + 0.5;
            var dx = Math.cos(a) * r/k;
            var dy = Math.sin(a) * r/k;

            return {
                'x': dx + hW,
                'y': dy + hH
            }
        },
        none: function(px, py) {
            return {
                'x': px,
                'y': py
            }
        }
    }

    this.render = function() {
        if(!this.mapped || this.locked) {
            return;
        }

        this.locked = true;

        var imageData = this.srce.getImageData(0, 0, width, height);
        var imageDataT = this.srce.createImageData(width, height);

        function colorat(x, y, channel) {
            return imageData.data[(x + y * height) * 4 + channel];
        }

        for(var y = 0 ; y < height ; y++) {
            var rowCycle = y * width;

            if(y < hH / 2 || y > hH * 1.5) {
                continue;
            }

            for(var x = 0 ; x < width ; x++) {
                if(x < hW / 2 || x > hW * 1.5) {
                    continue;
                }

                var dataPos = (x + rowCycle) * 4;

                var ax = map[y][x][0];
                var ay = map[y][x][1];

                var adjDataPos = (ax + ay * width) * 4;

                for(var c = 0 ; c < 4 ; c++) {
                    imageDataT.data[dataPos + c] = imageData.data[adjDataPos + c];
                }
            }
        }

        //this.dest.clearRect(0, 0, width, height);
        this.dest.putImageData(imageDataT, 0, 0, 0, 0, width, height);

        this.locked = false;
    }

    this.createMap = function() {
        if(!this.pointDisplace.hasOwnProperty(filter)) {
            console.error('Invalid filter ' + filter.toUpperCase() + ' applied for render object ' + this.lbl);
            filter = 'none';
        }

        for(var y = 0 ; y < height ; y++) {
            map[y] = [];

            for(var x = 0 ; x < width ; x++) {
                var transform = this.pointDisplace[filter](x, y);

                var ax = Math.floor(transform.x);
                var ay = Math.floor(transform.y);

                map[y][x] = [ax, ay];
            }
        }

        this.mapped = true;
    }

    this.createMap();
}

function ctxSetShadow(ctx, color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function projectStars() {
    var noGlow = true;

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var star = starCluster.stars[s];

        var dist = Math.sqrt( sq(star.x) + sq(star.y) + sq(star.z) );

        var nSx = star.x/dist;
        var nSy = star.y/dist;
        var nSz = star.z/dist;

        var xC = 300 - (2*nSx / (1 + nSz))*75*(360 / fov);
        var yC = 300 - (2*nSy / (1 + nSz))*75*(360 / fov);

        var apparentSize = ((star.size*5) / dist) * (360/fov);

        if( Math.sqrt( sq(Math.abs(xC)-300) + sq(Math.abs(yC)-300) ) < 360) {
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(xC, yC, apparentSize, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = '#FFF';

            var glowAmount = (star.temp*0.5)/dist;

            if(glowAmount > 5) {
                ctxSetShadow(DOM.prerender.ctx, 'rgba(255,255,255,1.0)', (glowAmount < 20 ? glowAmount : 20));
                noGlow = false;
            } else {
                if(!noGlow) {
                    // Only set glow to 0 if it isn't already
                    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);
                    noGlow = true;
                }
            }

            DOM.prerender.ctx.fill();
        }
    }

    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);
}

function projectPlanets() {
    for( var p = 0 ; p < planetSystem.planetCount ; p++ ) {
        var planet = planetSystem.planets[p];

        var dist = Math.sqrt( sq(planet.x) + sq(planet.y) + sq(planet.z) );

        var nPx = planet.x/dist;
        var nPy = planet.y/dist;
        var nPz = planet.z/dist;

        var xC = 300 - (2*nPx / (1 + nPz))*75*(360 / fov);
        var yC = 300 - (2*nPy / (1 + nPz))*75*(360 / fov);

        var apparentSize = ((planet.size*5) / dist) * (360/fov);

        if( Math.sqrt( sq(Math.abs(xC)-300) + sq(Math.abs(yC)-300) ) < 360) {
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(xC, yC, apparentSize, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = planet.color;
            DOM.prerender.ctx.fill();
        }
    }
}

function rerender() {
    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);
    DOM.prerender.ctx.clearRect(0, 0, 600, 600);

    projectStars();
    projectPlanets();

    _scene.render();
}