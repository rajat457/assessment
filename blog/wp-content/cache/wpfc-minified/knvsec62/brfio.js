// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/thegem-menu_init.js?ver=5.8.1 
function supportsTransitions() {
	return getSupportedTransition() != '';
}

function getSupportedTransition() {
	var b = document.body || document.documentElement,
		s = b.style,
		p = 'transition';

	if (typeof s[p] == 'string') { return p; }

	// Tests for vendor specific prop
	var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
	p = p.charAt(0).toUpperCase() + p.substr(1);

	for (var i=0; i<v.length; i++) {
		if (typeof s[v[i] + p] == 'string') { return true; }
	}

	return '';
}
window.supportedTransition = getSupportedTransition();
window.supportsTransitions = supportsTransitions();

function supportsAnimations() {
	return getSupportedAnimation() != '';
}

function getSupportedAnimation() {
	var t,
		el = document.createElement("fakeelement");

	var animations = {
		"animation"	  : "animationend",
		"OAnimation"	 : "oAnimationEnd",
		"MozAnimation"   : "animationend",
		"WebkitAnimation": "webkitAnimationEnd",
		'msAnimation' : 'MSAnimationEnd'
	};

	for (t in animations){
		if (el.style[t] !== undefined) {
			return t;
		}
	}
	return '';
}
window.supportedAnimation = getSupportedAnimation();
window.supportsAnimations = supportsAnimations();

function getMobileMenuType() {
	if(!document.getElementById('site-header')) return 'default';
	var m = document.getElementById('site-header').className.match(/mobile-menu-layout-([a-zA-Z0-9]+)/);
	window.gemMobileMenuType = m ? m[1] : 'default';
	return window.gemMobileMenuType;
}
getMobileMenuType();

