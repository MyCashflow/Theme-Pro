/**
 * MyCashflow Default Theme
 * Copyright (c) 2015 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 */
;(function () {
	'use strict';

	var Locales = {
		en: {
			close: 'Close',
			expandImage: 'Expand image',
			loading: 'Loading...',
			orderCommentSaved: 'Order comment saved.',
			updating: 'Updating...',
			updatingCart: 'Updating cart...',
			updatingCheckout: 'Updating checkout...',
			next: 'Next',
			previous: 'Previous',
			search: 'Search'
		},

		fi: {
			close: 'Sulje',
			expandImage: 'Näytä suurempana',
			loading: 'Ladataan...',
			orderCommentSaved: 'Kommenttisi on tallennettu.',
			updating: 'Päivitetään...',
			updatingCart: 'Ostoskoria päivitetään...',
			updatingCheckout: 'Kassaa päivitetään...',
			next: 'Seuraava',
			previous: 'Edellinen',
			search: 'Haku'
		},

		get: function (key) {
			var locale = window.MCF.locale.toLowerCase();
			return !!this[locale] ? this[locale][key] : this.en[key];
		}
	};

	$.extend(true, window, { MCF: { Locales: Locales }});
})();
