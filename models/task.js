const mongoose = require( 'mongoose' );

const taskSchema = new mongoose.Schema({
  workerId: String,
  hitId: String,
  assignmentId: String,
  trial_id: String,
  created: { type: Date, default: Date.now },
  studyName: String,
  browser: mongoose.Schema.Types.Mixed,
});

let Task = module.exports = mongoose.model('Task', taskSchema);
