/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var appStorage = {
	defVars: {
		esFilterVip: 0,
		esResultCount: 0,

		load_events_type: 0,
		default_language: 'en'
	},

	setLanguage: function(lang) {
		localStorage.setItem('app_language', lang);
	},
	getLanguage: function() {
		var app_language = localStorage.getItem('app_language');
		if(app_language === null) {
			return this.defVars.default_language;
		} else {
			return app_language;
		}
	},

	setCurrentEvent: function(eid) {
		localStorage.setItem('app_current_event', eid);
	},
	getCurrentEvent: function() {
		return localStorage.getItem('app_current_event');
	},
	
	
	setEsFilterName: function(name) {
		localStorage.setItem('es_filterName', name);
	},
	getEsFilterName: function() {
		return localStorage.getItem('es_filterName');
	},
	setEsFilterPresent: function(present) {
		localStorage.setItem('es_filterPresent', present);
	},
	getEsFilterPresent: function() {
		return localStorage.getItem('es_filterPresent');
	},
	setEsFilterVip: function(vip) {
		localStorage.setItem('es_filterVip', vip);
	},
	getEsFilterVip: function() {
		es_filterVip = localStorage.getItem('es_filterVip');
		if(es_filterVip === null) {
			return this.defVars.esFilterVip;
		} else {
			return parseInt(es_filterVip);
		}
	},
	setEsResultCount: function(resultCount) {
		localStorage.setItem('es_rc', resultCount);
	},
	getEsResultCount: function() {
		es_rc = localStorage.getItem('es_rc');
		if(es_rc === null) {
			return this.defVars.esResultCount;
		} else {
			return parseInt(es_rc);
		}
	},
	
	setLoadEventsType: function(LET) {
		localStorage.setItem('load_events_type', LET);
	},
	getLoadEventsType: function() {
		load_events_type = localStorage.getItem('load_events_type');
		if(load_events_type === null) {
			return this.defVars.load_events_type;
		} else {
			return load_events_type;
		}
	}
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		app.translate();
        app.receivedEvent();
		$('#app-settings-load-events').val(appStorage.getLoadEventsType());
		$('#app-lang-select').val(appStorage.getLanguage());
		if(localStorage.getItem("LocalData") == null) {
			var data = [];
			data = JSON.stringify(data);
			localStorage.setItem("LocalData", data);
		}
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
		if(localStorage.getItem('token')===null) {
			show.login();
		} else {
			em.loadEvents('en');
		}
    },
	translate: function() {
		switch (appStorage.getLanguage()) {
			case 'en': lang = trans.en; break;
			case 'de': lang = trans.de; break;
			case 'sk': lang = trans.sk; break;
		}
		for (var key in lang) {
			$('.trans-' + key.replace('_', '-')).html(lang[key]);
		}
	}
};

var AppConst = {
	checkin: [
		{ icon: 'fa-question', btn: 'btn-info'},
		{ icon: 'fa-thumbs-o-up', btn: 'btn-success' },
		{ icon: 'fa-thumbs-o-down', btn: 'btn-warning'}
	]
};


