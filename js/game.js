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
        aLon: 0,     // Longitudinal acceleration
        aLat: 0,     // Latitudinal acceleration
        roll: 0
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

    this.generate = function() {
        for( var s = 0 ; s < this.starCount ; s++ ) {
            this.stars.push({
                x: rnumber(1000, 10000) - 5500,
                y: rnumber(1000, 10000) - 5500,
                z: rnumber(1000, 10000) - 5500,
                temp: rnumber(3000, 15000),
                size: rnumber(200, 300)
            });
        }
    }
}

var PlanetarySystem = function() {
    this.planets = [];
    this.planetCount = 0;

    this.generate = function() {
        for( var p = 0 ; p < 100 ; p++ ) {
            this.planets.push({
                x: rnumber(10, 100) - 55,
                y: rnumber(10, 100) - 55,
                z: rnumber(10, 100) - 55,
                color: '#F0F',
                size: rnumber(20, 30)
            });
        }

        this.planetCount = this.planets.length;
    }
}

function rotateCelestialBodies() {
    var rALat = game.camera.aLat*degToRad;
    var sinRALat = Math.sin(rALat);
    var cosRALat = Math.cos(rALat);

    for( var p = 0 ; p < planetSystem.planetCount ; p++ ) {
        var pY = planetSystem.planets[p].y;
        var pZ = planetSystem.planets[p].z;

        planetSystem.planets[p].y = pY*cosRALat - pZ*sinRALat;
        planetSystem.planets[p].z = pY*sinRALat + pZ*cosRALat;
    }

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var sY = starCluster.stars[s].y;
        var sZ = starCluster.stars[s].z;

        starCluster.stars[s].y = sY*cosRALat - sZ*sinRALat;
        starCluster.stars[s].z = sY*sinRALat + sZ*cosRALat;
    }


    var rALon = -game.camera.aLon*degToRad;
    var sinRALon = Math.sin(rALon);
    var cosRALon = Math.cos(rALon);

    for( var p = 0 ; p < planetSystem.planetCount ; p++ ) {
        var pX = planetSystem.planets[p].x;
        var pZ = planetSystem.planets[p].z;

        planetSystem.planets[p].x = pX*cosRALon - pZ*sinRALon;
        planetSystem.planets[p].z = pX*sinRALon + pZ*cosRALon;
    }

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        var sX = starCluster.stars[s].x;
        var sZ = starCluster.stars[s].z;

        starCluster.stars[s].x = sX*cosRALon - sZ*sinRALon;
        starCluster.stars[s].z = sX*sinRALon + sZ*cosRALon;
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
    for( var p = 0 ; p < planetSystem.planetCount ; p++ ) {
        planetSystem.planets[p].x -= game.ship.velocity.x;
        planetSystem.planets[p].y -= game.ship.velocity.y;
        planetSystem.planets[p].z -= game.ship.velocity.z;
    }

    for( var s = 0 ; s < starCluster.starCount ; s++ ) {
        starCluster.stars[s].x -= game.ship.velocity.x;
        starCluster.stars[s].y -= game.ship.velocity.y;
        starCluster.stars[s].z -= game.ship.velocity.z;
    }
}

function updateOrientation() {
    if(keys.UP) {
        game.camera.aLat += game.ship.oAcceleration;
    }

    if(keys.DOWN) {
        game.camera.aLat -= game.ship.oAcceleration;
    }

    if(keys.LEFT) {
        game.camera.aLon -= game.ship.oAcceleration;
    }

    if(keys.RIGHT) {
        game.camera.aLon += game.ship.oAcceleration;
    }

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

    rerender();

    requestAnimationFrame(main);
}