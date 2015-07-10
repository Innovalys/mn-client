
// Components used in the framwork
var components = ['utils.js', 'elements.js', 'extend.js'];

for(var i = 0; i < components.length; i++) {
	var imported = require('./' + components[i]);
	for (var attrname in imported) {
		exports[attrname] = imported[attrname];
	}
}
