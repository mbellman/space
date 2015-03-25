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

            /*
            if (r > maxr) {
                return {
                    'x': px,
                    'y': py
                }
            }
            */

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
                //continue;
            }

            for(var x = 0 ; x < width ; x++) {
                if(x < hW / 2 || x > hW * 1.5) {
                    //continue;
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

function ctxSetShadow(ctx, color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function projectStarBG() {
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
    var shipAz   = game.ship.azimuth[1];
    var shipAlt  = game.ship.altitude[1];

    var azRange  = [JS_mod((game.ship.azimuth[1] - fov / 2), 360), JS_mod((game.ship.azimuth[1] + fov / 2), 360)];
    var altRange = [JS_mod((game.ship.altitude[1] - fov / 2), 360), JS_mod((game.ship.altitude[1] + fov / 2), 360)];

    var azStart  = azRange[0];
    var altStart = altRange[0];

    azRange[0]  += (360 - azStart);
    azRange[1]  += (360 - azStart);

    altRange[0] += (360 - altStart);
    altRange[1] += (360 - altStart);

    azRange[0]   %= 360;
    azRange[1]   %= 360;
    altRange[0]  %= 360;
    altRange[1]  %= 360;

    $('.console').html(shipAz + '<br />' + shipAlt);

    for(var p = 0 ; p < planetSystem.planetCount ; p++) {
        var planet = planetSystem.planets[p];

        var pAzNorm  = (planet.azimuth + (360 - azStart)) % 360;
        var pAltNorm = (planet.altitude + (360 - altStart)) % 360;

        var pAzNorm180  = (JS_mod(180 - planet.azimuth, 360) + (360 - azStart)) % 360;
        var pAltNorm180 = (JS_mod(180 - planet.altitude, 360) + (360 - altStart)) % 360;

        var adjRadius = 50 * fov / 600;

        //if(p == 0) $('.console').html((pAzNorm + adjRadius) % 360 + '<br />' + (fov + adjRadius * 2));

        //if(((pAzNorm + adjRadius) % 360) < (fov + adjRadius * 2) && ((pAltNorm + adjRadius) % 360) < (fov + adjRadius * 2)) {
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(600 - pAzNorm * 600 / fov, 600 - pAltNorm * 600 / fov, 50, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = planet.color;
            DOM.prerender.ctx.fill();
        //}
        //else if (pAzNorm180 < fov + 50 * fov / 600 || 360 - pAzNorm180 < 50 * fov / 600) {
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(600 - pAzNorm180 * 600 / fov, 600 - pAltNorm180 * 600 / fov, 50, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = planet.color;
            DOM.prerender.ctx.fill();
        //}
    }
}

function rerender() {
    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);

    projectStarBG();
    projectPlanets();

    _scene.render();
}