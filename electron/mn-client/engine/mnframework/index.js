var MN = require('./view');                        // Load the view (and the framework with it)
var $ = require('../jquery/jquery-2.1.4.min.js');  // JQuery plugin
var jQuery = $;

module.exports = MN; // Export all

// Actions used by the application to change view
MN._defaultActions = {
	'search' : function(e, info) {
		console.log(info);
		// Show search
		return new MN.Search(info);
	},
	'homepage' : function(e) {
		// Show home page
		return new MN.HomePage();
	},
	'manga' : function(e, manga, needReload) {
		// Show home page
		return new MN.MangaInfo({ manga : manga, needReload : needReload});
	},
	'manga-read' : function(e, manga, chapter) {
		// Show home page
		return new MN.MangaChapter({ manga : manga, chapter : chapter });
	},
	'options' : function(e) {
		return new MN.OptionsPage();
	}
};

MN._defaultActionsOffline = {
	/*'search' : function(e) {
		// Show search
		return new MN.Search();
	},*/
	'homepage' : function(e) {
		// Show home page
		return new MN.OfflineHomePage();
	},
	'manga' : function(e, manga, needReload) {
		// Show home page
		return new MN.MangaInfo({ manga : manga, needReload : needReload});
	},
	'manga-read' : function(e, manga, chapter) {
		// Show home page
		return new MN.MangaChapter({ manga : manga, chapter : chapter });
	},
	'options' : function(e) {
		return new MN.OptionsPage();
	}
};

// Start the engine
MN.launch = function(renderer, conf) {
	MN.conf = conf;
	
	// When all the page is loaded, add our container and launch
	$(document).ready(function() {
		console.log("Application launching done");
		
		var login = new MN.LoginWindow();
		
		login.on('connect', function(loadedUser, online) {
			MN.online = online;
			
			// Prepare user
			MN.user = loadedUser;
			MN.user.dir = MN.user.id + '_' + MN.user.login;
			
			// Create navigation bar (special case)
			var navBar = new MN.NavBar($('body'), {});
			navBar.show();
			
			new MN.ActionHandler(online ? MN._defaultActions : MN._defaultActionsOffline, renderer).start(navBar);
		
			// Show homepage
			navBar.fireEvent('homepage');
		});
		
		login.initView();
		renderer.append(login.getView());
	});
};