//-------------------------------------------------------------------
var em = {
	ApiUrl: 'http://eventmanager.webaholix.sk/api/',
	GuestOrdering: 'ASC',
	GuestOffset: 0,
	ajaxRequest: function (data) {
		var request = {};
		if(data.request !== undefined) {
			request = data.request;
		}
		request.token = localStorage.getItem('token');
		$.ajax({
			url: this.ApiUrl + data.action,
			type: 'POST',
			data: request,
			dataType: 'json',
			success: data.response,
			error: function(error) {
				$('#app-error').html(error.responseText);
				show.error();
			}
		});
	},
	openSettings: function() {
		$('#app-settings').modal('show');
	},
	loadEvents: function() {
		this.ajaxRequest({
			action: 'get-events',
			request: {type: appStorage.getLoadEventsType()},
			response: this.loadEventsResponse
		});
	},
	loadEventsResponse: function(response) {
		if(response.status) {
			$("#app-event-list-content").html('');
			response.result.forEach(function(event){
				var eventRow = $('#app-event-list-template').clone();
				eventRow.find('.datavar-event-id').attr('data-eid', event.eid);
				eventRow.find('.var-event-name').html(event.name);
				eventRow.find('.var-event-start').html(event.start);
				eventRow.find('.var-event-end').html(event.end);
				eventRow.find('.var-event-place').html(event.place);
				eventRow.find('.var-event-id').val(event.eid);
				eventRow.find('.var-event-invited').html(event.invited);
				eventRow.find('.var-event-checked').html(event.checked);
				eventRow.find('.var-event-percentage').html(Math.round(100 * parseInt(event.checked) / parseInt(event.invited)));
				$("#app-event-list-content").append(eventRow.html());
			});
			show.eventList();
		} else {
			alert(response.error);
		}
	},
	openEvent: function(eid) {
		appStorage.setCurrentEvent(eid);
		em.ajaxRequest({
			action: 'open-event',
			request: {
				eid: appStorage.getCurrentEvent(),
				ordering: this.GuestOrdering,
				limit: appStorage.getEsResultCount(),
				offset: this.GuestOffset,
				filterVip: appStorage.getEsFilterVip(),
				filterPresent: appStorage.getEsFilterPresent(),
				filterName: appStorage.getEsFilterName()
			},
			response: em.openEventResponse
		});
		
	},
	openEventResponse: function(response) {
		if(response.status) {
			localStorage.setItem('currentEvent', JSON.stringify(response.event));
			$('#app-event-open').find('.var-event-name').html(response.event.title);
			$("#app-event-open-content").html('');
			response.guests.forEach(function(guest){
				var guestRow = $('#app-event-open-template').clone();
				guestRow.children('tr').attr('data-iid', guest.id);
				guestRow.find('.var-guest-name').html(guest.firstName + " " + guest.lastName);
				guestRow.find('.var-guest-plus').html(guest.plus);
				guestRow.find('.var-guest-vip').addClass(((guest.vip) ? 'icon-is-vip' : 'icon-no-vip'));
				guestRow.find('.var-guest-checkin').addClass(AppConst.checkin[guest.checkin].icon);
				guestRow.find('.var-guest-checkin').parent().addClass(AppConst.checkin[guest.checkin].btn);
				$("#app-event-open-content").append(guestRow.html());
			});
			show.eventOpen();
		} else {
			alert(response.error);
		}
	},
	guestDetail: function(iid) {
		this.ajaxRequest({
			action: 'guest-detail',
			request: {'iid': iid},
			response: this.guestDetailResponse
		});
	},
	guestDetailResponse: function(response) {
		if(response.status) {
			var template = $('#app-template-guest-detail').clone();
			template.find('.var-guestdetail-name').html(response.guest.title + " " + response.guest.firstName + " " + response.guest.lastName);
			template.find('.var-guestdetail-employer').html(response.guest.employer);
			template.find('.var-guestdetail-plus').html(response.guest.plus);
			template.find('.var-guestdetail-email').html(response.guest.email);
			template.find('.var-guestdetail-detail').html(response.guest.detail);
			$('#app-info').html(template.html());
			$('#app-info').modal('show');			
		} else {
			alert('error');
		}
	},
	checkGuest: function(iid) {
		this.ajaxRequest({
			action: 'guest-check',
			request: {iid: iid},
			response: this.checkGuestResponse
		});
	},
	checkGuestResponse: function(response) {
		if(response.status) {
			var button = $('#app-event-open-content tr[data-iid="' + response.iid + '"] .var-guest-checkin');
			button.attr('class', 'var-guest-checkin icon fa');
			button.addClass(AppConst.checkin[response.checkin].icon);
			button.parent().attr('class', 'btn');
			button.parent().addClass(AppConst.checkin[response.checkin].btn);
		}
	},
	login: function(formdata) {
		formdata.push({name: 'device', value: JSON.stringify(device)});
		this.ajaxRequest({
			action: 'login',
			request: formdata,
			response: this.loginResponse
		});
	},
	loginResponse: function(response) {
		if(response.status) {
			localStorage.setItem('token', response.token);
			em.loadEvents();
		} else {
			alert(response.error);
		}
	},
	logout: function() {
		localStorage.removeItem('token');
		show.login();
	}
};

