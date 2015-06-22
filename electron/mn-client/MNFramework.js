MN = window.MN || {};

MN.Class = function() {}

/**
 * Base class for every class of the framework. This
 * class provide the 'extends' methods used to simulate
 * inheritance in JS.
 *
 * The method '_super' can be used in any overrided method
 * to call the base method with the provided parameters.
 * 
 * @param  {mixed} prop : Object of properties for the futur object
 * @return {Class}      : New instance
 */
MN.Class.extend = function(prop) {
	var _super = this.prototype;

    this.prototype.ignore = true;
    var prototype = new this();
    delete this.prototype.ignore;

    var _supers = {};

	for(var name in prop) {
		if(typeof prop[name] == 'function' && typeof _super[name] == 'function') {
			prototype[name] = (function(name, fn, _super) {
				return function() {
					this._super = _super;
					return fn.apply(this, arguments);
				}
			})(name, prop[name], _super[name]);
		} else
			prototype[name] = prop[name];
	}

    function Class() {
    	if (!this.ignore && this.init) {
    		this.init.apply(this, arguments);
    	}
    }

    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;

    return Class;
}

/**
 * Callback handler. Any class extending the class will be able
 * to register as event handler methods on a specific event type, and
 * to fire events.
 * 
 * @param  {self}  on       : Bin a handler on a specific event type
 * @param  {self} remove    : Remove the given handler for the specified type
 * @param  {self} clear     : Remove all handlers for the specified type
 * @param  {self} fireEvent : Fire an event for the specified type with the provided arguments
 */
MN.CallbackHandler = MN.Class.extend({
	init : function() {
		this.actions = {};
	},
	on : function(target, clbk, fireOnce) {
		if(this.actions[target] instanceof Array)
			this.actions[target].push(clbk);
		else
			this.actions[target] = [ clbk ];

		clbk._fireOnce = fireOnce || false;
		return this;
	},
	remove : function(target, toRemove) {
		if(this.actions[target] instanceof Array) {
			var index = this.actions[target].indexOf(toRemove);
			if(index >= 0)
				this.actions[target].splice(index, 1);
		}

		return this;
	},
	clear : function(target) {
		if(target) {
			if(this.actions[target] instanceof Array) {
				this.actions[target] = [];
			}
		} else
			this.actions = {};

		return this;
	},
	fireEvent : function(target) {
		var event_args = Array.prototype.slice.call(arguments, 1);
		var me = this;

		if(this.actions[target] instanceof Array) {
			for (var i = 0; i < this.actions[target].length; i++) {
				this.actions[target][i].apply(this, event_args);

				if(this.actions[target][i]._fireOnce)
					this.actions[target].remove(i--);
			}
		}
		return this;
	}
});

/**
 * Base class for every element
 */
MN.BaseElement = MN.CallbackHandler.extend({
	init : function(renderer) {
		this._super();
		this.renderer = renderer;
		// Used to initialize the element
	},
	show : function() {
		// Used to display the element
		// in the renderer
	},
	remove : function() {
		// Used to remove the element from
		// the renderer
	}
});

/*

// Exemple of inheritance between two classes

var A = Class.extend({
	init: function(a, b) {
		this.a = a;
		this.b = b;
	},
	hello: function() {
		console.log("hello from A : " + this.a);
	},
	goodbye: function() {
		console.log("goodbye from A");
	}
})
var B = A.extend({
	init: function(a, b) {
		this.a = a + 1;
		this.b = b + 1;
	},
	hello: function() {
		this._super();
		console.log("hello from B : " + this.a);
	}
})
var C = B.extend({
	hello: function() {
		this._super();
		console.log("hello from C : " + this.a);
	}
})

var b = new B(1, 2);
var c = new C(1, 2);
b.hello();
b.goodbye();
c.hello();
c.goodbye();
console.log(c instanceof A); // true
console.log(b instanceof A); // true
console.log(b instanceof C); // false
*/