(function() {
	var logoFixTimeout = false;
	window.thegemDesktopMenuLogoFixed = false;
	window.thegemWasDesktop = false;
	window.megaMenuWithSettingsFixed = false;

	function getElementPosition(elem) {
		var w = elem.offsetWidth,
			h = elem.offsetHeight,
			l = 0,
			t = 0;

		while (elem) {
			l += elem.offsetLeft;
			t += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return {"left":l, "top":t, "width": w, "height":h};
	}

	function fixMenuLogoPosition() {
		if (logoFixTimeout) {
			clearTimeout(logoFixTimeout);
		}

		var headerMain = document.querySelector('#site-header .header-main');
		if (headerMain == null) {
			return false;
		}

		var headerMainClass = headerMain.className;
		if (headerMainClass.indexOf('logo-position-menu_center') == -1 || headerMainClass.indexOf('header-layout-fullwidth_hamburger') != -1 || headerMainClass.indexOf('header-layout-vertical') != -1) {
			return false;
		}

		logoFixTimeout = setTimeout(function() {
			var page = document.getElementById('page'),
				primaryMenu = document.getElementById('primary-menu'),
				primaryNavigation = document.getElementById('primary-navigation'),
				windowWidth = page.offsetWidth,
				pageComputedStyles = window.getComputedStyle(page, null),
				pageMargin = parseFloat(pageComputedStyles['marginLeft']);

			if (isNaN(pageMargin)) {
				pageMargin = 0;
			}

			if (headerMainClass.indexOf('header-layout-fullwidth') != -1) {
				var logoItem = primaryMenu.querySelector('.menu-item-logo'),
					items = primaryNavigation.querySelectorAll('#primary-menu > li'),
					lastItem = null;

				for (var i = items.length - 1; i >=0; i--) {
					if (items[i].className.indexOf('mobile-only') == -1) {
						lastItem = items[i];
						break;
					}
				}

				primaryMenu.style.display = '';
				logoItem.style.marginLeft = '';
				logoItem.style.marginRight = '';

				if (windowWidth < 1212 || lastItem === null) {
					return;
				}

				window.thegemDesktopMenuLogoFixed = true;

				primaryMenu.style.display = 'block';

				var pageCenter = windowWidth / 2 + pageMargin,
					logoOffset = getElementPosition(logoItem),
					offset = pageCenter - logoOffset.left - logoItem.offsetWidth / 2;

				logoItem.style.marginLeft = offset + 'px';

				var primaryMenuOffsetWidth = primaryMenu.offsetWidth,
					primaryMenuOffsetLeft = getElementPosition(primaryMenu).left,
					lastItemOffsetWidth = lastItem.offsetWidth,
					lastItemOffsetLeft = getElementPosition(lastItem).left,
					rightItemsOffset = primaryMenuOffsetWidth - lastItemOffsetLeft - lastItemOffsetWidth + primaryMenuOffsetLeft;

				logoItem.style.marginRight = rightItemsOffset + 'px';
			} else {
				if (windowWidth < 1212) {
					primaryNavigation.style.textAlign = '';
					primaryMenu.style.position = '';
					primaryMenu.style.left = '';
					return;
				}

				window.thegemDesktopMenuLogoFixed = true;

				primaryNavigation.style.textAlign = 'left';
				primaryMenu.style.left = 0 + 'px';

				var pageCenter = windowWidth / 2,
					primaryMenuOffsetLeft = getElementPosition(primaryMenu).left,
					logoOffset = getElementPosition(document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo')),
					pageOffset = getElementPosition(page),
					offset = pageCenter - (logoOffset.left - pageOffset.left) - document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo').offsetWidth / 2;

				if (primaryMenuOffsetLeft + offset >= 0) {
					primaryMenu.style.position = 'relative';
					primaryMenu.style.left = offset + 'px';
				} else {
					primaryMenu.style.position = '';
					primaryMenu.style.left = '';
				}
			}
			primaryMenu.classList.remove("menu_center-preload");
			//primaryMenu.style.opacity = '1';
		}, 50);
	}

	window.fixMenuLogoPosition = fixMenuLogoPosition;

	if (window.gemOptions.clientWidth > 1212) {
		window.addEventListener('load', function(event) {
			window.fixMenuLogoPosition();
		}, false);
	}
})();


(function($) {
	/* PRIMARY MENU */

	var isVerticalMenu = $('.header-main').hasClass('header-layout-vertical'),
		isHamburgerMenu = $('.header-main').hasClass('header-layout-fullwidth_hamburger'),
		isPerspectiveMenu = $('#thegem-perspective').length > 0;

	$(window).resize(function() {
		window.updateGemClientSize(false);
		window.updateGemInnerSize();
	});

	window.menuResizeTimeoutHandler = false;

	var megaMenuSettings = {};

	function getOffset(elem) {
		if (elem.getBoundingClientRect && window.gemBrowser.platform.name != 'ios'){
			var bound = elem.getBoundingClientRect(),
				html = elem.ownerDocument.documentElement,
				htmlScroll = getScroll(html),
				elemScrolls = getScrolls(elem),
				isFixed = (styleString(elem, 'position') == 'fixed');
			return {
				x: parseInt(bound.left) + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: parseInt(bound.top)  + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = elem, position = {x: 0, y: 0};
		if (isBody(elem)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (window.gemBrowser.name == 'firefox'){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != elem && window.gemBrowser.name == 'safari'){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (window.gemBrowser.name == 'firefox' && !borderBox(elem)){
			position.x -= leftBorder(elem);
			position.y -= topBorder(elem);
		}
		return position;
	};

	function getScroll(elem){
		return {x: window.pageXOffset || document.documentElement.scrollLeft, y: window.pageYOffset || document.documentElement.scrollTop};
	};

	function getScrolls(elem){
		var element = elem.parentNode, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	};

	function styleString(element, style) {
		return $(element).css(style);
	};

	function styleNumber(element, style){
		return parseInt(styleString(element, style)) || 0;
	};

	function borderBox(element){
		return styleString(element, '-moz-box-sizing') == 'border-box';
	};

	function topBorder(element){
		return styleNumber(element, 'border-top-width');
	};

	function leftBorder(element){
		return styleNumber(element, 'border-left-width');
	};

	function isBody(element){
		return (/^(?:body|html)$/i).test(element.tagName);
	};


	function checkMegaMenuSettings() {
		if (window.customMegaMenuSettings == undefined || window.customMegaMenuSettings == null) {
			return false;
		}

		var uri = window.location.pathname;

		window.customMegaMenuSettings.forEach(function(item) {
			for (var i = 0; i < item.urls.length; i++) {
				if (uri.match(item.urls[i])) {
					megaMenuSettings[item.menuItem] = item.data;
				}
			}
		});
	}

	function fixMegaMenuWithSettings() {
		if (isResponsiveMenuVisible() && !window.thegemWasDesktop) {
			return false;
		}

		window.megaMenuWithSettingsFixed = true;

		checkMegaMenuSettings();

		$('#primary-menu > li.megamenu-enable').each(function() {
			var m = this.className.match(/(menu-item-(\d+))/);
			if (!m) {
				return;
			}

			var itemId = parseInt(m[2]);
			if (megaMenuSettings[itemId] == undefined || megaMenuSettings[itemId] == null) {
				return;
			}

			var $item = $('> ul', this);

			if (megaMenuSettings[itemId].masonry != undefined) {
				if (megaMenuSettings[itemId].masonry) {
					$item.addClass('megamenu-masonry');
				} else {
					$item.removeClass('megamenu-masonry');
				}
			}

			if (megaMenuSettings[itemId].style != undefined) {
				$(this).removeClass('megamenu-style-default megamenu-style-grid').addClass('megamenu-style-' + megaMenuSettings[itemId].style);
			}

			var css = {};

			if (megaMenuSettings[itemId].backgroundImage != undefined) {
				css.backgroundImage = megaMenuSettings[itemId].backgroundImage;
			}

			if (megaMenuSettings[itemId].backgroundPosition != undefined) {
				css.backgroundPosition = megaMenuSettings[itemId].backgroundPosition;
			}

			if (megaMenuSettings[itemId].padding != undefined) {
				css.padding = megaMenuSettings[itemId].padding;
			}

			if (megaMenuSettings[itemId].borderRight != undefined) {
				css.borderRight = megaMenuSettings[itemId].borderRight;
			}

			$item.css(css);
		});
	}

	function isResponsiveMenuVisible() {
		// var menuToggleDisplay = $('.menu-toggle').css('display');
		// return menuToggleDisplay == 'block' || menuToggleDisplay == 'inline-block';
		return $('.primary-navigation .menu-toggle').is(':visible');
	}
	window.isResponsiveMenuVisible = isResponsiveMenuVisible;

	function isTopAreaVisible() {
		return window.gemSettings.topAreaMobileDisable ? window.gemOptions.clientWidth >= 768 : true;
	}
	window.isTopAreaVisible = isTopAreaVisible;

	function isVerticalToggleVisible() {
		return window.gemOptions.clientWidth > 1600;
	}

	$('#primary-menu > li.megamenu-enable').hover(
		function() {
			fix_megamenu_position(this);
		},
		function() {}
	);

	$('#primary-menu > li.megamenu-enable:hover').each(function() {
		fix_megamenu_position(this);
	});

	$('#primary-menu > li.megamenu-enable').each(function() {
		var $item = $('> ul', this);
		if($item.length == 0) return;
		$item.addClass('megamenu-item-inited');
	});

	function fix_megamenu_position(elem, containerWidthCallback) {
		if (!$('.megamenu-inited', elem).length && isResponsiveMenuVisible()) {
			return false;
		}

			var $item = $('> ul', elem);
			if($item.length == 0) return;
			var self = $item.get(0);

			$item.addClass('megamenu-item-inited');

			var default_item_css = {
				width: 'auto',
				height: 'auto'
			};

			if (!isVerticalMenu && !isHamburgerMenu && !isPerspectiveMenu) {
				default_item_css.left = 0;
			}

			$item
				.removeClass('megamenu-masonry-inited megamenu-fullwidth')
				.css(default_item_css);

			$(' > li', $item).css({
				left: 0,
				top: 0
			}).each(function() {
				var old_width = $(this).data('old-width') || -1;
				if (old_width != -1) {
					$(this).width(old_width).data('old-width', -1);
				}
			});

			if (isResponsiveMenuVisible()) {
				return;
			}

			if (containerWidthCallback !== undefined) {
				var container_width = containerWidthCallback();
			} else if (isVerticalMenu) {
				var container_width = window.gemOptions.clientWidth - $('#site-header-wrapper').outerWidth();
			} else if (isPerspectiveMenu) {
				var container_width = window.gemOptions.clientWidth - $('#primary-navigation').outerWidth();
			} else if (isHamburgerMenu) {
				var container_width = window.gemOptions.clientWidth - $('#primary-menu').outerWidth();
			} else {
				var $container = $item.closest('.header-main'),
					container_width = $container.width(),
					container_padding_left = parseInt($container.css('padding-left')),
					container_padding_right = parseInt($container.css('padding-right')),
					parent_width = $item.parent().outerWidth();
			}

			var megamenu_width = $item.outerWidth();

			if (megamenu_width > container_width) {
				megamenu_width = container_width;
				var new_megamenu_width = container_width - parseInt($item.css('padding-left')) - parseInt($item.css('padding-right'));
				var columns = $item.data('megamenu-columns') || 4;
				var column_width = parseFloat(new_megamenu_width - columns * parseInt($(' > li.menu-item:first', $item).css('margin-left'))) / columns;
				var column_width_int = parseInt(column_width);
				$(' > li', $item).each(function() {
					$(this).data('old-width', $(this).width()).css('width', column_width_int);
				});
				$item.addClass('megamenu-fullwidth').width(new_megamenu_width - (column_width - column_width_int) * columns);
			}

			if (!isVerticalMenu && !isHamburgerMenu && !isPerspectiveMenu && containerWidthCallback === undefined) {
				if (megamenu_width > parent_width) {
					var left = -(megamenu_width - parent_width) / 2;
				} else {
					var left = 0;
				}

				var container_offset = getOffset($container[0]);
				var megamenu_offset = getOffset(self);

				if ((megamenu_offset.x - container_offset.x - container_padding_left + left) < 0) {
					left = -(megamenu_offset.x - container_offset.x - container_padding_left);
				}

				if ((megamenu_offset.x + megamenu_width + left) > (container_offset.x + $container.outerWidth() - container_padding_right)) {
					left -= (megamenu_offset.x + megamenu_width + left) - (container_offset.x + $container.outerWidth() - container_padding_right);
				}

				$item.css('left', left).css('left');
			}

			if ($item.hasClass('megamenu-masonry')) {
				var positions = {},
					max_bottom = 0;

				$item.width($item.width() - 1);
				var new_row_height = $('.megamenu-new-row', $item).outerHeight() + parseInt($('.megamenu-new-row', $item).css('margin-bottom'));

				$('> li.menu-item', $item).each(function() {
					var pos = $(this).position();
					if (positions[pos.left] != null && positions[pos.left] != undefined) {
						var top_position = positions[pos.left];
					} else {
						var top_position = pos.top;
					}
					positions[pos.left] = top_position + $(this).outerHeight() + new_row_height + parseInt($(this).css('margin-bottom'));
					if (positions[pos.left] > max_bottom)
						max_bottom = positions[pos.left];
					$(this).css({
						left: pos.left,
						top: top_position
					})
				});

				$item.height(max_bottom - new_row_height - parseInt($item.css('padding-top')) - 1);
				$item.addClass('megamenu-masonry-inited');
			}

			if ($item.hasClass('megamenu-empty-right')) {
				var mega_width = $item.width();
				var max_rights = {
					columns: [],
					position: -1
				};

				$('> li.menu-item', $item).removeClass('megamenu-no-right-border').each(function() {
					var pos = $(this).position();
					var column_right_position = pos.left + $(this).width();

					if (column_right_position > max_rights.position) {
						max_rights.position = column_right_position;
						max_rights.columns = [];
					}

					if (column_right_position == max_rights.position) {
						max_rights.columns.push($(this));
					}
				});

				if (max_rights.columns.length && max_rights.position >= (mega_width - 7)) {
					max_rights.columns.forEach(function($li) {
						$li.addClass('megamenu-no-right-border');
					});
				}
			}

			if (isVerticalMenu || isHamburgerMenu || isPerspectiveMenu) {
				var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
					itemOffset = $item.offset(),
					itemHeight = $item.outerHeight(),
					scrollTop = $(window).scrollTop();

				if (itemOffset.top - scrollTop + itemHeight > clientHeight) {
					$item.css({
						top: clientHeight - itemOffset.top + scrollTop - itemHeight - 20
					});
				}
			}

			$item.addClass('megamenu-inited');
	}

	window.fix_megamenu_position = fix_megamenu_position;

	function primary_menu_reinit() {
		if(isResponsiveMenuVisible()) {
			if (window.gemMobileMenuType == 'default') {
				var $submenuDisabled = $('#primary-navigation .dl-submenu-disabled');
				if ($submenuDisabled.length) {
					$submenuDisabled.addClass('dl-submenu').removeClass('dl-submenu-disabled');
				}
			}
			if ($('#primary-menu').hasClass('no-responsive')) {
				$('#primary-menu').removeClass('no-responsive');
			}
			if (!$('#primary-navigation').hasClass('responsive')) {
				$('#primary-navigation').addClass('responsive');
			}
			$('.menu-overlay').addClass('mobile');
			if (window.thegemDesktopMenuLogoFixed) {
				window.fixMenuLogoPosition();
			}

			if($('body').hasClass('mobile-cart-position-top')) {
				$('.mobile-cart > .minicart-menu-link.temp').remove();
				$('#primary-navigation .menu-item-cart > *').appendTo('.mobile-cart');
			}
		} else {
			window.thegemWasDesktop = true;

			if (window.gemMobileMenuType == 'overlay' && !$('.header-layout-overlay').length && $('.menu-overlay').hasClass('active')) {
				$('.mobile-menu-layout-overlay .menu-toggle').click();
			}

			$('#primary-navigation').addClass('without-transition');

			if (window.gemMobileMenuType == 'default') {
				$('#primary-navigation .dl-submenu').addClass('dl-submenu-disabled').removeClass('dl-submenu');
			}
			$('#primary-menu').addClass('no-responsive');
			$('#primary-navigation').removeClass('responsive');
			$('.menu-overlay').removeClass('mobile');

			window.fixMenuLogoPosition();

			if (!window.megaMenuWithSettingsFixed) {
				fixMegaMenuWithSettings();
			}

			$('#primary-navigation').removeClass('without-transition');

			if($('body').hasClass('mobile-cart-position-top')) {
				$('.mobile-cart > .minicart-menu-link.temp').remove();
				$('.mobile-cart > *').appendTo('#primary-navigation .menu-item-cart');
			}
		}
	}

	$(function() {
		function getScrollY(elem){
			return window.pageYOffset || document.documentElement.scrollTop;
		}
		$(document).on('click', '.mobile-cart > a', function(e) {
			e.preventDefault();
			$('.mobile-cart .minicart').addClass('minicart-show');
			$('body').data('scroll-position', getScrollY())
			$('body').addClass('mobile-minicart-opened');
		});
		$(document).on('click', '.mobile-cart-header-close, .mobile-minicart-overlay', function(e) {
			e.preventDefault();
			$('.mobile-cart .minicart').removeClass('minicart-show');
			$('body').removeClass('mobile-minicart-opened');
			if($('body').data('scroll-position')) {
				window.scrollTo(0, $('body').data('scroll-position'))
			}
		});
	});

	if (window.gemMobileMenuType == 'default') {
		$('#primary-navigation .submenu-languages').addClass('dl-submenu');
	}
	$('#primary-navigation ul#primary-menu > li.menu-item-language, #primary-navigation ul#primary-menu > li.menu-item-type-wpml_ls_menu_item').addClass('menu-item-parent');
	$('#primary-navigation ul#primary-menu > li.menu-item-language > a, #primary-navigation ul#primary-menu > li.menu-item-type-wpml_ls_menu_item > a').after('<span class="menu-item-parent-toggle"></span>');

	fixMegaMenuWithSettings();

	if (window.gemMobileMenuType == 'default') {
		var updateMobileMenuPosition = function() {
			var siteHeaderHeight = $('#site-header').outerHeight(),
				windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

			if ($('#thegem-perspective #primary-menu').length) {
				$('#thegem-perspective > .mobile-menu-layout-default').css({
					top: siteHeaderHeight
				});
			}

			$('#primary-menu').css({
				maxHeight: windowHeight - siteHeaderHeight
			});
		};

		$(window).resize(function() {
			if (isResponsiveMenuVisible() && $('#primary-menu').hasClass('dl-menuopen')) {
				setTimeout(updateMobileMenuPosition, 50);
			} else {
				$('#primary-menu').css({
					maxHeight: ''
				});
			}
		});

		$('#site-header .dl-trigger').on('click', function() {
			updateMobileMenuPosition();
		});

		if (typeof $.fn.dlmenu === 'function') {
			$('#primary-navigation').dlmenu({
				animationClasses: {
					classin : 'dl-animate-in',
					classout : 'dl-animate-out'
				},
				onLevelClick: function (el, name) {
					//$('html, body').animate({ scrollTop : 0 });
				},
				backLabel: thegem_dlmenu_settings.backLabel,
				showCurrentLabel: thegem_dlmenu_settings.showCurrentLabel
			});
		}
	}
	primary_menu_reinit();

	$('#primary-menu > li').hover(
		function() {
			var $items = $('ul:not(.minicart ul), .minicart, .minisearch', this);
			$items.removeClass('invert vertical-invert');

			if (!$(this).hasClass('megamenu-enable')) {
				$items.css({top: ''});
			}

			if ($(this).hasClass('megamenu-enable') ||
					$(this).closest('.header-layout-overlay').length ||
					$(this).closest('.mobile-menu-layout-overlay').length && isResponsiveMenuVisible()) {
				return;
			}

			var topItemTranslate = 0;
			if ($('>ul', this).css('transform')) {
				topItemTranslate = parseInt($('>ul', this).css('transform').split(',')[5]);
			}
			if (isNaN(topItemTranslate)) {
				topItemTranslate = 0;
			}
			var windowScroll = $(window).scrollTop(),
				siteHeaderOffset = $('#site-header').offset(),
				siteHeaderOffsetTop = siteHeaderOffset.top - windowScroll,
				siteHeaderHeight = $('#site-header').outerHeight(),
				pageOffset = $('#page').offset(),
				pageWidth = $('#page').width();

			$items.each(function() {
				var $item = $(this),
					self = this,
					$parentList = $item.parent().closest('ul');

				var itemOffset = $item.offset(),
					itemOffsetTop = itemOffset.top - windowScroll,
					itemOffsetLeft = itemOffset.left;


				var leftItemTranslate = 0;
				if ($item.css('transform')) {
					leftItemTranslate = parseInt(getComputedStyle(this).transform.split(',')[4]);
					var levelUL = getLevelULByPrimaryMenu(self);
					if (levelUL > 0) {
						leftItemTranslate = leftItemTranslate*levelUL;
					}
				}
				if (isNaN(leftItemTranslate)) {
					leftItemTranslate = 0;
				}

				if ($parentList.hasClass('invert')) {
					if ($parentList.offset().left - $item.outerWidth() > pageOffset.left) {
						$item.addClass('invert');
					}
				} else {
					if (itemOffsetLeft - leftItemTranslate - pageOffset.left + $item.outerWidth() > pageWidth) {
						$item.addClass('invert');
					}
				}

				if (isVerticalMenu || isPerspectiveMenu || isHamburgerMenu) {
					if (itemOffsetTop - topItemTranslate + $item.outerHeight() > $(window).height()) {
						$item.addClass('vertical-invert');
						var itemOffsetFix = itemOffsetTop  - topItemTranslate + $item.outerHeight() - $(window).height();
						if (itemOffsetTop - topItemTranslate - itemOffsetFix < 0) {
							itemOffsetFix = 0;
						}
						$item.css({ top: -itemOffsetFix + 'px' });
					}
				} else {
					if (itemOffsetTop - topItemTranslate + $item.outerHeight() > $(window).height()) {
						$item.addClass('vertical-invert');
						var itemOffsetFix = itemOffsetTop  - topItemTranslate + $item.outerHeight() - $(window).height();
						if (itemOffsetTop - topItemTranslate - itemOffsetFix < siteHeaderOffsetTop + siteHeaderHeight) {
							itemOffsetFix -= siteHeaderOffsetTop + siteHeaderHeight - (itemOffsetTop - topItemTranslate - itemOffsetFix);
							if (itemOffsetFix < 0) {
								itemOffsetFix = 0;
							}
						}
						if(itemOffsetFix > 0) {
							$item.css({ top: -itemOffsetFix + 'px' });
						}
					}
				}
			});
		},
		function() {}
	);

	function getLevelULByPrimaryMenu(item) {
		var parentUL = $(item).parent('li').parent('ul');
		var level = 0;

		while (!parentUL.is('#primary-menu')) {
			parentUL = parentUL.parent('li').parent('ul');
			level++;
		}

		return level;
	}

	$('.hamburger-toggle').click(function(e) {
		e.preventDefault();
		$(this).closest('#primary-navigation').toggleClass('hamburger-active');
		$('.hamburger-overlay').toggleClass('active');
	});

	$('.overlay-toggle, .mobile-menu-layout-overlay .menu-toggle').click(function(e) {
		var $element = this;
		e.preventDefault();
		if($('.menu-overlay').hasClass('active')) {
			$('.menu-overlay').removeClass('active');
			$('.primary-navigation').addClass('close');
			$('.primary-navigation').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
				$('.primary-navigation').removeClass('overlay-active close');
				$('.overlay-menu-wrapper').removeClass('active');
			});
			$(document).off('keydown.overlay-close');
			$('#primary-menu').off('click.overlay-close');
		} else {
			$('.overlay-menu-wrapper').addClass('active');
			$('.primary-navigation').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
			$('.primary-navigation').addClass('overlay-active').removeClass('close');
			if (isResponsiveMenuVisible()) {
				$('#site-header').removeClass('hidden');
				$('.menu-overlay').addClass('mobile');
			} else {
				$('.menu-overlay').removeClass('mobile');
			}
			$('.menu-overlay').addClass('active');
			$(document).on('keydown.overlay-close', function(event) {
				if (event.keyCode == 27) {
					$element.click();
				}
			});
			$('#primary-menu').on('click.overlay-close', 'li:not(.menu-item-search)', function() {
				$element.click();
			});
		}
	});

	$('.mobile-menu-layout-slide-horizontal .primary-navigation #primary-menu li.menu-item-current, .mobile-menu-layout-slide-vertical .primary-navigation #primary-menu li.menu-item-current').each(function() {
		if (!isResponsiveMenuVisible()) {
			return;
		}

		$(this).addClass('opened');
		$('> ul', this).show();
	});

	function getScrollY(elem){
		return window.pageYOffset || document.documentElement.scrollTop;
	}

	$('.mobile-menu-layout-slide-horizontal .menu-toggle, .mobile-menu-layout-slide-vertical .menu-toggle, .mobile-menu-slide-wrapper .mobile-menu-slide-close').click(function(e) {
		if (!isResponsiveMenuVisible()) {
			return;
		}

		e.preventDefault();
		$('#site-header').removeClass('hidden');
		$('.mobile-menu-slide-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
			$(this).removeClass('animation');
		});
		$('.mobile-menu-slide-wrapper').addClass('animation').toggleClass('opened');
		$('#site-header').toggleClass('menu-slide-opened');
		if($('.mobile-menu-slide-wrapper').hasClass('opened')) {
			$('body').data('scroll-position', getScrollY())
			$('body').addClass('menu-scroll-locked');
		} else {
			$('body').removeClass('menu-scroll-locked');
			if($('body').data('scroll-position')) {
				window.scrollTo(0, $('body').data('scroll-position'))
			}
		}
		setTimeout(function() {
			$(document).on('click.mobile-menu-out-click', function(e) {
				if($('.mobile-menu-slide-wrapper').hasClass('opened')) {
					if(!$(e.target).is('#site-header *') && !$(e.target).is('#thegem-perspective *')) {
						e.preventDefault();
						$('.mobile-menu-slide-wrapper .mobile-menu-slide-close').trigger('click');
						$(document).off('click.mobile-menu-out-click');
					}
				}
			});
		}, 500);
	});

	$('.mobile-menu-layout-slide-horizontal .primary-navigation #primary-menu .menu-item-parent-toggle, .mobile-menu-layout-slide-vertical .primary-navigation #primary-menu .menu-item-parent-toggle').on('click', function(e) {
		if (!isResponsiveMenuVisible()) {
			return;
		}

		e.preventDefault();
		var self = this;
		$(this).closest('li').toggleClass('opened');
		$(this).siblings('ul').slideToggle(200, function() {
			if (!$(self).closest('li').hasClass('opened')) {
				$(self).siblings('ul').find('li').removeClass('opened');
				$(self).siblings('ul').css('display', '');
				$(self).siblings('ul').find('ul').css('display', '');
			}
		});
	});

	$('.header-layout-overlay #primary-menu .menu-item-parent-toggle, .mobile-menu-layout-overlay .primary-navigation #primary-menu .menu-item-parent-toggle').on('click', function(e) {
		//if(!$('#primary-menu').hasClass('no-responsive')) return ;

		e.preventDefault();
		e.stopPropagation();

		if (!$('#primary-menu').hasClass('no-responsive') && !$(this).hasClass('menu-item-parent-toggle')) {
			return;
		}

		var $itemLink = $(this);
		var $item = $itemLink.closest('li');
		if($item.hasClass('menu-item-parent') && ($item.closest('ul').hasClass('nav-menu') || $item.parent().closest('li').hasClass('menu-overlay-item-open'))) {
			e.preventDefault();
			if($item.hasClass('menu-overlay-item-open')) {
				$(' > ul, .menu-overlay-item-open > ul', $item).each(function() {
					$(this).css({height: $(this).outerHeight()+'px'});
				});
				setTimeout(function() {
					$(' > ul, .menu-overlay-item-open > ul', $item).css({height: ''});
					$('.menu-overlay-item-open', $item).add($item).removeClass('menu-overlay-item-open');
				}, 50);
			} else {
				var $oldActive = $('.primary-navigation .menu-overlay-item-open').not($item.parents());
				$('> ul', $oldActive).not($item.parents()).each(function() {
					$(this).css({height: $(this).outerHeight()+'px'});
				});
				setTimeout(function() {
					$('> ul', $oldActive).not($item.parents()).css({height: ''});
					$oldActive.removeClass('menu-overlay-item-open');
				}, 50);
				$('> ul', $item).css({height: 'auto'});
				var itemHeight = $('> ul', $item).outerHeight();
				$('> ul', $item).css({height: ''});
				setTimeout(function() {
					$('> ul', $item).css({height: itemHeight+'px'});
					$item.addClass('menu-overlay-item-open');
					$('> ul', $item).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
						$('> ul', $item).css({height: 'auto'});
					});
				}, 50);
			}
		}
	});

	$('.vertical-toggle').click(function(e) {
		e.preventDefault();
		$(this).closest('#site-header-wrapper').toggleClass('vertical-active');
	});

	$(function() {
		$(window).resize(function() {
			if (window.menuResizeTimeoutHandler) {
				clearTimeout(window.menuResizeTimeoutHandler);
			}
			window.menuResizeTimeoutHandler = setTimeout(primary_menu_reinit, 50);
		});
	});

	$('#primary-navigation').on('click', 'a', function(e) {
		var $item = $(this);
		if($('#primary-menu').hasClass('no-responsive') && window.gemSettings.isTouch && $item.next('ul').length) {
			e.preventDefault();
		}
	});

	$(document).on('click', function(e) {
		if ($('.hamburger-overlay').hasClass('active') && !$(e.target).closest("#primary-menu").length && !$(e.target).closest(".hamburger-toggle").length) {
			$('.hamburger-toggle').trigger('click');
		}

		if ($("#site-header-wrapper").hasClass('vertical-active')) {
			if (!$("#site-header-wrapper").is(e.target) && $("#site-header-wrapper").has(e.target).length === 0) {
				$('.vertical-toggle').trigger('click');
			}
		}
	});

})(jQuery);

// Menu perspective
(function($) {
	var transitionEndEvent = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		}[ window.supportedTransition ],
		clickEventName = 'click';

	function initPerspective() {
		var $menuToggleButton = $('.perspective-toggle'),
			$perspective = $('#thegem-perspective'),
			$page = $('#page');

		if (!$perspective.length) {
			return false;
		}

		$menuToggleButton.on(clickEventName, function(event) {
			if ($perspective.hasClass('animate')) {
				return;
			}

			var documentScrollTop = $(window).scrollTop();
			$(window).scrollTop(0);

			var pageWidth = $page.outerWidth(),
				perspectiveWidth = $perspective.outerWidth(),
				pageCss = {
					width: pageWidth
				};

			if (pageWidth < perspectiveWidth) {
				pageCss.marginLeft = $page[0].offsetLeft;
			}

			$page.css(pageCss);

			$perspective.addClass('modalview animate');
			$page.scrollTop(documentScrollTop);
			//$(window).trigger('perspective-modalview-opened');
			event.preventDefault();
			event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
		});

		$('#primary-navigation').on(clickEventName, function(event) {
			if (isResponsiveMenuVisible()) {
				return;
			}
			event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
		});

		$('#thegem-perspective .perspective-menu-close').on(clickEventName, function(event) {
			$perspective.click();
			event.preventDefault();
			event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
		});

		$perspective.on(clickEventName, function(event) {
			if (!$perspective.hasClass('animate')) {
				return;
			}

			var onEndTransitionCallback = function(event) {
				if (window.supportsTransitions && (event.originalEvent.target.id !== 'page' || event.originalEvent.propertyName.indexOf('transform' ) == -1)) {
					return;
				}

				$(this).off(transitionEndEvent, onEndTransitionCallback);
				var pageScrollTop = $page.scrollTop();
				$perspective.removeClass('modalview');
				$page.css({
					width: '',
					marginLeft: ''
				});
				$(window).scrollTop(pageScrollTop);
				$page.scrollTop(0);
				$(window).resize();
				//$(window).trigger('perspective-modalview-closed');
			};

			if (window.supportsTransitions) {
				$perspective.on(transitionEndEvent, onEndTransitionCallback);
			} else {
				onEndTransitionCallback.call();
			}

			$perspective.removeClass('animate');
		});
	}

	initPerspective();
})(jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/thegem-form-elements.js?ver=5.8.1 
(function($) {
	$.fn.checkbox = function() {
		$(this).each(function() {
			var $el = $(this);
			var typeClass = $el.attr('type');
			$el.hide();
			$el.next('.'+typeClass+'-sign').remove();
			var $checkbox = $('<span class="'+typeClass+'-sign" />').insertAfter($el);
			$checkbox.click(function() {
				if($checkbox.closest('label').length) return;
				if($el.attr('type') == 'radio') {
					$el.prop('checked', true).trigger('change').trigger('click');
				} else {
					$el.prop('checked', !($el.is(':checked'))).trigger('change');
				}
			});
			$el.change(function() {
				$('input[name="'+$el.attr('name')+'"]').each(function() {
					if($(this).is(':checked')) {
						$(this).next('.'+$(this).attr('type')+'-sign').addClass('checked');
					} else {
						$(this).next('.'+$(this).attr('type')+'-sign').removeClass('checked');
					}
				});
			});
			if($el.is(':checked')) {
				$checkbox.addClass('checked');
			} else {
				$checkbox.removeClass('checked');
			}
		});
	}
	$.fn.combobox = function() {
		$(this).each(function() {
			var $el = $(this);
			$el.insertBefore($el.parent('.combobox-wrapper'));
			$el.next('.combobox-wrapper').remove();
			$el.css({
				'opacity': 0,
				'position': 'absolute',
				'left': 0,
				'right': 0,
				'top': 0,
				'bottom': 0
			});
			var $comboWrap = $('<span class="combobox-wrapper" />').insertAfter($el);
			var $text = $('<span class="combobox-text" />').appendTo($comboWrap);
			var $button = $('<span class="combobox-button" />').appendTo($comboWrap);
			$el.appendTo($comboWrap);
			$el.change(function() {
				$text.text($('option:selected', $el).text());
			});
			$text.text($('option:selected', $el).text());
			$el.comboWrap = $comboWrap;
		});
	}
})(jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/jquery.easing.js?ver=5.8.1 
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], function ($) {
            return factory($)
        })
    } else if (typeof module === "object" && typeof module.exports === "object") {
        exports = factory(require("jquery"))
    } else {
        factory(jQuery)
    }
})(function ($) {
    $.easing.jswing = $.easing.swing;
    var pow = Math.pow, sqrt = Math.sqrt, sin = Math.sin, cos = Math.cos, PI = Math.PI, c1 = 1.70158, c2 = c1 * 1.525,
        c3 = c1 + 1, c4 = 2 * PI / 3, c5 = 2 * PI / 4.5;

    function bounceOut(x) {
        var n1 = 7.5625, d1 = 2.75;
        if (x < 1 / d1) {
            return n1 * x * x
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + .75
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + .9375
        } else {
            return n1 * (x -= 2.625 / d1) * x + .984375
        }
    }

    $.extend($.easing, {
        def: "easeOutQuad", swing: function (x) {
            return $.easing[$.easing.def](x)
        }, easeInQuad: function (x) {
            return x * x
        }, easeOutQuad: function (x) {
            return 1 - (1 - x) * (1 - x)
        }, easeInOutQuad: function (x) {
            return x < .5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2
        }, easeInCubic: function (x) {
            return x * x * x
        }, easeOutCubic: function (x) {
            return 1 - pow(1 - x, 3)
        }, easeInOutCubic: function (x) {
            return x < .5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2
        }, easeInQuart: function (x) {
            return x * x * x * x
        }, easeOutQuart: function (x) {
            return 1 - pow(1 - x, 4)
        }, easeInOutQuart: function (x) {
            return x < .5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2
        }, easeInQuint: function (x) {
            return x * x * x * x * x
        }, easeOutQuint: function (x) {
            return 1 - pow(1 - x, 5)
        }, easeInOutQuint: function (x) {
            return x < .5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2
        }, easeInSine: function (x) {
            return 1 - cos(x * PI / 2)
        }, easeOutSine: function (x) {
            return sin(x * PI / 2)
        }, easeInOutSine: function (x) {
            return -(cos(PI * x) - 1) / 2
        }, easeInExpo: function (x) {
            return x === 0 ? 0 : pow(2, 10 * x - 10)
        }, easeOutExpo: function (x) {
            return x === 1 ? 1 : 1 - pow(2, -10 * x)
        }, easeInOutExpo: function (x) {
            return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2
        }, easeInCirc: function (x) {
            return 1 - sqrt(1 - pow(x, 2))
        }, easeOutCirc: function (x) {
            return sqrt(1 - pow(x - 1, 2))
        }, easeInOutCirc: function (x) {
            return x < .5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2
        }, easeInElastic: function (x) {
            return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)
        }, easeOutElastic: function (x) {
            return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - .75) * c4) + 1
        }, easeInOutElastic: function (x) {
            return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 : pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1
        }, easeInBack: function (x) {
            return c3 * x * x * x - c1 * x * x
        }, easeOutBack: function (x) {
            return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)
        }, easeInOutBack: function (x) {
            return x < .5 ? pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2) / 2 : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
        }, easeInBounce: function (x) {
            return 1 - bounceOut(1 - x)
        }, easeOutBounce: bounceOut, easeInOutBounce: function (x) {
            return x < .5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2
        }
    })
});
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/thegem-header.js?ver=5.8.1 
(function($) {

	function HeaderAnimation(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = {
			startTop: 1
		};
		$.extend(this.options, options);
		this.initialize();
	}

	HeaderAnimation.prototype = {
		initialize: function() {
			var self = this;
			this.$page = $('#page').length ? $('#page') : $('body');
			this.$wrapper = $('#site-header-wrapper');
			this.$topArea = $('#top-area');
			this.topAreaInSiteHeader = $('#site-header #top-area').length > 0;
			this.$headerMain = $('.header-main', this.$el);
			this.hasAdminBar = document.body.className.indexOf('admin-bar') != -1;
			this.adminBarOffset = 0;
			this.adminBarHeight = 0;
			this.topOffset = 0;
			this.oldScrollY = 0;
			this.isResponsive = null;
			this.isResponsiveOld = null;

			this.hideWrapper = this.$wrapper.hasClass('site-header-wrapper-transparent');
			this.videoBackground = $('.page-title-block .gem-video-background').length && $('.page-title-block .gem-video-background').data('headerup');

			if(this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
				this.$wrapper.css({position: 'absolute'});
			}

			if(this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
				this.$wrapper.addClass('header-on-slideshow');
			} else {
				this.$el.removeClass('header-on-slideshow');
			}

			if(this.videoBackground) {
				this.$el.addClass('header-on-slideshow');
				this.$wrapper.addClass('header-on-slideshow');
			}

			this.initHeader();

			$(document).ready(function() {
				self.updateAdminBarInfo();
				self.updateStartTop();
			});

			$(window).scroll(function() {
				self.scrollHandler();
			});

			if ($('#thegem-perspective').length) {
				this.$page.scroll(function() {
					self.scrollHandler();
				});
			}

			$(window).resize(function() {
				setTimeout(function() {
					self.initHeader();
					self.scrollHandler();
				}, 0);
			});

			//load header fix
			$(window).on("load", function() {
				self.$el.addClass('ios-load');
			});
		},

		initHeader: function() {
			this.isResponsiveOld = this.isResponsive;
			this.isResponsive = window.isResponsiveMenuVisible();

			if (this.isResponsive) {
				this.$el.addClass('shrink-mobile');
			} else {
				this.$el.removeClass('shrink-mobile');
			}

			this.updateAdminBarInfo();
			this.updateStartTop();
			if (this.isResponsive != this.isResponsiveOld) {
				this.initializeStyles();
			}
		},

		updateAdminBarInfo: function() {
			if (this.hasAdminBar) {
				this.adminBarHeight = $('#wpadminbar').outerHeight();
				this.adminBarOffset = this.hasAdminBar && $('#wpadminbar').css('position') == 'fixed' ? parseInt(this.adminBarHeight) : 0;
			}
		},

		updateStartTop: function() {
			if (this.$topArea.length && this.$topArea.is(':visible') && !this.topAreaInSiteHeader) {
				this.options.startTop = this.$topArea.outerHeight();
			} else {
				this.options.startTop = 1;
			}

			if (this.hasAdminBar && this.adminBarOffset == 0) {
				this.options.startTop += this.adminBarHeight;
			}
		},

		setMargin: function($img) {
			var $small = $img.siblings('img.small'),
				w = 0;

			if (this.$headerMain.hasClass('logo-position-right')) {
				w = $small.width();
			} else if (this.$headerMain.hasClass('logo-position-center') || this.$headerMain.hasClass('logo-position-menu_center')) {
				w = $img.width();
				var smallWidth = $small.width(),
					offset = (w - smallWidth) / 2;

				w = smallWidth + offset;
				$small.css('margin-right', offset + 'px');
			}
			if (!w) {
				w = $img.width();
			}
			$small.css('margin-left', '-' + w + 'px');
			$img.parent().css('min-width', w + 'px');

			$small.show();
		},

		initializeStyles: function() {
			var self = this;

			if (this.$headerMain.hasClass('logo-position-menu_center')) {
				var $img = $('#primary-navigation .menu-item-logo a .logo img.default', this.$el);
			} else {
				var $img = $('.site-title .site-logo a .logo img', this.$el);
			}

			if ($img.length && $img[0].complete) {
				self.setMargin($img);
				self.initializeHeight();
			} else {
				$img.on('load error', function() {
					self.setMargin($img);
					self.initializeHeight();
				});
			}
		},

		initializeHeight: function() {
			if (this.hideWrapper) {
				return false;
			}

			that = this;

			setTimeout(function() {
				var shrink = that.$el.hasClass('shrink');
				if (shrink) {
					that.$el.removeClass('shrink').addClass('without-transition');
				}
				var elHeight = that.$el.outerHeight();

				//load header fix
				if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
					that.$wrapper.css('min-height', elHeight);
				} else {
					that.$wrapper.height(elHeight);
				}

				if (shrink) {
					that.$el.addClass('shrink').removeClass('without-transition');
				}
			}, 50);
		},

		scrollHandler: function() {
			if (window.gemSettings.fullpageEnabled || $('body').hasClass('vc_editor')) {
				return;
			}

			var self = this,
				scrollY = this.getScrollY();

			if (scrollY >= this.options.startTop) {
				if (!this.$el.hasClass('shrink')) {
					var shrinkClass = 'shrink fixed';
					if (window.gemSettings.fillTopArea) {
						shrinkClass += ' fill';
					}
					this.$el.addClass(shrinkClass);
					//$('.hamburger-group').not('.hamburger-size-small-original').addClass('hamburger-size-small');
					//$('.perspective-toggle, .overlay-toggle').not('.toggle-size-small-original').addClass('toggle-size-small');
				}
				var top = 0;
				if (this.$page[0].scrollTop > 0) {
					top += this.$page[0].scrollTop;
				} else {
					if (this.hasAdminBar) {
						top += this.adminBarOffset;
					}
				}

				this.$el.css({
					top: top != 0 ? top : ''
				});
			} else {
				if (this.$el.hasClass('shrink')) {
					this.$el.removeClass('shrink fixed');
					//$('.hamburger-group').not('.hamburger-size-small-original').removeClass('hamburger-size-small');
					//$('.perspective-toggle, .overlay-toggle').not('.toggle-size-small-original').removeClass('toggle-size-small');
				}
				if (this.hasAdminBar) {
					this.$el.css({
						top: ''
					});
				}
			}

			if (this.isResponsive && !this.$wrapper.hasClass('sticky-header-on-mobile')) {
				if (!$('.mobile-menu-slide-wrapper.opened').length && !$('#primary-menu.dl-menuopen').length && !$('.menu-overlay.active').length) {
					if (scrollY - this.oldScrollY > 0 && scrollY > 300 && !this.$el.hasClass('hidden')) {
						self.$el.addClass('hidden');
					}

					if (scrollY - this.oldScrollY < 0 && this.$el.hasClass('hidden')) {
						self.$el.removeClass('hidden');
					}
				} else {
					self.$el.removeClass('hidden');
				}
			}

			this.oldScrollY = scrollY;
		},

		getScrollY: function() {
			return window.pageYOffset || document.documentElement.scrollTop + this.$page[0].scrollTop;
		},
	};

	$.fn.headerAnimation = function(options) {
		options = options || {};
		return new HeaderAnimation(this.get(0), options);
	};
})(jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/functions.js?ver=5.8.1 
(function($) {
	$.fn.thegemPreloader = function(callback) {
		$(this).each(function() {
			var $el = $(this),
				hasSrc = ['img', 'iframe'].indexOf($el[0].nodeName.toLowerCase()) != -1;

			$el.data('thegemPreloader', $('img, iframe', $el).add($el.filter('img, iframe')).length);

			if ($el.data('thegemPreloader') == 0 || (hasSrc && !$el.attr('src'))) {
				$el.prev('.preloader').remove();
				callback();
				$el.trigger('thegem-preloader-loaded');
				return;
			}

			if(!$el.prev('.preloader').length) {
				$('<div class="preloader">').insertBefore($el);
			}

			$('img, iframe', $el).add($el.filter('img, iframe')).each(function() {
				function preloaderItemLoaded() {
					$el.data('thegemPreloader', $el.data('thegemPreloader')-1);
					if($el.data('thegemPreloader') == 0) {
						$el.prev('.preloader').remove();
						callback();
						$el.trigger('thegem-preloader-loaded');
					}
				}

				if (!$(this).attr('src')) {
					preloaderItemLoaded();
					return;
				}

				var $obj = $('<img>');
				if($(this).prop('tagName').toLowerCase() == 'iframe') {
					$obj = $(this);
				}
				$obj.attr('src', $(this).attr('src'));
				$obj.on('load error', preloaderItemLoaded);
			});
		});
	}
})(jQuery);

(function($) {

	var oWidth=$.fn.width;
	$.fn.width=function(argument) {
		if (arguments.length==0 && this.length==1 && this[0]===window) {
			if (window.gemOptions.innerWidth != -1) {
				return window.gemOptions.innerWidth;
			}
			var width = oWidth.apply(this,arguments);
			window.updateGemInnerSize(width);
			return width;
		}

		return oWidth.apply(this,arguments);
	};

	var $page = $('#page');

	$(window).on('load', function() {
		var $preloader = $('#page-preloader');
		if ($preloader.length && !$preloader.hasClass('preloader-loaded')) {
			$preloader.addClass('preloader-loaded');
		}
	});

	$('#site-header.animated-header').headerAnimation();

	$.fn.updateTabs = function() {

		jQuery('.gem-tabs', this).each(function(index) {
			var $tabs = $(this);
			$tabs.thegemPreloader(function() {
				$tabs.easyResponsiveTabs({
					type: 'default',
					width: 'auto',
					fit: false,
					activate: function(currentTab, e) {
						var $tab = $(currentTab.target);
						var controls = $tab.attr('aria-controls');
						$tab.closest('.ui-tabs').find('.gem_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
					}
				});
			});
		});

		jQuery('.gem-tour', this).each(function(index) {
			var $tabs = $(this);
			$tabs.thegemPreloader(function() {
				$tabs.easyResponsiveTabs({
					type: 'vertical',
					width: 'auto',
					fit: false,
					activate: function(currentTab, e) {
						var $tab = $(currentTab.target);
						var controls = $tab.attr('aria-controls');
						$tab.closest('.ui-tabs').find('.gem_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
					}
				});
			});
		});

	};

	function fullwidth_block_after_update($item) {
		$item.trigger('updateTestimonialsCarousel');
		$item.trigger('updateClientsCarousel');
		$item.trigger('fullwidthUpdate');
	}

	function fullwidth_block_update($item, pageOffset, pagePaddingLeft, pageWidth,skipTrigger) {
		var $prevElement = $item.prev(),
			extra_padding = 0;
		if ($prevElement.length == 0 || $prevElement.hasClass('fullwidth-block')) {
			$prevElement = $item.parent();
			extra_padding = parseInt($prevElement.css('padding-left'));
		}

		var offsetKey = window.gemSettings.isRTL ? 'right' : 'left';
		var cssData = {
			width: pageWidth
		};
		cssData[offsetKey] = pageOffset.left - ($prevElement.length ? $prevElement.offset().left : 0) + parseInt(pagePaddingLeft) - extra_padding;

		$item.css(cssData);

		if (!skipTrigger) {
			fullwidth_block_after_update($item);
		}
	}

	var inlineFullwidths = [],
		notInlineFullwidths = [];

	$('.fullwidth-block').each(function() {
		var $item = $(this),
			$parents = $item.parents('.vc_row'),
			fullw = {
				isInline: false
			};

		$parents.each(function() {
			if (this.hasAttribute('data-vc-full-width')) {
				fullw.isInline = true;
				return false;
				}
		});

		if (fullw.isInline) {
			inlineFullwidths.push(this);
		} else {
			notInlineFullwidths.push(this);
			}
		});

	function update_fullwidths(inline, init) {
		var $needUpdate = [];

		(inline ? inlineFullwidths : notInlineFullwidths).forEach(function(item) {
			$needUpdate.push(item);
		});

		if ($needUpdate.length > 0) {
			var pageOffset = $page.offset(),
				pagePaddingLeft = $page.css('padding-left'),
				pageWidth = $page.width();

			$needUpdate.forEach(function(item) {
				fullwidth_block_update($(item), pageOffset, pagePaddingLeft, pageWidth);
				});
		}
	}

	if (!window.disableGemSlideshowPreloaderHandle) {
		jQuery('.gem-slideshow').each(function() {
			var $slideshow = $(this);
			$slideshow.thegemPreloader(function() {});
		});
	}

	$(function() {
		$('#gem-icons-loading-hide').remove();

		if (window.tgpLazyItems===undefined) {
			$('#thegem-preloader-inline-css').remove();
		}

		jQuery('iframe').not('.gem-video-background iframe, .wcppec-checkout-buttons iframe').each(function() {
			$(this).thegemPreloader(function() {});
		});

		jQuery('.gem-video-background').each(function() {
			var $videoBG = $(this);
			var $videoContainer = $('.gem-video-background-inner', this);
			var ratio = $videoBG.data('aspect-ratio') ? $videoBG.data('aspect-ratio') : '16:9';
			var regexp = /(\d+):(\d+)/;
			var $fullwidth = $videoBG.closest('.fullwidth-block');
			ratio = regexp.exec(ratio);
			if(!ratio || parseInt(ratio[1]) == 0 || parseInt(ratio[2]) == 0) {
				ratio = 16/9;
			} else {
				ratio = parseInt(ratio[1])/parseInt(ratio[2]);
			}

			function gemVideoUpdate() {
				$videoContainer.removeAttr('style');
				if($videoContainer.width() / $videoContainer.height() > ratio) {
					$videoContainer.css({
						height: ($videoContainer.width() / ratio) + 'px',
						marginTop: -($videoContainer.width() / ratio - $videoBG.height()) / 2 + 'px'
					});
				} else {
					$videoContainer.css({
						width: ($videoContainer.height() * ratio) + 'px',
						marginLeft: -($videoContainer.height() * ratio - $videoBG.width()) / 2 + 'px'
					});
				}
			}

			if ($videoBG.closest('.page-title-block').length > 0) {
				gemVideoUpdate();
			}

			if ($fullwidth.length) {
				$fullwidth.on('fullwidthUpdate', gemVideoUpdate);
			} else {
				$(window).resize(gemVideoUpdate);
				}
			});

		update_fullwidths(false, true);


		$('.fullwidth-block').each(function() {
			var $item = $(this),
				mobile_enabled = $item.data('mobile-parallax-enable') || '0',
				is_custom_title = $item.hasClass('custom-title-background');

			if (!window.gemSettings.isTouch || mobile_enabled == '1') {
				if ($item.hasClass('fullwidth-block-parallax-vertical')) {
					var parallaxOptions = {};
					if (is_custom_title) {
						parallaxOptions.position = 'top';
					}

					$('.fullwidth-block-background', $item).each(function() {
						var backgroundImageCss = $(this).css('background-image') || '';

						if (backgroundImageCss == 'none' || backgroundImageCss == '') {
							$(this).on('tgpliVisible', function() {
								$(this).parallaxVertical('50%', parallaxOptions);
							});

							return;
						}

						$(this).parallaxVertical('50%', parallaxOptions);
					});
				} else if ($item.hasClass('fullwidth-block-parallax-horizontal')) {
					$('.fullwidth-block-background', $item).each(function() {
						if (!window.gemSettings.parallaxDisabled) {
							var backgroundImageCss = $(this).css('background-image') || '';

							if (backgroundImageCss == 'none' || backgroundImageCss == '') {
								$(this).on('tgpliVisible', function() {
									$(this).parallaxHorizontal();
								});

								return;
							}

							$(this).parallaxHorizontal();
						}
					});
				}
			} else {
				$('.fullwidth-block-background', $item).css({
					backgroundAttachment: 'scroll'
				});
			}
		});

		if(!window.gemSettings.isTouch) {
			$('.page-title-parallax-background').each(function() {
				var backgroundImageCss = $(this).css('background-image') || '';
				if (backgroundImageCss == 'none' || backgroundImageCss == '') {
					$(this).on('tgpliVisible', function() {
						$(this).parallaxVertical('50%', {
							position: 'top'
						});
					});
					return;
				}

				$(this).parallaxVertical('50%', {
					position: 'top'
				});
			});
		} else {
			$('.page-title-parallax-background').css({
				backgroundAttachment: 'scroll'
			});
		}



		$(window).resize(function() {
			update_fullwidths(false, false);
		});

		$(window).on('load', function() {
			update_fullwidths(false, false);
		});

		jQuery('select.gem-combobox, .gem-combobox select, .widget_archive select').each(function(index) {
			$(this).combobox();
		});

		jQuery('.widget_categories select').each(function() {
			this.onchange = null;
			$(this).on('change', function() {
				if($(this).val() != -1) {
					$(this).closest('form').submit();
				}
			});
		});

		jQuery('input.gem-checkbox, .gem-checkbox input').checkbox();
		if (typeof($.fn.ReStable) == "function") {
			jQuery('.gem-table-responsive').each(function(index) {
				$('> table', this).ReStable({
					maxWidth: 768,
					rowHeaders : $(this).hasClass('row-headers')
				});
			});
		}

		jQuery('.fancybox').each(function() {
			$(this).fancybox();
		});

		if (typeof jQuery.fn.scSticky === 'function') {
			jQuery('.panel-sidebar-sticky > .sidebar').scSticky();
		}

		jQuery('iframe + .map-locker').each(function() {
			var $locker = $(this);
			$locker.click(function(e) {
				e.preventDefault();
				if($locker.hasClass('disabled')) {
					$locker.prev('iframe').css({ 'pointer-events' : 'none' });
				} else {
					$locker.prev('iframe').css({ 'pointer-events' : 'auto' });
				}
				$locker.toggleClass('disabled');
			});
		});

		$('.primary-navigation a.mega-no-link').closest('li').removeClass('menu-item-active current-menu-item');

		function getElementPagePosition(element) {
			var width = element.offsetWidth,
				height = element.offsetHeight,
				left = 0,
				top = 0;

			while (element && element.id != 'page') {
				left += element.offsetLeft;
				top += element.offsetTop;
				element = element.offsetParent;
			}

			return {"left": left, "top": top, "width": width, "height": height};
		}

		var $anhorsElements = [];
		$('.quickfinder-item a, .primary-navigation a, .gem-button, .footer-navigation a, .scroll-top-button, .scroll-to-anchor, .scroll-to-anchor a, .top-area-menu a').each(function(e) {
			var $anhor = $(this);
			var link = $anhor.attr('href');
			if(!link) return ;
			link = link.split('#');
			try {
			if($('#'+link[1]).hasClass('vc_tta-panel')) return ;
			if($('#'+link[1]).length) {
				$anhor.closest('li').removeClass('menu-item-active current-menu-item');
				$anhor.closest('li').parents('li').removeClass('menu-item-current');
				$(document).on('update-page-scroller', function(e, elem) {
					var $elem = $(elem);
					if(!$anhor.closest('li.menu-item').length) return ;
					if($elem.is($('#'+link[1])) || $elem.find($('#'+link[1])).length) {
						$anhor.closest('li').addClass('menu-item-active');
						$anhor.closest('li').parents('li').addClass('menu-item-current');
					} else {
						$anhor.closest('li').removeClass('menu-item-active');
						$anhor.closest('li').parents('li.menu-item-current').each(function() {
							if(!$('.menu-item-active', this).length) {
								$(this).removeClass('menu-item-current');
							}
						});
					}
				});
				$anhor.click(function(e) {
					e.preventDefault();
					history.replaceState('data to be passed', $anhor.text(), $anhor.attr('href'));
					var correction = 0;
					var isPerspectiveMenu = $('#thegem-perspective.modalview').length;

					if($('#site-header.animated-header').length) {
						var shrink = $('#site-header').hasClass('shrink');
						$('#site-header').addClass('scroll-counting');
						$('#site-header').addClass('fixed shrink');
						correction = $('#site-header').outerHeight();
						if (!isPerspectiveMenu) {
							var siteHeaderTop = $('#site-header').position().top;
							if ($('#site-header').hasClass('shrink')) {
								siteHeaderTop = 0;
							}
							correction += siteHeaderTop;
						}

						if(!shrink) {
							$('#site-header').removeClass('fixed shrink');
						}
						setTimeout(function() {
							$('#site-header').removeClass('scroll-counting');
						}, 50);
					}
					var target_top = getElementPagePosition( $('#'+link[1])[0] ).top - correction + 1;
					if(getElementPagePosition( $('#'+link[1])[0] ).top == 0) { target_top = 0; }
					if($('body').hasClass('page-scroller') && $('.page-scroller-nav-pane').is(':visible')) {
						var $block = $('#'+link[1]+'.scroller-block').add($('#'+link[1]).closest('.scroller-block')).eq(0);
						if($block.length) {
							$('.page-scroller-nav-pane .page-scroller-nav-item').eq($('.scroller-block').index($block)).trigger('click');
						}
						if($anhor.closest('.overlay-menu-wrapper').length && $anhor.closest('.overlay-menu-wrapper').hasClass('active')) {
							if($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('responsive')) {
								$('.menu-toggle').trigger('click');
							} else {
								$('.overlay-toggle').trigger('click');
							}
						}
					} else {
						if (isPerspectiveMenu) {
							$('#page').stop(true, true).animate({scrollTop:target_top}, 1500, 'easeInOutCubic', function() {
								if($anhor.closest('#thegem-perspective').length && $anhor.closest('#thegem-perspective').hasClass('modalview')) {
									$('.perspective-menu-close').trigger('click');
								}
							});
						} else {
							$('html, body').stop(true, true).animate({scrollTop:target_top}, 1500, 'easeInOutCubic');
						}
						if($anhor.closest('#primary-menu').length && $anhor.closest('#primary-menu').hasClass('dl-menuopen')) {
							$('.menu-toggle').trigger('click');
						}
						if($anhor.closest('.mobile-menu-slide-wrapper').length && $anhor.closest('.mobile-menu-slide-wrapper').hasClass('opened')) {
							$('.mobile-menu-slide-close').trigger('click');
						}
						if($anhor.closest('.overlay-menu-wrapper').length && $anhor.closest('.overlay-menu-wrapper').hasClass('active')) {
							if($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('responsive')) {
								$('.menu-toggle').trigger('click');
							} else {
								$('.overlay-toggle').trigger('click');
							}
						}
						if($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('hamburger-active')) {
							$('.hamburger-toggle').trigger('click');
						}
					}
				});
				$anhorsElements.push($anhor[0]);
			}
			} catch(e) { return; }
		});

		if ($anhorsElements.length) {
			function anchorLinksScroll() {
				var isPerspectiveMenu = $('#thegem-perspective.modalview').length;
				var correction = 0;

				if (!$page.hasClass('vertical-header')) {
					correction = $('#site-header').outerHeight();
					if (!isPerspectiveMenu) {
						var siteHeaderTop = $('#site-header').length ? $('#site-header').position().top : 0;
						if ($('#site-header').hasClass('shrink')) {
							siteHeaderTop = 0;
						}
						correction += siteHeaderTop;
					}
				}

				for (var i = 0; i < $anhorsElements.length; i++) {
					var $anhor = $($anhorsElements[i]);
					var link = $anhor.attr('href');
					if(!link) continue ;
					link = link.split('#');
					var scrollY = getScrollY() + $page.scrollTop();

					if(!$anhor.closest('li.menu-item').length) continue ;
					var target_top = getElementPagePosition( $('#'+link[1])[0] ).top - correction;
					if(scrollY >= target_top && scrollY <= target_top + $('#'+link[1]).outerHeight()) {
						$anhor.closest('li').addClass('menu-item-active');
						$anhor.closest('li').parents('li').addClass('menu-item-current');
					} else {
						$anhor.closest('li').removeClass('menu-item-active');
						$anhor.closest('li').parents('li.menu-item-current').each(function() {
							if(!$('.menu-item-active', this).length) {
								$(this).removeClass('menu-item-current');
							}
						});
					}
				}
			}

			$(window).scroll(anchorLinksScroll);
			if ($('#thegem-perspective').length) {
				$page.scroll(anchorLinksScroll);
			}

			$(window).on('load', function() {
				for (var i = 0; i < $anhorsElements.length; i++) {
					var anhor = $anhorsElements[i];
					if (anhor.href != undefined && anhor.href && window.location.href == anhor.href) {
						anhor.click();
						break;
					}
				}
			});
		}

		$('body').on('click', '.post-footer-sharing .gem-button', function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).closest('.post-footer-sharing').find('.sharing-popup').addClass('active');
		});

		$('body').on('click', function () {
			$('.sharing-popup').removeClass('active');
		});

		var scrollTimer,
			body = document.body;

		$(window).scroll(function() {
			clearTimeout(scrollTimer);
			if(!body.classList.contains('disable-hover')) {
				//body.classList.add('disable-hover')
			}

			scrollTimer = setTimeout(function(){
				//body.classList.remove('disable-hover')
			}, 300);

			if(getScrollY() > 0) {
				$('.scroll-top-button').addClass('visible');
			} else {
				$('.scroll-top-button').removeClass('visible');
			}
		}).scroll();

		function getScrollY(elem){
			return window.pageYOffset || document.documentElement.scrollTop;
		}

		$('a.hidden-email').each(function() {
			$(this).attr('href', 'mailto:'+$(this).data('name')+'@'+$(this).data('domain'));
		});

		var initFooterWidgetArea = function() {
			if (window.tgpLazyItems !== undefined) {
				var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
					initFooterWidgetArea.call(node);
				});
				if (!isShowed) {
					return;
				}
			}

			var self = this;
			$(self).thegemPreloader(function() {
				$(self).isotope({
					itemSelector: '.widget',
					layoutMode: 'masonry'
				});
			});
		};

		$('#colophon .footer-widget-area').each(initFooterWidgetArea);

		$('body').updateTabs();
	});

	$(document).on('show.vc.accordion', '[data-vc-accordion]', function() {
		var $target = $(this).data('vc.accordion').getContainer();
		var correction = 0;
		if(!$target.find('.vc_tta-tabs').length || !$(this).is(':visible') || $target.data('vc-tta-autoplay')) return ;
		if($('#site-header.animated-header').length && $('#site-header').hasClass('fixed')) {
			var shrink = $('#site-header').hasClass('shrink');
			$('#site-header').addClass('scroll-counting');
			$('#site-header').addClass('fixed shrink');
			correction = $('#site-header').outerHeight() + $('#site-header').position().top;
			if(!shrink) {
				$('#site-header').removeClass('fixed shrink');
			}
			$('#site-header').removeClass('scroll-counting');
		}
		var target_top = $target.offset().top - correction - 100 + 1;
		$('html, body').stop(true, true).animate({scrollTop:target_top}, 500, 'easeInOutCubic');
	});

	var vc_update_fullwidth_init = true;
	$(document).on('vc-full-width-row', function(e) {
		if (window.gemOptions.clientWidth - $page.width() > 25 || window.gemSettings.isRTL) {
			for (var i = 1; i < arguments.length; i++) {
				var $el = $(arguments[i]);
				$el.addClass("vc_hidden");
				var $el_full = $el.next(".vc_row-full-width");
				$el_full.length || ($el_full = $el.parent().next(".vc_row-full-width"));
				var el_margin_left = parseInt($el.css("margin-left"), 10),
					el_margin_right = parseInt($el.css("margin-right"), 10),
					offset = 0 - $el_full.offset().left - el_margin_left + $('#page').offset().left + parseInt($('#page').css('padding-left')),
					width = $('#page').width();

				var offsetKey = window.gemSettings.isRTL ? 'right' : 'left';
				var cssData = {
					position: "relative",
					left: offset,
					"box-sizing": "border-box",
					width: $("#page").width()
				};
				cssData[offsetKey] = offset;

				if ($el.css(cssData), !$el.data("vcStretchContent")) {
					var padding = -1 * offset;
					0 > padding && (padding = 0);
					var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
					0 > paddingRight && (paddingRight = 0), $el.css({
						"padding-left": padding + "px",
						"padding-right": paddingRight + "px"
					})
				}
				$el.attr("data-vc-full-width-init", "true"), $el.removeClass("vc_hidden");
				$el.trigger('VCRowFullwidthUpdate');
			}
		}
		update_fullwidths(true, vc_update_fullwidth_init);
		vc_update_fullwidth_init = false;
	});

	$('body').on('click', '.gem-button[href^="#give-form-"]', function(e) {
		var form_id = $(this).attr('href').replace('#give-form-', '');
		form_id = parseInt(form_id);
		if (!isNaN(form_id)) {
			$('#give-form-' + form_id + ' .give-btn-modal').click();
		}
		e.preventDefault();
		return false;
	});

})(jQuery);

