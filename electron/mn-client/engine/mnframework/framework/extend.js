var MN = exports; // Add export value

/**
 * Used by the extend functionnality
 */
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
