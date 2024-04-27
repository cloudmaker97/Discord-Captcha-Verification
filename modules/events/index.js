const util = require('util');
const eventEmitter = require('events').EventEmitter;
function Event () {
    eventEmitter.call(this);
}
util.inherits(Event, eventEmitter);
const eventBus = new Event();
module.exports = {
    emitter : Event,
    eventBus : eventBus
};