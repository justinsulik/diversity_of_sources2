/*
 * Plugin for collecting common demographic variables
 * If adding any more, ensure that the relevant input tag has class="jspsych-demographics answer"
 */

jsPsych.plugins["demographics"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "demographics",
    parameters: {
      age: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: true,
        description: "Whether to include age"
      },
      gender: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: true,
        description: "Whether to include gender"
      },
      education: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: true,
        description: "Whether to include education"
      },
      english: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: true,
        description: "Whether to include English skill"
      },
      honesty: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: true,
        description: "Whether to include honesty"
      },
      religion: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: false,
        description: "Whether to include religion"
      },
      vision: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: false,
        description: "Whether to include vision"
      },
      comments: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: true,
        description: "Whether to invite comments"
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Finally, some questions about you and your experience in this study.",
        description: "Preamble for the page"
      },
      force_response: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'invite',
        description: "If 'force', force responses; if 'invite', just alert asking for responses; otherwise no checking."
      }
    }
  };

  plugin.trial = function(display_element, trial) {

    // data saving
    var trial_data = {};

    // html + css

    var css = '<style>';
     css += '.jspsych-demographics {text-align: left;}';
     css += '</style>';

    var html = '<div id="preamble">'+trial.preamble+'</div>';

    var age = '<div id="age" class="jspsych-demographics">'+
                '<p><b>Age:</b></p>'+
                '<input type="text" name="age" class="jspsych-demographics answer text">'+
              '</div>';

    var gender = '<div id="gender" class="jspsych-demographics">'+
                    '<p><b>Gender:</b></p>'+
                    '<label class="jspsych-survey-likert-opt-label">'+
                      '<input type="radio" name="gender" value="male" class="jspsych-demographics answer radio"> Man<br>'+
                    '</label>'+
                    '<label class="jspsych-survey-likert-opt-label">'+
                      '<input type="radio" name="gender" value="female" class="jspsych-demographics answer radio"> Woman<br>'+
                    '</label>'+
                    '<label class="jspsych-survey-likert-opt-label">'+
                      '<input type="radio" name="gender" value="na" class="jspsych-demographics answer radio"> Prefer not to say<br>'+
                    '</label>'+
                    '<label class="jspsych-survey-likert-opt-label">'+
                      '<input id="gender_other_radio" type="radio" name="gender" value="other" class="jspsych-demographics answer radio"> Prefer to self-describe:<br>'+
                    '</label>'+
                    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="gender_other_text" type="text" name="gender_other" class="jspsych-demographics answer text">'+
                  '</div>';

    var education = '<div id="education" class="jspsych-demographics">'+
                      '<p><b>Highest completed education level:</b></p>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="0" class="jspsych-demographics answer radio"> Some high school<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="1" class="jspsych-demographics answer radio"> High school diploma<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="2" class="jspsych-demographics answer radio"> 2-year degree or diploma<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="3" class="jspsych-demographics answer radio"> Bachelors degree or equivalent<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="4" class="jspsych-demographics answer radio"> Masters degree or equivalent<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="education" value="5" class="jspsych-demographics answer radio"> Doctorate or equivalent<br>'+
                      '</label>'+
                    '</div>';

    var religion = '<div id="religion" class="jspsych-demographics">'+
    '<p>How strongly do you <b>believe in God or gods</b> (from 0-100)?</p>'+
    '<p>To clarify, if you are certain that God (or gods) does not exist, please put "0". '+
    'If you are certain that God (or gods) does exist, then put "100". '+
    'If you\'re unsure, answer somewhere in the middle.</p>'+
    '<input type="text" name="religionText" class="jspsych-demographics answer text">'+
    '</div>';

    var english = '<div id="english" class="jspsych-demographics">'+
                      '<p>Are you a <b>native speaker</b> of English?</p>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="english" value="0" class="jspsych-demographics answer radio"> No<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="english" value="1" class="jspsych-demographics answer radio"> Yes<br>'+
                      '</label>'+
                    '</div>';


    var honesty = '<div id="honesty" class="jspsych-demographics">'+
                      '<p>Were all your answers in this study <b>honest</b> and <b>sincere</b>? '+
                        'We will NOT reject any HITs based on this response, but it will help us make sure our data is good quality.</p>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="honesty" value="0" class="jspsych-demographics answer radio"> No<br>'+
                      '</label>'+
                      '<label class="jspsych-survey-likert-opt-label">'+
                        '<input type="radio" name="honesty" value="1" class="jspsych-demographics answer radio"> Yes<br>'+
                      '</label>'+
                    '</div>';

    var comments = '<div id="comments" class="jspsych-demographics">'+
                      '<p>Any other comments for us? (leave blank if none)</p>'+
                      '<textarea name="comments" rows="5" cols="90" class="jspsych-demographics answer text"></textarea>'+
                      '</div>';

    var submit = '<div>'+
                  '<br><button type="button" id="submit">Submit</button>'+
                  '</div>';


    if(trial.age){
      html += age;
    }

    if(trial.gender){
      html += gender;
    }

    if(trial.education){
      html += education;
    }

    if(trial.english){
      html += english;
    }

    if(trial.religion){
      html += religion;
    }

    if(trial.vision){
      html += religion;
    }

    if(trial.honesty){
      html += honesty;
    }

    if(trial.comments){
      html += comments;
    }

    display_element.innerHTML = css+html+submit;

    $('#gender_other_text').keypress(function(){
      // autoselect gender_other if response given there
      $('#gender_other_radio').prop("checked", true);
    });

    var error_messages = {
      force: {show: false,
        message: 'Please make sure you fix all problems before continuing.'},
      invite: {show: false,
        message: 'You have missed some answers. We would prefer you respond to these, but if you don\'t want to, you can click "submit" once more to skip them.'},
      plain: {show: false,
        message: 'Please check you have provided an answer to all questions in red.'},
      age: {
        show: false,
        message: 'Check that you have only included numbers when giving your age (give whole years only).'},
      gender_other: {
        show: false,
        message: 'If you have selected "self-describe" for gender, please make sure you enter a response.'},
      religion: {
        show: false,
        message: 'Check that you have only included numbers when answering about religion.'},
    };

    // inputs

    $('#submit').click(function(e){
      var responses = getResponses();
      var validated = validateResponses(responses);
      if(validated){
        endTrial(responses);
      } else {
        var alert_string = '';
        var error_string;
        // handle alerts depending on trial parameters
        if(trial.force_response){
          error_messages.force.show = true;
          error_string = formatErrors(error_messages);
          alert_string += error_string;
          alert(alert_string);
        } else if (trial.force_response == 'invite') {
          error_messages.invite.show = true;
          error_string = formatErrors(error_messages);
          alert_string += error_string;
          alert(alert_string);
        } else {
          endTrial(responses);
        }
      }
    });

    function formatErrors(error_messages){
      var error_string = '';
      Object.keys(error_messages).forEach(function(tag){
        if(error_messages[tag].show){
          error_string += ' ' + error_messages[tag].message;
        }
      });
      return error_string;
    }

    function getResponses(){
      var responses = {};
      $('.jspsych-demographics.answer').each(function(i, div){
        var name = $(div).attr('name');
        var response = '';
        if(!responses[name] && responses[name] != ''){
          responses[name] = response;
        }
        if($(div).hasClass('text')){
          response = $(div).val().trim();
          responses[name] = response;
        } else {
          if($(div).is(':checked')){
            response = $(div).val();
            responses[name] = response;
          }
        }
      });
      return responses;
    }

    function validateResponses(responses){
      var validated = true;
      Object.keys(responses).forEach(function(tag){
        var outcome;
        response = responses[tag];
        if(tag=='gender' || tag=='gender_other'){
          ok = checkGender(responses.gender, responses.gender_other);
          if(!ok){
            validated = false;
          }
        } else if(tag == 'age' || tag == 'religion'){
          ok = checkText(tag, response);
          if(!ok){
            validated = false;
          }
        } else if(tag != 'comments'){
          ok = checkResponse(tag, response);
          if(!ok){
            validated = false;
          }
        }
      });
      console.log('validated', validated);
      return validated;
    }

    function checkText(tag, response){
      // check that there is a number, and nothing else
      var ok = true;
      var contains_number = /[0-9]/.test(response);
      var contains_nonnumber = /[^0-9]/.test(response);
      if(contains_number && !contains_nonnumber){
        error_messages[tag].show = false;
        $('#'+tag+'>p').css('color', 'black');
        console.log("text ok", tag)
      } else {
        ok = false;
        error_messages[tag].show = true;
        $('#'+tag+'>p').css('color', 'red');
        console.log("text wrong", tag)
      }
      return ok;
    }

    function checkResponse(tag, response){
      var ok = true;
      if( parseInt(response) >= 0 ){
        $('#'+tag+'>p').css('color', 'black');
        console.log('response ok', tag)
      } else {
        $('#'+tag+'>p').css('color', 'red');
        error_messages.plain.show = true;
        ok = false;
        console.log('response wrong', tag);
      }
      return ok;
    }

    function checkGender(gender_radio, gender_other){
      var ok = true;
      if(gender_radio == ''){
        $('#gender>p').css('color', 'red');
        error_messages.plain.show = true;
        ok = false;
        console.log('response wrong: gender missing')
      } else if(gender_radio == 'other') {
        // if self-describing, make sure there's a description
        if(gender_other.length==0){
          $('#gender>p').css('color', 'red');
          error = 'If you have selected "self-describe" for gender, please make sure you enter a response';
          error_messages.gender_other.show = true;
          ok = false;
          console.log('response wrong: gender self-describe missing')
        } else {
          $('#gender>p').css('color', 'black');
          error_messages.gender_other.show = false;
          console.log('response ok: gender self-describe')
        }
      } else {
        $('#gender>p').css('color', 'black');
        error_messages.gender_other.show = false;
        console.log('response ok: gender')
      }
      return ok;
    }

    function endTrial(responses){
      var end_time = Date.now();
      var rt = end_time - start_time;
      trial_data.rt = rt;
      trial_data.responses = responses;

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // clear screen
      display_element.innerHTML = '';

      jsPsych.finishTrial(trial_data);
      console.log(trial_data);

    }

    $( document ).ready(function() {
      start_time = Date.now();

    });

  };

  return plugin;
})();
