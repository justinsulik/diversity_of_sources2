/*
Description: jsPsych plugin for offering a 2AFC between two images, which are composited by p5.js.
Preferably load p5.min.js in the main experiment page (otherwise it will be downloaded from cdnjs.cloudflare.com)
*/

jsPsych.plugins['2afc-p5'] = (function(){

  var plugin = {};

  plugin.info = {
    name: '2afc-p5',
    parameters: {
      contrasts: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Contrasts',
        default: [5,3],
        array: true,
        description: 'Array of length 2, each INT represents how many different channels should be displayed for each option.'
      },
      agent_ids: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: [{gender: 'm', hair: 0}, {gender: 'm', hair: 1}, {gender: 'f', hair: 0}, {gender: 'f', hair: 1}, {gender: 'f', hair: 2}],
        array: true,
        description: 'IDs of agents'
      },
      channel_ids: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        default: [0, 1, 2, 3, 4],
        description: 'Which channel IDs to use (shuffle in main expt script)'
      },
      instructions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        default: {scenario: 'blah'},
        description: 'instructions, with each stage of the trial as a key. Stages = scenario, priorEstimate, tvStart, tvsOn, socInfoCheck, posteriorEstimate'
      },
    }
  };

  plugin.trial = function(display_element, trial){

    // set up basic html for trial
    var choice_dims = {width: 300, height: 500};
    var outer_dims = {width: 700};

    var css = '<style id="jspsych-2afc-p5-css">'+
    '.choice-container {display: inline-block; border: 1px solid grey; position: relative; height: '+choice_dims.height+'px; width: '+choice_dims.width+'px}'+
    '.choice-container:hover {border: 1px solid black;}'+
    '#outer-container {width: '+outer_dims.width+'px; margin: auto;}'+
    '#instructions {width:  '+outer_dims.width+'px; margin: auto;}'+
    '.left {float: left;}'+
    '.right {float: right;}'+
    '</style>';

    var html = '<div id="task-container"><div id="instructions" class="instructions">blah</div>'+
    '<div id="outer-container"><div id="choice0" class="choice-container left"></div>'+
    '<div id="choice1" class="choice-container right"></div></div></div>';

    display_element.innerHTML = css + html;

    // trial variables

    var sketches = [];
    var trial_data = {checks: {}, attn_check_misses: 0, rt: {}};
    var displays;
    var agents;
    var start_time;

    // check if p5 script is loaded; create sketches

    if (window.p5){
        console.log('p5 already loaded...');
        createSketch(0);
        createSketch(1);
    } else {
      $.ajax({
          url: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.16/p5.min.js",
          dataType: "script",
          success: function() {
            console.log("p5 downloaded...");
            createSketch(0);
            createSketch(1);
          }
      });
    }

    // trial functions

/*
 P5.js sketch
*/
  function createSketch(choiceID){
    console.log('Creating ', choiceID);
    sketches[choiceID] = new p5(function( sketch ) {

      // set global vars
      displays = [];
      thoughts = [];
      agents = [];

      // declare sketch variables
      var tvs = [];
      var backgrounds = [];
      var jaws = [];

      sketch.setup = function() {
        console.log(choice_dims)
        sketch.createCanvas(choice_dims.width, choice_dims.height);
        sketch.frameRate(10);
        sketch.background(0);
      };

      sketch.draw = function(){
        sketch.background(100);
      }

    }, 'choice'+choiceID);
  }

console.log(sketches)
};


return plugin;

})();
