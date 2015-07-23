var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- Home page
// ---------------------------
// View displaying general informations
MN.HomePage = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "homepage";
	},
	_initLastFavoris : function() {
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Derniers manga favoris</h3></div>');
		this.favorisRenderer = $('<div class="panel-body"></div>');
		
		this.firstLine.append(panel.append(header).append(this.favorisRenderer));
	},
	_initLastNonFavoris : function() {
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Derniers mangas</h3></div>');
		this.nonFavorisRenderer = $('<div class="panel-body"></div>');
		
		this.firstLine.append(panel.append(header).append(this.nonFavorisRenderer));
	},
	_updateMangaList : function(values, renderer) {
		var me = this;

		// Remove all results
		renderer.empty();

		// Add for each manga
		values.forEach(function(manga) {
			
			var panel = $('<img class="img-responsive img-manga-cover" src="' + MN.conf.image + 'cover.jpg" data-toggle="tooltip" title="' + manga.title + '" alt="' + manga.title + '" />');
			panel.tooltip(); // Add the tooltip
			renderer.append(panel);
			
			panel.on('click', function(e) {
				me.fireEvent("manga", e, manga);
			});
			
			// Load the real image
			remote.getCurrentWindow().getFile(MN.user.dir, manga.cover, function (path, error) {
				if(path != null)
					panel.attr('src', path);
			});
		});
	},
	_updateValues : function() {
		var me = this;
		
		// Perform the request
		$.ajax({
			type: 'GET',
			url: conf.endpoint + 'user/mangas/' + MN.user.id,
			dataType : 'json',
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				var values = data.data;
				var mangaFavoris = [];
				var mangaNonFavoris = [];
				
				for(var i = 0; i < values.length; i++) {
					if(values[i].user_info.favoris) {
						if(mangaFavoris.length < 6)
							mangaFavoris.push(values[i]);
					} else {
						if(mangaNonFavoris.length < 6)
							mangaNonFavoris.push(values[i]);
					}
				}
				
				// Update the view
				me._updateMangaList(mangaFavoris, me.favorisRenderer);
				me._updateMangaList(mangaNonFavoris, me.nonFavorisRenderer);
			},
			error: function(response) {
				MN.handleRequestError(response);
			},
			fail: function(response) {
				MN.handleRequestFail(response);
			}
		});
	},
	initView : function() {
		this.container = $('<div class="container"></div>');
		this.firstLine = $('<div class="row"></div>');
		this.secondLine = $('<div class="row"></div>');

		this._initLastFavoris();
		this._initLastNonFavoris();
		
		this.renderer.append(this.container.append(this.firstLine).append(this.secondLine));

	},
	updateView : function() {
		// Update displayed values
		this._updateValues();
	}
});

// -- Offline home page
// ---------------------------
// View displaying general informations
MN.OfflineHomePage = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "homepage (offline)";
	},
	_initLastDownloaded : function() {
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Derniers manga téléchargés</h3></div>');
		this.downloadedRenderer = $('<div class="panel-body"></div>');
		
		this.firstLine.append(panel.append(header).append(this.downloadedRenderer));
	},
	_updateMangaList : function(values, renderer) {
		var me = this;
		renderer.empty();
		
		values.forEach(function(manga) {
			
			var panel = $('<img class="img-responsive img-manga-cover" src="' + MN.conf.image + 'cover.jpg" data-toggle="tooltip" title="' + manga.title + '" alt="' + manga.title + '" />');
			panel.tooltip(); // Add the tooltip
			renderer.append(panel);
			
			panel.on('click', function(e) {
				me.fireEvent("manga", e, manga);
			});
			
			// Load the real image
			remote.getCurrentWindow().getDownloadedFile(MN.user.dir, manga.id + '/cover.jpg', function (path, error) {
				if(path != null)
					panel.attr('src', path);
			});
		});
	},
	_updateValues : function() {
		var me = this;
		
		remote.getCurrentWindow().getDirContent(MN.user.dir, function(dirs) {
			
			var mangas = [];
			
			if(dirs && dirs.length > 0) {
				// Each dir is a manga
				for(var i = 0; i < dirs.length; i++) {
					var manga = remote.getCurrentWindow().readFileSync(MN.user.dir + '/' + dirs[i], 'info.json');
					
					if(manga)
						mangas.push(manga);
				}
			}
			
			me._updateMangaList(mangas, me.downloadedRenderer);
			
		}, function(err) {
			console.log(err);
			MN.notify("Aucun manga téléchargé", "Aucun manga n'a été téléchargé pour une lecture en mode hors ligne.<br/><br/>"+
				                                "Vous devez manuellement télécharger chaque manga que vous souhaitez pouvoir lire sans connexion internet sur sa page d'information", 'error');
		});
	},
	initView : function() {
		this.container = $('<div class="container"></div>');
		this.firstLine = $('<div class="row"></div>');

		this._initLastDownloaded();
		
		this.renderer.append(this.container.append(this.firstLine).append(this.secondLine));
	},
	updateView : function() {
		// Update displayed values
		this._updateValues();
	}
});
