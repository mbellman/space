var game;
var planetSystem;

var Game = function() {
    this.loop;

    this.ship = {

        // [change rate, current value]
        x:        [0, 0],
        y:        [0, 0],
        z:        [0, 0],
        azimuth:  [0, 0],
        altitude: [0, 0],
        roll:     [0, 0],

        oAcceleration: 0.025,    // Orientation acceleration (orientation thruster power)
        mAcceleration: 0.025,    // Movement acceleration (main thruster power)

        acceleration: 0,
        velocity: 0
    }
}

var PlanetarySystem = function() {
    this.planets = [
        {
            azimuth: 70,
            altitude: 70,
            color: '#0A0'
        },
        {
            azimuth: 80,
            altitude: 80,
            color: '#F00'
        },
        {
            azimuth: 60,
            altitude: 60,
            color: '#FFF'
        },
        {
            azimuth: 85,
            altitude: 85,
            color: '#F0F'
        }
    ];

    this.planetCount = 4;
}

function checkOrientationAcceleration() {
    if(keys.A) { game.ship.roll[0] += game.ship.oAcceleration; }
    if(keys.D) { game.ship.roll[0] -= game.ship.oAcceleration; }

    var cosRoll   = Math.cos(degToRad * game.ship.roll[1]);
    var sinRoll   = Math.sin(degToRad * game.ship.roll[1]);

    if(keys.UP) {
        game.ship.altitude[0] += game.ship.oAcceleration * cosRoll;
        game.ship.azimuth[0]  += game.ship.oAcceleration * sinRoll;
    }

    if(keys.DOWN) {
        game.ship.altitude[0] -= game.ship.oAcceleration * cosRoll;
        game.ship.azimuth[0]  -= game.ship.oAcceleration * sinRoll;
    }

    if(keys.LEFT) {
        game.ship.azimuth[0]  += game.ship.oAcceleration * cosRoll;
        game.ship.altitude[0] -= game.ship.oAcceleration * sinRoll;
    }

    if(keys.RIGHT) {
        game.ship.azimuth[0]  -= game.ship.oAcceleration * cosRoll;
        game.ship.altitude[0] += game.ship.oAcceleration * sinRoll;
    }
}

function updateOrientation() {
    checkOrientationAcceleration();

    game.ship.azimuth[1]  += game.ship.azimuth[0];
    game.ship.altitude[1] += game.ship.altitude[0];
    game.ship.roll[1]     += game.ship.roll[0];

    game.ship.azimuth[1]  = JS_mod(game.ship.azimuth[1], 360);
    game.ship.altitude[1] = JS_mod(game.ship.altitude[1], 360);
    game.ship.roll[1]     = JS_mod(game.ship.roll[1], 360);
}

function checkMovementAcceleration() {
    var cosAz = Math.cos(degToRad * game.ship.azimuth[1]);
    var sinAz = Math.sin(degToRad * game.ship.azimuth[1]);

    var cosAl = Math.cos(degToRad * game.ship.altitude[1]);
    var sinAl = Math.sin(degToRad * game.ship.altitude[1]);

    if(keys.W) {
        // Accelerating forward
        game.ship.x[0] += game.ship.mAcceleration * (sinAl - sinAl);
        game.ship.z[0] += game.ship.mAcceleration * (cozAz - sinAl);
    }

    if(keys.S) {
        // Accelerating backward
        game.ship.z[0] -= game.ship.mAcceleration;
    }
}

function updateMovement() {
    checkMovementAcceleration();

    game.ship.x[1] += game.ship.x[0];
    game.ship.x[1] += game.ship.x[0];
    game.ship.x[1] += game.ship.x[0];
}

function main() {
    updateOrientation();
    rerender();

    //$('.console').html('Altitude: ' + game.ship.altitude[1] + '<br />Azimuth: ' + game.ship.azimuth[1]);
}