//-------------------------------------------------------------------
var show = {
	containter: $("main"),
	navigation: $('#app-navigation'),
	hideAll: function() {
		this.containter.children('div').addClass('hidden');
		this.navigation.find('button').addClass('hidden');
	},
	error: function() {
		this.hideAll();
		this.containter.find('#app-error').removeClass('hidden');
		this.navigation.find('.app-nav-logout').removeClass('hidden');
	},
	login: function() {
		this.hideAll();
		this.containter.find('#app-login').removeClass('hidden');
		this.navigation.find('.app-nav-settings').removeClass('hidden');
	},
	eventList: function() {
		this.hideAll();
		this.containter.find('#app-event-list').removeClass('hidden');
		this.navigation.find('.app-nav-logout').removeClass('hidden');
		this.navigation.find('.app-nav-settings').removeClass('hidden');
	},
	eventOpen: function() {
		this.hideAll();
		this.containter.find('#app-event-open').removeClass('hidden');
		this.navigation.find('.app-nav-eventAddGuest').removeClass('hidden');
		this.navigation.find('.app-nav-eventSettings').removeClass('hidden');
		this.navigation.find('.app-nav-eventList').removeClass('hidden');
		this.navigation.find('.app-nav-logout').removeClass('hidden');
		this.navigation.find('.app-nav-settings').removeClass('hidden');
		this.navigation.find('#app-nav-scan-invitation').removeClass('hidden');
	}
};

var trans = {
	en: {
		langName: 'English',
		login_submit: 'LogIn',
		login_remember: 'Remember Me',
		logout: 'LogOut',
		control_loadEvents: 'Show Events',
		control_eventPrint: 'Print',
		control_guestShowAll: 'Show all',
		control_guestAddGuest: 'Add guest',
		control_guestPrint: 'Print',
		event_invited: 'guests invited',
		event_checked: 'guests checked',
		guest_name: 'Event',
		guest_institution: 'institution',
		guest_vip: 'VIP',
		guest_info: 'info',
		guest_check: 'check in',
		guest_detail: 'detail',
		search_filter: 'filter',
		search_present: 'present',
		search_absent: 'absent',
		search_vip: 'VIP',
		search_noVip: 'no VIP',
		search_all: 'all',
		
		eventDetail_place: 'Place',
		eventDetail_start: "Event's start",
		eventDetail_end: "Event's end",
		eventDetail_description: "Description",
		eventDetail_settings: "Settings",
		eventDetail_detail: "Detail",
		eventDetail_reset: "Reset",
		eventDetail_search: "Search",
		
		filter_esByName: 'Name filter',
		filter_esByPresent: 'Present filter',
		filter_esByVip: 'VIP filter',
		filter_esResultCount: 'Show ' + appStorage.getEsResultCount() + ' guests',

		settings_title: 'Settings',
		settings_language: 'Language'
	},
	de: {
		langName: 'Deutsch',
		login_submit: 'Anmeldung',
		login_remember: 'Merken mir? Or? :D',
		logout: 'Ausloggen',
		control_loadEvents: 'Veranstaltungen',
		control_eventPrint: 'Liste drucken',
		control_guestShowAll: 'Alle anzeigen',
		control_guestAddGuest: 'Gast anlegen',
		control_guestPrint: 'Liste drucken',
		event_invited: 'G&auml;ste geladen',
		event_checked: 'G&auml;ste eingecheckt',
		guest_name: 'Veranstaltung',
		guest_institution: 'Institution',
		guest_vip: 'VIP',
		guest_info: 'Info',
		guest_check: 'Check-In',
		guest_detail: 'Detail',
		search_filter: 'Filter',
		search_present: 'Anwesend',
		search_absent: 'Abwesend',
		search_vip: 'VIP',
		search_noVip: 'no VIP',
		search_all: 'alle',

		eventDetail_place: 'Ort',
		eventDetail_start: "Ereignisstart",
		eventDetail_end: "Ereignisende",
		eventDetail_description: "Beschreibung",
		eventDetail_settings: "Einstellungen",
		eventDetail_detail: "Detail",
		eventDetail_reset: "Zurücksetzen",
		eventDetail_search: "Suche",

		filter_esByName: 'Name-Filter',
		filter_esByPresent: 'Teilnahme-Filter',
		filter_esByVip: 'VIP-Filter',
		filter_esResultCount: 'Zeigen ' + appStorage.getEsResultCount() + ' Gäste',

		settings_title: 'Einstellungen',
		settings_language: 'Sprache'
	},
	sk: {
		langName: 'Slovenčina',
		login_submit: 'Prihlásiť',
		login_remember: 'Zapamätať',
		logout: 'Odhlásiť',
		control_loadEvents: 'Zobraziť eventy',
		control_eventPrint: 'Vytlačiť zoznam',
		control_guestShowAll: 'Ukáž všetkých',
		control_guestAddGuest: 'Pozvať hosťa',
		control_guestPrint: 'Tlačiť',
		event_invited: 'pozvaných hostí',
		event_checked: 'potvrdených hostí',
		guest_name: 'udalosť',
		guest_institution: 'spoločnosť',
		guest_vip: 'VIP',
		guest_info: 'info',
		guest_check: 'check',
		guest_detail: 'detail',
		search_filter: 'filter',
		search_present: 'prítomní',
		search_absent: 'neprítomní',
		search_vip: 'VIP',
		search_noVip: 'bez VIP',
		search_all: 'všetko',

		eventDetail_place: 'Miesto',
		eventDetail_start: "Začiatok",
		eventDetail_end: "Koniec",
		eventDetail_description: "Info",
		eventDetail_settings: "Nastavenia",
		eventDetail_detail: "Detail",
		eventDetail_reset: "Zrušiť filtre",
		eventDetail_search: "Vyhľadať",

		filter_esByName: 'Hľadať podľa mena',
		filter_esByPresent: 'Hľadať prítomných',
		filter_esByVip: 'Hľadať VIP',
		filter_esResultCount: 'Zobraziť ' + appStorage.getEsResultCount() + ' hostí',

		settings_title: 'Nastavenia',
		settings_language: 'Jazyk'
	}
};

