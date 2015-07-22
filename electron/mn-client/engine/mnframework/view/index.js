var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// Import all the views
var components = ['login',
				  'navbar',
				  'homepage',
				  'manga-info',
				  'manga-chapter',
				  'search',
				  'option',
				  'user-info'];

for(var i = 0; i < components.length; i++) {
	var imported = require('./' + components[i] + '.js');
	for (var attrname in imported) {
		MN[attrname] = imported[attrname];
	}
}
