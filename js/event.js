/*
* 事件触发器
* mixin对象
*/
;(function(host) {

var EventEmitter = {
	addListener	: function (type,fn) {
		var _evts = this._events;
		if( !_evts ) _evts = this._events = {};
		
		if(_evts.hasOwnProperty(type) && _evts[type]){
			_evts[type].push(fn);
		}else{
			this._events[type] = [fn];
		}
		return this;
	},
	fireEvent	: function (type,data) {
		var self = this, _evts = self._events;
		if( !_evts ) _evts = self._events = {};

		var evts = _evts[type];
		if( !evts ) return self;
		
		evts.forEach(function (evt) {
			evt.call(self,{type:type},data)
		});
		return self;
	},
	removeListener	: function (type) {
		var evts = this._events;
		if(type && evts[type]){
			evts[type] = [];
		}else{
			this._events = {};
		}
		return this;
	}
}

// prevent override
EventEmitter.on     = EventEmitter.addListener;
EventEmitter.emit   = EventEmitter.fireEvent;
EventEmitter.unbind = EventEmitter.removeListener;

host.EventEmitter = EventEmitter;

})(this);