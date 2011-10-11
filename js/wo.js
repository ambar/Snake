/*
* 公用: oo,protos,utils
* todos: dom,unit,scale
*/

;(function(host,undefined) {

Object.extend = function (dest,src) {
	for(var p in src){
	    dest[p] = src[p]
	}
	return dest;
}
util = {};
util.inherits = function(subclass,superclass) {
	subclass.prototype = Object.create(superclass.prototype,{
		constructor : { value : subclass }
	});
	subclass.super = superclass.prototype;
}

if( !window.requestAnimationFrame ){
	window.requestAnimationFrame = 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback,element){
				window.setTimeout(callback, 1000 / 60);
			};
}

var wo = host.wo || (host.wo = {});

wo.rand = function (max,min) {
    min || (min=0);
    return Math.round(Math.random()*(max-min)) + min;
}

wo.makeArray = function(obj) {
	return Array.prototype.slice.call(obj,0);
}

wo.throttle = function(delay,action,fix_end,debounce) {
    var now = Date.now, last_call = 0, last_exec = 0, curr = 0, elapsed = 0, diff = 0, timer = null;

    return function() {
        var args = arguments, self = this;
        curr = now(), elapsed = curr - last_exec, diff = elapsed - delay
        var exec = function() {
            last_exec = now();
            action.apply(self,args);
        };

        clearTimeout(timer);        

        if( debounce === undefined && diff >= 0 ){
            exec();
        }else if(fix_end === true){
            // throttle 尾部补救 | debounce 尾部执行
            timer = setTimeout(exec,debounce === true ? delay : -diff);
        }else if(debounce === true){
            // debounce 头部执行 : idle time >= delay
            if(curr - last_call >= delay){
                exec();
            }
        }
        last_call = curr;
    }
}

wo.debounce = function(delay,action,end) {
    return wo.throttle(delay,action,end,true);
}

wo.$query = function(id) {
	return document.querySelector(id)
}

host.wo = wo;

})(this);

;(function() {
    // ref ejohn.org/blog/simple-javascript-inheritance/
    function Class() {};

    var initializing = false, 
        _super = '_super',
        has_super = new RegExp('\\b'+_super+'\\b'), 
        is_func = function(fn) {
            return typeof fn === 'function' 
        },
        wrap = function(fn,name,replacer) {
            return function() {
                var tmp    = this[name], ret;
                this[name] = replacer;
                ret        = fn.apply(this,arguments);
                this[name] = tmp;
                return ret;
            }
        }

    Class.extend = function(protos) {
        initializing = true;
        var super_proto = this.prototype;
        var derived_proto = new this();
        initializing = false;

        function ClassEx() {
            !initializing && is_func(this.init) && this.init.apply(this,arguments);
        }
        ClassEx.__super__ = super_proto;
        ClassEx.extend = arguments.callee;
        ClassEx.prototype = Object.create(derived_proto,{ constructor : { value : ClassEx } });

        ClassEx.methods = function(protos) {
            Object.keys(protos).forEach(function(name,i) {
                var fn = protos[name];
                // 修改原型，重新绑定
                derived_proto[name] = 
                    is_func(fn) && is_func(super_proto[name]) && has_super.test(fn) 
                    ? wrap(fn,_super,super_proto[name])
                    : fn;
            });
        };

        ClassEx.methods(protos);

        return ClassEx;
    };

    this.Class = Class

})();

// protos
HTMLElement.prototype.bind = function (type,fn) {
	this.addEventListener(type,fn,true);
	return this;
}
HTMLElement.prototype.text = function (text) {
	this.textContent = text;
	return this;
}

Number.prototype.times = function(action,scope){
	var i = 0, n = this.valueOf(), scope = scope || this;
	n < 0 && (n=0);
	while(i<n)
		action.call(scope,i++);
};

Array.prototype.first = function(){
    return this[0];
}
Array.prototype.last = function(){
	return this[this.length-1];
}
Array.prototype.removeAt = function(idx,num) {
	return this.splice(idx,num || 1);;
}
Array.prototype.remove = function(value,greedy) {
	var ls = this, i = 0, len = ls.length;
	for(;i<len;i++){
		if( ls[i]===value ){
			ls.removeAt(i);
			if(!greedy) break;
		}
	}
	return ls;
}