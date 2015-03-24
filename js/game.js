var game;
var planetSystem;

var Game = function() {
    this.loop;

    this.ship = {
        x: 0,
        y: 0,
        z: 0,
        azimuth: [0, 0],
        altitude: [0, 0],
        roll: [0, 0],

        oAcceleration: 0.025,    // Orientation acceleration (orientation thruster power)
        mAcceleration: 0.025,    // Movement acceleration (main thruster power)

        acceleration: 0,
        velocity: 0
    }
}

var PlanetarySystem = function() {
    this.planets = [
        {
            azimuth: 150,
            altitude: 40,
            color: '#0A0'
        },
        {
            azimuth: 41,
            altitude: 200,
            color: '#00A'
        },
        {
            azimuth: 365,
            altitude: 0,
            color: '#A00'
        },
        {
            azimuth: 180,
            altitude: 180,
            color: '#A0A'
        }
    ];

    this.planetCount = 4;
}

function updateOrientation() {
    if(keys.A) { game.ship.roll[0] += game.ship.oAcceleration; }
    if(keys.D) { game.ship.roll[0] -= game.ship.oAcceleration; }

    var mapFactor = Math.PI / 180;
    var cosRoll   = Math.cos(mapFactor * game.ship.roll[1]);
    var sinRoll   = Math.sin(mapFactor * game.ship.roll[1]);

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

    game.ship.azimuth[1]  += game.ship.azimuth[0];
    game.ship.altitude[1] += game.ship.altitude[0];
    game.ship.roll[1]     += game.ship.roll[0];

    game.ship.azimuth[1]  = JS_mod(game.ship.azimuth[1], 360);
    game.ship.altitude[1] = JS_mod(game.ship.altitude[1], 360);
    game.ship.roll[1]     = JS_mod(game.ship.roll[1], 360);
}

function main() {
    updateOrientation();
    rerender();
}