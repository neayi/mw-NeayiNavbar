/*
 * Copyright (c) 2016 The MITRE Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var neayinavbar_controller = ( function () {
	'use strict';

	return {
		baseUrl: null,
		imagepath: null,
		userPhoto: null,
		userIsAnon: null,
		userName: null,

		initialize: function () {
			this.baseUrl = window.location.href.split( /[?#]/ )[ 0 ];
			this.imagepath = mw.config.get( 'wgExtensionAssetsPath' ) + '/NeayiNavbar/images/';

			var config = mw.config.get( 'NeayiNavbar' );
			this.userPhoto = config.wgUserAvatarURL;
			this.userIsAnon = config.wgUserIsAnon;
			this.userName = config.wgUserName;

			this.setupDivs();
		},
		setupDivs: function () {
			var self = this;

			if (this.userIsAnon)
			{
				// Just change the return path of the connection link
				var relevantPageName = mw.config.get( 'wgRelevantPageName' );

				$( 'a.neayi-username').attr('href', '/index.php?title=Special:Login&returnto=' + relevantPageName);
			}
			else
			{
				$('#neayi-createaccount').remove();
				$(`<div class="row align-items-center" style="height: 100%; margin: 0">
					<div class="col-auto"><img class="neayi-avatar" src="${this.userPhoto}"></a></div>
					<div class="col"><div class="navbar-tool dropdown position-static show" id="neayi-navbar-menu"><a href="#" class="neayi-username dropdown-toggle" data-toggle="dropdown" data-boundary="viewport" title="Vous êtes connecté en tant que ${this.userName}.">${this.userName}</a></div></div>
				</div>`).appendTo( '.create-profile' );
				
				$( ".navbar-tool > .p-personal-tools" ).appendTo( "#neayi-navbar-menu" );
			}

			// Setup search
			$( "#searchform" ).appendTo("#neayi-searchform");

			$( "#neayi-search-button" ).on( "click", function() {
				$( "#neayi-searchform" ).show();
				$( 'html,body' ).animate( { scrollTop: 0 }, 'slow' );
			  });

			$( "#neayi-search-button-collapsed" ).on( "click", function() {
				$( "#neayi-searchform" ).show();
				$( "#mw-navigation div.navbar-collapse" ).collapse('hide');
				$( 'html,body' ).animate( { scrollTop: 0 }, 'slow' );
			  });

			$( "#searchform-close" ).on( "click", function() {
				$( "#neayi-searchform" ).hide();
			  });
		}
	}; // return line 26
}() );

window.NeayiNavbarController = neayinavbar_controller;

( function () {
	$( document )
		.ready( function () {
			if ( mw.config.exists( 'NeayiNavbar' ) ) {
				window.NeayiNavbarController.initialize();
			}
		} );
}() );

