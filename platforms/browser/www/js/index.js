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
		app.translate('en');
        app.receivedEvent();
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
		if(localStorage.getItem('token')===null) {
			show.login();
		} else {
			em.loadEvents('en');
		}
    },
	translate: function(ln) {
		switch (ln) {
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
		{
			icon: 'fa-question',
			btn: 'btn-info'
		},
		{
			icon: 'fa-thumbs-o-up',
			btn: 'btn-success'
		},
		{
			icon: 'fa-thumbs-o-down',
			btn: 'btn-warning'
		}
	]
};


//-------------------------------------------------------------------
var em = {
	ApiUrl: 'http://eventmanager.webaholix.sk/api/',
	GuestOrdering: 'ASC',
	GuestLimit: 10,
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
		this.GuestLimit = 10;
		this.ajaxRequest({
			action: 'open-event',
			request: {
				eid: eid,
				ordering: this.GuestOrdering,
				limit: this.GuestLimit,
				offset: this.GuestOffset
			},
			response: this.openEventResponse
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
		this.navigation.find('.app-nav-eventSettings').removeClass('hidden');
		this.navigation.find('.app-nav-eventList').removeClass('hidden');
		this.navigation.find('.app-nav-logout').removeClass('hidden');
		this.navigation.find('.app-nav-settings').removeClass('hidden');
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

		settings_title: 'Nastavenia',
		settings_language: 'Jazyk'
	}
};

var eventWindow = {
	modal: $('#app-settings-event'),
	hideAll: function() {
		this.modal.find('.modal-body').addClass('hidden');
	},
	open: function() {
		var event = JSON.parse(localStorage.getItem('currentEvent'));
		this.modal.find('.var-eventDetail-title').html(event.title);
		this.modal.find('.var-eventDetail-place').html(event.place);
		this.modal.find('.var-eventDetail-start').html(event.start);
		this.modal.find('.var-eventDetail-end').html(event.end);
		this.modal.find('.var-eventDetail-description').html(event.description);
		this.detail();
		this.modal.modal('show');
	},
	detail: function() {
		this.hideAll();
		this.modal.find('#modal-event-detail').removeClass('hidden');
	},
	settings: function() {
		this.hideAll();
		this.modal.find('#modal-event-settings').removeClass('hidden');
	}
};