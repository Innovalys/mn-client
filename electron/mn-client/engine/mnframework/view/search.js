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
				me._search(sourceSelected.val(), keywordsInput.val());
			}
		});
		
		if(this.toSearch)
			keywordsInput.val(this.toSearch);
			
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

		this.spinner = $('<div></div>').append($('<div class="loader">Loading...</div>')).append('<div class="container loader-text">Chargement en cours...</div>');
		this.spinner.css('display', 'none');

		this.container.append(this.spinner);
		this.container.append(this.resultsContainer.append(panel.append(header).append(this.resultContent)));
	},
	_search : function(api, keywords) {
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
			this._search('all', this.toSearch); // Search on all APIs
	}
});
