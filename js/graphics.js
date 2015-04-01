var _scene;
var fov = 90;

var canvasRatio = 600 / 360;
var angleRatio = 4;

var Render = function(label, source, destination, width, height, filter, intensity) {
    this.lbl    = label;
    this.srce   = source;
    this.dest   = destination;
    this.w      = width;
    this.h      = height;
    this.stren  = intensity;
    this.mapped = false;
    this.locked = false;

    var hW = width / 2;
    var hH = height / 2;

    var yLow = hH/4;
    var yHigh = hH*1.75;

    var xLow = hW/4;
    var xHigh = hW*1.75;

    var map = [];

    this.pointDisplace = {
        pincushion: function(px, py) {
            var x = (px - hW) / intensity;
            var y = (py - hH) / intensity;
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

        for(var y = 0 ; y < height ; y++) {
            var rowCycle = y * width;

            if(y < yLow || y > yHigh) {
                continue;
            }

            for(var x = 0 ; x < width ; x++) {
                if(x < xLow || x > xHigh) {
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

function drawStar(x, y, radius, glow) {
    DOM.prerender.ctx.beginPath();
    DOM.prerender.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    DOM.prerender.ctx.fillStyle = '#FFF';

    if(glow > 5) {
        ctxSetShadow(DOM.prerender.ctx, 'rgba(255,255,255,1.0)', (glow < 20 ? glow : 20));
    }

    DOM.prerender.ctx.fill();
}

function drawPlanet(x, y, radius, color) {
    DOM.prerender.ctx.beginPath();
    DOM.prerender.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    DOM.prerender.ctx.fillStyle = color;
    DOM.prerender.ctx.fill();
}

function projectCelestialBodies() {
    var noGlow = true;

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var star = starCluster.stars[s];

        var dist = Math.sqrt( sq(star.x) + sq(star.y) + sq(star.z) );

        var nSx = star.x/dist;
        var nSy = star.y/dist;
        var nSz = star.z/dist;

        var xC = 300 - (2*nSx / (1 + nSz))*75*(360 / fov);
        var yC = 300 - (2*nSy / (1 + nSz))*75*(360 / fov);

        var apparentSize = (star.size / dist) * (360/fov);

        if( Math.sqrt( sq(Math.abs(xC)-300) + sq(Math.abs(yC)-300) ) < 360 || dist < 1000) {
            // Rendering a star if it is within the FOV

            var glowAmount = (star.temp*0.5)/dist;
            drawStar(xC, yC, apparentSize, glowAmount);
            
            ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);

            for( var p = 0 ; p < star.planets.planetCount ; p++ ) {
                // Rendering planets

                var planet = star.planets.planets[p];

                var dist = Math.sqrt( sq(planet.x) + sq(planet.y) + sq(planet.z) );

                var nPx = planet.x/dist;
                var nPy = planet.y/dist;
                var nPz = planet.z/dist;

                var xC = 300 - (2*nPx / (1 + nPz))*75*(360 / fov);
                var yC = 300 - (2*nPy / (1 + nPz))*75*(360 / fov);

                var apparentSize = ((planet.size*5) / dist) * (360/fov);

                drawPlanet(xC, yC, apparentSize, planet.color);
            }
        }
    }
}

function projectPlanets() {
    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);

    for( var p = 0 ; p < planetSystem.planetCount ; p++ ) {
        var planet = planetSystem.planets[p];

        var dist = Math.sqrt( sq(planet.x) + sq(planet.y) + sq(planet.z) );

        var nPx = planet.x/dist;
        var nPy = planet.y/dist;
        var nPz = planet.z/dist;

        var xC = 300 - (2*nPx / (1 + nPz))*75*(360 / fov);
        var yC = 300 - (2*nPy / (1 + nPz))*75*(360 / fov);

        var apparentSize = (planet.size / dist) * (360/fov);

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

    projectCelestialBodies();
    //projectPlanets();

    _scene.render();
}