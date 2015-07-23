var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- Search view TODO
// ---------------------------
// View for searching manga or authors
MN.Search = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = 'advanced search';
		
			console.log(values);
		if(values) {
			this.toSearch = values.manga; // only handle manga for now
		}
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
				if(keywordsInput.val().length > 0)
					me._searchGeneral(sourceSelected.val(), keywordsInput.val());
			}
		});
		
		if(this.toSearch)
			keywordsInput.val(this.toSearch);
			
		// Search value
		var searchField = $('<button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>');
		
		content.append(values).append(searchField);
		panel.append(header).append(content);
		
		searchField.on('click', function(e) {
			if(keywordsInput.val().length > 0)
				me._searchGeneral(sourceSelected.val(), keywordsInput.val());
		});
		
		this.searchContainer.append($('<div class="col-md-4"></div>').append(panel));
	},
	_initUserSearchFields : function() {
		var me = this;
		var panel = $('<div class="panel panel-warning panel-search"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Recherche utilisateur</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var values = $('<ul></ul>');
		
		// Keywords
		var keywords = $('<li></li>');
		var keywordsInput = $('<input type="text" />');
		keywords.append('<label>Login utilisateur :</label>').append('<br/>').append(keywordsInput);
		values.append(keywords);
		
		keywordsInput.keypress(function(e) {
			if ( e.which == 13 ) {
				e.preventDefault();
				if(keywordsInput.val().length > 0)
					me._searchUser(keywordsInput.val());
			}
		});
		
		if(this.toSearch)
			keywordsInput.val(this.toSearch);
			
		// Search value
		var searchField = $('<button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>');
		
		content.append(values).append(searchField);
		panel.append(header).append(content);
		
		searchField.on('click', function(e) {
			if(keywordsInput.val().length > 0)
				me._searchUser(keywordsInput.val());
		});
		
		this.searchContainer.append($('<div class="col-md-4"></div>').append(panel));
	},
	_initMangaPersonalSearchFields : function() {
		var me = this;
		var panel = $('<div class="panel panel-danger panel-search"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Recherche dans sa librairie</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		var values = $('<ul></ul>');
		
		// Keywords
		var keywords = $('<li></li>');
		var keywordsInput = $('<input type="text" />');
		keywords.append('<label>Nom du manga :</label>').append('<br/>').append(keywordsInput);
		values.append(keywords);
		
		keywordsInput.keypress(function(e) {
			if ( e.which == 13 ) {
				e.preventDefault();
				if(keywordsInput.val().length > 0)
					me._searchPersonal(keywordsInput.val());
			}
		});
		
		if(this.toSearch)
			keywordsInput.val(this.toSearch);
			
		// Search value
		var searchField = $('<button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>');
		
		content.append(values).append(searchField);
		panel.append(header).append(content);
		
		searchField.on('click', function(e) {
			if(keywordsInput.val().length > 0)
				me._searchPersonal(keywordsInput.val());
		});
		
		this.searchContainer.append($('<div class="col-md-4"></div>').append(panel));
	},
	_initSearchFields : function() {
		this.searchContainer = $('<div class="row searchBlock"></div>');
		
		this._initMangaSearchFields();
		this._initMangaPersonalSearchFields();
		this._initUserSearchFields();
		
		this.container.append(this.searchContainer);
	},
	_initResultsFields : function() {
		this.resultsContainer = $('<div class="row searchBlock" style="display: none"></div>');
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Résultats de la recherche</h3></div>');
		this.resultContent = $('<div class="panel-body"></div>');

		this.spinner = $('<div></div>').append($('<div class="loader">Loading...</div>')).append('<div class="container loader-text">Chargement en cours...</div>');
		this.spinner.css('display', 'none');

		this.container.append(this.spinner);
		this.container.append(this.resultsContainer.append(panel.append(header).append(this.resultContent)));
	},
	_search : function(uri) {
		var me = this;
			
		// Desactivate all the components of the form
		this.searchContainer.find('*').attr('disabled', true);
			
		// Hide existing results
		this.resultsContainer.fadeOut(function() {
			
			// Empty results & show spinner
			me.resultContent.empty();
			me.spinner.fadeIn();
			
			// Start timer
			var start = new Date().getTime();
			
			// Perform the request
			$.ajax({
				type: 'GET',
				url: conf.endpoint + uri,
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
	_searchUser : function(keywords) {
		var me = this;
			
		// Desactivate all the components of the form
		this.searchContainer.find('*').attr('disabled', true);
			
		// Hide existing results
		this.resultsContainer.fadeOut(function() {
			
			// Empty results & show spinner
			me.resultContent.empty();
			me.spinner.fadeIn();
			
			// Start timer
			var start = new Date().getTime();
			
			// Perform the request
			$.ajax({
				type: 'GET',
				url: conf.endpoint + 'user/search/' + encodeURIComponent(keywords),
				dataType : 'json',
				headers : MN.authHeader(MN.user.login, MN.user.pass),
				success: function(response) {
					var end = new Date().getTime();
					var time = end - start;

					MN.notify("Recherche effectuée", "La recherche a été effectuée avec succès, et a retournée " + response.data.length + ' résultat(s) en ' + time + 'ms');
					me._showUserResults(response.data);
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
	_searchGeneral : function(api, keywords) {
		this._search('manga/search/' + api + '/' + encodeURIComponent(keywords));
	},
	_searchPersonal : function(keywords) {
		this._search('user/search/' + MN.user.id + '/' + encodeURIComponent(keywords));
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
			
			var image = $('<img class="img-responsive img-manga-cover" src="' + conf.image + 'cover.jpg"  style="height: 100px;" data-toggle="tooltip" title="' + result.title + '" alt="' + result.title + '" />');
			image.tooltip(); // Add the tooltip
			row.append($('<td rowspan="2"></td>').append(image));
			
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
			if(result.genres && result.genres.length > 0) {
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
			
			resultTable.append(row);

			// Add info about the manga
			row = $('<tr></tr>');
			if(result.user_info) {
				var tags = $('<td colspan="3"></td>');
				tags.append($('<button type="button" class="btn btn-info btn-xs btn-tag">Dans la collection</button>'));
				
				if(result.user_info.favoris) {
					tags.append($('<button type="button" class="btn btn-warning btn-xs btn-tag">Favoris</button>'));
				}

				row.append(tags);
			} else
				row.append($('<td colspan="3"><button type="button" class="btn btn-disabled btn-xs btn-tag">Pas dans la collection</button></td>'));

			resultTable.append(row);
		});
		
		this.resultContent.append(resultTable);
		
		this.spinner.fadeOut(function() {
			me.resultsContainer.fadeIn();
		});
	},
	_showUserResults : function(results) {
		var me = this;
		var resultTable = $('<table class="table table-striped" style="background-color: white;"></table>');
		
		// Headers
		var header = $('<tr></tr>');
		header.append('<th> Login </th>');
		header.append('<th> Nom </th>');
		header.append('<th></th>');
		resultTable.append(header);
		
		// Construct the array
		results.forEach(function(result) {
			var row = $('<tr></tr>');
			
			// Login
			var login = $('<td class="clickable">' + result.login + '</td>');
			row.append(login);
			
			login.on('click', function(e) {
				// Load the selected user
				me.fireEvent("user", e, { id : result.id });
			});

			// Name
			row.append('<td>' + (result.name ? result.name : "" ) + '</td>');

			// Number of followers & following
			var infos = $('<td></td>');
			infos.append('Nombre d\'abonné(s) : ' + result.following.length + '<br/>Nombre d\'abonnement(s) : ' + result.followed.length);
			row.append(infos);

			resultTable.append(row);
		});
		
		this.resultContent.append(resultTable);
		
		this.spinner.fadeOut(function() {
			me.resultsContainer.fadeIn();
		});
	},
	initView : function() {
		this.container = $('<div class="container" ></div>');

		this._initSearchFields();
		this._initResultsFields();
		
		this.renderer.append(this.container);

		if(this.toSearch)
			this._searchGeneral('all', this.toSearch); // Search on all APIs
	}
});
