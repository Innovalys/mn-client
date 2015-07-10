// Requires moment.js
var moment = require('moment');
var notify = require('./elements.js').notify;

var MN = exports; // Add export value

// Header utils function
MN.authHeader = function(login, password) {
	return { 'Authorization' : 'Basic ' + btoa(login + ":" + password) }
}

// handle for a bad request response
MN.handleRequestError = function(response) {
	console.error(response);
	if(response.responseJSON && response.responseJSON.data && response.responseJSON.data.message) {
		notify('Erreur lors du chargement des informations', 'La requête a échouée avec le code <b>' + response.status + '</b>. Le serveur a également indiqué <em>"' + response.responseJSON.data.message + '"</em>', 'error');
	} else {
		notify('Erreur lors du chargement des informations', 'La requête a échouée avec le code ' + response.status + '. Aucun message d\'erreur n\'a pu être récupéré', 'error');
	}
}

// handle for a failed request
MN.handleRequestFail = function(response) {
	console.error(response);
	notify('L\'envoie de la requête a échoué', 'Impossible d\'envoyer la requête. Il n\'y a peu être plus de connexion internet.', 'error');
}	

// Format the date in an human readable way
MN.formatDate = function(time) {
	if(time == '0000-00-00 00:00:00')
		return '[Aucune date disponible]';
	else
		return moment(time, 'YYYY-MM-DD hh:mm:ss', 'fr').fromNow();
}
