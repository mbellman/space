// ---------------------------------------
// -------------- Variables --------------


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

    initRenderLoop();

    $(window).mousemove(function(e){

        DOM.stars.prerender.ctx.clearRect(0, 0, 500, 500);

        var ratio = 500 / DOM.stars.main.canvas.width();

        var originX = Math.floor(e.clientX * ratio) % 500;
        var originY = Math.floor(e.clientY * ratio) % 500;

        for(var i = 0 ; i < 2 ; i++) {
            for(var j = 0 ; j < 2 ; j++) {
                DOM.stars.prerender.ctx.drawImage(DOM.starsImg, originX - ((1 - i) * 500), originY - ((1-j) * 500), 500, 500);
            }
        }
    });
});