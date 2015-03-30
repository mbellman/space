// ---------------------------------------
// -------------- Variables --------------

var mouse = {
    x: 0,
    y: 0
}

var keys = {
    UP: false,
    RIGHT: false,
    DOWN: false,
    LEFT: false,
    W: false,
    A: false,
    S: false,
    D: false
}

var degToRad = Math.PI / 180;

// ---------------------------------------
// -------------- Handlers ---------------


// ---------------------------------------
// -------------- DOM --------------------
var DOM = {};

function cacheDOM() {
    DOM.starsImg = $('.stars')[0];

    DOM.prerender = {
        canvas: $('.scene.prerender'),
        ctx:    $('.scene.prerender')[0].getContext('2d')
    }

    DOM.scene = {
        canvas: $('.scene:not(.prerender)'),
        ctx:    $('.scene:not(.prerender)')[0].getContext('2d')
    }
}

$(document).ready(function(){
    cacheDOM();

    _scene = new Render('starBG', DOM.prerender.ctx, DOM.scene.ctx, 600, 600, 'pincushion');

    $(window).keydown(function(e){
        if(e.which == 37) keys.LEFT  = true;
        if(e.which == 38) keys.UP    = true;
        if(e.which == 39) keys.RIGHT = true;
        if(e.which == 40) keys.DOWN  = true;
        if(e.which == 87) keys.W     = true;
        if(e.which == 65) keys.A     = true;
        if(e.which == 83) keys.S     = true;
        if(e.which == 68) keys.D     = true;

        e.preventDefault();
        return false;
    });

    $(window).keyup(function(e){
        if(e.which == 37) keys.LEFT  = false;
        if(e.which == 38) keys.UP    = false;
        if(e.which == 39) keys.RIGHT = false;
        if(e.which == 40) keys.DOWN  = false;
        if(e.which == 87) keys.W     = false;
        if(e.which == 65) keys.A     = false; 
        if(e.which == 83) keys.S     = false;
        if(e.which == 68) keys.D     = false;

        e.preventDefault();
        return false;
    });

    game         = new Game();

    starCluster  = new starCluster();
    planetSystem = new PlanetarySystem();

    starCluster.generate();
    planetSystem.generate();
    
    game.loop = setInterval(main, 1000 / 60);
});