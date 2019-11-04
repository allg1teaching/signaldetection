// jspsych-SDT

jsPsych.plugins["allg1-sdt"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "allg1-sdt",
        parameters: {
            n_dots: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Number of dots",
                description: "The number of dots that will be displayed in this trial"
            },

            contains_signal: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: "Contains signal",
                description: "Indicates whether this trial contains a signal or not"
            },

            key_choices: {  // key_choices[0] -> no signal, key_choices[1] -> signal
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Valid keycodes",
                default: [65, 83],
                description: "Keycodes of valid keypresses for this trial"
            },

            dot_radius: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Dot radius",
                default: 3,
                description: "The radius of dots in pixels"
            },

            dot_colour: {
                type: jsPsych.plugins.parameterType.STRING,
                prety_name: "Dot colour",
                default: "white",
                description: "Default colour of dots"
            },

            background_colour: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: "Background colour",
                default: "black",
                description: "Background colour for the canvas"
            },

            dot_radius_signal: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "DEBUG: Signal dot radius",
                default: 3,
                description: "DEBUG: Set radius of signal dots"
            },

            signal_custom_radius: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: "DEBUG: Custom radius for signal dots",
                default: false,
                description: "DEBUG: Enable custom radius for signal dots, as specified in dot_radius_signal"
            },

            is_practice: {
                type: jsPsych.plugins.parameterType.INT,
                default: 0
            }
        }
    }

    plugin.trial = function(display_element, trial) {

        display_element.innerHTML='';

        // SET UP PARAMETERS

        // SET VARIABLES FOR USE IN THE PROGRAM
        // parameters that are handed to the current trial
        var dot_radius = trial.dot_radius;
        var dot_radius_signal = dot_radius;
        var dot_colour = trial.dot_colour;
        var background_colour = trial.background_colour;
        var n_dots = trial.n_dots;
        var contains_signal = trial.contains_signal;
        var key_choices = trial.key_choices;
        // only used for debugging:
        var signal_custom_radius = trial.signal_custom_radius;

/*
        // the radius of signal dots can be altered for debugging purposes
        // to do so, set these parameters when creating a new trial:
                signal_custom_radius: true
                dot_radius_signal: r (r px)

        if (signal_custom_radius) {
            dot_radius_signal = trial.dot_radius_signal;
        }
*/

        // this parameter is not handed to the trial
        var backgroundColor = trial.background_color; /*not used?*/

        // SET UP HTML CANVAS

        var canvas = document.createElement("canvas");
        display_element.appendChild(canvas);

        // grab html body element to get/set values
        var body = document.getElementsByClassName("jspsych-display-element")[0];

        // get body settings
        var oldMargin = body.style.margin;
        var oldPadding = body.style.padding;
        var oldBackgroundColour = body.style.backgroundColor;
        // set body settings
        body.style.margin = 0;
        body.style.padding = 0;

        // canvas styling
        canvas.style.margin = 0;
        canvas.style.padding = 0;

        // do the following 2 lines do anything?
        canvas.top = 0;
        canvas.left = 0;

        canvas.style.backgroundColor = background_colour;

        // get HTML canvas context. all draw events will take place inside of that context
        var ctx = canvas.getContext("2d");

        // maximize canvas size
        // factor 0.95 will slightly reduce the canvas size but prevent scroll bars from showing up
        // factor 0.93 because the scroll bar takes away a tiny part of the screen
        var canvasWidth = canvas.width = 0.95*(window.innerWidth);
        var canvasHeight = canvas.height = 0.93*(window.innerHeight);

        // signal x/y offset
        var xOffset, yOffset;
        xOffset = canvasWidth / 25 // 60;
        yOffset = canvasHeight / 25 // 33;

        // FUNCTION CALLING/INITIALIZATION START

        if (contains_signal) {
            // start positions for signal are initialized here for namespace reasons

            /* old:
            var signalStartX = Math.max((Math.floor((Math.random()*canvasWidth)-600)),5);
            var signalStartY = Math.max((Math.floor((Math.random()*canvasHeight)-330)),5);


            the following way is preferred because it lowers the chance of signals starting
            at (5,y) or (x,5) when using the max(s,5) method above
            using modulo, more signals will start in the range [0-600] for x, [0-330] for y,
            but this workaround is not as bad as the max(s,5) approach
            */

            var signalStartX = (Math.floor((Math.random()*canvasWidth))) % (canvasWidth - 11 * xOffset);
            var signalStartY = (Math.floor((Math.random()*canvasHeight))) % (canvasHeight - 11 * yOffset);

            // 10 dot slots are reserved for the signal
            n_dots += -10;

            drawSignal();
            // draw the 10 signal dots
        }

        var trial_data = {};

        drawDotArray();  // draw dots on the screen

        keyListener();  // wait for keyboard response

        // FUNCTION CALLING/INITIALIZATION END

        // FUNCTIONS

        // test function : draw a single dot
        function drawSingleDot(){
            ctx.beginPath();
            ctx.arc(200,200,dot_radius,0,Math.PI*2);
            ctx.fillStyle = dot_colour;
            ctx.fill();
            return;
        }

        // generates and returns an array containing n_dots (param) dot objects
        // each dot object has 2 attributes: posX, posY
        function generateNDotArray(){
            var array = [];

            for (var i = 0; i < n_dots; i++) {
                // generate specified amount of dots

                // generate random position
                var posX = Math.floor((Math.random()*canvasWidth)+1)
                var posY = Math.floor((Math.random()*canvasHeight)+1)
                // math.random generates a pseudorandom number in the range [0,1]

                // new dot object
                var dot = {
                    x: posX,
                    y: posY
                }

                array.push(dot);
                // add dot to array
            }
            return array;
        }

        function drawDotArray(){
            var a = generateNDotArray();
            for  (var i = 0; i < n_dots; i++) {
                // draw one dot at a time

                var currentDot = a[i];

                ctx.beginPath();
                ctx.arc(currentDot.x,currentDot.y,dot_radius,0,Math.PI*2);
                // draw dot with specified radius
                ctx.fillStyle = dot_colour;
                ctx.fill();

            }
            return;
        }

        function drawSignal(){
            // ~150 deg angle, 10 dots
            var posX, posY;
            // this x/y offset creates a line of dots at a 150deg angle

            // keep the distance between dots fixed or scale with screen size?
            // since (hopefully) nobody will try this on their phone anyways
            //      ~> to do: scale distance between signal dots to increase compatability

            posX = signalStartX;
            posY = signalStartY;

            for (var i = 0; i < 10; i++){

                ctx.beginPath();
                ctx.arc(posX, posY, dot_radius_signal, 0, Math.PI*2);
                ctx.fillStyle = dot_colour;
                ctx.fill()

                // adjust offset for next dot
                posX += xOffset;
                posY += yOffset;

            }
        }

        function keyListener(){

            if (key_choices != jsPsych.NO_KEYS){
                // check whether key_choices are valid keycodes

                listener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: checkResponse,
                    // when valid key is pressed, result is checked
                    valid_responses: key_choices,
                    persist: false,
                    allow_held_key: false
                });
            }
        }

        function checkResponse(info){
           // handle keyboard event

           trial_data["key"] = info.key;
           trial_data["is_practice"] = trial.is_practice;

            if (contains_signal) {

                // draw line along signal
                ctx.beginPath();
                ctx.moveTo(signalStartX-xOffset,signalStartY-yOffset);
                ctx.lineTo(signalStartX+11*xOffset,signalStartY+11*yOffset);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "green";
                ctx.stroke();

                // check response
                if (info.key == key_choices[0]) {
                    // key_choices[1] is the correct key when there is a signal
                    feedback(true);
                    // log result
                }
                else {
                    feedback(false);
                    // log result
                }
            }
            else {
                // doesn't contain a signal
                if (info.key == key_choices[1]) {
                    feedback(true);
                    // log result
                }
                else {
                    feedback(false);
                    // log result
                }
            }
        }

        function feedback(positive){
            // user feedback

            ctx.font = '30pt Arial';
            ctx.textAlign="center";
            if (positive) {
                ctx.fillStyle = "green";
                ctx.fillText("Correct", canvasWidth/2, canvasHeight/2);
            }
            else {
                ctx.fillStyle = "red";
                ctx.fillText("Incorrect", canvasWidth/2, canvasHeight/2);
            }
            end_trial(positive);
        }

        function end_trial(correct_response){
            // return data and end trial

            jsPsych.pluginAPI.cancelKeyboardResponse(keyListener);

            trial_data["correct_response"] = correct_response;
                // the rest of the trial data is handed over to the trial at creation

            jsPsych.pluginAPI.setTimeout(() => {
                display_element.removeChild(canvas);
                jsPsych.finishTrial(trial_data);    
            }, 500);
        }

    }; // END OF TRIAL

    return plugin;

})(); // END OF FILE
