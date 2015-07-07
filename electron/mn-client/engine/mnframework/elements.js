var MN = exports;                        // Add export value
MN.Class = require('./extend.js').Class; // MN.Class.extend

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

// Allow to use a config object to handle actions
MN.ActionHandler = MN.Class.extend({
	init : function(actions, renderer) {
		this.inAction = false;
		this.stack = [];
		this.renderer = renderer;
		this.actions = actions;
	},
	start : function(firstView) {
		this.actualView = firstView;
		this._update(firstView);
	},
	_showView : function(view, clbk) {
		var me = this;
		
		var viewElement = view.getView();
		view.updateView();
		
		this.renderer.fadeOut(200).promise().always(function() {
			me.renderer.children().detach();
			me.renderer.append(viewElement);
			me.renderer.scrollTop(0);
			me.renderer.fadeIn(200).promise().always(function() {
				clbk(view);
			});
		});
	},
	_update : function() {
		var me = this;
		
		$('html').unbind('keydown');
		$('html').on('keydown', function(e) {
		    if(e.which === 116) {
				e.preventDefault();
				
				if(me.inAction) return;
				me.inAction = true; // Avoid multiple action at the same time
				
				try {
					console.log('Reloading view ' + me.actualView.getId());
					
					// Get the previous view, and re-display it
					me._showView(me.actualView, function(view) {
						me.inAction = false;
					});
				} catch(err) {
					MN.notify('Erreur', 'Une erreur inattendue est survenue : "' + err + '"', 'error');
					me.inAction = false;
				}
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
					
					if(me.inAction) return;
					me.inAction = true; // Avoid multiple action at the same time
					
					// Always keep at least a stacked view
					if(me.stack.length > 0) {
						try {
							// Get the previous view, and re-display it
							me.actualView = me.stack.pop();
							
							console.log('Resuming view ' + me.actualView.getId());
							
							me._showView(me.actualView, function(view) {
								me.inAction = false;
							});
						} catch(err) {
							MN.notify('Erreur', 'Une erreur inattendue est survenue : "' + err + '"', 'error');
							me.inAction = false;
						}
					} else
						me.inAction = false; // Cancel
				}
			}
		});
		
		// Bind the actions
		$.each(me.actions, function(action, handler) {
			me.actualView.on(action, function() {
				
				if(me.inAction) return;
				me.inAction = true; // Avoid multiple action at the same time
				
				// Save the actual view to the stack
				if(me.actualView.isSavable())
					me.stack.push(me.actualView);
				
				// Create a new view, and happend to the renderer
				try {
					var view = handler.apply(handler, arguments);
					view.initView();
						
					console.log('Creating view ' + view.getId());
						
					me._showView(view, function(view) {
						me.inAction = false;
						
						me.actualView = view;
						me._update();
					});
				} catch(err) {
					MN.notify('Erreur', 'Une erreur inattendue est survenue : "' + err + '"', 'error');
					me.inAction = false;
				}
			});
		});
	}
});
