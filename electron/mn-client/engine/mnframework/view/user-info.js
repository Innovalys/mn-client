var MN = require('../framework');
var remote = require('remote');

module.exports = MN;

// -- User view
// ---------------------------
// View displaying informations about the selected manga
MN.UserInfo = MN.BaseElement.extend({
	init : function(values) {
		this._super();
		this.id = "user info";
		this.userID = values.id || MN.user.id;
	},
	_initContent : function() {

		// TODO : show list of following users
		//        show list of users he follows
		//        
		//        Avatar ? With only URLs ? TODO

		this._initUserInfo();
		this._initFollowedPanel();
		this._initFollowingPanel();
	},
	_initUserInfo : function() {
		// Info
		var title = $('<h2>' + this.user.login + '</h2>');
		var name = $('<h4> Nom : ' + this.user.name + '</h4>');

		// Actions
		var followUser = $('<button type="button" class="btn">Suivre l\'utilisateur</button>');

		this.container.append(title).append(name).append(followUser);
	},
	_initFollowedPanel : function() {
		var me = this;

		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Utilisateurs suivit</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		this.user.followed.forEach(function(user) {
			var userButton = $('<button type="button" class="btn btn-info btn-xs btn-tag">' + user.login + '</button>');
			userButton.on('click', function(e) {
				me.fireEvent('user', e, { id : user.id });
			});

			content.append(userButton);
		});

		panel.append(header).append(content);
		this.container.append(panel);
	},
	_initFollowingPanel : function() {
		var me = this;
		
		var panel = $('<div class="panel panel-default"></div>');
		var header = $('<div class="panel-heading"><h3 class="panel-title">Utilisateurs abonnés</h3></div>');
		var content = $('<div class="panel-body"></div>');
		
		this.user.following.forEach(function(user) {
			var userButton = $('<button type="button" class="btn btn-info btn-xs btn-tag">' + user.login + '</button>');
			userButton.on('click', function(e) {
				me.fireEvent('user', e, { id : user.id });
			});

			content.append(userButton);
		});

		panel.append(header).append(content);
		this.container.append(panel);
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
			url: conf.endpoint + 'user/' + this.userID,
			dataType : 'json',
			headers : MN.authHeader(MN.user.login, MN.user.pass),
			success: function(data) {
				me.user = data.data;
				
				me._initContent();  // Info & buttons
		
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

