var game;

var Game = function() {
    this.loop;

    this.ship = {
        x: 0,
        y: 0,
        z: 0,
        azimuth: [0, 0],
        altitude: [0, 0],
        roll: 0,

        oAcceleration: 0.025,    // Orientation acceleration (orientation thruster power)
        mAcceleration: 0.025,    // Movement acceleration (main thruster power)

        acceleration: 0,
        velocity: 0
    }
}

function updateOrientation() {
    if(keys.UP) {
        game.ship.altitude[0] += game.ship.oAcceleration;
    }

    if(keys.DOWN) {
        game.ship.altitude[0] -= game.ship.oAcceleration;
    }

    if(keys.LEFT) {
        game.ship.azimuth[0] += game.ship.oAcceleration;
    }

    if(keys.RIGHT) {
        game.ship.azimuth[0] -= game.ship.oAcceleration;
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