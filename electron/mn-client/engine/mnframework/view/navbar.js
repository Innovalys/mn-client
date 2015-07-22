var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- Nav bar
// ---------------------------
// Used to navigate through every pages of the application. The navbar is always present once connected
MN.NavBar = MN.BaseElement.extend({
	init : function(renderer, values) {
		this._super();
		this.renderer = renderer;
		this.text = values.text;
	},
	_initSearchBar : function() {
		var me = this;
		var search_bar = $('<form class="navbar-form navbar-right" role="search"></form>');
		var input = $('<input type="text" class="form-control ipt-search" placeholder="Mangas, Auteurs, Chapitres">');
		var button = $('<button type="submit" class="btn btn-default" style="margin-left: 5px; margin-right: -10px"><i class="fa fa-search"></i></button>');
		
		// Bind search events
		input.keypress(function(e) {
			if ( e.which == 13 ) {
				e.preventDefault();
				me.fireEvent('search', e, { manga : input.val() });
			}
		});
		button.on('click', function(e) {
			e.preventDefault();
			me.fireEvent('search', e, { manga : input.val() });
		});
		
		search_bar.append($('<div class="form-group"></div>').append(input)).append(button);
		this.container.append(search_bar);
	},
	_initButtons : function() {
		var me = this;
		var buttons = $('<ul class="nav navbar-nav">');
		
		// Homepage
		var home_button = $('<li><a href="#">Mon Espace</a></li>');
		home_button.on('click', function(e) { me.fireEvent('homepage', e); });
		buttons.append(home_button);
		
		// Mangas
		var manga_button = $('<li><a href="#">Mes Mangas</a></li>');
		manga_button.on('click', function(e) { me.fireEvent('mangapage', e); });
		buttons.append(manga_button);
		
		// Search
		var search_button = $('<li><a href="#">Recherche avancée</a></li>');
		search_button.on('click', function(e) { me.fireEvent('searchpage', e); });
		buttons.append(search_button);
		
		this.container.append(buttons);
	},
	_initLogo : function() {
		var logo = $('<a class="navbar-brand logo" href="#"></a>');
		logo.append('<i class="fa fa-book fa-2x"></i>');
		
		this.container.append(logo);
	},
	_initUsername : function() {
		var me = this;
		
		var navbar = $('<ul class="nav navbar-nav navbar-right"></ul>')
		var options = $('<button type="submit" class="btn btn-default"><i class="fa fa-cogs"></i></button>');
		var username = $('<a href="#" aria-expanded="false">' + MN.user.login + '</a>');
		
		options.on('click', function(e) { me.fireEvent('options', e); });
		username.on('click', function(e) { me.fireEvent('user', e, { id : MN.user.id }); });
		
		navbar.append('<li><a>&nbsp;</a></li>').append($('<li></li>').append(options)).append($('<li></li>').append(username));
		
		this.container.append(navbar);
	},
	show : function() {
		this.container = $('<nav class="navbar navbar-default container-fluid"></nav>');
		this.container.css({ display : 'none' });

		this._initLogo();
		this._initButtons();
		this._initUsername();
		this._initSearchBar();

		this.renderer.append(this.container);
		this.container.slideDown();
	},
	isSavable : function() {
		return false;
	}
});
