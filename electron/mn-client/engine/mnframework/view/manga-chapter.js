var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

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
		var download = $('<button class="btn btn-default">Télécharger</button>');
		
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
		
		download.on('click', function(e) {
			remote.getCurrentWindow().exportFiles(me.imageFiles, function(path, error) {
				if(!error)
					MN.notify('Chapitre sauvegardé', 'Le chapitre en cours de lecture a été sauvegardé dans le fichier ' + path);	
			});
		});
		
		this.controls.append(plus).append(minus).append('<hr/>').append(up).append(down).append('<hr/>').append(back).append(download);
	},
	_initMangaPages : function() {
		var me = this;
		this.images = [];  // All the images
		this.imageFiles = [];
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
				
				me.imageFiles.push(path);
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
