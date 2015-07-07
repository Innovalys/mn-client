// Requires
var moment = require('moment');

// Framework definition
MN = window.MN || {};

MN.authHeader = function(login, password) {
	return { 'Authorization' : 'Basic ' + btoa(login + ":" + password) }
}

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
 * Toast handler
 */
MN.ToastHandler = MN.Class.extend({
	init : function(renderer) {
		this.messages = [];
		this.renderer = renderer;
	},
	add : function(toast) {
		// Place in the queue
		this.messages.push(toast);

		if(this.messages.length == 1) {
			// Display now
			this._display(this.messages[0]);
		}

		return this;
	},
	_update : function() {
		if(this.messages.length <= 0)
			return;

		this._display(this.messages[0]);
	},
	_display : function(toast) {
		var me = this;

		toast.display(this.renderer);
		toast.on('dissmiss', function() {
			me.messages.splice(me.messages.indexOf(toast), 1);
			me._update();
		});
	}
});

MN._toastHandler = new MN.ToastHandler($("#toast_back"));

MN.notify = function(title, message, type, timer) {
	MN._toastHandler.add(new MN.Toast(title, message, type, timer));
}

/**
 * Toast
 */
MN.Toast = MN.CallbackHandler.extend({
	init : function(title, message, type, timer) {
		this._super();
		this.title = title;
		this.message = message;
		this.type = type ||'info';

		if(!timer) {
			if(this.type == 'info' || this.type == 'success')
				this.timer = 4000;
			else
				this.timer = 8000;
		} else
			this.timer = timer;
	},
	display : function(render) {
		var me = this;

		this.render();
		render.append(this.content);
		this.content.addClass('bounce');

		this.fireEvent('display', this);

		setTimeout(function() {
			me.dissmiss();
		}, this.timer);
	},
	render : function() {
		this.content = $('<div class="toast bouncy-bottom"></div>');
		this.content.append($('<h2></h2>').append(this.title));
		this.content.append($('<p></p>').append(this.message));
		this.content.addClass(this.type);
	},
	dissmiss : function() {
		var me = this;

		me.content.removeClass('bounce');
		me.fireEvent('dissmiss', this);

		setTimeout(function() {
			me.content.remove();
		}, 1000);
	}
});

/**
 * Base class for every element
 */
MN.BaseElement = MN.CallbackHandler.extend({
	init : function() {
		this._super();
		this.renderer = $('<div></div>');;
		// Used to initialize the element
	},
	loading_start : function(onEnd) {
		var me = this;
		// Hide and empty
		this._tmp_renderer = $('<span></span>');
		this._tmp_renderer.append(this.renderer.children());
		
		// Show spinner
		this.renderer.append($('<div class="loader">Loading...</div>')).append('<div class="container loader-text">Chargement en cours...</div>');
		this.renderer.fadeIn(200);
		
		// Swap the tmp renderer and the real one
		var tmp = this._tmp_renderer;
		this._tmp_renderer = this.renderer;
		this.renderer = tmp;
	},
	loading_stop : function(onEnd) {
		var me = this;
		
		this._tmp_renderer.fadeOut(200).promise().always(function() {
			// Empty the real renderer and append the real content
			me._tmp_renderer.empty();
			me._tmp_renderer.append(me.renderer.children());
			
			// Swap back
			me.renderer = me._tmp_renderer;
			me._tmp_renderer = undefined;
			
			me.renderer.fadeIn(200);
		});
	},
	initView : function() {
		// Default empty init
	},
	updateView : function() {
		// Default empty update
	},
	getView : function() {
		return this.renderer;
	},
	getId : function() {
		return this.id || 'Default view';
	},
	isSavable : function() {
		return true;
	}
});
	
var inAction = false;
var stack = [];

