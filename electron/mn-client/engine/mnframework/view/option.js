var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

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
