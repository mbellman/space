var game;
var planetSystem;

var Game = function() {
    this.loop;

    this.ship = {

        // [change rate, current value]
        x:        [0, 0],
        y:        [0, 0],
        z:        [0, 0],
        //azimuth:  [0, 0],
        //altitude: [0, 0],
        //roll:     [0, 0],

        oAcceleration: 0.025,    // Orientation acceleration (orientation thruster power)
        mAcceleration: 0.01,    // Movement acceleration (main thruster power)

        velocity: {
            x: 0,
            y: 0,
            z: 0
        }
    }

    this.camera = {
        aLon: 0,        // Longitudinal acceleration
        aLat: 0,        // Latitudinal acceleration
        roll: [0, 0]    // Rotation rate, rotation amount
    }

    this.updateCameraRotation = function() {
        this.camera.xRot += this.camera.aLat;
        this.camera.yRot += this.camera.aLon;

        rotateStars();
        rotatePlanets();
    }
}

var starCluster = function() {
    this.stars = [];
    this.starCount = 300;
    this.initialized = false;
    this.closestStar = 0;

    this.generate = function() {
        for( var s = 0 ; s < this.starCount ; s++ ) {
            var xC = rnumber(1, 10000) - 5000;
            var yC = rnumber(1, 10000) - 5000;
            var zC = rnumber(1, 10000) - 5000;

            var radius = rnumber(2500, 15000);

            this.stars.push({
                x: xC,
                y: yC,
                z: zC,
                temp: rnumber(3000, 15000),
                size: radius,
                dist: 0,    // Updated during game cycle
                planets: generatePlanets(xC, yC, zC, radius)
            });
        }

        this.initialized = true;
    }

    this.logDistances = function() {
        if(!this.initialized) {
            return;
        }

        var minDist = -1;
        var mID = 0;

        for( var s = 0 ; s < this.starCount ; s++ ) {
            var star = this.stars[s];

            var dist = Math.sqrt( sq(star.x) + sq(star.y) + sq(star.z) );

            if(minDist == -1) {
                // Initializing
                minDist = dist;
            } else {
                if (dist < minDist) {
                    // Found new minimum distance
                    minDist = dist;
                    mID = s;
                }
            }

            star.dist = dist;
        }

        this.closestStar = mID;
    }
}

var PlanetarySystem = function() {
    this.planets = [];
    this.planetCount = 0;

    this.xO;
    this.yO;
    this.zO;
    this.starRadius;

    this.generate = function() {
        var total = rnumber(1, 22) - 1;

        var xSlope = rnumber(1, 20) - 10;
        var zSlope = rnumber(1, 20) - 10;

        var desiredDist = rnumber(10, 20);

        for( var p = 0 ; p < total ; p++ ) {
            var tX = (rnumber(1, 50) - 25);
            var tZ = (rnumber(1, 50) - 25);
            var tY = (tX*xSlope + tZ*zSlope)/(zSlope > xSlope ? zSlope : xSlope);

            var dist = Math.sqrt( sq(tX) + sq(tY) + sq(tZ) );

            var cX = this.xO + tX*((this.starRadius/30 + desiredDist)/dist);
            var cY = this.yO + tY*((this.starRadius/30 + desiredDist)/dist);
            var cZ = this.zO + tZ*((this.starRadius/30 + desiredDist)/dist);

            this.planets.push({
                x: cX,
                y: cY,
                z: cZ,
                size: rnumber(Math.ceil(this.starRadius*0.005), Math.ceil(this.starRadius*0.05)),
                dist: Math.sqrt( sq(cX) + sq(cY) + sq(cZ) ),
                color: planetColors[rnumber(1, planetColors.length) - 1]
            });

            desiredDist *= 2;
        }

        this.planetCount = total;
    }

    this.sortByDistance = function() {
        for( var p = 0 ; p < this.planetCount ; p++ ) {
            var planet = this.planets[p];

            planet.dist = Math.sqrt( sq(planet.x) + sq(planet.y) + sq(planet.z) );
        }

        this.planets.sort(function(a, b){
            return b.dist - a.dist;
        });
    }
}

function generatePlanets(xO, yO, zO, radius) {
    var planets = new PlanetarySystem();

    planets.xO = xO;
    planets.yO = yO;
    planets.zO = zO;
    planets.starRadius = radius;

    planets.generate();

    return planets;
}

function rollCamera() {
    game.camera.roll[1] += game.camera.roll[0];
    game.camera.roll[1]  = JS_mod(game.camera.roll[1], 360);

    DOM.scene.canvas.css({
        '-moz-transform' : 'rotate(' + game.camera.roll[1] + 'deg)',
        '-webkit-transform' : 'rotate(' + game.camera.roll[1] + 'deg)',
        'transform' : 'rotate(' + game.camera.roll[1] + 'deg)'
    });
}

