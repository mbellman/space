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
    LEFT: false
}


// ---------------------------------------
// -------------- Handlers ---------------


// ---------------------------------------
// -------------- DOM --------------------
var DOM = {};

function cacheDOM() {
    DOM.starsImg = $('.stars')[0];

    DOM.stars = {
        prerender: {
            canvas: $('.star-bg.prerender'),
            ctx: $('.star-bg.prerender')[0].getContext('2d')
        },
        main: {
            canvas: $('.star-bg:not(.prerender)'),
            ctx: $('.star-bg:not(.prerender)')[0].getContext('2d')
        }
    }

    DOM.system = {
        prerender: {
            canvas: $('.system-fg.prerender'),
            ctx: $('.system-fg.prerender')[0].getContext('2d'),
        },
        main: {
            canvas: $('.system-fg:not(.prerender)'),
            ctx: $('.system-fg:not(.prerender)')[0].getContext('2d'),
        }
    }
}

$(document).ready(function(){
    cacheDOM();

    _stars = new Render('starBG', DOM.stars.prerender.ctx, DOM.stars.main.ctx, 600, 600, 'pincushion');

    $(window).keydown(function(e){
        if(e.which == 37) { keys.LEFT  = true; }
        if(e.which == 38) { keys.UP    = true; }
        if(e.which == 39) { keys.RIGHT = true; }
        if(e.which == 40) { keys.DOWN  = true; }

        e.preventDefault();
        return false;
    });

    $(window).keyup(function(e){
        if(e.which == 37) { keys.LEFT  = false; }
        if(e.which == 38) { keys.UP    = false; }
        if(e.which == 39) { keys.RIGHT = false; }
        if(e.which == 40) { keys.DOWN  = false; }

        e.preventDefault();
        return false;
    });

    game = new Game();
    game.loop = setInterval(main, 1000 / 60);
});