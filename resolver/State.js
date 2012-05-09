/**
 * Created by JetBrains WebStorm.
 * User: Slava
 * Date: 22.04.12
 * Time: 15:30
 * To change this template use File | Settings | File Templates.
 */
//TODO: cache heuristic mark
//TODO: make heuristic mark (slow, but more precise)

var finishStateCache = null;
function State(){
    var that = this;
    this.parentState = 0;
    this.state = [];
    this.distance = 0;      //distance from initial position in space of states
    this.mark = -1;

    this.fill = function (from){
        var i = 0;
        var j = 0;

        this.state = [];
        for (i = 0; i < from.length; i++){
            this.state.push(from[i].slice(0));
        }
    };

    this.getHeuristicMarkFast = function(finishState){
        var result = 0;
        for(var i = 0; i < finishState.state.length; i++ ){
            for(var j = 0; j < finishState.state[i].length; j++ ){
                if( this.state[i][j] != finishState.state[i][j] ){
                    result ++;
                }
            }
        }

        this.mark = result;
        return result;
    }

    this.getHeuristicMark = this.getHeuristicMarkFast;

    this.clone = function(from){
        this.fill(from.state);
        this.distance = from.distance;
        this.parentState = from.parentState;
    }

    this.equals = function(anotherState, withDistance){
        var i = 0;
        var j = 0;

        if(typeof anotherState === "undefined")
            return false;
        if(typeof withDistance === "undefined")
            withDistance = false;

        var nRows = anotherState.state.length;
        for(i = 0; i < nRows; i++){

            var nColumns = anotherState.state[i].length;


            //if(anotherState.state[i].toString() != this.state[i].toString())
                //return false;
            for(j = 0; j < nColumns; j++){
                if(anotherState.state[i][j] != this.state[i][j])
                    return false;

                if(withDistance)
                    if(anotherState.distance != this.distance)
                        return false;
            }
        }
        return true;
    };

    this.indexOf = function(arrayOfStates, withDistance){
        //return arrayOfStates.indexOf(this);   fail

        var i = 0;
        for(i; i < arrayOfStates.length; i++){
            if(typeof arrayOfStates[i] === "undefined")
                continue;
            if(arrayOfStates[i].equals(this, withDistance))
                return i;
        }
        return -1;
    }
    /*
     * x, y - coordinate of top-left corner
     * CW - true - CW, false - CCW
     */
    this.rotate = function (x, y, CW){
        if(x >= this.state[0].length - 1)
            throw("x is too big: "+ x);
        if(y >= this.state.length - 1)
            throw("y is too big: "+ y);

        var temp = this.state[y][x];
        if (CW){
            this.state[y][x] = this.state[y+1][x];
            this.state[y+1][x] = this.state[y+1][x+1];
            this.state[y+1][x+1] = this.state[y][x+1];
            this.state[y][x+1] = temp;
        } else{
            this.state[y][x] = this.state[y][x+1];
            this.state[y][x+1] = this.state[y+1][x+1];
            this.state[y+1][x+1] = this.state[y+1][x];
            this.state[y+1][x] = temp;
        }
    }

    /**
     * @param forbiddenStates = [State, State, State, ...]*/
    this.generateChildrenStates = function(nextStates, openStates, forbiddenStates){
        if(typeof forbiddenStates === undefined)
            throw "generateChildrenStates must have parameter";
        var i = 0;
        var j = 0;

        var currentVariant;
        var result = [];
        for(i = 0; i < that.state.length-1; i++){
            for(j = 0; j < that.state[0].length-1; j++){
                function addCombination(cw){
                    currentVariant = new State();
                    currentVariant.clone(that);
                    currentVariant.distance += 1;
                    currentVariant.parentState = that;
                    currentVariant.rotate(j, i, cw);

                    //in open state, then abort
                    var indexOf = currentVariant.indexOf(forbiddenStates, false);
                    if(indexOf != -1)   return;
                    if(currentVariant.indexOf (nextStates, false) != -1){
                        return;
                    }
                    if(currentVariant.indexOf (openStates, false) != -1){
                        return;
                    }
                    var indexOf = currentVariant.indexOf(forbiddenStates, false);
                    if(indexOf == -1)
                        result.push(currentVariant);
                    else{
                        /*if(forbiddenStates[indexOf].distance > currentVariant.distance){
                            delete forbiddenStates[indexOf];
                            forbiddenStates[indexOf] = forbiddenStates[forbiddenStates.length - 1];
                            forbiddenStates.length--;
                            result.push(currentVariant);
                        } Only in second lab*/
                    }
                };
                addCombination(true);
                addCombination(false);
            }
        }
        return result;
    }

    this.generateFinishState = function(){
        //Generating finish state
        if(finishStateCache != null)
            return finishStateCache;
        var finishState = new State();
        var finishStateArray = [];

        var iFieldValue = 1;
        for(var i = 0; i < this.state.length; i++){
            finishStateArray.push([]);
            for(var j = 0; j < this.state[0].length; j++){
                finishStateArray[i].push(iFieldValue);
                iFieldValue ++;
            }
        }
        finishState.fill(finishStateArray);
        return finishState;
    }
}

State.compareMarks = function(stateA, stateB){
    var markA = stateA.distance + stateA.getHeuristicMark(finishStateCache);
    var markB = stateB.distance + stateB.getHeuristicMark(finishStateCache);
    if(markA == markB) return 0;
    return (markA > markB? -1: 1);
}

State.removeDoubles = function(states){
    for(var i = 0; i < states.length; i ++){
        if(typeof states[i] === "undefined")
            continue;

        for(var j = i+1; j < states.length; j++){

            if(typeof states[i] === "undefined")
                continue;
            if(typeof states[j] === "undefined")
                continue;

            if(states[i].equals(states[j])){
                if(states[i].distance > states[j].distance ){
                    states[i] = states[states.length-1];
                }else{
                    states[j] = states[states.length-1];
                }
                states.length--;
            }
        }
    }

}