// Allow to use a config object to handle actions
MN.actionHandler = function(actions, actualView, renderer) {
	
	$('html').unbind('keydown');
	$('html').on('keydown', function(e) {
	    if(e.which === 116) {
			e.preventDefault();
			
			if(inAction) return;
			inAction = true; // Avoid multiple action at the same time
			
			// Always keep at least a stacked view
			if(stack.length > 0) {
				// Get the previous view, and re-display it
				var view = actualView;
				var viewElement = view.getView();
				view.updateView();
			
				console.log('Reloading view ' + view.getId());
						
				renderer.fadeOut(200).promise().always(function() {
					renderer.children().detach();
					renderer.append(viewElement);
					renderer.fadeIn(200).promise().always(function() {
						inAction = false;
					});
				});
			} else
				inAction = false; // Cancel
	    } else if(e.keyCode == 8) {
    		var doPrevent = false;
	        var d = event.srcElement || event.target;
	        if ((d.tagName.toUpperCase() === 'INPUT' && 
	             (
	                 d.type.toUpperCase() === 'TEXT' ||
	                 d.type.toUpperCase() === 'PASSWORD' || 
	                 d.type.toUpperCase() === 'FILE' || 
	                 d.type.toUpperCase() === 'EMAIL' || 
	                 d.type.toUpperCase() === 'SEARCH' || 
	                 d.type.toUpperCase() === 'DATE' )
	             ) || 
	             d.tagName.toUpperCase() === 'TEXTAREA') {
	            doPrevent = d.readOnly || d.disabled;
	        } else {
	            doPrevent = true;
	        }
			
			if(doPrevent) {
				e.preventDefault();
				
				if(inAction) return;
				inAction = true; // Avoid multiple action at the same time
				
				// Always keep at least a stacked view
				if(stack.length > 0) {
					// Get the previous view, and re-display it
					var view = stack.pop();
					var viewElement = view.getView();
					view.updateView();
				
					console.log('Resuming view ' + view.getId());
							
					renderer.fadeOut(200).promise().always(function() {
						renderer.children().detach();
						renderer.append(viewElement);
						renderer.fadeIn(200).promise().always(function() {
							inAction = false;
						});
					});
				} else
					inAction = false; // Cancel
			}
		}
	});
	
	// Bind the actions
	$.each(actions, function(action, handler) {
		actualView.on(action, function() {
			
			if(inAction) return;
			inAction = true; // Avoid multiple action at the same time
			
			// TODO : fix navbar handling
			// Save the actual view to the stack
			if(actualView.isSavable())
				stack.push(actualView);
			
			// Create a new view, and happend to the renderer
			var view = handler.apply(actualView, arguments);
			view.initView();
			var viewElement = view.getView();
			view.updateView();
				
			console.log('Creating view ' + view.getId());
				
			renderer.fadeOut(200).promise().always(function() {
				renderer.children().detach();
				renderer.append(viewElement);
				renderer.fadeIn(200).promise().always(function() {
					inAction = false;
					MN.actionHandler(actions, view, renderer);
				});
			});
			
		});
	});
};

// handle for a bad request response
MN.handleRequestError = function(response) {
	console.log(response);
	if(response.responseJSON && response.responseJSON.data && response.responseJSON.data.message) {
		MN.notify('Erreur lors du chargement des informations', 'La requête a échouée avec le code <b>' + response.status + '</b>. Le serveur a également indiqué <em>"' + response.responseJSON.data.message + '"</em>', 'error');
	} else {
		MN.notify('Erreur lors du chargement des informations', 'La requête a échouée avec le code ' + response.status + '.', 'error');
	}
}

// handle for a failed request
MN.handleRequestFail = function(response) {
	console.log(response);
	MN.notify('L\'envoie de la requête a échoué', 'Impossible d\'envoyer la requête. Il n\'y a peu être plus de connexion internet.', 'error');
}	

// Format the date in an human readable way
MN.formatDate = function(time) {
	if(time == '0000-00-00 00:00:00')
		return '[Aucune date disponible]';
	else
		return moment(time, 'YYYY-MM-DD hh:mm:ss', 'fr').fromNow();
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
