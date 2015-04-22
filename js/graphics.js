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

function getBodyDistance(body1, body2) {
    var dxS = sq(body1.x - body2.x);
    var dyS = sq(body1.y - body2.y);
    var dzS = sq(body1.z - body2.z);

    return Math.sqrt(dxS + dyS + dzS);
}

function getApproxCelestialSphereDist(body1, body2) {
    var d1 = Math.sqrt(sq(body1.x) + sq(body1.y) + sq(body1.z));
    var d2 = Math.sqrt(sq(body2.x) + sq(body2.y) + sq(body2.z));

    var nB1x = body1.x/d1;
    var nB1y = body1.y/d1;
    var nB1z = body1.z/d1;

    var nB2x = body2.x/d2;
    var nB2y = body2.y/d2;
    var nB2z = body2.z/d2;

    return Math.sqrt( sq(nB1x - nB2x) + sq(nB1y - nB2y) + sq(nB1z - nB2z) );
}

function drawPlanet(x, y, radius, color, starCoords, star, planet, starDist, planetDist) {
    DOM.prerender.ctx.save();   // Save context

    // Define clipping region
    DOM.prerender.ctx.beginPath();
    DOM.prerender.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    DOM.prerender.ctx.clip();

    // Generate shadow
    DOM.prerender.ctx.beginPath();

    if(radius > 0.5) {

        // Find raw distance between star and planet on projected screen
        var starVec = {
            x: starCoords.x - x,
            y: starCoords.y - y
        }

        var starVecLength = Math.sqrt(sq(starVec.x) + sq(starVec.y));

        // Normalize vector to 1
        starVec.x /= starVecLength;
        starVec.y /= starVecLength;

        // Multiply vector by an amount that will not change with orientation
        starVec.x *= radius;
        starVec.y *= radius;

        // Determine conditions
        var planetStarDist = getBodyDistance(planet, star);
        var celestialSphereDist = getApproxCelestialSphereDist(planet, star);
        var planetShipRatio = 1+(100 / Math.abs(planetStarDist - starDist));

        var scalar = 4;

        if(planetStarDist < starDist && planetDist < starDist) {
            // Planet closer to star than ship is (shadow on near side)

            // Determine shadow position
            var xGradOffset = starVec.x*celestialSphereDist*scalar*2;
            var yGradOffset = starVec.y*celestialSphereDist*scalar*2;
            var gradRadius = radius + Math.sqrt( sq(xGradOffset) + sq(yGradOffset) );

            // Fill clipping region with planet color
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = color;
            DOM.prerender.ctx.fill();

            // Prepare shadow fill
            DOM.prerender.ctx.arc(x - xGradOffset, y - yGradOffset, gradRadius, 0, 2*Math.PI, false);

            var shading = DOM.prerender.ctx.createRadialGradient(
                x - xGradOffset,
                y - yGradOffset,
                gradRadius,
                x - xGradOffset,
                y - yGradOffset,
                (gradRadius*0.6 < 0 ? 0 : gradRadius*0.6)
            );

            shading.addColorStop(0, color);
            shading.addColorStop(1, '#000');
        } else {
            // Ship closer to star than planet is (light on near side)

            // Determine shadow position
            var xGradOffset = starVec.x * (2 - celestialSphereDist) * scalar*2;
            var yGradOffset = starVec.y * (2 - celestialSphereDist) * scalar*2;
            var gradRadius = radius + Math.sqrt(sq(xGradOffset) + sq(yGradOffset));

            // Fill clipping region with shadow color
            DOM.prerender.ctx.beginPath();
            DOM.prerender.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            DOM.prerender.ctx.fillStyle = '#000';
            DOM.prerender.ctx.fill();

            // Prepare shadow fill
            DOM.prerender.ctx.arc(x + xGradOffset, y + yGradOffset, gradRadius, 0, 2*Math.PI, false);

            var shading = DOM.prerender.ctx.createRadialGradient(
                x + xGradOffset,
                y + yGradOffset,
                gradRadius,
                x + xGradOffset,
                y + yGradOffset,
                (gradRadius*0.6 < 0 ? 0 : gradRadius*0.6)
            );

            shading.addColorStop(0, '#000');
            shading.addColorStop(1, color);
        }

        DOM.prerender.ctx.fillStyle = shading;
    } else {
        DOM.prerender.ctx.fillStyle = color;
    }

    DOM.prerender.ctx.fill();
    DOM.prerender.ctx.restore();
}

function project3Dto2D(object, normalizer)
{
    if(object.hasOwnProperty('x') && object.hasOwnProperty('y') && object.hasOwnProperty('z')) {
        var nX = object.x/normalizer;
        var nY = object.y/normalizer;
        var nZ = object.z/normalizer;

        var xC = 300 - (2 * nX / (1 + nZ)) * 75 * (360 / fov);
        var yC = 300 - (2 * nY / (1 + nZ)) * 75 * (360 / fov);

        return {
            x: xC,
            y: yC
        }
    }

    return {
        x: -1,
        y: -1
    }
}

function projectCelestialBodies() {
    var noGlow = true;

    // Rendering distant stars
    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        if(s == starCluster.closestStar) {
            continue;
        }

        // Getting star properties
        var star = starCluster.stars[s];
        var sDist = star.dist;
        var projection = project3Dto2D(star, sDist);

        var apparentSize = (star.size / sDist) * (360/fov);
        if(apparentSize < 1) apparentSize = 1;

        if( Math.sqrt( sq(Math.abs(projection.x)-300) + sq(Math.abs(projection.y)-300) ) < 360 || sDist < 1000) {
            // Rendering a star if it is within the FOV
            var glowAmount = (star.temp*0.5)/sDist;
            drawStar(projection.x, projection.y, apparentSize, glowAmount);
        }

        ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);    // Reset glow
    }

    // Rendering currently occupied system
    var currentStar = starCluster.stars[starCluster.closestStar];
    var starDistance = currentStar.dist;
    var sProjection = project3Dto2D(currentStar, starDistance);
    var starRendered = false;

    currentStar.planets.sortByDistance();

    for( var p = 0 ; p < currentStar.planets.planetCount ; p++ ) {
        var planet = currentStar.planets.planets[p];

        var planetDistance = planet.dist;

        if(!starRendered) {
            if(starDistance > planetDistance) {
                // Star is further away than next planet in lineup, so render it
                // first in case the two overlap
                var apparentSize = (currentStar.size / starDistance) * (360/fov);
                var glowAmount = (currentStar.temp*0.5)/starDistance;

                drawStar(sProjection.x, sProjection.y, apparentSize, glowAmount);

                ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);

                starRendered = true;
            }
        }

        // Render planet
        var pProjection = project3Dto2D(planet, planetDistance);
        var apparentSize = (planet.size/planetDistance) * (360/fov);

        drawPlanet(pProjection.x, pProjection.y, apparentSize, planet.color, sProjection, currentStar, planet, starDistance, planetDistance);
    }

    if(!starRendered) {
        // Star is the closest object, so render that last!
        var apparentSize = (currentStar.size / starDistance) * (360/fov);
        var glowAmount = (currentStar.temp*0.5)/starDistance;

        drawStar(sProjection.x, sProjection.y, apparentSize, glowAmount);

        starRendered = true;
    }
}

function rerender() {
    ctxSetShadow(DOM.prerender.ctx, 'rgba(0,0,0,0)', 0);
    DOM.prerender.ctx.clearRect(0, 0, 600, 600);

    projectCelestialBodies();

    _scene.render();
}