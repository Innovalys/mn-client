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
				me.fireEvent('search', e, input.val());
			}
		});
		button.on('click', function(e) {
			e.preventDefault();
			me.fireEvent('search', e, input.val());
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
		username.on('click', function(e) { me.fireEvent('user', e); });
		
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
						remote.getCurrentWindow().downloadFiles(me.mangaDir, 'cover.jpg', me.manga.cover, function() {
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

// -- Manga chapter read view
// ---------------------------
// View allowing the user to read a page for a chapter of a manga
MN.MangaChapter = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = 'chapter reader';
		this.manga = values.manga;
		this.chapter_nb = values.chapter ? values.chapter : (this.manga.user_info.chapter_cur ?  this.manga.user_info.chapter_cur : 1);
		this.page_nb = values.chapter ? null : this.manga.user_info.page_cur;
	},
	_initLeftPanel : function() {
		var me = this;
		this.titleContainer = $('<div class="container row" style="text-align: center" ></div>');
		
		var mangaTitle = $('<h2>' + this.manga.title + '</h2>');
		var title = $('<h3> Chapitre ' + this.chapter_nb + ' : ' + this.chapter.title + '</h3>');
		
		this.titleContainer.append(mangaTitle).append(title).append('<br/>');
		
		this.container.append(this.titleContainer);
	},
	_initRightPanel : function() {
		var me = this;
		this.mangaPages = $('<div class="container row" ></div>');
		this.controls = $('<div class="container panel-body manga-controls" ></div>');
			
		// Controls & images
		this._initControls();
		this._initMangaPages();
		
		// Init next/previous chapter buttons
		var prevChapter = $('<button type="button" class="btn btn-lg btn-default">Chapitre précédant</button>');
		var nextChapter = $('<button type="button" class="btn btn-lg btn-default">Chapitre suivant</button>');
		
		if(this.chapter_nb <= 1)
			prevChapter.attr('disabled', true);
		else
			prevChapter.on('click', function(e) {
				me.fireEvent('manga-read', e, me.manga, me.chapter_nb - 1);
			});
								
		if(this.chapter_nb >= this.manga.chapter_nb)
			nextChapter.attr('disabled', true);
		else
			nextChapter.on('click', function(e) {
				me.fireEvent('manga-read', e, me.manga, me.chapter_nb + 1);
			});
			
		this.mangaPages.append($('<div class="container manga-image"></div>').append($('<div class="btn-group"></div>').append(prevChapter).append(nextChapter)));
		
		this.container.append(this.controls);
		this.container.append(this.mangaPages);
	},
	_initControls : function() {
		var me = this;
		var plus = $('<button class="btn btn-primary">+</button>');
		var minus = $('<button class="btn btn-primary">-</button>');
		var up = $('<button class="btn btn-default">Aller en haut</button>');
		var down = $('<button class="btn btn-default">Aller en bas</button>');
		var back = $('<button class="btn btn-default">Retour</button>');
		
		plus.on('click', function() {
			me.images.forEach(function(image) {
				image.animate({ width : image.width() + 20}, 200);
			});
			
			// Scroll back to the selected image
			setTimeout(function() {
				$('html,body').animate({ scrollTop: (me.image ? me.image.offset().top - 80 : 0) }, 400);
			}, 300);
		});
		
		minus.on('click', function() {
			me.images.forEach(function(image) {
				image.animate({ width : image.width() - 20}, 200);
			});
			
			// Scroll back to the selected image
			setTimeout(function() {
				$('html,body').animate({ scrollTop: (me.image ? me.image.offset().top - 80 : 0) }, 400);
			}, 300);
		});
		
		up.on('click', function() {
			$('html,body').animate({ scrollTop: 0 }, 400);
		});
		
		down.on('click', function() {
			$('html,body').animate({ scrollTop: me.container.height() }, 400);
		});
		
		back.on('click', function(e) {
			me.fireEvent('manga', e, me.manga);
		});
		
		this.controls.append(plus).append(minus).append('<hr/>').append(up).append(down).append('<hr/>').append(back);
	},
	_initMangaPages : function() {
		var me = this;
		this.images = [];  // All the images
		this.image = null; // Current image
		
		var scrolling = false; // If any code controller scrolling is happening in the view
		
		var loadedPages = 0;
		var loader = $('<div class="container manga-image alert alert-info" style="width:550px;">Chargement des images en cours...</div>');
		
		me.mangaPages.append(loader);
		
		this.chapter.pages.forEach(function(page) {
			var panel = $('<div class="container manga-image"></div>');
			var image = $('<img class="img-responsive" src="' + conf.image + 'cover.jpg" alt="' + me.chapter.title + '(' + page.page_nb + ')" />');
			var info = $('<div class="page-number"> Page ' + page.page_nb + '/' + me.chapter.pages.length + '</div>');
			me.mangaPages.append(panel.append(image).append(info));
			
			// Load the real image
			remote.getCurrentWindow().getFile(MN.user.dir, page.link, function (path, error) {
				if(path != null)
					image.attr('src', path);
				
				if(++loadedPages >= me.chapter.pages.length) {
					loader.slideUp(function() {
						loader.remove();
					});
				}
			});
			
			image.on('appear', function(e) {
				if(!scrolling) {
					if(me.image)
						me.image.removeClass('selected');
						
					me.image = image;
					me.image.addClass('selected');
				}
			});
			
			me.images.push(image);
		});
		
		$(document).keydown(function(e) {
			if(scrolling)
				return;
			
		    switch(e.which) {
		        case 37: // left
				var index = me.images.indexOf(me.image);
				if(index > 0) {
					me.images[index - 1].trigger('appear');
					scrolling = true; // lock scrolling
					
					if(!me.image || me.image.offset().top != 0) {
						$('html,body').animate({ scrollTop: (me.image ? me.image.offset().top - 80 : 0) }, 400).promise().always(function() {
							scrolling = false;
						});
					}
				}
		   		e.preventDefault();
		        break;
		
		        case 39: // right
				var index = me.images.indexOf(me.image);
				if(index + 1 < me.images.length) {
					me.images[index + 1].trigger('appear');
					scrolling = true; // lock scrolling
					
					if(!me.image || me.image.offset().top != 0) {
						$('html,body').animate({ scrollTop: (me.image ? me.image.offset().top - 80 : 0) }, 400).promise().always(function() {
							scrolling = false;
						});
					}
				}
		    	e.preventDefault();
		        break;
		
		        default: return;
		    }
		});
		
		$(document).on('scroll', function(){
			// Guess what image is in the view
			var pos = $(this).scrollTop();
			
			for(var i = 0; i < me.images.length; i++) {
				
				var imagePos = me.images[i].offset().top;
				var imageHeight = me.images[i].height();
				
				if(pos > imagePos - imageHeight/2 && pos < imagePos + imageHeight/2) {
					 me.images[i].trigger('appear');
					 break;
				}
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
		$.ajax({
			type: 'GET',
			url: conf.endpoint + 'user/manga/id/' + this.manga.id + '/' + this.chapter_nb,
			dataType : 'json',
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				me.chapter = data.data;
				
				if(me.manga.user_info.chapter_cur != null && me.manga.user_info.chapter_cur == me.chapter_nb - 1) {
					// Update the actual chapter for this manga
					$.ajax({
						type: 'POST',
						url: conf.endpoint + 'user/manga/' + me.manga.id,
						dataType : 'json',
					    contentType: 'application/json',
					    data: JSON.stringify({ chapter : me.chapter_nb }),
						headers : MN.authHeader(MN.user.login, MN.user.pass),
						success: function(data) {
							me.manga.user_info.chapter_cur++ ; // Update local data
							MN.notify('Chapitre mis à jour', 'Le chapitre en cours de lecture a été synchronisé');
						}, 
						error: function(response) {
							MN.handleRequestError(response);
						},
						fail: function(response) {
							MN.handleRequestFail(response);
						}
					});
				}
				
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
	}
});

// -- Search view TODO
// ---------------------------
// View for searching manga or authors
MN.Search = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = 'advanced search';
	},
	_initMangaSearchFields : function() {
		var me = this;
		var panel = $('<div class="panel panel-info panel-search"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Recherche de manga</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var values = $('<ul></ul>');
		
		// Source choices
		var sources = [
			{ api : 'all', name : ' Toutes' },
			{ api : 'mangafox.me', name : ' Manga Fox' },
		    { api : 'mangareader.net', name : ' Manga Reader' },
			{ api : 'mangastream.com', name : ' Manga Stream' },
			{ api : 'mangaeden.com', name : ' Manga Eden' }
		];
		
		var sourceList = $('<li></li>');
		var sourceSelected = null;
		sourceList.append($('<label>Choisir la source</label>')).append($('<br/>'));
		
		sources.forEach(function(source) {
			var sourceBox = $('<input type="radio" name="source" value="' + source.api + '" />');
			sourceList.append(sourceBox).append(source.name).append($('<br/>'));
			
			if(source.api == 'all') { // Default value
				sourceBox.attr("checked", true);
				sourceSelected = sourceBox;
			}
			
			sourceBox.on('click', function(e) {
				sourceSelected = sourceBox;
			});
		});
		values.append(sourceList);
		
		// Keywords
		var keywords = $('<li></li>');
		var keywordsInput = $('<input type="text" />');
		keywords.append('<label>Nom du manga :</label>').append('<br/>').append(keywordsInput);
		values.append(keywords);
		
		keywordsInput.keypress(function(e) {
			if ( e.which == 13 ) {
				e.preventDefault();
				me._search(sourceSelected.val(), keywordsInput.val());
			}
		});
		
		// Search value
		var searchField = $('<button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>');
		
		content.append(values).append(searchField);
		panel.append(header).append(content);
		
		searchField.on('click', function(e) {
			me._search(sourceSelected.val(), keywordsInput.val());
		});
		
		this.searchContainer.append($('<div class="col-md-4"></div>').append(panel));
	},
	_initAuthorSearchFields : function() {
		
	},
	_initUserSearchFields : function() {
		
	},
	_initSearchFields : function() {
		this.searchContainer = $('<div class="row searchBlock"></div>');
		
		this._initMangaSearchFields();
		//this._initMangaSearchFields(); TODO
		//this._initMangaSearchFields(); TODO
		
		this.container.append(this.searchContainer);
	},
	_initResultsFields : function() {
		this.resultsContainer = $('<div class="row searchBlock"></div>');
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Résultats de la recherche</h3></div>');
		this.resultContent = $('<div class="panel-body"></div>');
		
		this.container.append(this.resultsContainer.append(panel.append(header).append(this.resultContent)));
	},
	_search : function(api, keywords) {
		var me = this;
			
		// Desactivate all the components of the form
		this.searchContainer.find('*').attr('disabled', true);
			
		// Hide existing results
		this.resultContent.slideUp(function() {
			
			// Empty results
			me.resultContent.empty();
			
			// Start timer
			var start = new Date().getTime();
			
			// Perform the request
			$.ajax({
				type: 'GET',
				url: conf.endpoint + 'manga/search/' + api + '/' + encodeURIComponent(keywords),
				dataType : 'json',
				headers : MN.authHeader(MN.user.login, MN.user.pass),
				success: function(response) {
					var end = new Date().getTime();
					var time = end - start;

					MN.notify("Recherche effectuée", "La recherche a été effectuée avec succès, et a retournée " + response.data.length + ' résultat(s) en ' + time + 'ms');
					me._showResults(response.data);
				},
				error: function(response) {
					MN.handleRequestError(response);
				},
				fail: function(response) {
					MN.handleRequestFail(response);
				}
			}).always(function () {
				me.searchContainer.find('*').attr('disabled', false);
			});
		});
	},
	_showResults : function(results) {
		var me = this;
		var resultTable = $('<table class="table table-striped" style="background-color: white;"></table>');
		
		// Headers
		var header = $('<tr></tr>');
		header.append('<th> Couverture </th>');
		header.append('<th> Titre </th>');
		header.append('<th> Source </th>');
		header.append('<th> Genres </th>');
		header.append('<th></th>');
		resultTable.append(header);
		
		// Construct the array
		results.forEach(function(result) {
			var row = $('<tr></tr>');
			
			var image = $('<img class="img-responsive" src="' + conf.image + 'cover.jpg"  style="height: 100px;" data-toggle="tooltip" title="' + result.title + '" alt="' + result.title + '" />');
			image.tooltip(); // Add the tooltip
			row.append($('<td></td>').append(image));
			
			image.on('click', function(e) {
				// Load the selected manga
				me.fireEvent("manga", e, result, true);
			});
			
			// Load the real image
			if(result.cover) {
				remote.getCurrentWindow().getFile(MN.user.dir, result.cover, function (path, error) {
					if(path != null)
						image.attr('src', path);
				});
			}
			
			row.append('<td>' + result.title + '</td>');
			row.append('<td>' + result.source_URL + '</td>');
			
			var genres = $('<td></td>');
			if(result.genres && result.length > 0) {
				result.genres.forEach(function(genre) {
					var button = $('<button type="button" class="btn btn-info btn-xs btn-tag">' + genre + '</button>');
					/*
					button.on('click', function(e) {
						me.fireEvent('search', e, { genre : genre });
					});*/
					genres.append(button);
				});
			} else {
				genres.append($('<button type="button" class="btn btn-info btn-xs disabled">[Aucun]</button>'));
			}
			row.append(genres);
			
			row.append('<td> [Commandes] </td>');
			
			resultTable.append(row);
		});
		
		this.resultContent.append(resultTable);
		this.resultContent.slideDown();
	},
	initView : function() {
		this.container = $('<div class="container" ></div>');

		this._initSearchFields();
		this._initResultsFields();
		
		this.renderer.append(this.container);
	}
});


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
		renderer.empty();
		
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

