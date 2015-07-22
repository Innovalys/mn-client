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
					if(values[i].user_info.favoris)
						mangaFavoris.push(values[i]);
					else
						mangaNonFavoris.push(values[i]);
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

// -- Options page
// ---------------------------
// View displaying the options of the sofware
MN.OptionsPage = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "options";
	},
	_initActions : function() {
		var title = $('<h2>Options - Actions</h2>');
		var elements = $('<div class="row options-actions"></div>');
		
		var emptyCache = $('<button class="btn btn-default btn-large">Vider le cache</button>');
		var emptyDownloads = $('<button class="btn btn-default btn-large">Supprimer tous les mangas enregistrés</button>');
		
		this.container.append(title).append(elements.append(emptyCache).append(emptyDownloads));
	},
	_initConfiguration : function() {
		
	},
	initView : function() {
		this.container = $('<div class="container"></div>');
		
		this._initActions();
		this._initConfiguration();
		
		this.renderer.append(this.container.append(this.title).append(this.secondLine));
	},
	updateView : function() {
		
	}
});

// -- Login window
// ---------------------------
// View displaying general informations
MN.LoginWindow = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "login page";
	},
	_toggleForms : function(active) {
		this.username.prop('disabled', active);
		this.password.prop('disabled', active);
		this.connect.prop('disabled', active);
		this.register.prop('disabled', active);
	},
	_checkValues : function() {
		var error = false;
		
		if(!this.username.val() || this.username.val() == '') {
			this.usernameGroup.addClass('has-error');
			MN.notify("Aucun nom d'utilisateur", "Aucun nom d'utilisateur n'a été entré dans le formulaire", 'error');
			error = true;
		} else {
			this.usernameGroup.removeClass('has-error');
		}
		
		if(!this.password.val() || this.password.val() == '') {
			this.passwordGroup.addClass('has-error');
			MN.notify("Aucun mot de passe", "Aucun mot de passe n'a été entré dans le formulaire", 'error');
			error = true;
		} else {
			this.passwordGroup.removeClass('has-error');
		}
		
		return !error;
	},
	_initValueBind : function() {
		var me = this;
		
		this.connect.on('click', function(e) {
			e.preventDefault();
			
			// Check the values
			if(!me._checkValues())
				return;
				
			me._toggleForms(true);
			me.connect.html('Chargement...');

			// Offline connection
			if(me.online.prop('checked')) {
				remote.getCurrentWindow().readFile('', me.username.val() + '.json', function (user) {
					// Check password
					var check = remote.getCurrentWindow().crypto.createHash('md5').update(me.username.val() + me.password.val()).digest('hex');
					if(user.check != check) {
						MN.notify("Mot de passe invalide", "Le mot de passe n'est pas valide", 'error');
						me._toggleForms(false);
						me.connect.html('Connexion');
					} else {
				     	me.fireEvent('connect', user, false);
					}
				}, function () {
					MN.notify("Compte local in trouvable", "Le nom de compte ne correspondent à aucun compte localement sauvegardé", 'error');
					me._toggleForms(false);
					me.connect.html('Connexion');
				});
			} 
			// Online connection
			else {
	     		$.ajax({
				     type: 'GET',
				     url: MN.conf.endpoint + 'user' ,
				     dataType : 'json',
				     headers: MN.authHeader(me.username.val(), me.password.val()),
				     success: function(response) {
						// Save the current user
						var user = response.data;
						var tmp_user = { id    : user.id,
							             login : 'test',
										 check : remote.getCurrentWindow().crypto.createHash('md5').update(user.login + user.pass).digest('hex') };
						
						remote.getCurrentWindow().writeFile('', user.login + '.json', tmp_user, function () {
							// Nothing
						}, function(error) {
							MN.notify("Impossible de sauvegarder le compte", "Il ne sera pas possible d'accès à ce compte en mode hors-ligne", 'warning');
						});
						
				     	me.fireEvent('connect', response.data, true);
				     },
				     error: function(response) {
						if(response.responseJSON && response.responseJSON.data && response.responseJSON.data.code == 403)
							MN.notify("Nom de compte et/ou mot de passe invalide", "Le nom de compte et le formulaire ne correspondent à aucun compte", 'error');
						else
							MN.handleRequestError(response);
						me._toggleForms(false);
						me.connect.html('Connexion');
				     },
				     fail: function(response) {
						MN.handleRequestFail(response);
						me._toggleForms(false);
						me.connect.html('Connexion');
				     }
		    	});
			}
		});
		
		this.register.on('click', function(e) {
			e.preventDefault();
			MN.notify("Fonctionnalité en cours de développement", "L'inscription n'est pas encore disponible", 'warning');
		});
	},
	initView : function() {
		var title = $('<h2 class="auth-title">Manga Network</h2>');
		
		this.usernameGroup = $('<div class="input-group"></div>').append($('<span class="input-group-addon" id="basic-addon1"><span class="fa fa-user"></span></span>'));
		this.username = $('<input name="username" type="text" class="form-control" placeholder="Username">');
		
		this.passwordGroup = $('<div class="input-group"></div>').append($('<span class="input-group-addon" id="basic-addon1"><span class="fa fa-lock"></span></span>'));
		this.password = $('<input name="password" type="password" class="form-control" placeholder="Password">');

		this.online = $('<input type="checkbox" />')		
		this.connect = $('<button type="submit" class="btn bnt-block btn-lg btn-primary">Connexion</button>');
		this.register = $('<button type="submit" class="btn btn-block btn-lg btn-default">Inscription</button>');

		var form = $('<form class="auth"></form>');
		
		this._initValueBind();
		
		form.append(this.usernameGroup.append(this.username));
		form.append(this.passwordGroup.append(this.password));
		form.append($('<label class="checkbox connected-chk">Mode hors ligne</label>').prepend(this.online)).append(this.connect).append(this.register);
		
		this.renderer.append(title).append(form);
	},
	updateView : function() {}
});