var eventWindow = {
	modalSettings: $('#app-settings-event'),
	modalAddGuest: $('#app-event-addGuest'),
	formAddGuest: $('#app-add-guest-to-event-form'),
	hideAll: function() {
		this.modalSettings.find('.modal-body').addClass('hidden');
	},
	open: function() {
		var event = JSON.parse(localStorage.getItem('currentEvent'));
		this.modalSettings.find('.var-eventDetail-title').html(event.title);
		this.modalSettings.find('.var-eventDetail-place').html(event.place);
		this.modalSettings.find('.var-eventDetail-start').html(event.start);
		this.modalSettings.find('.var-eventDetail-end').html(event.end);
		this.modalSettings.find('.var-eventDetail-description').html(event.description);
		this.settings();
		this.modalSettings.modal('show');
	},
	detail: function() {
		this.hideAll();
		this.modalSettings.find('#modal-event-detail').removeClass('hidden');
	},
	settings: function() {
		this.hideAll();
		this.modalSettings.find('#modal-event-settings').removeClass('hidden');
		this.modalSettings.find('#app-es-guest-range').val(appStorage.getEsResultCount());
	},
	resetFilters: function() {
		appStorage.setEsFilterName('');
		appStorage.setEsFilterPresent(1);
		appStorage.setEsFilterVip(1);
		appStorage.setEsResultCount(0);
	},
	addGuest: function() {
		var event = JSON.parse(localStorage.getItem('currentEvent'));
		this.modalAddGuest.find('.var-eventDetail-title').html(event.title);
		this.modalAddGuest.modal('show');
	},
	handleAddGuestForm: function() {
		var event = JSON.parse(localStorage.getItem('currentEvent'));
		if(this.validateAddGuestForm()) {
			em.ajaxRequest({
				action: 'event-add-guest',
				request: {
					eid: event.eid,
					form: this.formAddGuest.serialize()
				},
				response: this.handleAddGuestFormResponse
			});
		} else {
			return false;
		}
	},
	handleAddGuestFormResponse: function(response) {
		if(response.status) {
			eventWindow.modalAddGuest.modal('hide');
			eventWindow.resetAddGuestForm();
			em.openEvent(appStorage.getCurrentEvent());
		} else {
			alert(response.error);
		}
	},
	validateAddGuestForm: function() {
		var valid = true;
		if(this.formAddGuest.find('input[name="firstName"]').val() === '') {
			this.formAddGuest.find('input[name="firstName"]').addClass('btn-danger');
			valid = false;
		}
		if(this.formAddGuest.find('input[name="lastName"]').val() === '') {
			this.formAddGuest.find('input[name="lastName"]').addClass('btn-danger');
			valid = false;
		}
		if(this.formAddGuest.find('input[name="email"]').val() === '') {
			this.formAddGuest.find('input[name="email"]').addClass('btn-danger');
			valid = false;
		}
		return valid;
	},
	resetAddGuestForm: function() {
		this.formAddGuest.find('input').removeClass('btn-danger');
		this.formAddGuest.find('input').val('');
	},
	scan: function() {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				if(!result.cancelled) {
					alert("Decoded text is: " + result.text);
				} else {
					alert("You have cancelled scan");
				}
			},
			function (error) {
				alert("Scanning failed: " + error);
			}
		);
	}
};