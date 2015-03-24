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

        this.dest.clearRect(0, 0, width, height);
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

function planetCoords(planetObj) {
    return {
        /*
        x: (300 - (planetObj.azimuth * canvasRatio * angleRatio) + (game.ship.azimuth[1] * canvasRatio * angleRatio)) - 1200,
        y: (300 - (planetObj.altitude * canvasRatio * angleRatio) + (game.ship.altitude[1] * canvasRatio * angleRatio)) - 1200
        */
        x: 300 - ((planetObj.azimuth - game.ship.azimuth[1]) * canvasRatio * angleRatio),
        y: 300 - ((planetObj.altitude - game.ship.altitude[1]) * canvasRatio * angleRatio)
    }
}

function updateFlatStarBG() {
    DOM.prerender.ctx.clearRect(0, 0, 600, 600);

    var xDist = Math.floor(game.ship.azimuth[1] * canvasRatio * angleRatio);
    var yDist = Math.floor(game.ship.altitude[1] * canvasRatio * angleRatio);

    for(var i = 0 ; i < 2 ; i++) {
        for(var j = 0 ; j < 2 ; j++) {
            DOM.prerender.ctx.drawImage(DOM.starsImg,
                (xDist % 600 - (1 - i) * 600),
                (yDist % 600 - (1 - j) * 600),
            600, 600);
        }
    }

    DOM.scene.canvas.css({
        '-moz-transform'    : 'rotate(' + game.ship.roll[1] + 'deg)',
        '-webkit-transform' : 'rotate(' + game.ship.roll[1] + 'deg)',
        'transform'         : 'rotate(' + game.ship.roll[1] + 'deg)'
    });
}

function projectPlanets() {
    var azimuthNormalization = game.ship.azimuth[1];
    for(var p = 0 ; p < planetSystem.planetCount ; p++) {
        var planet = planetSystem.planets[p];
        var coords = planetCoords(planet);

        DOM.prerender.ctx.beginPath();

        DOM.prerender.ctx.arc(coords.x, coords.y, 50, 0, 2 * Math.PI, false);

        DOM.prerender.ctx.fillStyle = planet.color;
        DOM.prerender.ctx.fill();
    }
}

function rerender() {
    updateFlatStarBG();
    projectPlanets();

    _scene.render();
}