(function($) {
		$('.menu-item-search a').on('click', function(e){
			e.preventDefault();
			if($(this).closest('.overlay-menu-wrapper.active').length) {
				var $primaryMenu = $('#primary-menu');
				$primaryMenu.addClass('overlay-search-form-show');

				if ($primaryMenu.hasClass('no-responsive')) {
					$primaryMenu.addClass('animated-minisearch');
				}

				setTimeout(function() {
					$(document).on('click.menu-item-search-close', 'body', function(e) {
						if(!$(e.target).is('.menu-item-search .minisearch *')) {
							var $primaryMenu = $('#primary-menu');

							if ($primaryMenu.hasClass('animated-minisearch')) {
								$primaryMenu.removeClass('animated-minisearch');

								setTimeout(function() {
									$primaryMenu.removeClass('overlay-search-form-show');
									$(document).off('click.menu-item-search-close');
								}, 700);

							} else {
								$primaryMenu.removeClass('overlay-search-form-show');
								$(document).off('click.menu-item-search-close');
							}
						}
					});
				}, 500);
			} else {
				$('.menu-item-search').toggleClass('active');
			}
		});
})(jQuery);


(function($) {
	$('.menu-item-search a').click(function(){
		if(!$('#primary-navigation').hasClass('overlay-active')) {
			$('#searchform-input').focus();
		}
	});
})(jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/fancyBox/jquery.mousewheel.pack.js?ver=5.8.1 
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
(function(d){function e(a){var b=a||window.event,c=[].slice.call(arguments,1),f=0,e=0,g=0,a=d.event.fix(b);a.type="mousewheel";b.wheelDelta&&(f=b.wheelDelta/120);b.detail&&(f=-b.detail/3);g=f;b.axis!==void 0&&b.axis===b.HORIZONTAL_AXIS&&(g=0,e=-1*f);b.wheelDeltaY!==void 0&&(g=b.wheelDeltaY/120);b.wheelDeltaX!==void 0&&(e=-1*b.wheelDeltaX/120);c.unshift(a,f,e,g);return(d.event.dispatch||d.event.handle).apply(this,c)}var c=["DOMMouseScroll","mousewheel"];if(d.event.fixHooks)for(var h=c.length;h;)d.event.fixHooks[c[--h]]=
d.event.mouseHooks;d.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],e,false);else this.onmousewheel=e},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],e,false);else this.onmousewheel=null}};d.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/fancyBox/jquery.fancybox.min.js?ver=5.8.1 
// ==================================================
// fancyBox v3.5.7
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2019 fancyApps
//
// ==================================================
!function(t,e,n,o){"use strict";function i(t,e){var o,i,a,s=[],r=0;t&&t.isDefaultPrevented()||(t.preventDefault(),e=e||{},t&&t.data&&(e=h(t.data.options,e)),o=e.$target||n(t.currentTarget).trigger("blur"),(a=n.fancybox.getInstance())&&a.$trigger&&a.$trigger.is(o)||(e.selector?s=n(e.selector):(i=o.attr("data-fancybox")||"",i?(s=t.data?t.data.items:[],s=s.length?s.filter('[data-fancybox="'+i+'"]'):n('[data-fancybox="'+i+'"]')):s=[o]),r=n(s).index(o),r<0&&(r=0),a=n.fancybox.open(s,e,r),a.$trigger=o))}if(t.console=t.console||{info:function(t){}},n){if(n.fn.fancybox)return void console.info("fancyBox already initialized");var a={closeExisting:!1,loop:!1,gutter:50,keyboard:!0,preventCaptionOverlap:!0,arrows:!0,infobar:!0,smallBtn:"auto",toolbar:"auto",buttons:["zoom","slideShow","thumbs","close"],idleTime:3,protect:!1,modal:!1,image:{preload:!1},ajax:{settings:{data:{fancybox:!0}}},iframe:{tpl:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" allowfullscreen="allowfullscreen" allow="autoplay; fullscreen" src=""></iframe>',preload:!0,css:{},attr:{scrolling:"auto"}},video:{tpl:'<video class="fancybox-video" controls controlsList="nodownload" poster="{{poster}}"><source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!</video>',format:"",autoStart:!0},defaultType:"image",animationEffect:"zoom",animationDuration:366,zoomOpacity:"auto",transitionEffect:"fade",transitionDuration:366,slideClass:"",baseClass:"",baseTpl:'<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><div class="fancybox-toolbar">{{buttons}}</div><div class="fancybox-navigation">{{arrows}}</div><div class="fancybox-stage"></div><div class="fancybox-caption"><div class="fancybox-caption__body"></div></div></div></div>',spinnerTpl:'<div class="fancybox-loading"></div>',errorTpl:'<div class="fancybox-error"><p>{{ERROR}}</p></div>',btnTpl:{download:'<a download data-fancybox-download class="fancybox-button fancybox-button--download" title="{{DOWNLOAD}}" href="javascript:;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.62 17.09V19H5.38v-1.91zm-2.97-6.96L17 11.45l-5 4.87-5-4.87 1.36-1.32 2.68 2.64V5h1.92v7.77z"/></svg></a>',zoom:'<button data-fancybox-zoom class="fancybox-button fancybox-button--zoom" title="{{ZOOM}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.7 17.3l-3-3a5.9 5.9 0 0 0-.6-7.6 5.9 5.9 0 0 0-8.4 0 5.9 5.9 0 0 0 0 8.4 5.9 5.9 0 0 0 7.7.7l3 3a1 1 0 0 0 1.3 0c.4-.5.4-1 0-1.5zM8.1 13.8a4 4 0 0 1 0-5.7 4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7 4 4 0 0 1-5.7 0z"/></svg></button>',close:'<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"/></svg></button>',arrowLeft:'<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.28 15.7l-1.34 1.37L5 12l4.94-5.07 1.34 1.38-2.68 2.72H19v1.94H8.6z"/></svg></div></button>',arrowRight:'<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 12.97l-2.68 2.72 1.34 1.38L19 12l-4.94-5.07-1.34 1.38 2.68 2.72H5v1.94z"/></svg></div></button>',smallBtn:'<button type="button" data-fancybox-close class="fancybox-button fancybox-close-small" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"/></svg></button>'},parentEl:"body",hideScrollbar:!0,autoFocus:!0,backFocus:!0,trapFocus:!0,fullScreen:{autoStart:!1},touch:{vertical:!0,momentum:!0},hash:null,media:{},slideShow:{autoStart:!1,speed:3e3},thumbs:{autoStart:!1,hideOnClose:!0,parentEl:".fancybox-container",axis:"y"},wheel:"auto",onInit:n.noop,beforeLoad:n.noop,afterLoad:n.noop,beforeShow:n.noop,afterShow:n.noop,beforeClose:n.noop,afterClose:n.noop,onActivate:n.noop,onDeactivate:n.noop,clickContent:function(t,e){return"image"===t.type&&"zoom"},clickSlide:"close",clickOutside:"close",dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1,mobile:{preventCaptionOverlap:!1,idleTime:!1,clickContent:function(t,e){return"image"===t.type&&"toggleControls"},clickSlide:function(t,e){return"image"===t.type?"toggleControls":"close"},dblclickContent:function(t,e){return"image"===t.type&&"zoom"},dblclickSlide:function(t,e){return"image"===t.type&&"zoom"}},lang:"en",i18n:{en:{CLOSE:"Close",NEXT:"Next",PREV:"Previous",ERROR:"The requested content cannot be loaded. <br/> Please try again later.",PLAY_START:"Start slideshow",PLAY_STOP:"Pause slideshow",FULL_SCREEN:"Full screen",THUMBS:"Thumbnails",DOWNLOAD:"Download",SHARE:"Share",ZOOM:"Zoom"},de:{CLOSE:"Schlie&szlig;en",NEXT:"Weiter",PREV:"Zur&uuml;ck",ERROR:"Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es sp&auml;ter nochmal.",PLAY_START:"Diaschau starten",PLAY_STOP:"Diaschau beenden",FULL_SCREEN:"Vollbild",THUMBS:"Vorschaubilder",DOWNLOAD:"Herunterladen",SHARE:"Teilen",ZOOM:"Vergr&ouml;&szlig;ern"}}},s=n(t),r=n(e),c=0,l=function(t){return t&&t.hasOwnProperty&&t instanceof n},d=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),u=function(){return t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame||t.oCancelAnimationFrame||function(e){t.clearTimeout(e)}}(),f=function(){var t,n=e.createElement("fakeelement"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(t in o)if(void 0!==n.style[t])return o[t];return"transitionend"}(),p=function(t){return t&&t.length&&t[0].offsetHeight},h=function(t,e){var o=n.extend(!0,{},t,e);return n.each(e,function(t,e){n.isArray(e)&&(o[t]=e)}),o},g=function(t){var o,i;return!(!t||t.ownerDocument!==e)&&(n(".fancybox-container").css("pointer-events","none"),o={x:t.getBoundingClientRect().left+t.offsetWidth/2,y:t.getBoundingClientRect().top+t.offsetHeight/2},i=e.elementFromPoint(o.x,o.y)===t,n(".fancybox-container").css("pointer-events",""),i)},b=function(t,e,o){var i=this;i.opts=h({index:o},n.fancybox.defaults),n.isPlainObject(e)&&(i.opts=h(i.opts,e)),n.fancybox.isMobile&&(i.opts=h(i.opts,i.opts.mobile)),i.id=i.opts.id||++c,i.currIndex=parseInt(i.opts.index,10)||0,i.prevIndex=null,i.prevPos=null,i.currPos=0,i.firstRun=!0,i.group=[],i.slides={},i.addContent(t),i.group.length&&i.init()};n.extend(b.prototype,{init:function(){var o,i,a=this,s=a.group[a.currIndex],r=s.opts;r.closeExisting&&n.fancybox.close(!0),n("body").addClass("fancybox-active"),!n.fancybox.getInstance()&&!1!==r.hideScrollbar&&!n.fancybox.isMobile&&e.body.scrollHeight>t.innerHeight&&(n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar{margin-right:'+(t.innerWidth-e.documentElement.clientWidth)+"px;}</style>"),n("body").addClass("compensate-for-scrollbar")),i="",n.each(r.buttons,function(t,e){i+=r.btnTpl[e]||""}),o=n(a.translate(a,r.baseTpl.replace("{{buttons}}",i).replace("{{arrows}}",r.btnTpl.arrowLeft+r.btnTpl.arrowRight))).attr("id","fancybox-container-"+a.id).addClass(r.baseClass).data("FancyBox",a).appendTo(r.parentEl),a.$refs={container:o},["bg","inner","infobar","toolbar","stage","caption","navigation"].forEach(function(t){a.$refs[t]=o.find(".fancybox-"+t)}),a.trigger("onInit"),a.activate(),a.jumpTo(a.currIndex)},translate:function(t,e){var n=t.opts.i18n[t.opts.lang]||t.opts.i18n.en;return e.replace(/\{\{(\w+)\}\}/g,function(t,e){return void 0===n[e]?t:n[e]})},addContent:function(t){var e,o=this,i=n.makeArray(t);n.each(i,function(t,e){var i,a,s,r,c,l={},d={};n.isPlainObject(e)?(l=e,d=e.opts||e):"object"===n.type(e)&&n(e).length?(i=n(e),d=i.data()||{},d=n.extend(!0,{},d,d.options),d.$orig=i,l.src=o.opts.src||d.src||i.attr("href"),l.type||l.src||(l.type="inline",l.src=e)):l={type:"html",src:e+""},l.opts=n.extend(!0,{},o.opts,d),n.isArray(d.buttons)&&(l.opts.buttons=d.buttons),n.fancybox.isMobile&&l.opts.mobile&&(l.opts=h(l.opts,l.opts.mobile)),a=l.type||l.opts.type,r=l.src||"",!a&&r&&((s=r.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i))?(a="video",l.opts.video.format||(l.opts.video.format="video/"+("ogv"===s[1]?"ogg":s[1]))):r.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)?a="image":r.match(/\.(pdf)((\?|#).*)?$/i)?(a="iframe",l=n.extend(!0,l,{contentType:"pdf",opts:{iframe:{preload:!1}}})):"#"===r.charAt(0)&&(a="inline")),a?l.type=a:o.trigger("objectNeedsType",l),l.contentType||(l.contentType=n.inArray(l.type,["html","inline","ajax"])>-1?"html":l.type),l.index=o.group.length,"auto"==l.opts.smallBtn&&(l.opts.smallBtn=n.inArray(l.type,["html","inline","ajax"])>-1),"auto"===l.opts.toolbar&&(l.opts.toolbar=!l.opts.smallBtn),l.$thumb=l.opts.$thumb||null,l.opts.$trigger&&l.index===o.opts.index&&(l.$thumb=l.opts.$trigger.find("img:first"),l.$thumb.length&&(l.opts.$orig=l.opts.$trigger)),l.$thumb&&l.$thumb.length||!l.opts.$orig||(l.$thumb=l.opts.$orig.find("img:first")),l.$thumb&&!l.$thumb.length&&(l.$thumb=null),l.thumb=l.opts.thumb||(l.$thumb?l.$thumb[0].src:null),"function"===n.type(l.opts.caption)&&(l.opts.caption=l.opts.caption.apply(e,[o,l])),"function"===n.type(o.opts.caption)&&(l.opts.caption=o.opts.caption.apply(e,[o,l])),l.opts.caption instanceof n||(l.opts.caption=void 0===l.opts.caption?"":l.opts.caption+""),"ajax"===l.type&&(c=r.split(/\s+/,2),c.length>1&&(l.src=c.shift(),l.opts.filter=c.shift())),l.opts.modal&&(l.opts=n.extend(!0,l.opts,{trapFocus:!0,infobar:0,toolbar:0,smallBtn:0,keyboard:0,slideShow:0,fullScreen:0,thumbs:0,touch:0,clickContent:!1,clickSlide:!1,clickOutside:!1,dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1})),o.group.push(l)}),Object.keys(o.slides).length&&(o.updateControls(),(e=o.Thumbs)&&e.isActive&&(e.create(),e.focus()))},addEvents:function(){var e=this;e.removeEvents(),e.$refs.container.on("click.fb-close","[data-fancybox-close]",function(t){t.stopPropagation(),t.preventDefault(),e.close(t)}).on("touchstart.fb-prev click.fb-prev","[data-fancybox-prev]",function(t){t.stopPropagation(),t.preventDefault(),e.previous()}).on("touchstart.fb-next click.fb-next","[data-fancybox-next]",function(t){t.stopPropagation(),t.preventDefault(),e.next()}).on("click.fb","[data-fancybox-zoom]",function(t){e[e.isScaledDown()?"scaleToActual":"scaleToFit"]()}),s.on("orientationchange.fb resize.fb",function(t){t&&t.originalEvent&&"resize"===t.originalEvent.type?(e.requestId&&u(e.requestId),e.requestId=d(function(){e.update(t)})):(e.current&&"iframe"===e.current.type&&e.$refs.stage.hide(),setTimeout(function(){e.$refs.stage.show(),e.update(t)},n.fancybox.isMobile?600:250))}),r.on("keydown.fb",function(t){var o=n.fancybox?n.fancybox.getInstance():null,i=o.current,a=t.keyCode||t.which;if(9==a)return void(i.opts.trapFocus&&e.focus(t));if(!(!i.opts.keyboard||t.ctrlKey||t.altKey||t.shiftKey||n(t.target).is("input,textarea,video,audio,select")))return 8===a||27===a?(t.preventDefault(),void e.close(t)):37===a||38===a?(t.preventDefault(),void e.previous()):39===a||40===a?(t.preventDefault(),void e.next()):void e.trigger("afterKeydown",t,a)}),e.group[e.currIndex].opts.idleTime&&(e.idleSecondsCounter=0,r.on("mousemove.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle",function(t){e.idleSecondsCounter=0,e.isIdle&&e.showControls(),e.isIdle=!1}),e.idleInterval=t.setInterval(function(){++e.idleSecondsCounter>=e.group[e.currIndex].opts.idleTime&&!e.isDragging&&(e.isIdle=!0,e.idleSecondsCounter=0,e.hideControls())},1e3))},removeEvents:function(){var e=this;s.off("orientationchange.fb resize.fb"),r.off("keydown.fb .fb-idle"),this.$refs.container.off(".fb-close .fb-prev .fb-next"),e.idleInterval&&(t.clearInterval(e.idleInterval),e.idleInterval=null)},previous:function(t){return this.jumpTo(this.currPos-1,t)},next:function(t){return this.jumpTo(this.currPos+1,t)},jumpTo:function(t,e){var o,i,a,s,r,c,l,d,u,f=this,h=f.group.length;if(!(f.isDragging||f.isClosing||f.isAnimating&&f.firstRun)){if(t=parseInt(t,10),!(a=f.current?f.current.opts.loop:f.opts.loop)&&(t<0||t>=h))return!1;if(o=f.firstRun=!Object.keys(f.slides).length,r=f.current,f.prevIndex=f.currIndex,f.prevPos=f.currPos,s=f.createSlide(t),h>1&&((a||s.index<h-1)&&f.createSlide(t+1),(a||s.index>0)&&f.createSlide(t-1)),f.current=s,f.currIndex=s.index,f.currPos=s.pos,f.trigger("beforeShow",o),f.updateControls(),s.forcedDuration=void 0,n.isNumeric(e)?s.forcedDuration=e:e=s.opts[o?"animationDuration":"transitionDuration"],e=parseInt(e,10),i=f.isMoved(s),s.$slide.addClass("fancybox-slide--current"),o)return s.opts.animationEffect&&e&&f.$refs.container.css("transition-duration",e+"ms"),f.$refs.container.addClass("fancybox-is-open").trigger("focus"),f.loadSlide(s),void f.preload("image");c=n.fancybox.getTranslate(r.$slide),l=n.fancybox.getTranslate(f.$refs.stage),n.each(f.slides,function(t,e){n.fancybox.stop(e.$slide,!0)}),r.pos!==s.pos&&(r.isComplete=!1),r.$slide.removeClass("fancybox-slide--complete fancybox-slide--current"),i?(u=c.left-(r.pos*c.width+r.pos*r.opts.gutter),n.each(f.slides,function(t,o){o.$slide.removeClass("fancybox-animated").removeClass(function(t,e){return(e.match(/(^|\s)fancybox-fx-\S+/g)||[]).join(" ")});var i=o.pos*c.width+o.pos*o.opts.gutter;n.fancybox.setTranslate(o.$slide,{top:0,left:i-l.left+u}),o.pos!==s.pos&&o.$slide.addClass("fancybox-slide--"+(o.pos>s.pos?"next":"previous")),p(o.$slide),n.fancybox.animate(o.$slide,{top:0,left:(o.pos-s.pos)*c.width+(o.pos-s.pos)*o.opts.gutter},e,function(){o.$slide.css({transform:"",opacity:""}).removeClass("fancybox-slide--next fancybox-slide--previous"),o.pos===f.currPos&&f.complete()})})):e&&s.opts.transitionEffect&&(d="fancybox-animated fancybox-fx-"+s.opts.transitionEffect,r.$slide.addClass("fancybox-slide--"+(r.pos>s.pos?"next":"previous")),n.fancybox.animate(r.$slide,d,e,function(){r.$slide.removeClass(d).removeClass("fancybox-slide--next fancybox-slide--previous")},!1)),s.isLoaded?f.revealContent(s):f.loadSlide(s),f.preload("image")}},createSlide:function(t){var e,o,i=this;return o=t%i.group.length,o=o<0?i.group.length+o:o,!i.slides[t]&&i.group[o]&&(e=n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage),i.slides[t]=n.extend(!0,{},i.group[o],{pos:t,$slide:e,isLoaded:!1}),i.updateSlide(i.slides[t])),i.slides[t]},scaleToActual:function(t,e,o){var i,a,s,r,c,l=this,d=l.current,u=d.$content,f=n.fancybox.getTranslate(d.$slide).width,p=n.fancybox.getTranslate(d.$slide).height,h=d.width,g=d.height;l.isAnimating||l.isMoved()||!u||"image"!=d.type||!d.isLoaded||d.hasError||(l.isAnimating=!0,n.fancybox.stop(u),t=void 0===t?.5*f:t,e=void 0===e?.5*p:e,i=n.fancybox.getTranslate(u),i.top-=n.fancybox.getTranslate(d.$slide).top,i.left-=n.fancybox.getTranslate(d.$slide).left,r=h/i.width,c=g/i.height,a=.5*f-.5*h,s=.5*p-.5*g,h>f&&(a=i.left*r-(t*r-t),a>0&&(a=0),a<f-h&&(a=f-h)),g>p&&(s=i.top*c-(e*c-e),s>0&&(s=0),s<p-g&&(s=p-g)),l.updateCursor(h,g),n.fancybox.animate(u,{top:s,left:a,scaleX:r,scaleY:c},o||366,function(){l.isAnimating=!1}),l.SlideShow&&l.SlideShow.isActive&&l.SlideShow.stop())},scaleToFit:function(t){var e,o=this,i=o.current,a=i.$content;o.isAnimating||o.isMoved()||!a||"image"!=i.type||!i.isLoaded||i.hasError||(o.isAnimating=!0,n.fancybox.stop(a),e=o.getFitPos(i),o.updateCursor(e.width,e.height),n.fancybox.animate(a,{top:e.top,left:e.left,scaleX:e.width/a.width(),scaleY:e.height/a.height()},t||366,function(){o.isAnimating=!1}))},getFitPos:function(t){var e,o,i,a,s=this,r=t.$content,c=t.$slide,l=t.width||t.opts.width,d=t.height||t.opts.height,u={};return!!(t.isLoaded&&r&&r.length)&&(e=n.fancybox.getTranslate(s.$refs.stage).width,o=n.fancybox.getTranslate(s.$refs.stage).height,e-=parseFloat(c.css("paddingLeft"))+parseFloat(c.css("paddingRight"))+parseFloat(r.css("marginLeft"))+parseFloat(r.css("marginRight")),o-=parseFloat(c.css("paddingTop"))+parseFloat(c.css("paddingBottom"))+parseFloat(r.css("marginTop"))+parseFloat(r.css("marginBottom")),l&&d||(l=e,d=o),i=Math.min(1,e/l,o/d),l*=i,d*=i,l>e-.5&&(l=e),d>o-.5&&(d=o),"image"===t.type?(u.top=Math.floor(.5*(o-d))+parseFloat(c.css("paddingTop")),u.left=Math.floor(.5*(e-l))+parseFloat(c.css("paddingLeft"))):"video"===t.contentType&&(a=t.opts.width&&t.opts.height?l/d:t.opts.ratio||16/9,d>l/a?d=l/a:l>d*a&&(l=d*a)),u.width=l,u.height=d,u)},update:function(t){var e=this;n.each(e.slides,function(n,o){e.updateSlide(o,t)})},updateSlide:function(t,e){var o=this,i=t&&t.$content,a=t.width||t.opts.width,s=t.height||t.opts.height,r=t.$slide;o.adjustCaption(t),i&&(a||s||"video"===t.contentType)&&!t.hasError&&(n.fancybox.stop(i),n.fancybox.setTranslate(i,o.getFitPos(t)),t.pos===o.currPos&&(o.isAnimating=!1,o.updateCursor())),o.adjustLayout(t),r.length&&(r.trigger("refresh"),t.pos===o.currPos&&o.$refs.toolbar.add(o.$refs.navigation.find(".fancybox-button--arrow_right")).toggleClass("compensate-for-scrollbar",r.get(0).scrollHeight>r.get(0).clientHeight)),o.trigger("onUpdate",t,e)},centerSlide:function(t){var e=this,o=e.current,i=o.$slide;!e.isClosing&&o&&(i.siblings().css({transform:"",opacity:""}),i.parent().children().removeClass("fancybox-slide--previous fancybox-slide--next"),n.fancybox.animate(i,{top:0,left:0,opacity:1},void 0===t?0:t,function(){i.css({transform:"",opacity:""}),o.isComplete||e.complete()},!1))},isMoved:function(t){var e,o,i=t||this.current;return!!i&&(o=n.fancybox.getTranslate(this.$refs.stage),e=n.fancybox.getTranslate(i.$slide),!i.$slide.hasClass("fancybox-animated")&&(Math.abs(e.top-o.top)>.5||Math.abs(e.left-o.left)>.5))},updateCursor:function(t,e){var o,i,a=this,s=a.current,r=a.$refs.container;s&&!a.isClosing&&a.Guestures&&(r.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-zoomOut fancybox-can-swipe fancybox-can-pan"),o=a.canPan(t,e),i=!!o||a.isZoomable(),r.toggleClass("fancybox-is-zoomable",i),n("[data-fancybox-zoom]").prop("disabled",!i),o?r.addClass("fancybox-can-pan"):i&&("zoom"===s.opts.clickContent||n.isFunction(s.opts.clickContent)&&"zoom"==s.opts.clickContent(s))?r.addClass("fancybox-can-zoomIn"):s.opts.touch&&(s.opts.touch.vertical||a.group.length>1)&&"video"!==s.contentType&&r.addClass("fancybox-can-swipe"))},isZoomable:function(){var t,e=this,n=e.current;if(n&&!e.isClosing&&"image"===n.type&&!n.hasError){if(!n.isLoaded)return!0;if((t=e.getFitPos(n))&&(n.width>t.width||n.height>t.height))return!0}return!1},isScaledDown:function(t,e){var o=this,i=!1,a=o.current,s=a.$content;return void 0!==t&&void 0!==e?i=t<a.width&&e<a.height:s&&(i=n.fancybox.getTranslate(s),i=i.width<a.width&&i.height<a.height),i},canPan:function(t,e){var o=this,i=o.current,a=null,s=!1;return"image"===i.type&&(i.isComplete||t&&e)&&!i.hasError&&(s=o.getFitPos(i),void 0!==t&&void 0!==e?a={width:t,height:e}:i.isComplete&&(a=n.fancybox.getTranslate(i.$content)),a&&s&&(s=Math.abs(a.width-s.width)>1.5||Math.abs(a.height-s.height)>1.5)),s},loadSlide:function(t){var e,o,i,a=this;if(!t.isLoading&&!t.isLoaded){if(t.isLoading=!0,!1===a.trigger("beforeLoad",t))return t.isLoading=!1,!1;switch(e=t.type,o=t.$slide,o.off("refresh").trigger("onReset").addClass(t.opts.slideClass),e){case"image":a.setImage(t);break;case"iframe":a.setIframe(t);break;case"html":a.setContent(t,t.src||t.content);break;case"video":a.setContent(t,t.opts.video.tpl.replace(/\{\{src\}\}/gi,t.src).replace("{{format}}",t.opts.videoFormat||t.opts.video.format||"").replace("{{poster}}",t.thumb||""));break;case"inline":n(t.src).length?a.setContent(t,n(t.src)):a.setError(t);break;case"ajax":a.showLoading(t),i=n.ajax(n.extend({},t.opts.ajax.settings,{url:t.src,success:function(e,n){"success"===n&&a.setContent(t,e)},error:function(e,n){e&&"abort"!==n&&a.setError(t)}})),o.one("onReset",function(){i.abort()});break;default:a.setError(t)}return!0}},setImage:function(t){var o,i=this;setTimeout(function(){var e=t.$image;i.isClosing||!t.isLoading||e&&e.length&&e[0].complete||t.hasError||i.showLoading(t)},50),i.checkSrcset(t),t.$content=n('<div class="fancybox-content"></div>').addClass("fancybox-is-hidden").appendTo(t.$slide.addClass("fancybox-slide--image")),!1!==t.opts.preload&&t.opts.width&&t.opts.height&&t.thumb&&(t.width=t.opts.width,t.height=t.opts.height,o=e.createElement("img"),o.onerror=function(){n(this).remove(),t.$ghost=null},o.onload=function(){i.afterLoad(t)},t.$ghost=n(o).addClass("fancybox-image").appendTo(t.$content).attr("src",t.thumb)),i.setBigImage(t)},checkSrcset:function(e){var n,o,i,a,s=e.opts.srcset||e.opts.image.srcset;if(s){i=t.devicePixelRatio||1,a=t.innerWidth*i,o=s.split(",").map(function(t){var e={};return t.trim().split(/\s+/).forEach(function(t,n){var o=parseInt(t.substring(0,t.length-1),10);if(0===n)return e.url=t;o&&(e.value=o,e.postfix=t[t.length-1])}),e}),o.sort(function(t,e){return t.value-e.value});for(var r=0;r<o.length;r++){var c=o[r];if("w"===c.postfix&&c.value>=a||"x"===c.postfix&&c.value>=i){n=c;break}}!n&&o.length&&(n=o[o.length-1]),n&&(e.src=n.url,e.width&&e.height&&"w"==n.postfix&&(e.height=e.width/e.height*n.value,e.width=n.value),e.opts.srcset=s)}},setBigImage:function(t){var o=this,i=e.createElement("img"),a=n(i);t.$image=a.one("error",function(){o.setError(t)}).one("load",function(){var e;t.$ghost||(o.resolveImageSlideSize(t,this.naturalWidth,this.naturalHeight),o.afterLoad(t)),o.isClosing||(t.opts.srcset&&(e=t.opts.sizes,e&&"auto"!==e||(e=(t.width/t.height>1&&s.width()/s.height()>1?"100":Math.round(t.width/t.height*100))+"vw"),a.attr("sizes",e).attr("srcset",t.opts.srcset)),t.$ghost&&setTimeout(function(){t.$ghost&&!o.isClosing&&t.$ghost.hide()},Math.min(300,Math.max(1e3,t.height/1600))),o.hideLoading(t))}).addClass("fancybox-image").attr("src",t.src).appendTo(t.$content),(i.complete||"complete"==i.readyState)&&a.naturalWidth&&a.naturalHeight?a.trigger("load"):i.error&&a.trigger("error")},resolveImageSlideSize:function(t,e,n){var o=parseInt(t.opts.width,10),i=parseInt(t.opts.height,10);t.width=e,t.height=n,o>0&&(t.width=o,t.height=Math.floor(o*n/e)),i>0&&(t.width=Math.floor(i*e/n),t.height=i)},setIframe:function(t){var e,o=this,i=t.opts.iframe,a=t.$slide;t.$content=n('<div class="fancybox-content'+(i.preload?" fancybox-is-hidden":"")+'"></div>').css(i.css).appendTo(a),a.addClass("fancybox-slide--"+t.contentType),t.$iframe=e=n(i.tpl.replace(/\{rnd\}/g,(new Date).getTime())).attr(i.attr).appendTo(t.$content),i.preload?(o.showLoading(t),e.on("load.fb error.fb",function(e){this.isReady=1,t.$slide.trigger("refresh"),o.afterLoad(t)}),a.on("refresh.fb",function(){var n,o,s=t.$content,r=i.css.width,c=i.css.height;if(1===e[0].isReady){try{n=e.contents(),o=n.find("body")}catch(t){}o&&o.length&&o.children().length&&(a.css("overflow","visible"),s.css({width:"100%","max-width":"100%",height:"9999px"}),void 0===r&&(r=Math.ceil(Math.max(o[0].clientWidth,o.outerWidth(!0)))),s.css("width",r||"").css("max-width",""),void 0===c&&(c=Math.ceil(Math.max(o[0].clientHeight,o.outerHeight(!0)))),s.css("height",c||""),a.css("overflow","auto")),s.removeClass("fancybox-is-hidden")}})):o.afterLoad(t),e.attr("src",t.src),a.one("onReset",function(){try{n(this).find("iframe").hide().unbind().attr("src","//about:blank")}catch(t){}n(this).off("refresh.fb").empty(),t.isLoaded=!1,t.isRevealed=!1})},setContent:function(t,e){var o=this;o.isClosing||(o.hideLoading(t),t.$content&&n.fancybox.stop(t.$content),t.$slide.empty(),l(e)&&e.parent().length?((e.hasClass("fancybox-content")||e.parent().hasClass("fancybox-content"))&&e.parents(".fancybox-slide").trigger("onReset"),t.$placeholder=n("<div>").hide().insertAfter(e),e.css("display","inline-block")):t.hasError||("string"===n.type(e)&&(e=n("<div>").append(n.trim(e)).contents()),t.opts.filter&&(e=n("<div>").html(e).find(t.opts.filter))),t.$slide.one("onReset",function(){n(this).find("video,audio").trigger("pause"),t.$placeholder&&(t.$placeholder.after(e.removeClass("fancybox-content").hide()).remove(),t.$placeholder=null),t.$smallBtn&&(t.$smallBtn.remove(),t.$smallBtn=null),t.hasError||(n(this).empty(),t.isLoaded=!1,t.isRevealed=!1)}),n(e).appendTo(t.$slide),n(e).is("video,audio")&&(n(e).addClass("fancybox-video"),n(e).wrap("<div></div>"),t.contentType="video",t.opts.width=t.opts.width||n(e).attr("width"),t.opts.height=t.opts.height||n(e).attr("height")),t.$content=t.$slide.children().filter("div,form,main,video,audio,article,.fancybox-content").first(),t.$content.siblings().hide(),t.$content.length||(t.$content=t.$slide.wrapInner("<div></div>").children().first()),t.$content.addClass("fancybox-content"),t.$slide.addClass("fancybox-slide--"+t.contentType),o.afterLoad(t))},setError:function(t){t.hasError=!0,t.$slide.trigger("onReset").removeClass("fancybox-slide--"+t.contentType).addClass("fancybox-slide--error"),t.contentType="html",this.setContent(t,this.translate(t,t.opts.errorTpl)),t.pos===this.currPos&&(this.isAnimating=!1)},showLoading:function(t){var e=this;(t=t||e.current)&&!t.$spinner&&(t.$spinner=n(e.translate(e,e.opts.spinnerTpl)).appendTo(t.$slide).hide().fadeIn("fast"))},hideLoading:function(t){var e=this;(t=t||e.current)&&t.$spinner&&(t.$spinner.stop().remove(),delete t.$spinner)},afterLoad:function(t){var e=this;e.isClosing||(t.isLoading=!1,t.isLoaded=!0,e.trigger("afterLoad",t),e.hideLoading(t),!t.opts.smallBtn||t.$smallBtn&&t.$smallBtn.length||(t.$smallBtn=n(e.translate(t,t.opts.btnTpl.smallBtn)).appendTo(t.$content)),t.opts.protect&&t.$content&&!t.hasError&&(t.$content.on("contextmenu.fb",function(t){return 2==t.button&&t.preventDefault(),!0}),"image"===t.type&&n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)),e.adjustCaption(t),e.adjustLayout(t),t.pos===e.currPos&&e.updateCursor(),e.revealContent(t))},adjustCaption:function(t){var e,n=this,o=t||n.current,i=o.opts.caption,a=o.opts.preventCaptionOverlap,s=n.$refs.caption,r=!1;s.toggleClass("fancybox-caption--separate",a),a&&i&&i.length&&(o.pos!==n.currPos?(e=s.clone().appendTo(s.parent()),e.children().eq(0).empty().html(i),r=e.outerHeight(!0),e.empty().remove()):n.$caption&&(r=n.$caption.outerHeight(!0)),o.$slide.css("padding-bottom",r||""))},adjustLayout:function(t){var e,n,o,i,a=this,s=t||a.current;s.isLoaded&&!0!==s.opts.disableLayoutFix&&(s.$content.css("margin-bottom",""),s.$content.outerHeight()>s.$slide.height()+.5&&(o=s.$slide[0].style["padding-bottom"],i=s.$slide.css("padding-bottom"),parseFloat(i)>0&&(e=s.$slide[0].scrollHeight,s.$slide.css("padding-bottom",0),Math.abs(e-s.$slide[0].scrollHeight)<1&&(n=i),s.$slide.css("padding-bottom",o))),s.$content.css("margin-bottom",n))},revealContent:function(t){var e,o,i,a,s=this,r=t.$slide,c=!1,l=!1,d=s.isMoved(t),u=t.isRevealed;return t.isRevealed=!0,e=t.opts[s.firstRun?"animationEffect":"transitionEffect"],i=t.opts[s.firstRun?"animationDuration":"transitionDuration"],i=parseInt(void 0===t.forcedDuration?i:t.forcedDuration,10),!d&&t.pos===s.currPos&&i||(e=!1),"zoom"===e&&(t.pos===s.currPos&&i&&"image"===t.type&&!t.hasError&&(l=s.getThumbPos(t))?c=s.getFitPos(t):e="fade"),"zoom"===e?(s.isAnimating=!0,c.scaleX=c.width/l.width,c.scaleY=c.height/l.height,a=t.opts.zoomOpacity,"auto"==a&&(a=Math.abs(t.width/t.height-l.width/l.height)>.1),a&&(l.opacity=.1,c.opacity=1),n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"),l),p(t.$content),void n.fancybox.animate(t.$content,c,i,function(){s.isAnimating=!1,s.complete()})):(s.updateSlide(t),e?(n.fancybox.stop(r),o="fancybox-slide--"+(t.pos>=s.prevPos?"next":"previous")+" fancybox-animated fancybox-fx-"+e,r.addClass(o).removeClass("fancybox-slide--current"),t.$content.removeClass("fancybox-is-hidden"),p(r),"image"!==t.type&&t.$content.hide().show(0),void n.fancybox.animate(r,"fancybox-slide--current",i,function(){r.removeClass(o).css({transform:"",opacity:""}),t.pos===s.currPos&&s.complete()},!0)):(t.$content.removeClass("fancybox-is-hidden"),u||!d||"image"!==t.type||t.hasError||t.$content.hide().fadeIn("fast"),void(t.pos===s.currPos&&s.complete())))},getThumbPos:function(t){var e,o,i,a,s,r=!1,c=t.$thumb;return!(!c||!g(c[0]))&&(e=n.fancybox.getTranslate(c),o=parseFloat(c.css("border-top-width")||0),i=parseFloat(c.css("border-right-width")||0),a=parseFloat(c.css("border-bottom-width")||0),s=parseFloat(c.css("border-left-width")||0),r={top:e.top+o,left:e.left+s,width:e.width-i-s,height:e.height-o-a,scaleX:1,scaleY:1},e.width>0&&e.height>0&&r)},complete:function(){var t,e=this,o=e.current,i={};!e.isMoved()&&o.isLoaded&&(o.isComplete||(o.isComplete=!0,o.$slide.siblings().trigger("onReset"),e.preload("inline"),p(o.$slide),o.$slide.addClass("fancybox-slide--complete"),n.each(e.slides,function(t,o){o.pos>=e.currPos-1&&o.pos<=e.currPos+1?i[o.pos]=o:o&&(n.fancybox.stop(o.$slide),o.$slide.off().remove())}),e.slides=i),e.isAnimating=!1,e.updateCursor(),e.trigger("afterShow"),o.opts.video.autoStart&&o.$slide.find("video,audio").filter(":visible:first").trigger("play").one("ended",function(){Document.exitFullscreen?Document.exitFullscreen():this.webkitExitFullscreen&&this.webkitExitFullscreen(),e.next()}),o.opts.autoFocus&&"html"===o.contentType&&(t=o.$content.find("input[autofocus]:enabled:visible:first"),t.length?t.trigger("focus"):e.focus(null,!0)),o.$slide.scrollTop(0).scrollLeft(0))},preload:function(t){var e,n,o=this;o.group.length<2||(n=o.slides[o.currPos+1],e=o.slides[o.currPos-1],e&&e.type===t&&o.loadSlide(e),n&&n.type===t&&o.loadSlide(n))},focus:function(t,o){var i,a,s=this,r=["a[href]","area[href]",'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',"select:not([disabled]):not([aria-hidden])","textarea:not([disabled]):not([aria-hidden])","button:not([disabled]):not([aria-hidden])","iframe","object","embed","video","audio","[contenteditable]",'[tabindex]:not([tabindex^="-"])'].join(",");s.isClosing||(i=!t&&s.current&&s.current.isComplete?s.current.$slide.find("*:visible"+(o?":not(.fancybox-close-small)":"")):s.$refs.container.find("*:visible"),i=i.filter(r).filter(function(){return"hidden"!==n(this).css("visibility")&&!n(this).hasClass("disabled")}),i.length?(a=i.index(e.activeElement),t&&t.shiftKey?(a<0||0==a)&&(t.preventDefault(),i.eq(i.length-1).trigger("focus")):(a<0||a==i.length-1)&&(t&&t.preventDefault(),i.eq(0).trigger("focus"))):s.$refs.container.trigger("focus"))},activate:function(){var t=this;n(".fancybox-container").each(function(){var e=n(this).data("FancyBox");e&&e.id!==t.id&&!e.isClosing&&(e.trigger("onDeactivate"),e.removeEvents(),e.isVisible=!1)}),t.isVisible=!0,(t.current||t.isIdle)&&(t.update(),t.updateControls()),t.trigger("onActivate"),t.addEvents()},close:function(t,e){var o,i,a,s,r,c,l,u=this,f=u.current,h=function(){u.cleanUp(t)};return!u.isClosing&&(u.isClosing=!0,!1===u.trigger("beforeClose",t)?(u.isClosing=!1,d(function(){u.update()}),!1):(u.removeEvents(),a=f.$content,o=f.opts.animationEffect,i=n.isNumeric(e)?e:o?f.opts.animationDuration:0,f.$slide.removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"),!0!==t?n.fancybox.stop(f.$slide):o=!1,f.$slide.siblings().trigger("onReset").remove(),i&&u.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing").css("transition-duration",i+"ms"),u.hideLoading(f),u.hideControls(!0),u.updateCursor(),"zoom"!==o||a&&i&&"image"===f.type&&!u.isMoved()&&!f.hasError&&(l=u.getThumbPos(f))||(o="fade"),"zoom"===o?(n.fancybox.stop(a),s=n.fancybox.getTranslate(a),c={top:s.top,left:s.left,scaleX:s.width/l.width,scaleY:s.height/l.height,width:l.width,height:l.height},r=f.opts.zoomOpacity,
"auto"==r&&(r=Math.abs(f.width/f.height-l.width/l.height)>.1),r&&(l.opacity=0),n.fancybox.setTranslate(a,c),p(a),n.fancybox.animate(a,l,i,h),!0):(o&&i?n.fancybox.animate(f.$slide.addClass("fancybox-slide--previous").removeClass("fancybox-slide--current"),"fancybox-animated fancybox-fx-"+o,i,h):!0===t?setTimeout(h,i):h(),!0)))},cleanUp:function(e){var o,i,a,s=this,r=s.current.opts.$orig;s.current.$slide.trigger("onReset"),s.$refs.container.empty().remove(),s.trigger("afterClose",e),s.current.opts.backFocus&&(r&&r.length&&r.is(":visible")||(r=s.$trigger),r&&r.length&&(i=t.scrollX,a=t.scrollY,r.trigger("focus"),n("html, body").scrollTop(a).scrollLeft(i))),s.current=null,o=n.fancybox.getInstance(),o?o.activate():(n("body").removeClass("fancybox-active compensate-for-scrollbar"),n("#fancybox-style-noscroll").remove())},trigger:function(t,e){var o,i=Array.prototype.slice.call(arguments,1),a=this,s=e&&e.opts?e:a.current;if(s?i.unshift(s):s=a,i.unshift(a),n.isFunction(s.opts[t])&&(o=s.opts[t].apply(s,i)),!1===o)return o;"afterClose"!==t&&a.$refs?a.$refs.container.trigger(t+".fb",i):r.trigger(t+".fb",i)},updateControls:function(){var t=this,o=t.current,i=o.index,a=t.$refs.container,s=t.$refs.caption,r=o.opts.caption;o.$slide.trigger("refresh"),r&&r.length?(t.$caption=s,s.children().eq(0).html(r)):t.$caption=null,t.hasHiddenControls||t.isIdle||t.showControls(),a.find("[data-fancybox-count]").html(t.group.length),a.find("[data-fancybox-index]").html(i+1),a.find("[data-fancybox-prev]").prop("disabled",!o.opts.loop&&i<=0),a.find("[data-fancybox-next]").prop("disabled",!o.opts.loop&&i>=t.group.length-1),"image"===o.type?a.find("[data-fancybox-zoom]").show().end().find("[data-fancybox-download]").attr("href",o.opts.image.src||o.src).show():o.opts.toolbar&&a.find("[data-fancybox-download],[data-fancybox-zoom]").hide(),n(e.activeElement).is(":hidden,[disabled]")&&t.$refs.container.trigger("focus")},hideControls:function(t){var e=this,n=["infobar","toolbar","nav"];!t&&e.current.opts.preventCaptionOverlap||n.push("caption"),this.$refs.container.removeClass(n.map(function(t){return"fancybox-show-"+t}).join(" ")),this.hasHiddenControls=!0},showControls:function(){var t=this,e=t.current?t.current.opts:t.opts,n=t.$refs.container;t.hasHiddenControls=!1,t.idleSecondsCounter=0,n.toggleClass("fancybox-show-toolbar",!(!e.toolbar||!e.buttons)).toggleClass("fancybox-show-infobar",!!(e.infobar&&t.group.length>1)).toggleClass("fancybox-show-caption",!!t.$caption).toggleClass("fancybox-show-nav",!!(e.arrows&&t.group.length>1)).toggleClass("fancybox-is-modal",!!e.modal)},toggleControls:function(){this.hasHiddenControls?this.showControls():this.hideControls()}}),n.fancybox={version:"3.5.7",defaults:a,getInstance:function(t){var e=n('.fancybox-container:not(".fancybox-is-closing"):last').data("FancyBox"),o=Array.prototype.slice.call(arguments,1);return e instanceof b&&("string"===n.type(t)?e[t].apply(e,o):"function"===n.type(t)&&t.apply(e,o),e)},open:function(t,e,n){return new b(t,e,n)},close:function(t){var e=this.getInstance();e&&(e.close(),!0===t&&this.close(t))},destroy:function(){this.close(!0),r.add("body").off("click.fb-start","**")},isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),use3d:function(){var n=e.createElement("div");return t.getComputedStyle&&t.getComputedStyle(n)&&t.getComputedStyle(n).getPropertyValue("transform")&&!(e.documentMode&&e.documentMode<11)}(),getTranslate:function(t){var e;return!(!t||!t.length)&&(e=t[0].getBoundingClientRect(),{top:e.top||0,left:e.left||0,width:e.width,height:e.height,opacity:parseFloat(t.css("opacity"))})},setTranslate:function(t,e){var n="",o={};if(t&&e)return void 0===e.left&&void 0===e.top||(n=(void 0===e.left?t.position().left:e.left)+"px, "+(void 0===e.top?t.position().top:e.top)+"px",n=this.use3d?"translate3d("+n+", 0px)":"translate("+n+")"),void 0!==e.scaleX&&void 0!==e.scaleY?n+=" scale("+e.scaleX+", "+e.scaleY+")":void 0!==e.scaleX&&(n+=" scaleX("+e.scaleX+")"),n.length&&(o.transform=n),void 0!==e.opacity&&(o.opacity=e.opacity),void 0!==e.width&&(o.width=e.width),void 0!==e.height&&(o.height=e.height),t.css(o)},animate:function(t,e,o,i,a){var s,r=this;n.isFunction(o)&&(i=o,o=null),r.stop(t),s=r.getTranslate(t),t.on(f,function(c){(!c||!c.originalEvent||t.is(c.originalEvent.target)&&"z-index"!=c.originalEvent.propertyName)&&(r.stop(t),n.isNumeric(o)&&t.css("transition-duration",""),n.isPlainObject(e)?void 0!==e.scaleX&&void 0!==e.scaleY&&r.setTranslate(t,{top:e.top,left:e.left,width:s.width*e.scaleX,height:s.height*e.scaleY,scaleX:1,scaleY:1}):!0!==a&&t.removeClass(e),n.isFunction(i)&&i(c))}),n.isNumeric(o)&&t.css("transition-duration",o+"ms"),n.isPlainObject(e)?(void 0!==e.scaleX&&void 0!==e.scaleY&&(delete e.width,delete e.height,t.parent().hasClass("fancybox-slide--image")&&t.parent().addClass("fancybox-is-scaling")),n.fancybox.setTranslate(t,e)):t.addClass(e),t.data("timer",setTimeout(function(){t.trigger(f)},o+33))},stop:function(t,e){t&&t.length&&(clearTimeout(t.data("timer")),e&&t.trigger(f),t.off(f).css("transition-duration",""),t.parent().removeClass("fancybox-is-scaling"))}},n.fn.fancybox=function(t){var e;return t=t||{},e=t.selector||!1,e?n("body").off("click.fb-start",e).on("click.fb-start",e,{options:t},i):this.off("click.fb-start").on("click.fb-start",{items:this,options:t},i),this},r.on("click.fb-start","[data-fancybox]",i),r.on("click.fb-start","[data-fancybox-trigger]",function(t){n('[data-fancybox="'+n(this).attr("data-fancybox-trigger")+'"]').eq(n(this).attr("data-fancybox-index")||0).trigger("click.fb-start",{$trigger:n(this)})}),function(){var t=null;r.on("mousedown mouseup focus blur",".fancybox-button",function(e){switch(e.type){case"mousedown":t=n(this);break;case"mouseup":t=null;break;case"focusin":n(".fancybox-button").removeClass("fancybox-focus"),n(this).is(t)||n(this).is("[disabled]")||n(this).addClass("fancybox-focus");break;case"focusout":n(".fancybox-button").removeClass("fancybox-focus")}})}()}}(window,document,jQuery),function(t){"use strict";var e={youtube:{matcher:/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,params:{autoplay:1,autohide:1,fs:1,rel:0,hd:1,wmode:"transparent",enablejsapi:1,html5:1},paramPlace:8,type:"iframe",url:"https://www.youtube-nocookie.com/embed/$4",thumb:"https://img.youtube.com/vi/$4/hqdefault.jpg"},vimeo:{matcher:/^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/,params:{autoplay:1,hd:1,show_title:1,show_byline:1,show_portrait:0,fullscreen:1},paramPlace:3,type:"iframe",url:"//player.vimeo.com/video/$2"},instagram:{matcher:/(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,type:"image",url:"//$1/p/$2/media/?size=l"},gmap_place:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/?ll="+(t[9]?t[9]+"&z="+Math.floor(t[10])+(t[12]?t[12].replace(/^\//,"&"):""):t[12]+"").replace(/\?/,"&")+"&output="+(t[12]&&t[12].indexOf("layer=c")>0?"svembed":"embed")}},gmap_search:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/maps?q="+t[5].replace("query=","q=").replace("api=1","")+"&output=embed"}}},n=function(e,n,o){if(e)return o=o||"","object"===t.type(o)&&(o=t.param(o,!0)),t.each(n,function(t,n){e=e.replace("$"+t,n||"")}),o.length&&(e+=(e.indexOf("?")>0?"&":"?")+o),e};t(document).on("objectNeedsType.fb",function(o,i,a){var s,r,c,l,d,u,f,p=a.src||"",h=!1;s=t.extend(!0,{},e,a.opts.media),t.each(s,function(e,o){if(c=p.match(o.matcher)){if(h=o.type,f=e,u={},o.paramPlace&&c[o.paramPlace]){d=c[o.paramPlace],"?"==d[0]&&(d=d.substring(1)),d=d.split("&");for(var i=0;i<d.length;++i){var s=d[i].split("=",2);2==s.length&&(u[s[0]]=decodeURIComponent(s[1].replace(/\+/g," ")))}}return l=t.extend(!0,{},o.params,a.opts[e],u),p="function"===t.type(o.url)?o.url.call(this,c,l,a):n(o.url,c,l),r="function"===t.type(o.thumb)?o.thumb.call(this,c,l,a):n(o.thumb,c),"youtube"===e?p=p.replace(/&t=((\d+)m)?(\d+)s/,function(t,e,n,o){return"&start="+((n?60*parseInt(n,10):0)+parseInt(o,10))}):"vimeo"===e&&(p=p.replace("&%23","#")),!1}}),h?(a.opts.thumb||a.opts.$thumb&&a.opts.$thumb.length||(a.opts.thumb=r),"iframe"===h&&(a.opts=t.extend(!0,a.opts,{iframe:{preload:!1,attr:{scrolling:"no"}}})),t.extend(a,{type:h,src:p,origSrc:a.src,contentSource:f,contentType:"image"===h?"image":"gmap_place"==f||"gmap_search"==f?"map":"video"})):p&&(a.type=a.opts.defaultType)});var o={youtube:{src:"https://www.youtube.com/iframe_api",class:"YT",loading:!1,loaded:!1},vimeo:{src:"https://player.vimeo.com/api/player.js",class:"Vimeo",loading:!1,loaded:!1},load:function(t){var e,n=this;if(this[t].loaded)return void setTimeout(function(){n.done(t)});this[t].loading||(this[t].loading=!0,e=document.createElement("script"),e.type="text/javascript",e.src=this[t].src,"youtube"===t?window.onYouTubeIframeAPIReady=function(){n[t].loaded=!0,n.done(t)}:e.onload=function(){n[t].loaded=!0,n.done(t)},document.body.appendChild(e))},done:function(e){var n,o,i;"youtube"===e&&delete window.onYouTubeIframeAPIReady,(n=t.fancybox.getInstance())&&(o=n.current.$content.find("iframe"),"youtube"===e&&void 0!==YT&&YT?i=new YT.Player(o.attr("id"),{events:{onStateChange:function(t){0==t.data&&n.next()}}}):"vimeo"===e&&void 0!==Vimeo&&Vimeo&&(i=new Vimeo.Player(o),i.on("ended",function(){n.next()})))}};t(document).on({"afterShow.fb":function(t,e,n){e.group.length>1&&("youtube"===n.contentSource||"vimeo"===n.contentSource)&&o.load(n.contentSource)}})}(jQuery),function(t,e,n){"use strict";var o=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),i=function(){return t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame||t.oCancelAnimationFrame||function(e){t.clearTimeout(e)}}(),a=function(e){var n=[];e=e.originalEvent||e||t.e,e=e.touches&&e.touches.length?e.touches:e.changedTouches&&e.changedTouches.length?e.changedTouches:[e];for(var o in e)e[o].pageX?n.push({x:e[o].pageX,y:e[o].pageY}):e[o].clientX&&n.push({x:e[o].clientX,y:e[o].clientY});return n},s=function(t,e,n){return e&&t?"x"===n?t.x-e.x:"y"===n?t.y-e.y:Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)):0},r=function(t){if(t.is('a,area,button,[role="button"],input,label,select,summary,textarea,video,audio,iframe')||n.isFunction(t.get(0).onclick)||t.data("selectable"))return!0;for(var e=0,o=t[0].attributes,i=o.length;e<i;e++)if("data-fancybox-"===o[e].nodeName.substr(0,14))return!0;return!1},c=function(e){var n=t.getComputedStyle(e)["overflow-y"],o=t.getComputedStyle(e)["overflow-x"],i=("scroll"===n||"auto"===n)&&e.scrollHeight>e.clientHeight,a=("scroll"===o||"auto"===o)&&e.scrollWidth>e.clientWidth;return i||a},l=function(t){for(var e=!1;;){if(e=c(t.get(0)))break;if(t=t.parent(),!t.length||t.hasClass("fancybox-stage")||t.is("body"))break}return e},d=function(t){var e=this;e.instance=t,e.$bg=t.$refs.bg,e.$stage=t.$refs.stage,e.$container=t.$refs.container,e.destroy(),e.$container.on("touchstart.fb.touch mousedown.fb.touch",n.proxy(e,"ontouchstart"))};d.prototype.destroy=function(){var t=this;t.$container.off(".fb.touch"),n(e).off(".fb.touch"),t.requestId&&(i(t.requestId),t.requestId=null),t.tapped&&(clearTimeout(t.tapped),t.tapped=null)},d.prototype.ontouchstart=function(o){var i=this,c=n(o.target),d=i.instance,u=d.current,f=u.$slide,p=u.$content,h="touchstart"==o.type;if(h&&i.$container.off("mousedown.fb.touch"),(!o.originalEvent||2!=o.originalEvent.button)&&f.length&&c.length&&!r(c)&&!r(c.parent())&&(c.is("img")||!(o.originalEvent.clientX>c[0].clientWidth+c.offset().left))){if(!u||d.isAnimating||u.$slide.hasClass("fancybox-animated"))return o.stopPropagation(),void o.preventDefault();i.realPoints=i.startPoints=a(o),i.startPoints.length&&(u.touch&&o.stopPropagation(),i.startEvent=o,i.canTap=!0,i.$target=c,i.$content=p,i.opts=u.opts.touch,i.isPanning=!1,i.isSwiping=!1,i.isZooming=!1,i.isScrolling=!1,i.canPan=d.canPan(),i.startTime=(new Date).getTime(),i.distanceX=i.distanceY=i.distance=0,i.canvasWidth=Math.round(f[0].clientWidth),i.canvasHeight=Math.round(f[0].clientHeight),i.contentLastPos=null,i.contentStartPos=n.fancybox.getTranslate(i.$content)||{top:0,left:0},i.sliderStartPos=n.fancybox.getTranslate(f),i.stagePos=n.fancybox.getTranslate(d.$refs.stage),i.sliderStartPos.top-=i.stagePos.top,i.sliderStartPos.left-=i.stagePos.left,i.contentStartPos.top-=i.stagePos.top,i.contentStartPos.left-=i.stagePos.left,n(e).off(".fb.touch").on(h?"touchend.fb.touch touchcancel.fb.touch":"mouseup.fb.touch mouseleave.fb.touch",n.proxy(i,"ontouchend")).on(h?"touchmove.fb.touch":"mousemove.fb.touch",n.proxy(i,"ontouchmove")),n.fancybox.isMobile&&e.addEventListener("scroll",i.onscroll,!0),((i.opts||i.canPan)&&(c.is(i.$stage)||i.$stage.find(c).length)||(c.is(".fancybox-image")&&o.preventDefault(),n.fancybox.isMobile&&c.parents(".fancybox-caption").length))&&(i.isScrollable=l(c)||l(c.parent()),n.fancybox.isMobile&&i.isScrollable||o.preventDefault(),(1===i.startPoints.length||u.hasError)&&(i.canPan?(n.fancybox.stop(i.$content),i.isPanning=!0):i.isSwiping=!0,i.$container.addClass("fancybox-is-grabbing")),2===i.startPoints.length&&"image"===u.type&&(u.isLoaded||u.$ghost)&&(i.canTap=!1,i.isSwiping=!1,i.isPanning=!1,i.isZooming=!0,n.fancybox.stop(i.$content),i.centerPointStartX=.5*(i.startPoints[0].x+i.startPoints[1].x)-n(t).scrollLeft(),i.centerPointStartY=.5*(i.startPoints[0].y+i.startPoints[1].y)-n(t).scrollTop(),i.percentageOfImageAtPinchPointX=(i.centerPointStartX-i.contentStartPos.left)/i.contentStartPos.width,i.percentageOfImageAtPinchPointY=(i.centerPointStartY-i.contentStartPos.top)/i.contentStartPos.height,i.startDistanceBetweenFingers=s(i.startPoints[0],i.startPoints[1]))))}},d.prototype.onscroll=function(t){var n=this;n.isScrolling=!0,e.removeEventListener("scroll",n.onscroll,!0)},d.prototype.ontouchmove=function(t){var e=this;return void 0!==t.originalEvent.buttons&&0===t.originalEvent.buttons?void e.ontouchend(t):e.isScrolling?void(e.canTap=!1):(e.newPoints=a(t),void((e.opts||e.canPan)&&e.newPoints.length&&e.newPoints.length&&(e.isSwiping&&!0===e.isSwiping||t.preventDefault(),e.distanceX=s(e.newPoints[0],e.startPoints[0],"x"),e.distanceY=s(e.newPoints[0],e.startPoints[0],"y"),e.distance=s(e.newPoints[0],e.startPoints[0]),e.distance>0&&(e.isSwiping?e.onSwipe(t):e.isPanning?e.onPan():e.isZooming&&e.onZoom()))))},d.prototype.onSwipe=function(e){var a,s=this,r=s.instance,c=s.isSwiping,l=s.sliderStartPos.left||0;if(!0!==c)"x"==c&&(s.distanceX>0&&(s.instance.group.length<2||0===s.instance.current.index&&!s.instance.current.opts.loop)?l+=Math.pow(s.distanceX,.8):s.distanceX<0&&(s.instance.group.length<2||s.instance.current.index===s.instance.group.length-1&&!s.instance.current.opts.loop)?l-=Math.pow(-s.distanceX,.8):l+=s.distanceX),s.sliderLastPos={top:"x"==c?0:s.sliderStartPos.top+s.distanceY,left:l},s.requestId&&(i(s.requestId),s.requestId=null),s.requestId=o(function(){s.sliderLastPos&&(n.each(s.instance.slides,function(t,e){var o=e.pos-s.instance.currPos;n.fancybox.setTranslate(e.$slide,{top:s.sliderLastPos.top,left:s.sliderLastPos.left+o*s.canvasWidth+o*e.opts.gutter})}),s.$container.addClass("fancybox-is-sliding"))});else if(Math.abs(s.distance)>10){if(s.canTap=!1,r.group.length<2&&s.opts.vertical?s.isSwiping="y":r.isDragging||!1===s.opts.vertical||"auto"===s.opts.vertical&&n(t).width()>800?s.isSwiping="x":(a=Math.abs(180*Math.atan2(s.distanceY,s.distanceX)/Math.PI),s.isSwiping=a>45&&a<135?"y":"x"),"y"===s.isSwiping&&n.fancybox.isMobile&&s.isScrollable)return void(s.isScrolling=!0);r.isDragging=s.isSwiping,s.startPoints=s.newPoints,n.each(r.slides,function(t,e){var o,i;n.fancybox.stop(e.$slide),o=n.fancybox.getTranslate(e.$slide),i=n.fancybox.getTranslate(r.$refs.stage),e.$slide.css({transform:"",opacity:"","transition-duration":""}).removeClass("fancybox-animated").removeClass(function(t,e){return(e.match(/(^|\s)fancybox-fx-\S+/g)||[]).join(" ")}),e.pos===r.current.pos&&(s.sliderStartPos.top=o.top-i.top,s.sliderStartPos.left=o.left-i.left),n.fancybox.setTranslate(e.$slide,{top:o.top-i.top,left:o.left-i.left})}),r.SlideShow&&r.SlideShow.isActive&&r.SlideShow.stop()}},d.prototype.onPan=function(){var t=this;if(s(t.newPoints[0],t.realPoints[0])<(n.fancybox.isMobile?10:5))return void(t.startPoints=t.newPoints);t.canTap=!1,t.contentLastPos=t.limitMovement(),t.requestId&&i(t.requestId),t.requestId=o(function(){n.fancybox.setTranslate(t.$content,t.contentLastPos)})},d.prototype.limitMovement=function(){var t,e,n,o,i,a,s=this,r=s.canvasWidth,c=s.canvasHeight,l=s.distanceX,d=s.distanceY,u=s.contentStartPos,f=u.left,p=u.top,h=u.width,g=u.height;return i=h>r?f+l:f,a=p+d,t=Math.max(0,.5*r-.5*h),e=Math.max(0,.5*c-.5*g),n=Math.min(r-h,.5*r-.5*h),o=Math.min(c-g,.5*c-.5*g),l>0&&i>t&&(i=t-1+Math.pow(-t+f+l,.8)||0),l<0&&i<n&&(i=n+1-Math.pow(n-f-l,.8)||0),d>0&&a>e&&(a=e-1+Math.pow(-e+p+d,.8)||0),d<0&&a<o&&(a=o+1-Math.pow(o-p-d,.8)||0),{top:a,left:i}},d.prototype.limitPosition=function(t,e,n,o){var i=this,a=i.canvasWidth,s=i.canvasHeight;return n>a?(t=t>0?0:t,t=t<a-n?a-n:t):t=Math.max(0,a/2-n/2),o>s?(e=e>0?0:e,e=e<s-o?s-o:e):e=Math.max(0,s/2-o/2),{top:e,left:t}},d.prototype.onZoom=function(){var e=this,a=e.contentStartPos,r=a.width,c=a.height,l=a.left,d=a.top,u=s(e.newPoints[0],e.newPoints[1]),f=u/e.startDistanceBetweenFingers,p=Math.floor(r*f),h=Math.floor(c*f),g=(r-p)*e.percentageOfImageAtPinchPointX,b=(c-h)*e.percentageOfImageAtPinchPointY,m=(e.newPoints[0].x+e.newPoints[1].x)/2-n(t).scrollLeft(),v=(e.newPoints[0].y+e.newPoints[1].y)/2-n(t).scrollTop(),y=m-e.centerPointStartX,x=v-e.centerPointStartY,w=l+(g+y),$=d+(b+x),S={top:$,left:w,scaleX:f,scaleY:f};e.canTap=!1,e.newWidth=p,e.newHeight=h,e.contentLastPos=S,e.requestId&&i(e.requestId),e.requestId=o(function(){n.fancybox.setTranslate(e.$content,e.contentLastPos)})},d.prototype.ontouchend=function(t){var o=this,s=o.isSwiping,r=o.isPanning,c=o.isZooming,l=o.isScrolling;if(o.endPoints=a(t),o.dMs=Math.max((new Date).getTime()-o.startTime,1),o.$container.removeClass("fancybox-is-grabbing"),n(e).off(".fb.touch"),e.removeEventListener("scroll",o.onscroll,!0),o.requestId&&(i(o.requestId),o.requestId=null),o.isSwiping=!1,o.isPanning=!1,o.isZooming=!1,o.isScrolling=!1,o.instance.isDragging=!1,o.canTap)return o.onTap(t);o.speed=100,o.velocityX=o.distanceX/o.dMs*.5,o.velocityY=o.distanceY/o.dMs*.5,r?o.endPanning():c?o.endZooming():o.endSwiping(s,l)},d.prototype.endSwiping=function(t,e){var o=this,i=!1,a=o.instance.group.length,s=Math.abs(o.distanceX),r="x"==t&&a>1&&(o.dMs>130&&s>10||s>50);o.sliderLastPos=null,"y"==t&&!e&&Math.abs(o.distanceY)>50?(n.fancybox.animate(o.instance.current.$slide,{top:o.sliderStartPos.top+o.distanceY+150*o.velocityY,opacity:0},200),i=o.instance.close(!0,250)):r&&o.distanceX>0?i=o.instance.previous(300):r&&o.distanceX<0&&(i=o.instance.next(300)),!1!==i||"x"!=t&&"y"!=t||o.instance.centerSlide(200),o.$container.removeClass("fancybox-is-sliding")},d.prototype.endPanning=function(){var t,e,o,i=this;i.contentLastPos&&(!1===i.opts.momentum||i.dMs>350?(t=i.contentLastPos.left,e=i.contentLastPos.top):(t=i.contentLastPos.left+500*i.velocityX,e=i.contentLastPos.top+500*i.velocityY),o=i.limitPosition(t,e,i.contentStartPos.width,i.contentStartPos.height),o.width=i.contentStartPos.width,o.height=i.contentStartPos.height,n.fancybox.animate(i.$content,o,366))},d.prototype.endZooming=function(){var t,e,o,i,a=this,s=a.instance.current,r=a.newWidth,c=a.newHeight;a.contentLastPos&&(t=a.contentLastPos.left,e=a.contentLastPos.top,i={top:e,left:t,width:r,height:c,scaleX:1,scaleY:1},n.fancybox.setTranslate(a.$content,i),r<a.canvasWidth&&c<a.canvasHeight?a.instance.scaleToFit(150):r>s.width||c>s.height?a.instance.scaleToActual(a.centerPointStartX,a.centerPointStartY,150):(o=a.limitPosition(t,e,r,c),n.fancybox.animate(a.$content,o,150)))},d.prototype.onTap=function(e){var o,i=this,s=n(e.target),r=i.instance,c=r.current,l=e&&a(e)||i.startPoints,d=l[0]?l[0].x-n(t).scrollLeft()-i.stagePos.left:0,u=l[0]?l[0].y-n(t).scrollTop()-i.stagePos.top:0,f=function(t){var o=c.opts[t];if(n.isFunction(o)&&(o=o.apply(r,[c,e])),o)switch(o){case"close":r.close(i.startEvent);break;case"toggleControls":r.toggleControls();break;case"next":r.next();break;case"nextOrClose":r.group.length>1?r.next():r.close(i.startEvent);break;case"zoom":"image"==c.type&&(c.isLoaded||c.$ghost)&&(r.canPan()?r.scaleToFit():r.isScaledDown()?r.scaleToActual(d,u):r.group.length<2&&r.close(i.startEvent))}};if((!e.originalEvent||2!=e.originalEvent.button)&&(s.is("img")||!(d>s[0].clientWidth+s.offset().left))){if(s.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container"))o="Outside";else if(s.is(".fancybox-slide"))o="Slide";else{if(!r.current.$content||!r.current.$content.find(s).addBack().filter(s).length)return;o="Content"}if(i.tapped){if(clearTimeout(i.tapped),i.tapped=null,Math.abs(d-i.tapX)>50||Math.abs(u-i.tapY)>50)return this;f("dblclick"+o)}else i.tapX=d,i.tapY=u,c.opts["dblclick"+o]&&c.opts["dblclick"+o]!==c.opts["click"+o]?i.tapped=setTimeout(function(){i.tapped=null,r.isAnimating||f("click"+o)},500):f("click"+o);return this}},n(e).on("onActivate.fb",function(t,e){e&&!e.Guestures&&(e.Guestures=new d(e))}).on("beforeClose.fb",function(t,e){e&&e.Guestures&&e.Guestures.destroy()})}(window,document,jQuery),function(t,e){"use strict";e.extend(!0,e.fancybox.defaults,{btnTpl:{slideShow:'<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.5 5.4v13.2l11-6.6z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.33 5.75h2.2v12.5h-2.2V5.75zm5.15 0h2.2v12.5h-2.2V5.75z"/></svg></button>'},slideShow:{autoStart:!1,speed:3e3,progress:!0}});var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{timer:null,isActive:!1,$button:null,init:function(){var t=this,n=t.instance,o=n.group[n.currIndex].opts.slideShow;t.$button=n.$refs.toolbar.find("[data-fancybox-play]").on("click",function(){t.toggle()}),n.group.length<2||!o?t.$button.hide():o.progress&&(t.$progress=e('<div class="fancybox-progress"></div>').appendTo(n.$refs.inner))},set:function(t){var n=this,o=n.instance,i=o.current;i&&(!0===t||i.opts.loop||o.currIndex<o.group.length-1)?n.isActive&&"video"!==i.contentType&&(n.$progress&&e.fancybox.animate(n.$progress.show(),{scaleX:1},i.opts.slideShow.speed),n.timer=setTimeout(function(){o.current.opts.loop||o.current.index!=o.group.length-1?o.next():o.jumpTo(0)},i.opts.slideShow.speed)):(n.stop(),o.idleSecondsCounter=0,o.showControls())},clear:function(){var t=this;clearTimeout(t.timer),t.timer=null,t.$progress&&t.$progress.removeAttr("style").hide()},start:function(){var t=this,e=t.instance.current;e&&(t.$button.attr("title",(e.opts.i18n[e.opts.lang]||e.opts.i18n.en).PLAY_STOP).removeClass("fancybox-button--play").addClass("fancybox-button--pause"),t.isActive=!0,e.isComplete&&t.set(!0),t.instance.trigger("onSlideShowChange",!0))},stop:function(){var t=this,e=t.instance.current;t.clear(),t.$button.attr("title",(e.opts.i18n[e.opts.lang]||e.opts.i18n.en).PLAY_START).removeClass("fancybox-button--pause").addClass("fancybox-button--play"),t.isActive=!1,t.instance.trigger("onSlideShowChange",!1),t.$progress&&t.$progress.removeAttr("style").hide()},toggle:function(){var t=this;t.isActive?t.stop():t.start()}}),e(t).on({"onInit.fb":function(t,e){e&&!e.SlideShow&&(e.SlideShow=new n(e))},"beforeShow.fb":function(t,e,n,o){var i=e&&e.SlideShow;o?i&&n.opts.slideShow.autoStart&&i.start():i&&i.isActive&&i.clear()},"afterShow.fb":function(t,e,n){var o=e&&e.SlideShow;o&&o.isActive&&o.set()},"afterKeydown.fb":function(n,o,i,a,s){var r=o&&o.SlideShow;!r||!i.opts.slideShow||80!==s&&32!==s||e(t.activeElement).is("button,a,input")||(a.preventDefault(),r.toggle())},"beforeClose.fb onDeactivate.fb":function(t,e){var n=e&&e.SlideShow;n&&n.stop()}}),e(t).on("visibilitychange",function(){var n=e.fancybox.getInstance(),o=n&&n.SlideShow;o&&o.isActive&&(t.hidden?o.clear():o.set())})}(document,jQuery),function(t,e){"use strict";var n=function(){for(var e=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],n={},o=0;o<e.length;o++){var i=e[o];if(i&&i[1]in t){for(var a=0;a<i.length;a++)n[e[0][a]]=i[a];return n}}return!1}();if(n){var o={request:function(e){e=e||t.documentElement,e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT)},exit:function(){t[n.exitFullscreen]()},toggle:function(e){e=e||t.documentElement,this.isFullscreen()?this.exit():this.request(e)},isFullscreen:function(){return Boolean(t[n.fullscreenElement])},enabled:function(){return Boolean(t[n.fullscreenEnabled])}};e.extend(!0,e.fancybox.defaults,{btnTpl:{fullScreen:'<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fsenter" title="{{FULL_SCREEN}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg></button>'},fullScreen:{autoStart:!1}}),e(t).on(n.fullscreenchange,function(){var t=o.isFullscreen(),n=e.fancybox.getInstance();n&&(n.current&&"image"===n.current.type&&n.isAnimating&&(n.isAnimating=!1,n.update(!0,!0,0),n.isComplete||n.complete()),n.trigger("onFullscreenChange",t),n.$refs.container.toggleClass("fancybox-is-fullscreen",t),n.$refs.toolbar.find("[data-fancybox-fullscreen]").toggleClass("fancybox-button--fsenter",!t).toggleClass("fancybox-button--fsexit",t))})}e(t).on({"onInit.fb":function(t,e){var i;if(!n)return void e.$refs.toolbar.find("[data-fancybox-fullscreen]").remove();e&&e.group[e.currIndex].opts.fullScreen?(i=e.$refs.container,i.on("click.fb-fullscreen","[data-fancybox-fullscreen]",function(t){t.stopPropagation(),t.preventDefault(),o.toggle()}),e.opts.fullScreen&&!0===e.opts.fullScreen.autoStart&&o.request(),e.FullScreen=o):e&&e.$refs.toolbar.find("[data-fancybox-fullscreen]").hide()},"afterKeydown.fb":function(t,e,n,o,i){e&&e.FullScreen&&70===i&&(o.preventDefault(),e.FullScreen.toggle())},"beforeClose.fb":function(t,e){e&&e.FullScreen&&e.$refs.container.hasClass("fancybox-is-fullscreen")&&o.exit()}})}(document,jQuery),function(t,e){"use strict";var n="fancybox-thumbs";e.fancybox.defaults=e.extend(!0,{btnTpl:{thumbs:'<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.59 14.59h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76H5.65V5.65z"/></svg></button>'},thumbs:{autoStart:!1,hideOnClose:!0,parentEl:".fancybox-container",axis:"y"}},e.fancybox.defaults);var o=function(t){this.init(t)};e.extend(o.prototype,{$button:null,$grid:null,$list:null,isVisible:!1,isActive:!1,init:function(t){var e=this,n=t.group,o=0;e.instance=t,e.opts=n[t.currIndex].opts.thumbs,t.Thumbs=e,e.$button=t.$refs.toolbar.find("[data-fancybox-thumbs]");for(var i=0,a=n.length;i<a&&(n[i].thumb&&o++,!(o>1));i++);o>1&&e.opts?(e.$button.removeAttr("style").on("click",function(){e.toggle()}),e.isActive=!0):e.$button.hide()},create:function(){var t,o=this,i=o.instance,a=o.opts.parentEl,s=[];o.$grid||(o.$grid=e('<div class="'+n+" "+n+"-"+o.opts.axis+'"></div>').appendTo(i.$refs.container.find(a).addBack().filter(a)),o.$grid.on("click","a",function(){i.jumpTo(e(this).attr("data-index"))})),o.$list||(o.$list=e('<div class="'+n+'__list">').appendTo(o.$grid)),e.each(i.group,function(e,n){t=n.thumb,t||"image"!==n.type||(t=n.src),s.push('<a href="javascript:;" tabindex="0" data-index="'+e+'"'+(t&&t.length?' style="background-image:url('+t+')"':'class="fancybox-thumbs-missing"')+"></a>")}),o.$list[0].innerHTML=s.join(""),"x"===o.opts.axis&&o.$list.width(parseInt(o.$grid.css("padding-right"),10)+i.group.length*o.$list.children().eq(0).outerWidth(!0))},focus:function(t){var e,n,o=this,i=o.$list,a=o.$grid;o.instance.current&&(e=i.children().removeClass("fancybox-thumbs-active").filter('[data-index="'+o.instance.current.index+'"]').addClass("fancybox-thumbs-active"),n=e.position(),"y"===o.opts.axis&&(n.top<0||n.top>i.height()-e.outerHeight())?i.stop().animate({scrollTop:i.scrollTop()+n.top},t):"x"===o.opts.axis&&(n.left<a.scrollLeft()||n.left>a.scrollLeft()+(a.width()-e.outerWidth()))&&i.parent().stop().animate({scrollLeft:n.left},t))},update:function(){var t=this;t.instance.$refs.container.toggleClass("fancybox-show-thumbs",this.isVisible),t.isVisible?(t.$grid||t.create(),t.instance.trigger("onThumbsShow"),t.focus(0)):t.$grid&&t.instance.trigger("onThumbsHide"),t.instance.update()},hide:function(){this.isVisible=!1,this.update()},show:function(){this.isVisible=!0,this.update()},toggle:function(){this.isVisible=!this.isVisible,this.update()}}),e(t).on({"onInit.fb":function(t,e){var n;e&&!e.Thumbs&&(n=new o(e),n.isActive&&!0===n.opts.autoStart&&n.show())},"beforeShow.fb":function(t,e,n,o){var i=e&&e.Thumbs;i&&i.isVisible&&i.focus(o?0:250)},"afterKeydown.fb":function(t,e,n,o,i){var a=e&&e.Thumbs;a&&a.isActive&&71===i&&(o.preventDefault(),a.toggle())},"beforeClose.fb":function(t,e){var n=e&&e.Thumbs;n&&n.isVisible&&!1!==n.opts.hideOnClose&&n.$grid.hide()}})}(document,jQuery),function(t,e){"use strict";function n(t){var e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};return String(t).replace(/[&<>"'`=\/]/g,function(t){return e[t]})}e.extend(!0,e.fancybox.defaults,{btnTpl:{share:'<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.55 19c1.4-8.4 9.1-9.8 11.9-9.8V5l7 7-7 6.3v-3.5c-2.8 0-10.5 2.1-11.9 4.2z"/></svg></button>'},share:{url:function(t,e){return!t.currentHash&&"inline"!==e.type&&"html"!==e.type&&(e.origSrc||e.src)||window.location},
tpl:'<div class="fancybox-share"><h1>{{SHARE}}</h1><p><a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m287 456v-299c0-21 6-35 35-35h38v-63c-7-1-29-3-55-3-54 0-91 33-91 94v306m143-254h-205v72h196" /></svg><span>Facebook</span></a><a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}&text={{descr}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m456 133c-14 7-31 11-47 13 17-10 30-27 37-46-15 10-34 16-52 20-61-62-157-7-141 75-68-3-129-35-169-85-22 37-11 86 26 109-13 0-26-4-37-9 0 39 28 72 65 80-12 3-25 4-37 2 10 33 41 57 77 57-42 30-77 38-122 34 170 111 378-32 359-208 16-11 30-25 41-42z" /></svg><span>Twitter</span></a><a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}&description={{descr}}&media={{media}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m265 56c-109 0-164 78-164 144 0 39 15 74 47 87 5 2 10 0 12-5l4-19c2-6 1-8-3-13-9-11-15-25-15-45 0-58 43-110 113-110 62 0 96 38 96 88 0 67-30 122-73 122-24 0-42-19-36-44 6-29 20-60 20-81 0-19-10-35-31-35-25 0-44 26-44 60 0 21 7 36 7 36l-30 125c-8 37-1 83 0 87 0 3 4 4 5 2 2-3 32-39 42-75l16-64c8 16 31 29 56 29 74 0 124-67 124-157 0-69-58-132-146-132z" fill="#fff"/></svg><span>Pinterest</span></a></p><p><input class="fancybox-share__input" type="text" value="{{url_raw}}" onclick="select()" /></p></div>'}}),e(t).on("click","[data-fancybox-share]",function(){var t,o,i=e.fancybox.getInstance(),a=i.current||null;a&&("function"===e.type(a.opts.share.url)&&(t=a.opts.share.url.apply(a,[i,a])),o=a.opts.share.tpl.replace(/\{\{media\}\}/g,"image"===a.type?encodeURIComponent(a.src):"").replace(/\{\{url\}\}/g,encodeURIComponent(t)).replace(/\{\{url_raw\}\}/g,n(t)).replace(/\{\{descr\}\}/g,i.$caption?encodeURIComponent(i.$caption.text()):""),e.fancybox.open({src:i.translate(i,o),type:"html",opts:{touch:!1,animationEffect:!1,afterLoad:function(t,e){i.$refs.container.one("beforeClose.fb",function(){t.close(null,0)}),e.$content.find(".fancybox-share__button").click(function(){return window.open(this.href,"Share","width=550, height=450"),!1})},mobile:{autoFocus:!1}}}))})}(document,jQuery),function(t,e,n){"use strict";function o(){var e=t.location.hash.substr(1),n=e.split("-"),o=n.length>1&&/^\+?\d+$/.test(n[n.length-1])?parseInt(n.pop(-1),10)||1:1,i=n.join("-");return{hash:e,index:o<1?1:o,gallery:i}}function i(t){""!==t.gallery&&n("[data-fancybox='"+n.escapeSelector(t.gallery)+"']").eq(t.index-1).focus().trigger("click.fb-start")}function a(t){var e,n;return!!t&&(e=t.current?t.current.opts:t.opts,""!==(n=e.hash||(e.$orig?e.$orig.data("fancybox")||e.$orig.data("fancybox-trigger"):""))&&n)}n.escapeSelector||(n.escapeSelector=function(t){return(t+"").replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,function(t,e){return e?"\0"===t?"�":t.slice(0,-1)+"\\"+t.charCodeAt(t.length-1).toString(16)+" ":"\\"+t})}),n(function(){!1!==n.fancybox.defaults.hash&&(n(e).on({"onInit.fb":function(t,e){var n,i;!1!==e.group[e.currIndex].opts.hash&&(n=o(),(i=a(e))&&n.gallery&&i==n.gallery&&(e.currIndex=n.index-1))},"beforeShow.fb":function(n,o,i,s){var r;i&&!1!==i.opts.hash&&(r=a(o))&&(o.currentHash=r+(o.group.length>1?"-"+(i.index+1):""),t.location.hash!=="#"+o.currentHash&&(s&&!o.origHash&&(o.origHash=t.location.hash),o.hashTimer&&clearTimeout(o.hashTimer),o.hashTimer=setTimeout(function(){"replaceState"in t.history?(t.history[s?"pushState":"replaceState"]({},e.title,t.location.pathname+t.location.search+"#"+o.currentHash),s&&(o.hasCreatedHistory=!0)):t.location.hash=o.currentHash,o.hashTimer=null},300)))},"beforeClose.fb":function(n,o,i){i&&!1!==i.opts.hash&&(clearTimeout(o.hashTimer),o.currentHash&&o.hasCreatedHistory?t.history.back():o.currentHash&&("replaceState"in t.history?t.history.replaceState({},e.title,t.location.pathname+t.location.search+(o.origHash||"")):t.location.hash=o.origHash),o.currentHash=null)}}),n(t).on("hashchange.fb",function(){var t=o(),e=null;n.each(n(".fancybox-container").get().reverse(),function(t,o){var i=n(o).data("FancyBox");if(i&&i.currentHash)return e=i,!1}),e?e.currentHash===t.gallery+"-"+t.index||1===t.index&&e.currentHash==t.gallery||(e.currentHash=null,e.close()):""!==t.gallery&&i(t)}),setTimeout(function(){n.fancybox.getInstance()||i(o())},50))})}(window,document,jQuery),function(t,e){"use strict";var n=(new Date).getTime();e(t).on({"onInit.fb":function(t,e,o){e.$refs.stage.on("mousewheel DOMMouseScroll wheel MozMousePixelScroll",function(t){var o=e.current,i=(new Date).getTime();e.group.length<2||!1===o.opts.wheel||"auto"===o.opts.wheel&&"image"!==o.type||(t.preventDefault(),t.stopPropagation(),o.$slide.hasClass("fancybox-animated")||(t=t.originalEvent||t,i-n<250||(n=i,e[(-t.deltaY||-t.deltaX||t.wheelDelta||-t.detail)<0?"next":"previous"]())))})}})}(document,jQuery);
// source --> https://www.sln-solutions.com/wp-content/themes/thegem/js/fancyBox/jquery.fancybox-init.js?ver=5.8.1 
(function($) {

	$.fn.initGalleryFancybox = function() {
	    $('a.fancy-gallery', this).fancybox({
	        caption : function( instance, item ) {
	            var slideInfo = $('.slide-info', this);
	            if ($('> *', slideInfo).length) {
	                return slideInfo.clone().html();
	            }
	        },
	        onInit: function(instance) {
	            instance.$refs.caption.addClass('fancybox-title');
	            instance.$refs.caption.parent().addClass('slideinfo');
	        }
	    });
	};

	$.fn.initPortfolioFancybox = function() {
		$('a.fancy, .fancy-link-inner a', this).fancybox();

		$('.portfolio-item a.vimeo, .portfolio-item a.youtube', this).fancybox({
			type: 'iframe'
		});

		$('.portfolio-item a.self_video', this).click(function(e) {
			e.preventDefault();
			var $a = $(this);
			$.fancybox.open({
				type: 'html',
				maxWidth: 1200,
				content: '<div id="fancybox-video"><video width="100%" height="100%" autoplay="autoplay" controls="controls" src="'+$a.attr('href')+'" preload="none"></video></div>',
				afterShow: function(instance, current) {
					$('video', current.$content).mediaelementplayer();
				}
			});
		});
	};

	$.fn.initBlogFancybox = function() {
		$('a.fancy, .fancy-link-inner a', this).fancybox();

		$('.blog article a.youtube, .blog article a.vimeo', this).fancybox({
			type: 'iframe'
		});
	};

	$.fn.initProductFancybox = function() {
		let isTouch = window.gemSettings.isTouch;

		$('a.fancy-product-gallery', this).fancybox({
			arrows: isTouch ? false : true,
			infobar: true,
			clickOutside: 'close',
			buttons: [
				'zoom',
				'fullScreen',
				'thumbs',
				'close',
			],
			touch: {
				vertical: false,
				momentum : false
			},
			loop : true,
			animationDuration: 300,
			backFocus: false,
			mobile: {
				fullScreen: false,
				arrows: false,
				animationEffect : 'fade',
				buttons: [
					'zoom',
					'fullScreen',
					'close',
				],
				clickContent: function(current, event) {
					return current.type === "image" ? "zoom" : false;
				},
				clickSlide: function(current, event) {
					return "close";
				},
			},
		});
	};

	$(document).initGalleryFancybox();
	$(document).initPortfolioFancybox();
	$(document).initBlogFancybox();
	$(document).initProductFancybox();

	$('a.fancy, .fancy-link-inner a').fancybox();
})(jQuery);
// source --> https://www.sln-solutions.com/wp-includes/js/dist/vendor/regenerator-runtime.min.js?ver=0.13.7 
var runtime=function(a){"use strict";var u,t=Object.prototype,h=t.hasOwnProperty,r="function"==typeof Symbol?Symbol:{},n=r.iterator||"@@iterator",e=r.asyncIterator||"@@asyncIterator",o=r.toStringTag||"@@toStringTag";function i(t,r,e){return Object.defineProperty(t,r,{value:e,enumerable:!0,configurable:!0,writable:!0}),t[r]}try{i({},"")}catch(t){i=function(t,r,e){return t[r]=e}}function c(t,r,e,n){var o,i,a,c,r=r&&r.prototype instanceof d?r:d,r=Object.create(r.prototype),n=new j(n||[]);return r._invoke=(o=t,i=e,a=n,c=l,function(t,r){if(c===p)throw new Error("Generator is already running");if(c===y){if("throw"===t)throw r;return k()}for(a.method=t,a.arg=r;;){var e=a.delegate;if(e){var n=function t(r,e){var n=r.iterator[e.method];if(n===u){if(e.delegate=null,"throw"===e.method){if(r.iterator.return&&(e.method="return",e.arg=u,t(r,e),"throw"===e.method))return v;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return v}var n=f(n,r.iterator,e.arg);if("throw"===n.type)return e.method="throw",e.arg=n.arg,e.delegate=null,v;n=n.arg;if(!n)return e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,v;{if(!n.done)return n;e[r.resultName]=n.value,e.next=r.nextLoc,"return"!==e.method&&(e.method="next",e.arg=u)}e.delegate=null;return v}(e,a);if(n){if(n===v)continue;return n}}if("next"===a.method)a.sent=a._sent=a.arg;else if("throw"===a.method){if(c===l)throw c=y,a.arg;a.dispatchException(a.arg)}else"return"===a.method&&a.abrupt("return",a.arg);c=p;n=f(o,i,a);if("normal"===n.type){if(c=a.done?y:s,n.arg!==v)return{value:n.arg,done:a.done}}else"throw"===n.type&&(c=y,a.method="throw",a.arg=n.arg)}}),r}function f(t,r,e){try{return{type:"normal",arg:t.call(r,e)}}catch(t){return{type:"throw",arg:t}}}a.wrap=c;var l="suspendedStart",s="suspendedYield",p="executing",y="completed",v={};function d(){}function g(){}function m(){}var w={};w[n]=function(){return this};r=Object.getPrototypeOf,r=r&&r(r(O([])));r&&r!==t&&h.call(r,n)&&(w=r);var L=m.prototype=d.prototype=Object.create(w);function x(t){["next","throw","return"].forEach(function(r){i(t,r,function(t){return this._invoke(r,t)})})}function b(a,c){var r;this._invoke=function(e,n){function t(){return new c(function(t,r){!function r(t,e,n,o){t=f(a[t],a,e);if("throw"!==t.type){var i=t.arg;return(e=i.value)&&"object"==typeof e&&h.call(e,"__await")?c.resolve(e.__await).then(function(t){r("next",t,n,o)},function(t){r("throw",t,n,o)}):c.resolve(e).then(function(t){i.value=t,n(i)},function(t){return r("throw",t,n,o)})}o(t.arg)}(e,n,t,r)})}return r=r?r.then(t,t):t()}}function E(t){var r={tryLoc:t[0]};1 in t&&(r.catchLoc=t[1]),2 in t&&(r.finallyLoc=t[2],r.afterLoc=t[3]),this.tryEntries.push(r)}function _(t){var r=t.completion||{};r.type="normal",delete r.arg,t.completion=r}function j(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(E,this),this.reset(!0)}function O(r){if(r){var t=r[n];if(t)return t.call(r);if("function"==typeof r.next)return r;if(!isNaN(r.length)){var e=-1,t=function t(){for(;++e<r.length;)if(h.call(r,e))return t.value=r[e],t.done=!1,t;return t.value=u,t.done=!0,t};return t.next=t}}return{next:k}}function k(){return{value:u,done:!0}}return((g.prototype=L.constructor=m).constructor=g).displayName=i(m,o,"GeneratorFunction"),a.isGeneratorFunction=function(t){t="function"==typeof t&&t.constructor;return!!t&&(t===g||"GeneratorFunction"===(t.displayName||t.name))},a.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,m):(t.__proto__=m,i(t,o,"GeneratorFunction")),t.prototype=Object.create(L),t},a.awrap=function(t){return{__await:t}},x(b.prototype),b.prototype[e]=function(){return this},a.AsyncIterator=b,a.async=function(t,r,e,n,o){void 0===o&&(o=Promise);var i=new b(c(t,r,e,n),o);return a.isGeneratorFunction(r)?i:i.next().then(function(t){return t.done?t.value:i.next()})},x(L),i(L,o,"Generator"),L[n]=function(){return this},L.toString=function(){return"[object Generator]"},a.keys=function(e){var t,n=[];for(t in e)n.push(t);return n.reverse(),function t(){for(;n.length;){var r=n.pop();if(r in e)return t.value=r,t.done=!1,t}return t.done=!0,t}},a.values=O,j.prototype={constructor:j,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=u,this.done=!1,this.delegate=null,this.method="next",this.arg=u,this.tryEntries.forEach(_),!t)for(var r in this)"t"===r.charAt(0)&&h.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=u)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var n=this;function t(t,r){return i.type="throw",i.arg=e,n.next=t,r&&(n.method="next",n.arg=u),!!r}for(var r=this.tryEntries.length-1;0<=r;--r){var o=this.tryEntries[r],i=o.completion;if("root"===o.tryLoc)return t("end");if(o.tryLoc<=this.prev){var a=h.call(o,"catchLoc"),c=h.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return t(o.catchLoc,!0);if(this.prev<o.finallyLoc)return t(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return t(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return t(o.finallyLoc)}}}},abrupt:function(t,r){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.tryLoc<=this.prev&&h.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}var i=(o=o&&("break"===t||"continue"===t)&&o.tryLoc<=r&&r<=o.finallyLoc?null:o)?o.completion:{};return i.type=t,i.arg=r,o?(this.method="next",this.next=o.finallyLoc,v):this.complete(i)},complete:function(t,r){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&r&&(this.next=r),v},finish:function(t){for(var r=this.tryEntries.length-1;0<=r;--r){var e=this.tryEntries[r];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),_(e),v}},catch:function(t){for(var r=this.tryEntries.length-1;0<=r;--r){var e=this.tryEntries[r];if(e.tryLoc===t){var n,o=e.completion;return"throw"===o.type&&(n=o.arg,_(e)),n}}throw new Error("illegal catch attempt")},delegateYield:function(t,r,e){return this.delegate={iterator:O(t),resultName:r,nextLoc:e},"next"===this.method&&(this.arg=u),v}},a}("object"==typeof module?module.exports:{});try{regeneratorRuntime=runtime}catch(t){Function("r","regeneratorRuntime = r")(runtime)};
// source --> https://www.sln-solutions.com/wp-includes/js/dist/vendor/wp-polyfill.min.js?ver=3.15.0 
/**
 * core-js 3.11.0
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2021 Denis Pushkarev (zloirock.ru)
 */
