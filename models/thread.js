var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var thread = new Schema({
  _id: Schema.Types.ObjectId,
  _braidId: Schema.Types.ObjectId,
  _userId: String,
  active: { type: Boolean, default: false},
  service: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  poll_time: { type: Number, default: 15 },
  last_checked: {type: Date, default: Date.now },
  entries: [Schema.Types.ObjectId],
  modifiers: [Schema.Types.ObjectId]
});

/*
You need to be able to add specific service data. You need perhaps a function that will look up what service has been set,
build and then attach that data to the thread.
Use embeded documents, set up mongoose child schemas
*/

module.exports = mongoose.model('Thread', thread);
