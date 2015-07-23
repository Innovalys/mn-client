var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- Manga page
// ---------------------------
// View displaying all the manga of the user
MN.MangaAll = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "homepage";
		this.user = values.user || MN.user;
	},
	_initContent : function() {
		var me = this;

		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Collection de ' + this.user.login + '</h3></div>');
		var content = $('<div class="panel-body"></div>');
		panel.append(header).append(content);

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
		this.mangas.forEach(function(manga) {
			var row = $('<tr></tr>');
			
			var image = $('<img class="img-responsive img-manga-cover" src="' + conf.image + 'cover.jpg"  style="height: 100px;" data-toggle="tooltip" title="' + manga.title + '" alt="' + manga.title + '" />');
			image.tooltip(); // Add the tooltip
			row.append($('<td rowspan="2"></td>').append(image));
			
			image.on('click', function(e) {
				// Load the selected manga
				me.fireEvent("manga", e, manga, true);
			});
			
			// Load the real image
			if(manga.cover) {
				remote.getCurrentWindow().getFile(MN.user.dir, manga.cover, function (path, error) {
					if(path != null)
						image.attr('src', path);
				});
			}
			
			row.append('<td>' + manga.title + '</td>');
			row.append('<td>' + manga.source_URL + '</td>');
			
			var genres = $('<td></td>');
			if(manga.genres && manga.genres.length > 0) {
				manga.genres.forEach(function(genre) {
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
			if(manga.user_info) {
				var tags = $('<td colspan="3"></td>');
				tags.append($('<button type="button" class="btn btn-info btn-xs btn-tag">Dans la collection</button>'));
				
				if(manga.user_info.favoris) {
					tags.append($('<button type="button" class="btn btn-warning btn-xs btn-tag">Favoris</button>'));
				}

				row.append(tags);
			} else
				row.append($('<td colspan="3"><button type="button" class="btn btn-disabled btn-xs btn-tag">Pas dans la collection</button></td>'));

			resultTable.append(row);
		});
		
		content.append(resultTable);
		this.container.append(panel);
	},
	initView : function() {
		this.container = $('<div class="container"></div>');
		this.renderer.append(this.container);
	},
	updateView : function() {
		var me = this;
		
		this.loading_start();
		this.container.empty();

		// Perform the request
		$.ajax({
			type: 'GET',
			url: conf.endpoint + 'user/mangas/' + this.user.id,
			dataType : 'json',
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				me.mangas = data.data;
				
				me._initContent();
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
