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
            canvas: $('.star-bg.prerender')[0],
            ctx: $('.star-bg.prerender')[0].getContext('2d')
        },
        main: {
            canvas: $('.star-bg:not(.prerender)')[0],
            ctx: $('.star-bg:not(.prerender)')[0].getContext('2d')
        }
    }

    DOM.system = {
        prerender: {
            canvas: $('.system-fg.prerender')[0],
            ctx: $('.system-fg.prerender')[0].getContext('2d'),
        },
        main: {
            canvas: $('.system-fg:not(.prerender)')[0],
            ctx: $('.system-fg:not(.prerender)')[0].getContext('2d'),
        }
    }
}

$(document).ready(function(){
    cacheDOM();

    initRenderLoop();

    $(window).mousemove(function(e){

        DOM.stars.prerender.ctx.clearRect(0, 0, 500, 500);

        var originX = e.clientX % 500;
        var originY = e.clientY % 500;

        for(var i = 0 ; i < 2 ; i++) {
            for(var j = 0 ; j < 2 ; j++) {
                DOM.stars.prerender.ctx.drawImage(DOM.starsImg, originX - ((1 - i) * 500), originY - ((1-j) * 500), 500, 500);
            }
        }
    });
});