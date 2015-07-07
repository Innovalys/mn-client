
// Components to export
var components = ['utils', 'elements', 'extend'];

for(var i = 0; i < components.length; i++) {
	var imported = require('./' + components[i] + '.js');
	for (var attrname in imported) {
		exports[attrname] = imported[attrname];
	}
}