function rotateCelestialBodies() {
    var rALat = game.camera.aLat*degToRad;
    var sinRALat = Math.sin(rALat);
    var cosRALat = Math.cos(rALat);

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var star = starCluster.stars[s];

        var sY = star.y;
        var sZ = star.z;

        star.y = sY*cosRALat - sZ*sinRALat;
        star.z = sY*sinRALat + sZ*cosRALat;

        for( var p = 0 ; p < star.planets.planetCount ; p++ ) {
            var planet = star.planets.planets[p];

            var pY = planet.y;
            var pZ = planet.z;

            planet.y = pY*cosRALat - pZ*sinRALat;
            planet.z = pY*sinRALat + pZ*cosRALat;
        }
    }


    var rALon = -game.camera.aLon*degToRad;
    var sinRALon = Math.sin(rALon);
    var cosRALon = Math.cos(rALon);

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var star = starCluster.stars[s];

        var sX = star.x;
        var sZ = star.z;

        star.x = sX*cosRALon - sZ*sinRALon;
        star.z = sX*sinRALon + sZ*cosRALon;

        for( var p = 0 ; p < star.planets.planetCount ; p++ ) {
            var planet = star.planets.planets[p];

            var pX = planet.x;
            var pZ = planet.z;

            planet.x = pX*cosRALon - pZ*sinRALon;
            planet.z = pX*sinRALon + pZ*cosRALon;
        }
    }
}

function rotateShipVelocityVector() {
    var rALat = game.camera.aLat*degToRad;
    var sinRALat = Math.sin(rALat);
    var cosRALat = Math.cos(rALat);

    var vY = game.ship.velocity.y;
    var vZ = game.ship.velocity.z;

    game.ship.velocity.y = vY*cosRALat - vZ*sinRALat;
    game.ship.velocity.z = vY*sinRALat + vZ*cosRALat;

    var rALon = -game.camera.aLon*degToRad;
    var sinRALon = Math.sin(rALon);
    var cosRALon = Math.cos(rALon);

    var vX = game.ship.velocity.x;
    var vZ = game.ship.velocity.z;

    game.ship.velocity.x = vX*cosRALon - vZ*sinRALon;
    game.ship.velocity.z = vX*sinRALon + vZ*cosRALon;
}

function translateCelestialBodies() {
    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var star = starCluster.stars[s];

        star.x -= game.ship.velocity.x;
        star.y -= game.ship.velocity.y;
        star.z -= game.ship.velocity.z;

        for( var p = 0 ; p < star.planets.planetCount ; p++ ) {
            var planet = star.planets.planets[p];

            planet.x -= game.ship.velocity.x;
            planet.y -= game.ship.velocity.y;
            planet.z -= game.ship.velocity.z;
        }
    }
}

function updateOrientation() {
    var sinRoll = Math.sin(game.camera.roll[1]*degToRad);
    var cosRoll = Math.cos(game.camera.roll[1]*degToRad);

    if(keys.UP) {
        game.camera.aLat += game.ship.oAcceleration*cosRoll;
        game.camera.aLon -= game.ship.oAcceleration*sinRoll;
    }

    if(keys.DOWN) {
        game.camera.aLat -= game.ship.oAcceleration*cosRoll;
        game.camera.aLon += game.ship.oAcceleration*sinRoll;
    }

    if(keys.LEFT) {
        game.camera.aLon -= game.ship.oAcceleration*cosRoll;
        game.camera.aLat -= game.ship.oAcceleration*sinRoll;
    }

    if(keys.RIGHT) {
        game.camera.aLon += game.ship.oAcceleration*cosRoll;
        game.camera.aLat += game.ship.oAcceleration*sinRoll;
    }

    if(keys.A) {
        game.camera.roll[0] += game.ship.oAcceleration;
    }

    if(keys.D) {
        game.camera.roll[0] -= game.ship.oAcceleration;
    }

    rollCamera();
    rotateCelestialBodies();
    rotateShipVelocityVector();
}

function updateMovement() {
    if(keys.W) {
        // Accelerating forward
        game.ship.velocity.z += game.ship.mAcceleration;
    }

    if(keys.S) {
        // Accelerating backward
        game.ship.velocity.z -= game.ship.mAcceleration;
    }

    translateCelestialBodies();
}

function main() {
    updateOrientation();
    updateMovement();

    starCluster.logDistances();
    rerender();

    requestAnimationFrame(main);
}