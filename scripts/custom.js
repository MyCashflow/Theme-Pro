/**
 * MyCashflow Default Theme
 * Copyright (c) 2015 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 */
$(document).ready(function () {
	'use strict';

	$.ajaxSetup({
		cache: false
	});

	$.Finger = {
		flickDuration: 150,
		motionThreshold: 5
	};

	var plugins = ['Drawers', 'Loaders', 'Navigations', 'Notifications', 'Spinners', 'Tabs'];
	$.each(plugins, function (index, name) {
		var plugin = MCF[name];
		if (plugin) {
			plugin.init();
		}
	});

	new MCF.Search({
		$searchForm: $('#LiveSearch'),

		beforeUpdate: function ($elem) {
			MCF.Loaders.show($elem);
		},

		afterUpdate: function ($elem) {
			MCF.Loaders.hide($elem);
		}
	});

	MCF.Theme.init({
		updateCarts: function () {
			return $.when([
				this.updateFullCart(),
				this.updateMiniCarts()
			]);
		},

		updateFullCart: function () {
			var $fullCart = $('.FullCart').first();
			if (!$fullCart.length) {
				return;
			}
			var $products = $fullCart.find('.Product');
			if ($products.length) {
				MCF.Loaders.show($fullCart);
			} else {
				$fullCart.remove();
				return;
			}
			return $.get('/interface/Helper?file=helpers/full-cart')
				.then(function (html) {
					$fullCart.html(html);
					MCF.Spinners.wrapInputs($fullCart);
					MCF.Loaders.hide($fullCart);
				});
		},

		updateMiniCarts: function () {
			var $miniCarts = $('.MiniCart');
			var $cartTotals = $('.CartTotal');
			if (!$miniCarts.length && !$cartTotals.length) {
				return;
			}
			$miniCarts.each(function () {
				var $cart = $(this);
				var $drawer = $cart.closest('.Drawer');
				if ($cart.is(':visible') && !$drawer.length) {
					MCF.Loaders.show($cart);
				}
			});
			$.get('/interface/CartSubTotal')
				.then(function (html) {
					$cartTotals.each(function () {
						var $total = $(this);
						$total.children(':not(.Loader)').remove();
						$total.html(html);
					});
				});
			return $.get('/interface/Helper?file=helpers/mini-cart')
				.then(function (html) {
					$miniCarts.each(function () {
						var $cart = $(this);
						$cart.children(':not(.Loader)').remove();
						$cart.append(html);
						MCF.Loaders.hide($cart);
					});
				});
		},

		skipNotifications: function (ajaxSettings) {
			// Skip spam when filling checkout address information.
			var $focused = $('#CheckoutBillingAddress, #CheckoutShippingAddress').find(':focus');
			if (ajaxSettings.url === '/checkout/' && $focused.length) {
				return true;
			}
		}
	});

	MCF.Cart.init({
		beforeUpdate: function ($cart) {
			MCF.Loaders.show($cart);
		},

		afterUpdate: function ($cart) {
			MCF.Loaders.hide($cart);
			MCF.Theme.updateCarts();
		},

		beforeAddProduct: function ($buyForm) {
			MCF.Loaders.show($buyForm);
		},

		afterAddProduct: function ($buyForm) {
			MCF.Loaders.hide($buyForm);
			MCF.Theme.updateMiniCarts()
				.then(function () {
					MCF.Drawers.toggleByName('cart');
				});
		},

		beforeRemoveProduct: function ($removeLink) {
			var $product = $removeLink.closest('.Product');
			$product.fadeOut('fast');
		},

		afterRemoveProduct: function () {
			MCF.Theme.updateCarts();
		}
	});

	MCF.Checkout.init({
		afterUpdate: function () {
			MCF.Theme.updateMiniCarts();
		},

		beforeUpdatePart: function ($part) {
			MCF.Loaders.show($part);
		},

		afterUpdatePart: function ($part) {
			MCF.Loaders.hide($part);
		}
	});

	MCF.KlarnaCheckout.init({
		beforeUpdate: function ($element) {
			MCF.Loaders.show($element);
		},

		afterUpdate: function ($element) {
			MCF.Loaders.hide($element);
			MCF.Theme.updateMiniCarts();

			if ($element.is('#CheckoutSubmitOrderComment')) {
				MCF.Notifications.success(MCF.Locales.get('orderCommentSaved'));
			}
		}
	});

	MCF.Modals.init({
		tClose: MCF.Locales.get('close'),
		tLoading: MCF.Locales.get('loading'),
		gallery: {
			tPrev: MCF.Locales.get('previous'),
			tNext: MCF.Locales.get('next')
		}
	});

	MCF.Images.init({
		zoomOn: 'click',
		transitionEffect: false,
		textClickZoomHint: MCF.Locales.get('expandImage'),
		textHoverZoomHint: MCF.Locales.get('expandImage'),
		textExpandHint: MCF.Locales.get('expandImage'),
		textBtnClose: MCF.Locales.get('close'),
		textBtnPrev: MCF.Locales.get('previous'),
		textBtnNext: MCF.Locales.get('next')
	});

	$('[data-flickity="banner"]').flickity({
		cellAlign: 'left',
		contain: true,
		pageDots: true,
		prevNextButtons: false,
		wrapAround: true
	});
	
	$('[data-flickity="list"]').flickity({
		cellAlign: 'left',
		contain: true,
		groupCells: '80%',
		pageDots: false,
	});
	
	//--------------------------------------------------------------------------
	// Search
	//--------------------------------------------------------------------------

	var searchInput = $('#SearchInput'),
			searchBg = $('.LiveSearchBackground');
			
	searchInput.attr("placeholder", MCF.Locales.get('search'));

	searchInput.focus(function () {
		searchBg.addClass('Visible');
	});
	
	searchInput.blur(function () {
		searchBg.removeClass('Visible');
	});

	function closeSearch() {
		searchInput.blur();
		searchBg.removeClass('Visible');
	}

	// Close Search with esc key
	$(document).keydown(function (e) {
		if (e.keyCode == 27) {
				closeSearch();
		}
	});
	
	//--------------------------------------------------------------------------
	// Add products to the cart via AJAX
	//--------------------------------------------------------------------------
	
	/**
	 * Add products to the cart via AJAX
	 *
	 * Add products to the cart without reloading the page. If product has any
	 * options, like variations, user will be redirected to the actual product
	 * page to make all required decisions before adding the product to the cart.
	 *
	 */

	$(document).on('submit', '.ProductAddToCart', function(evt){
		var $buyForm = $(evt.currentTarget);
		var $product = $buyForm.closest('.Product');
		var $addToCartButton = $product.find('button.SubmitButton');

		var productID = $buyForm.attr('action').split('/')[2];
		var isCustomizableProduct = $product.is(
			'.ProductVariations, .ProductTailorings, .ProductDownloads');

		if(!isCustomizableProduct) {
			evt.preventDefault();
			MCF.Cart.addProduct($buyForm);
		}
	});

	$(document).on('click', '[href="/terms/"]', function () {
		MCF.Drawers.toggleByName('terms');
		return false;
	});

	$(document).on('change', '[data-auto-submit]', function (evt) {
		$(evt.currentTarget).closest('form').submit();
	});

	$(document).on('ajaxSuccess', function (evt, xhr, settings) {
		if (MCF.Theme.skipNotifications(settings)) {
			return;
		}
		var json;
		try {
			json = $.parseJSON(xhr.responseText);
		} catch (e) {
			MCF.Notifications.createFromHtml(xhr.responseText);
		}
		if (json && json.notifications) {
			MCF.Notifications.createFromJson(json);
		}
	});

	$('#StickyNavigation').hcSticky({
		stickTo: document,
		top: 20,
	});
	
	$('#StickyTopBar').hcSticky({
		stickTo: document
	});

	$('#StickyCart').hcSticky({
		stickTo: '.SiteContent',
		top: 80,
		bottomEnd: 80
	});
	
	var $target = $('.Breadcrumb').children();
	while ($target.length) {
		$target = $target.children();
	}
	$target.end().closest("ul li").addClass('Current');
	
	$('#SubscribeEmail').focus(function () {
		$('#NewsletterCaptchaBadge').fadeIn();
	});
	
	$('#SubscribeEmail').blur(function () {
		$('#NewsletterCaptchaBadge').fadeOut();
	});
});
