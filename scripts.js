/*function resizeWindow(){
	document.getElementById("display").style.width = (window.innerWidth-25)+'px';
	document.getElementById("display").style.height = (window.innerHeight-25)+'px';
}*/

//window.addEventListener("resize", resizeWindow);
//window.addEventListener("load", resizeWindow);

/*Class Field */

/* Debug error handler */
window.addEventListener('error', function (error){
	var msg = "";
	for (var i in error){
		msg += i+"="+error[i]+"\n";
	}
	alert(msg);
});

function Field(_width, _height, _fieldDivId){
	var that = this;

	var numCols = 0;
	var numRows = 0;
	var node = null;
	var field = [[]];
	var fieldBeforeAnimation = [[]];

    var initialState;

	(function Constructor(){
		if(typeof _width === "undefined")
			numCols = CONFIG.DEF_FIELD_WIDTH;
		else
			numCols = _width;

		if(typeof _height === "undefined")
			numRows = CONFIG.DEF_FIELD_HEIGHT;
		else
			numRows = _height;

		if (typeof _fieldDivId !== 'undefined')
			node = document.getElementById(_fieldDivId);

		if(node === null)
			throw "Can not find field with id == '"+_fieldDivId +"'";
		if(numCols < CONFIG.MIN_FIELD_WIDTH)
			throw "Width of field is less node" + CONFIG.MIN_FIELD_WIDTH;
		if(numRows < CONFIG.MIN_FIELD_HEIGHT)
			throw "Width of field is less than " + CONFIG.MIN_FIELD_HEIGHT;

		fill();
		create();

        initialState = new State();
        initialState.fill(field);

	})();

	function fill(){
		var i = 0;
		var j = 0;
		var counter = 0;

		for (i = 0; i < numRows; i++){
			for (j = 0; j < numCols; j++){
				counter ++;
				field[i].push(counter);
			}
			field.push([]);
		}

		field.pop();

		fieldBeforeAnimation = [];
		copyField(field, fieldBeforeAnimation);
	};

	function create(){

		/*Cell position is absolute. We need to calculate sizes and position
		 * relates to parent node by ourselves. Else, browser will calculate
		 * position and sizes relates to screen sizes */

		var percentWidth = node.clientWidth / node.parentElement.clientWidth * 100;
		var percentHeight = node.clientHeight / node.parentElement.clientHeight * 100;
		var elementWidth = ( percentWidth / numCols).toFixed() - 1;
		var elementHeight = (percentHeight / numRows).toFixed() - 1;
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numCols; j++){
				var p = document.createElement('P');
				p.style.width = elementWidth+"%";
				p.style.height = elementHeight+"%";
				p.style.top = elementHeight * i + "%";
				p.style.left = elementWidth * j + "%";
				p.appendChild(document.createTextNode(field[i][j].toString()));

				node.appendChild(p);
			}
		}

	}

	function copyField(srcField, destField){
        destField.length = 0;
		for(var i = 0; i < srcField.length; i++){
			destField.push(srcField[i].slice(0));
		}
	}
	function animate(oncomplete, fieldBefore, fieldAfter){
		if(typeof fieldBefore === 'undefined')
			fieldBefore = fieldBeforeAnimation;
		if(typeof fieldAfter === 'undefined')
			fieldAfter = field;

		var elementWidth = (node.clientWidth / node.parentElement.clientWidth * 100)/numCols;
		var elementHeight = (node.clientHeight / node.parentElement.clientHeight * 100) / numRows;

		for (var i = 0; i < fieldBefore.length; i++){
			for (var j = 0; j < fieldBefore[0].length; j++){

				var afterPos = (function findElement(element){

					for(var i = 0; i < fieldAfter.length; i++){
						var indexOf = fieldAfter[i].indexOf(element);
						if (indexOf != -1)
							return {i: i, j: indexOf};
					}
                    throw ("Can not find element "+ element);
				}(fieldBefore[i][j]));

				var domNode = (function findNode(element){

					for (var i = 0; i < node.children.length; i++){
						if(node.children[i].childNodes[0].nodeValue == element){
                            return node.children[i];
                        }

					}
                    throw ("Can not find domNode for element "+element);

				}(fieldBefore[i][j]));


				//var fromx = +domNode.style.left.replace("%","");
				//var fromy = +domNode.style.top.replace("%","");
                var fromx = elementWidth * j;
                var fromy = elementHeight * i;

				var tox = elementWidth * afterPos.j;
				var toy = elementHeight * afterPos.i;


                var counter = 0;
				new LinearInterpolator(domNode, {x: fromx, y: fromy}, {x: tox, y: toy}, CONFIG.ANIMATION_SPEED, function(){
                    counter ++;

                    if(counter >= fieldBefore.length * fieldBefore[0].length){
                        copyField(fieldAfter, fieldBefore);
                        if(typeof oncomplete !== "undefined")
                            oncomplete();
                    }

                });


			}
		}
	}
    this.randomize = function(){
        var lastAnimationSpeed = CONFIG.ANIMATION_SPEED;
        CONFIG.ANIMATION_SPEED = CONFIG.ANIMATION_SPEED / (field.length * field[0].length);

        if (Math.random() > (1.0 - 1.0 / (field.length * field[0].length) ) / 2 ){
            CONFIG.ANIMATION_SPEED = lastAnimationSpeed;
            return;
        }
        var i = Math.floor(Math.random() * (field.length-1));
        var j = Math.floor(Math.random() * (field[0].length-1));
        initialState.rotate(j, i, Math.random() > 0.5);
        copyField(initialState.state, field);
        animate(function(){
            that.randomize();
        })
        CONFIG.ANIMATION_SPEED = lastAnimationSpeed;


    }

    this.solve = function(){

        var finishState = initialState.generateFinishState();
        var closedStates = [];
        var openStates = [initialState];
        var indexOf = 0;
        while((indexOf = finishState.indexOf(openStates)) == -1){
            var state;
            var nextStates = [];
            for (var iState = 0; iState < openStates.length; iState ++){
                if(typeof openStates[iState] === "undefined")
                    continue;

                state = openStates[iState];

                //TODO: 1. state.generateChildrenStates should receive openStates,
                //TODO: it will increase performance, and we will can delete slow removeDoubles.
                nextStates = nextStates.concat(state.generateChildrenStates(openStates, closedStates));
                closedStates.push(state);
            }

            //State.removeDoubles(nextStates);
            openStates = nextStates;
        }

        console.log("Wow!");
    }
}
window.addEventListener("load", function(){

	gameField = new Field(CONFIG.DEF_FIELD_WIDTH, CONFIG.DEF_FIELD_HEIGHT, "field");

});