!function(S){"use strict";var r,e,o;e={},(o=function(t){if(e[t])return e[t].exports;var n=e[t]={i:t,l:!1,exports:{}};return r[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}).m=r=[function(t,n,r){r(1),r(69),r(71),t.exports=r(75)},function(t,n,r){var e=r(2),o=r(46),i=r(48),c=r(50),u=r(19),f=r(8),a=r(54),s=function(t,n){var r=this;if(!(r instanceof s))return new s(t,n);i&&(r=i(new Error(S),o(r))),n!==S&&u(r,"message",String(n));n=[];return a(t,n.push,{that:n}),u(r,"errors",n),r};s.prototype=c(Error.prototype,{constructor:f(5,s),message:f(5,""),name:f(5,"AggregateError")}),e({global:!0},{AggregateError:s})},function(t,n,r){var a=r(3),s=r(4).f,p=r(19),l=r(22),g=r(23),v=r(33),y=r(45);t.exports=function(t,n){var r,e,o,i=t.target,c=t.global,u=t.stat,f=c?a:u?a[i]||g(i,{}):(a[i]||{}).prototype;if(f)for(r in n){if(e=n[r],o=t.noTargetGet?(o=s(f,r))&&o.value:f[r],!y(c?r:i+(u?".":"#")+r,t.forced)&&o!==S){if(typeof e==typeof o)continue;v(e,o)}(t.sham||o&&o.sham)&&p(e,"sham",!0),l(f,r,e,t)}}},function(t,n){function r(t){return t&&t.Math==Math&&t}t.exports=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof global&&global)||function(){return this}()||Function("return this")()},function(t,n,r){var e=r(5),o=r(7),i=r(8),c=r(9),u=r(13),f=r(15),a=r(17),s=Object.getOwnPropertyDescriptor;n.f=e?s:function(t,n){if(t=c(t),n=u(n,!0),a)try{return s(t,n)}catch(t){}if(f(t,n))return i(!o.f.call(t,n),t[n])}},function(t,n,r){r=r(6);t.exports=!r(function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n,r){var e={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i=o&&!e.call({1:2},1);n.f=i?function(t){t=o(this,t);return!!t&&t.enumerable}:e},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,r){var e=r(10),o=r(12);t.exports=function(t){return e(o(t))}},function(t,n,r){var e=r(6),o=r(11),i="".split;t.exports=e(function(){return!Object("z").propertyIsEnumerable(0)})?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object},function(t,n){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,n){t.exports=function(t){if(t==S)throw TypeError("Can't call method on "+t);return t}},function(t,n,r){var o=r(14);t.exports=function(t,n){if(!o(t))return t;var r,e;if(n&&"function"==typeof(r=t.toString)&&!o(e=r.call(t)))return e;if("function"==typeof(r=t.valueOf)&&!o(e=r.call(t)))return e;if(!n&&"function"==typeof(r=t.toString)&&!o(e=r.call(t)))return e;throw TypeError("Can't convert object to primitive value")}},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n,r){var e=r(16),o={}.hasOwnProperty;t.exports=function(t,n){return o.call(e(t),n)}},function(t,n,r){var e=r(12);t.exports=function(t){return Object(e(t))}},function(t,n,r){var e=r(5),o=r(6),i=r(18);t.exports=!e&&!o(function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a})},function(t,n,r){var e=r(3),r=r(14),o=e.document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,n,r){var e=r(5),o=r(20),i=r(8);t.exports=e?function(t,n,r){return o.f(t,n,i(1,r))}:function(t,n,r){return t[n]=r,t}},function(t,n,r){var e=r(5),o=r(17),i=r(21),c=r(13),u=Object.defineProperty;n.f=e?u:function(t,n,r){if(i(t),n=c(n,!0),i(r),o)try{return u(t,n,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported");return"value"in r&&(t[n]=r.value),t}},function(t,n,r){var e=r(14);t.exports=function(t){if(!e(t))throw TypeError(String(t)+" is not an object");return t}},function(t,n,r){var u=r(3),f=r(19),a=r(15),s=r(23),e=r(24),r=r(26),o=r.get,p=r.enforce,l=String(String).split("String");(t.exports=function(t,n,r,e){var o=!!e&&!!e.unsafe,i=!!e&&!!e.enumerable,c=!!e&&!!e.noTargetGet;"function"==typeof r&&("string"!=typeof n||a(r,"name")||f(r,"name",n),(e=p(r)).source||(e.source=l.join("string"==typeof n?n:""))),t!==u?(o?!c&&t[n]&&(i=!0):delete t[n],i?t[n]=r:f(t,n,r)):i?t[n]=r:s(n,r)})(Function.prototype,"toString",function(){return"function"==typeof this&&o(this).source||e(this)})},function(t,n,r){var e=r(3),o=r(19);t.exports=function(n,r){try{o(e,n,r)}catch(t){e[n]=r}return r}},function(t,n,r){var r=r(25),e=Function.toString;"function"!=typeof r.inspectSource&&(r.inspectSource=function(t){return e.call(t)}),t.exports=r.inspectSource},function(t,n,r){var e=r(3),o=r(23),r="__core-js_shared__",r=e[r]||o(r,{});t.exports=r},function(t,n,r){var e,o,i,c,u,f,a,s,p=r(27),l=r(3),g=r(14),v=r(19),y=r(15),h=r(25),d=r(28),r=r(32),b="Object already initialized",l=l.WeakMap;a=p?(e=h.state||(h.state=new l),o=e.get,i=e.has,c=e.set,u=function(t,n){if(i.call(e,t))throw new TypeError(b);return n.facade=t,c.call(e,t,n),n},f=function(t){return o.call(e,t)||{}},function(t){return i.call(e,t)}):(r[s=d("state")]=!0,u=function(t,n){if(y(t,s))throw new TypeError(b);return n.facade=t,v(t,s,n),n},f=function(t){return y(t,s)?t[s]:{}},function(t){return y(t,s)}),t.exports={set:u,get:f,has:a,enforce:function(t){return a(t)?f(t):u(t,{})},getterFor:function(r){return function(t){var n;if(!g(t)||(n=f(t)).type!==r)throw TypeError("Incompatible receiver, "+r+" required");return n}}}},function(t,n,r){var e=r(3),r=r(24),e=e.WeakMap;t.exports="function"==typeof e&&/native code/.test(r(e))},function(t,n,r){var e=r(29),o=r(31),i=e("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},function(t,n,r){var e=r(30),o=r(25);(t.exports=function(t,n){return o[t]||(o[t]=n!==S?n:{})})("versions",[]).push({version:"3.11.0",mode:e?"pure":"global",copyright:"© 2021 Denis Pushkarev (zloirock.ru)"})},function(t,n){t.exports=!1},function(t,n){var r=0,e=Math.random();t.exports=function(t){return"Symbol("+String(t===S?"":t)+")_"+(++r+e).toString(36)}},function(t,n){t.exports={}},function(t,n,r){var u=r(15),f=r(34),a=r(4),s=r(20);t.exports=function(t,n){for(var r=f(n),e=s.f,o=a.f,i=0;i<r.length;i++){var c=r[i];u(t,c)||e(t,c,o(n,c))}}},function(t,n,r){var e=r(35),o=r(37),i=r(44),c=r(21);t.exports=e("Reflect","ownKeys")||function(t){var n=o.f(c(t)),r=i.f;return r?n.concat(r(t)):n}},function(t,n,r){function e(t){return"function"==typeof t?t:S}var o=r(36),i=r(3);t.exports=function(t,n){return arguments.length<2?e(o[t])||e(i[t]):o[t]&&o[t][n]||i[t]&&i[t][n]}},function(t,n,r){r=r(3);t.exports=r},function(t,n,r){var e=r(38),o=r(43).concat("length","prototype");n.f=Object.getOwnPropertyNames||function(t){return e(t,o)}},function(t,n,r){var c=r(15),u=r(9),f=r(39).indexOf,a=r(32);t.exports=function(t,n){var r,e=u(t),o=0,i=[];for(r in e)!c(a,r)&&c(e,r)&&i.push(r);for(;n.length>o;)c(e,r=n[o++])&&(~f(i,r)||i.push(r));return i}},function(t,n,r){var f=r(9),a=r(40),s=r(42),r=function(u){return function(t,n,r){var e,o=f(t),i=a(o.length),c=s(r,i);if(u&&n!=n){for(;c<i;)if((e=o[c++])!=e)return!0}else for(;c<i;c++)if((u||c in o)&&o[c]===n)return u||c||0;return!u&&-1}};t.exports={includes:r(!0),indexOf:r(!1)}},function(t,n,r){var e=r(41),o=Math.min;t.exports=function(t){return 0<t?o(e(t),9007199254740991):0}},function(t,n){var r=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(0<t?e:r)(t)}},function(t,n,r){var e=r(41),o=Math.max,i=Math.min;t.exports=function(t,n){t=e(t);return t<0?o(t+n,0):i(t,n)}},function(t,n){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},function(t,n){n.f=Object.getOwnPropertySymbols},function(t,n,r){var e=r(6),o=/#|\.prototype\./,r=function(t,n){t=c[i(t)];return t==f||t!=u&&("function"==typeof n?e(n):!!n)},i=r.normalize=function(t){return String(t).replace(o,".").toLowerCase()},c=r.data={},u=r.NATIVE="N",f=r.POLYFILL="P";t.exports=r},function(t,n,r){var e=r(15),o=r(16),i=r(28),r=r(47),c=i("IE_PROTO"),u=Object.prototype;t.exports=r?Object.getPrototypeOf:function(t){return t=o(t),e(t,c)?t[c]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,n,r){r=r(6);t.exports=!r(function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype})},function(t,n,r){var o=r(21),i=r(49);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var r,e=!1,t={};try{(r=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(t,[]),e=t instanceof Array}catch(t){}return function(t,n){return o(t),i(n),e?r.call(t,n):t.__proto__=n,t}}():S)},function(t,n,r){var e=r(14);t.exports=function(t){if(!e(t)&&null!==t)throw TypeError("Can't set "+String(t)+" as a prototype");return t}},function(t,n,r){function e(){}function o(t){return"<script>"+t+"</"+g+">"}var i,c=r(21),u=r(51),f=r(43),a=r(32),s=r(53),p=r(18),r=r(28),l="prototype",g="script",v=r("IE_PROTO"),y=function(){try{i=document.domain&&new ActiveXObject("htmlfile")}catch(t){}var t;y=i?function(t){t.write(o("")),t.close();var n=t.parentWindow.Object;return t=null,n}(i):((t=p("iframe")).style.display="none",s.appendChild(t),t.src=String("javascript:"),(t=t.contentWindow.document).open(),t.write(o("document.F=Object")),t.close(),t.F);for(var n=f.length;n--;)delete y[l][f[n]];return y()};a[v]=!0,t.exports=Object.create||function(t,n){var r;return null!==t?(e[l]=c(t),r=new e,e[l]=null,r[v]=t):r=y(),n===S?r:u(r,n)}},function(t,n,r){var e=r(5),c=r(20),u=r(21),f=r(52);t.exports=e?Object.defineProperties:function(t,n){u(t);for(var r,e=f(n),o=e.length,i=0;i<o;)c.f(t,r=e[i++],n[r]);return t}},function(t,n,r){var e=r(38),o=r(43);t.exports=Object.keys||function(t){return e(t,o)}},function(t,n,r){r=r(35);t.exports=r("document","documentElement")},function(t,n,r){function h(t,n){this.stopped=t,this.result=n}var d=r(21),b=r(55),x=r(40),m=r(63),O=r(65),w=r(68);t.exports=function(t,n,r){function e(t){return i&&w(i),new h(!0,t)}function o(t){return l?(d(t),v?y(t[0],t[1],e):y(t[0],t[1])):v?y(t,e):y(t)}var i,c,u,f,a,s,p=r&&r.that,l=!(!r||!r.AS_ENTRIES),g=!(!r||!r.IS_ITERATOR),v=!(!r||!r.INTERRUPTED),y=m(n,p,1+l+v);if(g)i=t;else{if("function"!=typeof(g=O(t)))throw TypeError("Target is not iterable");if(b(g)){for(c=0,u=x(t.length);c<u;c++)if((f=o(t[c]))&&f instanceof h)return f;return new h(!1)}i=g.call(t)}for(a=i.next;!(s=a.call(i)).done;){try{f=o(s.value)}catch(t){throw w(i),t}if("object"==typeof f&&f&&f instanceof h)return f}return new h(!1)}},function(t,n,r){var e=r(56),o=r(62),i=e("iterator"),c=Array.prototype;t.exports=function(t){return t!==S&&(o.Array===t||c[i]===t)}},function(t,n,r){var e=r(3),o=r(29),i=r(15),c=r(31),u=r(57),r=r(61),f=o("wks"),a=e.Symbol,s=r?a:a&&a.withoutSetter||c;t.exports=function(t){return i(f,t)&&(u||"string"==typeof f[t])||(u&&i(a,t)?f[t]=a[t]:f[t]=s("Symbol."+t)),f[t]}},function(t,n,r){var e=r(58),o=r(59),r=r(6);t.exports=!!Object.getOwnPropertySymbols&&!r(function(){return!Symbol.sham&&(e?38===o:37<o&&o<41)})},function(t,n,r){var e=r(11),r=r(3);t.exports="process"==e(r.process)},function(t,n,r){var e,o,i=r(3),r=r(60),i=i.process,i=i&&i.versions,i=i&&i.v8;i?o=(e=i.split("."))[0]+e[1]:r&&(!(e=r.match(/Edge\/(\d+)/))||74<=e[1])&&(e=r.match(/Chrome\/(\d+)/))&&(o=e[1]),t.exports=o&&+o},function(t,n,r){r=r(35);t.exports=r("navigator","userAgent")||""},function(t,n,r){r=r(57);t.exports=r&&!Symbol.sham&&"symbol"==typeof Symbol.iterator},function(t,n){t.exports={}},function(t,n,r){var i=r(64);t.exports=function(e,o,t){if(i(e),o===S)return e;switch(t){case 0:return function(){return e.call(o)};case 1:return function(t){return e.call(o,t)};case 2:return function(t,n){return e.call(o,t,n)};case 3:return function(t,n,r){return e.call(o,t,n,r)}}return function(){return e.apply(o,arguments)}}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(String(t)+" is not a function");return t}},function(t,n,r){var e=r(66),o=r(62),i=r(56)("iterator");t.exports=function(t){if(t!=S)return t[i]||t["@@iterator"]||o[e(t)]}},function(t,n,r){var e=r(67),o=r(11),i=r(56)("toStringTag"),c="Arguments"==o(function(){return arguments}());t.exports=e?o:function(t){var n;return t===S?"Undefined":null===t?"Null":"string"==typeof(t=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),i))?t:c?o(n):"Object"==(t=o(n))&&"function"==typeof n.callee?"Arguments":t}},function(t,n,r){var e={};e[r(56)("toStringTag")]="z",t.exports="[object z]"===String(e)},function(t,n,r){var e=r(21);t.exports=function(t){var n=t.return;if(n!==S)return e(n.call(t)).value}},function(t,n,r){var e=r(2),o=r(3),r=r(70);e({global:!0},{Reflect:{}}),r(o.Reflect,"Reflect",!0)},function(t,n,r){var e=r(20).f,o=r(15),i=r(56)("toStringTag");t.exports=function(t,n,r){t&&!o(t=r?t:t.prototype,i)&&e(t,i,{configurable:!0,value:n})}},function(t,n,r){function v(t,n,r){return r>t.length?-1:""===n?r:t.indexOf(n,r)}var e=r(2),y=r(12),h=r(72),d=r(73),b=r(74),o=r(56),x=r(30),m=o("replace"),O=RegExp.prototype,w=Math.max;e({target:"String",proto:!0},{replaceAll:function(t,n){var r,e,o,i,c,u,f,a,s=y(this),p=0,l=0,g="";if(null!=t){if((r=h(t))&&!~String(y("flags"in O?t.flags:d.call(t))).indexOf("g"))throw TypeError("`.replaceAll` does not allow non-global regexes");if((e=t[m])!==S)return e.call(t,s,n);if(x&&r)return String(s).replace(t,n)}for(o=String(s),i=String(t),(c="function"==typeof n)||(n=String(n)),u=i.length,f=w(1,u),p=v(o,i,0);-1!==p;)a=c?String(n(i,p,o)):b(i,o,p,[],S,n),g+=o.slice(l,p)+a,l=p+u,p=v(o,i,p+f);return l<o.length&&(g+=o.slice(l)),g}})},function(t,n,r){var e=r(14),o=r(11),i=r(56)("match");t.exports=function(t){var n;return e(t)&&((n=t[i])!==S?!!n:"RegExp"==o(t))}},function(t,n,r){var e=r(21);t.exports=function(){var t=e(this),n="";return t.global&&(n+="g"),t.ignoreCase&&(n+="i"),t.multiline&&(n+="m"),t.dotAll&&(n+="s"),t.unicode&&(n+="u"),t.sticky&&(n+="y"),n}},function(t,n,r){var e=r(16),l=Math.floor,o="".replace,g=/\$([$&'`]|\d{1,2}|<[^>]*>)/g,v=/\$([$&'`]|\d{1,2})/g;t.exports=function(i,c,u,f,a,t){var s=u+i.length,p=f.length,n=v;return a!==S&&(a=e(a),n=g),o.call(t,n,function(t,n){var r;switch(n.charAt(0)){case"$":return"$";case"&":return i;case"`":return c.slice(0,u);case"'":return c.slice(s);case"<":r=a[n.slice(1,-1)];break;default:var e=+n;if(0==e)return t;if(p<e){var o=l(e/10);return 0===o?t:o<=p?f[o-1]===S?n.charAt(1):f[o-1]+n.charAt(1):t}r=f[e-1]}return r===S?"":r})}},function(t,n,r){var e=r(2),o=r(3),r=r(76);e({global:!0,bind:!0,enumerable:!0,forced:!o.setImmediate||!o.clearImmediate},{setImmediate:r.set,clearImmediate:r.clear})},function(t,n,r){function e(t){var n;O.hasOwnProperty(t)&&(n=O[t],delete O[t],n())}function o(t){return function(){e(t)}}function i(t){e(t.data)}var c,u=r(3),f=r(6),a=r(63),s=r(53),p=r(18),l=r(77),g=r(58),v=u.location,y=u.setImmediate,h=u.clearImmediate,d=u.process,b=u.MessageChannel,x=u.Dispatch,m=0,O={},w="onreadystatechange",r=function(t){u.postMessage(t+"",v.protocol+"//"+v.host)};y&&h||(y=function(t){for(var n=[],r=1;r<arguments.length;)n.push(arguments[r++]);return O[++m]=function(){("function"==typeof t?t:Function(t)).apply(S,n)},c(m),m},h=function(t){delete O[t]},g?c=function(t){d.nextTick(o(t))}:x&&x.now?c=function(t){x.now(o(t))}:b&&!l?(b=(l=new b).port2,l.port1.onmessage=i,c=a(b.postMessage,b,1)):u.addEventListener&&"function"==typeof postMessage&&!u.importScripts&&v&&"file:"!==v.protocol&&!f(r)?(c=r,u.addEventListener("message",i,!1)):c=w in p("script")?function(t){s.appendChild(p("script"))[w]=function(){s.removeChild(this),e(t)}}:function(t){setTimeout(o(t),0)}),t.exports={set:y,clear:h}},function(t,n,r){r=r(60);t.exports=/(?:iphone|ipod|ipad).*applewebkit/i.test(r)}],o.c=e,o.d=function(t,n,r){o.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(n,t){if(1&t&&(n=o(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var e in n)o.d(r,e,function(t){return n[t]}.bind(null,e));return r},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="",o(o.s=0)}();