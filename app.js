/*jshint esversion: 6 */

/*
https://salty-journey-53248.herokuapp.com/ | https://git.heroku.com/salty-journey-53248.git
*/

// --- LOADING MODULES
const express = require('express'),
  url = require('url'),
  body_parser = require('body-parser'),
  ejs = require('ejs'),
  _ = require('lodash'),
  detect = require('browser-detect'),
  db = require(__dirname+'/controllers/db'),
  tasks = require(__dirname+'/controllers/tasks'),
  responses = require(__dirname+'/controllers/responses'),
  {makeCode} = require('./helper/codeString.js');

// --- INSTANTIATE THE APP
const studyName = 'study2_test';
const app = express();
const PORT = process.env.PORT || 5000;

// --- MONGOOSE SETUP
db.connect(process.env.MONGODB_URI);

// --- STATIC MIDDLEWARE
app.use(express.static(__dirname + '/public'));

// --- BODY PARSING MIDDLEWARE
app.use(body_parser.json()); // to support JSON-encoded bodies

// --- LIBRARIES FOR EXPERIMENT SCRIPT
app.use('/jspsych', express.static(__dirname + "/jspsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/helper', express.static(__dirname + "/helper"));

// --- VIEW LOCATION, SET UP SERVING STATIC HTML
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

// --- ERROR HANDLER
function errorHandler(err){
  console.log("Error in trial "+err.trial_id+" ("+err.stage+"): ", err);
  next();
}

// --- ROUTING

app.get('/', (req, res, next) => {
    const workerId = req.query.workerId || '';
    const assignmentId = req.query.assignmentId || '';
    const hitId = req.query.hitId || '';
    const trial_id = makeCode(2)+'5'+makeCode(5)+'RtR'+makeCode(4)+'m'+makeCode(2);
    const browser = detect(req.headers['user-agent']);

    // save trial info
    tasks.save({
        "workerId": workerId,
        "hitId": hitId,
        "assignmentId": assignmentId,
        "trial_id": trial_id,
        "studyName": studyName,
        "browser": browser,
    });

    // Check browser not IE, and device not mobile
    let browserOk = true;
    if (browser) {
      // console.log(trial_id, 'Detected browser...', browser);
      if (browser.name=='ie' || browser.mobile==true){
        browserOk = false;
      }
    }

    if(browserOk){
      res.render('experiment.ejs', {input_data: JSON.stringify({trial_id: trial_id})});
    } else {
      res.send('You seem to be viewing this either on a mobile device or with Internet Explorer. You will not be able to take this study with either. Please just return the HIT.');
    }

});

app.get('/demo', (req, res, next) => {
    var trial_id = 'test';
    let browserOk = true;
    res.render('experiment.ejs', {input_data: JSON.stringify({trial_id: trial_id})});
});

// --- SAVE TRIAL DATA
app.post('/data', (req, res, next) => {
  const data = req.body;
  const trial_id = req.query.trial_id || 'none';
  console.log(trial_id, 'Preparing to save trial data...');
  responses.save({
      trialData: data,
      trial_id: trial_id,
      studyName: studyName,
  })
  .then(res.status(200).end());
});

// --- RENDER DEBRIEFING SCREEN
app.get('/finish', (req, res) => {
  let code = req.query.token;
  if(code.length>=0){
    code = code + makeCode(3) + '5';
  } else {
    code = makeCode(10) + 'SZs';
  }
  res.render('finish.ejs', {completionCode: code});
});

app.get('/finish_demo', (req, res) => {
  res.render('finish_demo.ejs');
});

// --- START THE SERVER
var server = app.listen(PORT, function(){
    console.log("Listening on port %d", server.address().port);
});
