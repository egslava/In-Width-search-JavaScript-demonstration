/**
 * Created by JetBrains WebStorm.
 * User: Slava
 * Date: 21.04.12
 * Time: 22:05
 * To change this template use File | Settings | File Templates.
 */

function LinearInterpolator(_domElement, _from, _to, _milliSeconds, _finishCallBack){
    var domElement = _domElement;
    var from = {x: _from.x, y: _from.y};
    var to = {x:_to.x, y:_to.y};
    var finishCallBack = _finishCallBack;

    var d = {x: (to.x - from.x) / ( _milliSeconds/(1000/CONFIG.ANIMATION_FPS) ),
             y: (to.y - from.y) / ( _milliSeconds/(1000/CONFIG.ANIMATION_FPS) )};

    domElement.style.top = (+from.y)+"%";
    domElement.style.left = (+from.x)+"%";
    var intervalObject = setInterval(interpolate, 1000 / CONFIG.ANIMATION_FPS);

    var step = 1;
    function interpolate (){
        domElement.style.top = (+from.y  + d.y*step)+"%";
        domElement.style.left = (+from.x + d.x*step)+"%";
        step += 1;
        if(step >= _milliSeconds/(1000/CONFIG.ANIMATION_FPS) ){
            stopAnimation();
        }
    };

    function stopAnimation(){
        clearInterval(intervalObject);
        domElement.style.top = (+to.y)+"%";
        domElement.style.left = (+to.x)+"%";
        finishCallBack();
    }

}