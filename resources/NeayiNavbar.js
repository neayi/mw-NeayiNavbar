/*
 * Copyright (c) 2023 Neayi SAS
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

var neayinavbar_controller = (function () {
	'use strict';

	return {
		baseUrl: null,
		imagepath: null,
		userPhoto: null,
		userIsAnon: null,
		userName: null,
		userGuid: null,
		wgInsightsRootURL: null,

		initialize: function () {
			this.baseUrl = window.location.href.split(/[?#]/)[0];
			this.imagepath = mw.config.get('wgExtensionAssetsPath') + '/NeayiNavbar/images/';

			var config = mw.config.get('NeayiNavbar');
			this.userPhoto = config.wgUserAvatarURL;
			this.userIsAnon = config.wgUserIsAnon;
			this.userName = config.wgUserName;
			this.wgInsightsRootURL = config.wgInsightsRootURL;
			this.userGuid = config.wgUserGuid;

			this.setupDivs();

			this.getRealUserName();
		},

		setupDivs: function () {
			var self = this;

			if (this.userIsAnon) {
				// Just change the return path of the connection link
				var relevantPageName = mw.config.get('wgRelevantPageName');

				$('a.neayi-username').attr('href', '/index.php?title=Special:Login&returnto=' + relevantPageName);
			}
			else {
				$('#neayi-createaccount').remove();
				$(`<div class="row align-items-center" style="height: 100%; margin: 0">
					<div class="col-auto"><img class="neayi-avatar" src="${this.userPhoto}"></a></div>
					<div class="col"><div class="navbar-tool dropdown position-static show"
						id="neayi-navbar-menu"><a href="#" class="neayi-username dropdown-toggle"
						data-toggle="dropdown" data-boundary="viewport" title="`+mw.message('neayinavbar-you-are-connected-as', this.userName).escaped() +`">${this.userName}</a></div></div>
				</div>`).appendTo('.create-profile');

				$(".navbar-tool > .p-personal-tools").appendTo("#neayi-navbar-menu");
				$(" #pt-userpage > a ").attr('href', this.wgInsightsRootURL + 'profile');
			}

			// Setup search
			$("#searchform").appendTo("#neayi-searchform");

			$("#neayi-search-button").on("click", function () {
				$("#neayi-searchform").show();
				$('html,body').animate({ scrollTop: 0 }, 'slow');
				$('#searchInput').focus();
			});

			$(`<input type="hidden" value="default" name="profile">`).appendTo("#searchform");

			$("#searchform-close").on("click", function () {
				$("#neayi-searchform").hide();
			});

			// Use the wiki/Search page with the WikiSearchFront instead of Special:Search
			$('#searchform > input[name="title"]').val( 'Search' );
			$('#searchInput').attr('name', 'term');
			$('#homesearch').attr('action', '/wiki/Search');
			$('#searchInput.searchboxInput ').attr('name', 'term');

			// If the search form is visible (on mobile) we scroll automatically past it:
			if ($('#neayi-searchform').is(':visible') && $('html').scrollTop() == 0)
			{
				var offset = $('.mainContainer').offset();
				offset.left -= 20;
				offset.top -= 35;
				$('html, body').animate({
					scrollTop: offset.top,
					scrollLeft: offset.left
				}, 0);
			}

			this.setupTableOfContent();
			this.setHomepageHeroImages();
			this.setHorizontalScrollspy();
		},

		setupTableOfContent: function() {

			// Setup the table of content
			var toc = $('#toc');
			if (!toc || toc.length == 0)
				return;

			toc.appendTo('.leftSide');

			toc.find("a").each(function () {
				$(this).addClass("nav-link");
				$(this).parent().addClass("nav-item");
				$(this).parent().parent().addClass("nav flex-column");
			});

			// If the Toc has too many elements, we remove all elements of level 4 (====):
			if ($('#toc li').length > 10)
				$('#toc li.toclevel-3').remove();

			setTimeout(function () {
				$('body').scrollspy({ target: '#toc', 'offset': 0 });
			}, 1000);
		},

		setHomepageHeroImages: function() {

			// Hero Background Slides
			var imageHead = document.getElementById("js-hero");
			if (!imageHead)
				return;

			var images = [
				"/skins/skin-neayi/images/hero/shutterstock_1140147020.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_1429817771.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_1504970357.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_150648098.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_1730941180.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_340650272.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_484967650.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_562305403.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_660208033.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_708166867.jpg",
				"/skins/skin-neayi/images/hero/shutterstock_91296467.jpg"
			];

			var i = 0;

			setInterval(function () {
				imageHead.style.backgroundImage = "url(" + images[i] + ")";
				i = i + 1;
				if (i == images.length) {
					i = 0;
				}
			}, 4000);
		},

		setHorizontalScrollspy: function() {

			// Horizontal scrollspy
			var bar_bg = $(".scrollbar-bg");
			bar_bg.css("min-width", $(document).width() + "px");

			$(window).resize(function() {
				// Update the gradient width
				bar_bg.css("min-width", $(document).width() + "px");
			});

			$(window).scroll(function(e) {
				// Change the width of the progress bar
				var bar = $("#scrollbar"),
					barmobile = $("#scrollbar-mobile"),
					dw  = $(document).width(),
					dh  = $(document).height(),
					wh  = $(window).height(),
					pos = $(document).scrollTop(),
					bw  = ((pos / (dh - wh)) * 100);

				bar.css("width", bw + "%");
				barmobile.css("width", bw + "%");
			});
		},

		getRealUserName: function () {
			// https://insights.dev.tripleperformance.fr/api/user/b55afad2-234f-44aa-ac99-2ee763729c5d/context
			var self = this;

			if (self.userGuid == '')
				return;

			$.ajax({
				url: self.wgInsightsRootURL + "api/user/" + self.userGuid + "/context",
				dataType: 'json',
				method: "GET"
			}).done(function (data) {
				self.userName = data.firstname + ' ' + data.lastname;
				$( 'a.neayi-username' ).text(self.userName).attr('title', mw.message('neayinavbar-you-are-connected-as', self.userName).plain() );
				$( 'a.pt-userpage' ).text(self.userName);
			});
		},
	}; // return line 26
}());

window.NeayiNavbarController = neayinavbar_controller;

(function () {
	$(document)
		.ready(function () {
			if (mw.config.exists('NeayiNavbar')) {
				window.NeayiNavbarController.initialize();
			}
		});
}());

