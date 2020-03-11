/*
Description: jsPsych plugin for offering a 2AFC between two images, which are composited by p5.js.
Preferably load p5.min.js in the main experiment page (otherwise it will be downloaded from cdnjs.cloudflare.com)


TODO:
in main script, randomize side
- check what each diversity level actually translates into in harrison07
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
      agents: {
        type: jsPsych.plugins.parameterType.INT,
        default: 5,
        description: 'number of agents in each choice'
      },
      instructions: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'Which group\'s opinions would you trust more?',
        description: 'instructions, with each stage of the trial as a key. Stages = scenario, priorEstimate, tvStart, tvsOn, socInfoCheck, posteriorEstimate'
      },
      skin_colors: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        description: 'array of rgb vals for skin tones'
      },
      tv_background: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        description: 'RGB array for the color of the TV background'
      },
      tv_channels: {
        type: jsPsych.plugins.parameterType.STRING,
        array: true,
        description: 'File name for TV anchors'
      }
    }
  };

  plugin.trial = function(display_element, trial){

    /****
    ** Set up basic html for trial
    ****/
    console.log(trial)

    var choice_dims = {width: 300, height: 500};
    var outer_dims = {width: 700};
    var contrasts = jsPsych.randomization.shuffle(trial.contrasts);
    var sketches_complete = {0: false, 1: false};
    console.log(contrasts[0], '<--->', contrasts[1]);

    var css = '<style id="jspsych-2afc-p5-css">'+
    '.choice-container {display: inline-block; border: 3px solid #F2F2F2; position: relative; height: '+choice_dims.height+'px; width: '+choice_dims.width+'px}'+
    '.choice-container:hover {border: 3px solid #5FD8E7;}'+
    '#outer-container {width: '+outer_dims.width+'px; margin: auto;}'+
    '#instructions {width:  '+outer_dims.width+'px; margin: 5px auto 20px;}'+
    '.left {float: left;}'+
    '.right {float: right;}'+
    '</style>';

    var html = '<div id="task-container" style="visibility: hidden;"><div id="instructions" class="instructions">'+trial.instructions+'</div>'+
    '<div id="outer-container"><div id="choice_0" class="choice-container left"></div>'+
    '<div id="choice_1" class="choice-container right"></div></div></div>';

    display_element.innerHTML = css + html;

    /****
    ** Define trial variables
    ****/

    var sketches = [];
    var trial_data = {
      contrasts: contrasts
      // add agent/tv data
    };
    var start_time;
    var agent_count = trial.agents;
    var agent_ids = {0: [], 1: []};

    /****
    ** Generate agent ids
    ****/

    // first, pick a gender ratio, weighted to have higher likelihood of being more balanced
    var number_males = _.sample([0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5]);
    var number_females = trial.agents - number_males;
    // generate IDs for each gender, enough for 2 pannels
    var male_ids = _.sampleSize(_.range(0,15), number_males*2);
    var female_ids = _.sampleSize(_.range(0,15), number_females*2);
    // for each choice pannel, and for each gender, sample random IDs
    var choices = [0, 1];
    choices.forEach(function(choice){
      male_ids.slice(choice*number_males,(choice+1)*number_males).forEach(function(id){
          agent_ids[choice].push({gender: 'm', hair: id});
      });
      female_ids.slice(choice*number_females,(choice+1)*number_females).forEach(function(id){
        agent_ids[choice].push({gender: 'f', hair: id});
      });
    });


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

    function displayId(choice){
      // depending on the trial condition, create a dictionary with agent# as key and tv station ID as val
      var display_dict = {};
      var display_count = agent_count;
      var unique_channels = contrasts[choice];
      var keys = _.range(0,display_count);
      var keys_shuffled = jsPsych.randomization.shuffle(keys);
      var channels = _.range(0, unique_channels);
      for(i = 0; i < display_count - unique_channels; i++){
        channels.push(unique_channels-1);
      }
      var channels_shuffled = jsPsych.randomization.shuffle(channels);
      keys_shuffled.forEach(function(d, i){
        display_dict[d] = channels_shuffled[i];
      });
      return display_dict;
    }


