var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- Manga view
// ---------------------------
// View displaying informations about the selected manga
MN.MangaInfo = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "manga info";
		this.manga = values.manga;
		this.needReload = values.needReload || false;
	},
	_initTitle : function() {
		var title = $('<h1>' + this.manga.title + '</h1>');
		
		this.infoContainer.append(title);
	},
	_initInfos : function() {
		var me = this;
		
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Information du manga</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var info = $('<ul></ul>');
		info.append($('<li></li>').html('Source : ' + this.manga.source_URL));
		info.append($('<li></li>').html('Dernière mise à jour : ' + MN.formatDate(this.manga.update_date)));
		info.append($('<li></li>').html('Date de sortie : ' + MN.formatDate(this.manga.release_date)));
		info.append($('<li></li>').html('Nombre de chapitres : ' + this.manga.chapter_nb));
		
		var genres = $('<li></li>').html('Genre(s) : ');
		if(this.manga.genres && this.manga.genres > 0) {
			this.manga.genres.forEach(function(genre) {
				var button = $('<button type="button" class="btn btn-info btn-xs btn-tag">' + genre + '</button>');
				button.on('click', function(e) {
					me.fireEvent('search', e, { genre : genre });
				});
				genres.append(button);
			});
		} else {
			genres.append($('<button type="button" class="btn btn-info btn-xs btn-tag disabled">[Aucun]</button>'));
		}
		info.append(genres);
		
		var authors = $('<li></li>').html('Auteur(s) : ');
		if(this.manga.authors) {
			this.manga.authors.forEach(function(author) {
				var button = $('<button type="button" class="btn btn-info btn-xs btn-tag">' + author + '</button>');
				button.on('click', function(e) {
					me.fireEvent('search', e, { author : author });
				});
				authors.append(button);
			});
			
			info.append(authors);
		} else {
			authors.append($('<button type="button" class="btn btn-info btn-xs disabled">[Aucun]</button>'));
		}
		
		content.append(info);
		
		this.infoContainer.append(panel.append(header).append(content));
	},
	_initUserInfo : function() {
		var me = this;
		
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Information dans la collection</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var info = $('<ul></ul>');
		info.append($('<li></li>').html('Favoris : ' + ( this.manga.user_info.favoris ? 'Oui' : 'Non' )));
		info.append($('<li></li>').html('Dernière mise à jour : ' + MN.formatDate(this.manga.user_info.update_date)));
		info.append($('<li></li>').html('Note attribuée : ' + (this.manga.user_info.note != null ? this.manga.user_info.note + "/5": "Aucune" )));
		
		var removeButton = $('<button type="button" class="btn btn-danger btn-xs left-space" style="margin-left: 23px;">Retirer de la collection</button>');
		var favorisButton = $('<button type="button" class="btn btn-warning btn-xs">' + (this.manga.user_info.favoris ? 'Retirer des favoris' : 'Ajouter aux favoris') + '</button>');
		var downloadButton = $('<button type="button" class="btn btn-info btn-xs">Télécharger le manga</button>');
		
		if(MN.online) {
			removeButton.on('click', function(e) {
				me._collectionToggle();
			});
			
			favorisButton.on('click', function(e) {
				me._favorisToggle();
			});
			
			downloadButton.on('click', function(e) {
				me._download();
			});
		} else {
			removeButton.prop('disabled', true);
			favorisButton.prop('disabled', true);
			downloadButton.prop('disabled', true);
		}
		
		content.append(info);
		content.append(removeButton).append(favorisButton).append(downloadButton);
		
		this.infoContainer.append(panel.append(header).append(content));
	},
	_initNoUserInfo : function() {
		var me = this;
		
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Information dans la collection</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var info = $('<p>Ce manga n\'est pas encore dans votre collection. Si vous souhaitez le lire, vous devez l\'ajouter à votre collection</p>');
		var addButton = $('<button type="button" class="btn btn-primary btn" style="float: right;">Ajouter à la collection</button>');

		if(MN.online) {
			addButton.on('click', function(e) {
				me._collectionToggle();
			});
		} else {
			addButton.prop('disabled', true);
		}
		
		content.append(info);
		content.append(addButton);
		
		this.infoContainer.append(panel.append(header).append(content));
	},
	_initResume : function() {
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Description du manga</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		content.append($("<p></p>").html(this.manga.description));
		
		this.infoContainer.append(panel.append(header).append(content));
	},
	_initRapidAcces : function() {
		var me = this;
		
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Accès rapide à un chapitre</h3></div>');
		var content = $('<div class="panel-body"></div>');
		var chapterSelection = $('<select class="form-control" style="max-width: 88%;"></select>');
		var chapterButton = $('<button class="btn btn-default" style="margin-left: 5px; float: right;">Lire</button>');
		
		for(var i = 0; i < this.manga.chapters.length; i++) {
			var nb = this.manga.chapters[i].nb;
			var title =this.manga.chapters[i].title;
			chapterSelection.append('<option value="' + nb + '">Chapitre ' + nb + ' - ' + title + '</option>');
		}
			
		if(this.manga.user_info) {
			chapterButton.on('click', function(e) {
				me.fireEvent('manga-read', e, me.manga, chapterSelection.val());
			});
		} else {
			chapterButton.addClass("disabled");
			chapterButton.on('click', function(e) {
				MN.notify('Lecture manga', 'Vous devez ajouter ce mange à votre collection personnelle avant de pouvoir le lire');
			});
		}
		
		content.append($('<div class="form-inline"></div>').append(chapterSelection).append(chapterButton));
		this.infoContainer.append(panel.append(header).append(content));
	},
	_initRightPanel : function() {
		this.infoContainer = $('<div class="container col-md-8" ></div>');
		
		this._initTitle();
		if(this.manga.user_info)
			this._initUserInfo();
		else
			this._initNoUserInfo();
			
		this._initInfos();
		this._initResume();
		this._initRapidAcces();
		
		this.container.append(this.infoContainer)
	},
	_initLeftPanel : function() {
		var me = this;
		
		var container = $('<div class="container col-md-4" ></div>');
		var panel = $('<img class="img-responsive img-manga-cover" class="container" style="width: 100%; margin-top: 22px" src="' + conf.image + 'cover.jpg" title="' + this.manga.title + '" alt="' + this.manga.title + '" />');
		var button = $('<button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top: 22px;">' + (this.manga.user_info && this.manga.user_info.chapter_cur ? 'Reprendre la lecture' : 'Commencer la lecture') + '</button>');
						
		// Load the real image
		if(MN.online) {
			remote.getCurrentWindow().getFile(MN.user.dir, this.manga.cover, function (path, error) {
				if(path != null)
					panel.attr('src', path);
			});
		} else {
			remote.getCurrentWindow().getDownloadedFile(MN.user.dir, this.manga.id + '/cover.jpg', function (path, error) {
				if(path != null)
					panel.attr('src', path);
			});
		}
			
		if(this.manga.user_info) {
			button.on('click', function(e) {
				me.fireEvent('manga-read', e, me.manga);
			});
		} else {
			button.addClass("disabled");
			button.on('click', function(e) {
				MN.notify('Lecture manga', 'Vous devez ajouter ce mange à votre collection personnelle avant de pouvoir le lire.');
			});
		}
		
		container.append(panel).append(button);
		
		// Optionnal info if in a collection
		if(this.manga.user_info && this.manga.user_info.chapter_cur) {
			var progress = $('<div class="progress manga-progress" style="margin-top : 0px;"></div>');
			var value = ((0 + this.manga.user_info.chapter_cur) / (0 + this.manga.chapter_nb) * 100).toFixed(1);
			var progressInfo = $('<div style="text-align: center; padding-top: 10px;">Chapitre ' + this.manga.user_info.chapter_cur + '/' + this.manga.chapter_nb + ' (' + value + '%)</div>');
			
			progress.append($('<div class="progress-bar" role="progressbar" style="min-width: 2em; width: ' + value + '%;"></div>'));
			container.append(progressInfo).append(progress);
		}
		
		this.container.append(container);
	},
	_collectionToggle : function() {
		var me = this;
		
		if(!this.manga.user_info) {
			$.ajax({
				type: 'PUT',
				url: conf.endpoint + 'user/manga/' + me.manga.source_URL + '/' + me.manga.source_ID,
				dataType : 'json',
				headers : MN.authHeader(MN.user.login, MN.user.pass),
				success: function(data) {
					me.fireEvent('manga', null, me.manga);
					MN.notify('Informations mises à jour', 'Le manga a été ajouté avec succès à la collection');
				}, 
				error: function(response) {
					MN.handleRequestError(response);
				},
				fail: function(response) {
					MN.handleRequestFail(response);
				}
			});
		} else {
			$.ajax({
				type: 'DELETE',
				url: conf.endpoint + 'user/manga/' + me.manga.id,
				dataType : 'json',
				headers : MN.authHeader(MN.user.login, MN.user.pass),
				success: function(data) {
					me.fireEvent('manga', null, me.manga);
					MN.notify('Informations mises à jour', 'Le manga a été retiré de la collection avec succès');
				}, 
				error: function(response) {
					MN.handleRequestError(response);
				},
				fail: function(response) {
					MN.handleRequestFail(response);
				}
			});
		}
	},
	_download : function() {
		var me = this;

		var info = $("<span>Le téléchargement d'un manga permet de récupérer son contenu pour une lecture en mode <b>hors connexion</b>.<br/><br/>"+
					 "Cependant, le téléchargement complet d'un manga relativement long peu prendre un certain temps, "+
					 "en plus de l'espace disque requis par les différentrs images qui le compose.</span>");

		var modal = new MN.window("Téléchargement manga", info, [
				{ label : 'Annuler', action : function() { modal.dissmiss(); } },
				{ label : 'Lancer le téléchargement', type : 'primary', action : function() {
					modal.toggleDismissable();
					modal.toggleButtons();
					
					// Update view
					var progressBar = new MN.components.ProgressBar(me.manga.chapter_nb);
					var chapterInfo = $('<span>Téléchargement du chapite 1/' + me.manga.chapter_nb + ' ...</span>');
					
					info.empty().append(progressBar.getComponent()).append(chapterInfo);
					
					// Manga directory
					me.mangaDir = MN.user.dir + '/' + me.manga.id + '/';
					
					// Write the data
					remote.getCurrentWindow().writeFile(me.mangaDir, 'info.json', me.manga, function() {
						remote.getCurrentWindow().downloadFile(me.mangaDir, 'cover.jpg', me.manga.cover, function() {
							if(me.manga.chapters) {
								me._downloadChapter(1, me.manga.chapters, function(chapter, index) {
									// Update value
									progressBar.setValue(index);
									chapterInfo.html("Téléchargement du chapite " + index + '/' + me.manga.chapter_nb + ' ...');
								}, function() {
									// Finished
									chapterInfo.html('Téléchargement terminé !');
									modal.toggleDismissable();
									modal.setOptions({ label : 'Quitter', action : function() { modal.dissmiss(); } });
								});
							}
						});
					});
				} }
			]);
		modal.show();
	},
	_downloadChapter : function(index, chapters, update, done) {
		var me = this;
		
		var chapter = chapters.shift();
		var chapterDir = this.mangaDir + index;
		
		var nextChapter = function(chapterInfo) {
			update(chapterInfo, index);
			
			// Next chapter
			if(chapters.length > 0)
				me._downloadChapter(index + 1, chapters, update, done);
			else
				done();
		};
		
		// Perform the request
		$.ajax({
			type: 'GET',
			url: conf.endpoint + 'user/manga/id/' + this.manga.id + '/' + index,
			dataType : 'json',
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				var chapter = data.data;
				
				// Write the chapter info
				remote.getCurrentWindow().writeFile(chapterDir, 'info.json', chapter, function() {
					
					if(!chapter.pages || chapter.pages.length == 0)
						nextChapter(chapter);
					
					// Get images to download
					var filenames = [];
					var urls = [];
					
					for(var i = 0; i < chapter.pages.length; i++) {
						var page = chapter.pages[i];
						var imageName = page.page_nb + '.' + page.link.split('.').pop().split(/\#|\?/)[0];
						
						filenames.push(imageName);
						urls.push(page.link);
					}
					
					// Download the images
					remote.getCurrentWindow().downloadFiles(chapterDir, filenames, urls, function() {
						// Download finished
						nextChapter();
					});
				});
			},
			error: function(response) {
				MN.handleRequestError(response);
				nextChapter(null);
			},
			fail: function(response) {
				MN.handleRequestFail(response);
				nextChapter(null);
			}
		});

	},
	_favorisToggle : function() {
		if(!this.manga.user_info)
			return;
			
		var me = this;
		
		$.ajax({
			type: 'POST',
			url: conf.endpoint + 'user/manga/' + me.manga.id,
			dataType : 'json',
		    contentType: 'application/json',
		    data: JSON.stringify({ favoris : me.manga.user_info.favoris ? false : true }),
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				me.fireEvent('manga', null, me.manga);
				MN.notify('Informations mises à jour', 'Les informations ont correctement été synchronisées');
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
		this.container = $('<div class="container" ></div>');
		this.renderer.append(this.container);
	},
	updateView : function() {
		var me = this;
		
		this.loading_start();
		this.container.empty();

		// Perform the request
		if(MN.online) {
			$.ajax({
				type: 'GET',
				url: conf.endpoint + 'manga/' + this.manga.source_URL + '/' + this.manga.source_ID,
				dataType : 'json',
				headers : MN.authHeader(MN.user.login, MN.user.pass),
				success: function(data) {
					me.manga = data.data;
					me.needReload = false;
					
					me._initLeftPanel();  // Info & buttons
					me._initRightPanel(); // Pages
			
					me.loading_stop();
				},
				error: function(response) {
					MN.handleRequestError(response);
				},
				fail: function(response) {
					MN.handleRequestFail(response);
				}
			});
		} else {
			me._initLeftPanel();  // Info & buttons
			me._initRightPanel(); // Pages
	
			me.loading_stop();
		}
	}
});
