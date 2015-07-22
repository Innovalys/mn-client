var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

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