/*
 P5.js sketch
*/
  function createSketch(choiceID){
    console.log('Creating ', choiceID);
    sketches[choiceID] = new p5(function( sketch ) {

      // declare sketch variables
      var displays = [];
      var agents = [];
      var tvs = [];
      var tvs_indexes = jsPsych.randomization.shuffle(_.range(trial.agents));
      var tv_channels = [];
      var agentParts = {m: {hair: {}}, f: {hair: {}}};
      var agentSize = 90;
      var topMargin = 10;

      var tvSize = {x: 110, y: 110};
      var display_dict = displayId(choiceID);

      var bodyColors = _.map(_.range(0, agent_count), function(i){
        return shirt_colors[5*choiceID+i];
      });
      var hairColors = [{r: 236, g: 236, b: 25}, {r: 160, g: 68, b: 11}, {r: 167, g: 113, b: 13},
          {r: 93, g: 51, b: 4}, {r: 39, g: 26, b: 11}];
      var headColors = [{r: 117, g: 60, b: 16}, {r: 220, g: 182, b: 83}, {r: 250, g: 235, b: 173},
          {r: 209, g: 160, b: 69}, {r: 124, g: 93, b: 35}];
      var legColors = [{r: 43, g: 107, b: 171}, {r: 114, g: 181, b: 249}, {r: 41, g: 83, b: 125},
          {r: 130, g: 150, b: 169}, {r: 194, g: 188, b: 175}];
      var feetColors = [{r: 0, g: 0, b: 0}, {r: 90, g: 63, b: 2}, {r: 204, g: 4, b: 4},
          {r: 164, g: 153, b: 169}, {r: 116, g: 87, b: 32}];
      bodyColors = _.shuffle(bodyColors);
      hairColors = _.shuffle(hairColors);
      headColors = _.shuffle(trial.skin_colors);
      legColors = _.shuffle(legColors);
      feetColors = _.shuffle(feetColors);

      // sketch classes

      function Agent(gender, hairNo, agentNumber){
        this.agentNumber = agentNumber;
        this.y = agentNumber*((choice_dims.height-topMargin)/agent_count) + topMargin;
        this.x = 10;

        this.body = agentParts[gender].body;
        this.head = agentParts[gender].head;
        this.hair = agentParts[gender].hair[hairNo];
        this.legs = agentParts[gender].legs;
        this.feet = agentParts[gender].feet;

        this.body.loadPixels();
        this.head.loadPixels();
        this.hair.loadPixels();
        this.legs.loadPixels();
        this.feet.loadPixels();

        this.show = function(){
            sketch.push();
              sketch.translate(this.x, this.y);
              sketch.push();
                sketch.tint(bodyColors[this.agentNumber][0], bodyColors[this.agentNumber][1], bodyColors[this.agentNumber][2]);
                sketch.image(this.body, 0, 0, agentSize, agentSize);
              sketch.pop();
              sketch.push();
                sketch.tint(headColors[this.agentNumber][0], headColors[this.agentNumber][1], headColors[this.agentNumber][2]);
                sketch.image(this.head, 0, 0, agentSize, agentSize);
              sketch.pop();
              sketch.push();
                sketch.tint(hairColors[this.agentNumber].r, hairColors[this.agentNumber].g, hairColors[this.agentNumber].b);
                sketch.image(this.hair, 0, 0, agentSize, agentSize);
              sketch.pop();
              sketch.push();
                sketch.tint(legColors[this.agentNumber].r, legColors[this.agentNumber].g, legColors[this.agentNumber].b);
                sketch.image(this.legs, 0, 0, agentSize, agentSize);
              sketch.pop();
              sketch.push();
                sketch.tint(feetColors[this.agentNumber].r, feetColors[this.agentNumber].g, feetColors[this.agentNumber].b);
                sketch.image(this.feet, 0, 0, agentSize, agentSize);
              sketch.pop();
            sketch.pop();
        };
      }

      function Display(agentNumber, channel){
        this.agentNumber = agentNumber;
        this.channel = channel;
        this.tv = tvs[tvs_indexes[agentNumber]];
        this.background_color = trial.tv_background[channel];
        this.y = agentNumber*((choice_dims.height-topMargin)/agent_count) + topMargin + 5;
        this.x = 140;
        this.jawOffset = 2;

        this.showChannel = function(){
          sketch.push();
            sketch.fill(this.background_color[0],this.background_color[1],this.background_color[2]);
            sketch.rect(9, 21, 93, 60);
            sketch.image(tv_channels[this.channel], 0, 0, tvSize.x, tvSize.y);
          sketch.pop();
        };

        this.displayTv = function(){
          sketch.push();
            sketch.translate(this.x, this.y);
            sketch.scale(0.8);
            sketch.image(this.tv, 0, 0, tvSize.x, tvSize.y);
            sketch.push();
            sketch.fill(255);
            this.showChannel();
            sketch.pop();
          sketch.pop();
        };
      }

      sketch.preload = function() {

        agentParts.f.body = sketch.loadImage('img/agents/f_body.png');
        agentParts.f.head = sketch.loadImage('img/agents/f_head.png');
        agentParts.f.feet = sketch.loadImage('img/agents/feet.png');
        agentParts.f.legs = sketch.loadImage('img/agents/f_legs.png');

        agentParts.m.body = sketch.loadImage('img/agents/m_body.png');
        agentParts.m.head = sketch.loadImage('img/agents/m_head.png');
        agentParts.m.feet = sketch.loadImage('img/agents/feet.png');
        agentParts.m.legs = sketch.loadImage('img/agents/m_legs.png');

        agent_ids[choiceID].forEach(function(d, i){
          var gender = d.gender;
          var hair = d.hair;
          var imgPath = 'img/agents/'+d.gender+'_hair_'+hair+'.png';
          agentParts[gender].hair[hair] = sketch.loadImage(imgPath);
          agents[i] = new Agent(gender, hair, i);
        });

        for(var j = 0; j<agent_count; j++){
          tvs[j] = sketch.loadImage('img/tv/tv_'+j+'.png');
        }

        for(var k = 0; k < trial.tv_channels.length; k++){
          var channel_id = trial.tv_channels[k];
          tv_channels[k] = sketch.loadImage('img/tv/'+channel_id+'.png');
        }
      };

      sketch.setup = function() {

        tv_channels.forEach(function(d,i){
          tv_channels[i].loadPixels();
        });

        agents.forEach(function(d,i){
          tvs[i].loadPixels();
          displays[i] = new Display(i, display_dict[i]);
        });

        var canvas = sketch.createCanvas(choice_dims.width, choice_dims.height);
        canvas.id("canvas_choice_"+choiceID);
        sketch.frameRate(10);
        sketch.background(255);
        displays.forEach(function(d,i){
          d.displayTv();
        });
        agents.forEach(function(d,i){
          d.show();
        });

        // check if both sketches are set up
        // if so, show then and start timer
        sketches_complete[choiceID] = true;
        if(sketches_complete[0] & sketches_complete[1]){
          $('#task-container').css('visibility', 'visible');
          start_time = Date.now();
        }

      };

    }, 'choice_'+choiceID);
  }

  //inputs
  $('.choice-container').on('click', function(e){
    var target = e.target.id;
    var choice = parseInt(target.charAt(target.length-1));
    trial_data.diversity = contrasts[choice];
    trial_data.target = target;
    trial_data.choice = choice;
    trial_data.rt = Date.now() - start_time;
    $('.choice-container').off();
    display_element.innerHTML = '';
    jsPsych.finishTrial(trial_data);
  });

};


return plugin;

})();
