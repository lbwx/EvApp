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
        app.receivedEvent();
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
		if(localStorage.getItem('token')===null) {
			show.login();
		} else {
			em.loadEvents();
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
	openEvent: function(element) {
		this.GuestLimit = 10;
		this.ajaxRequest({
			action: 'open-event',
			request: {
				eid: element.val(),
				ordering: this.GuestOrdering,
				limit: this.GuestLimit,
				offset: this.GuestOffset
			},
			response: this.openEventResponse
		});
		
	},
	openEventResponse: function(response) {
		if(response.status) {
			$('#app-event-open').find('.var-event-name').html(response.event);
			$("#app-event-open-content").html('');
			response.guests.forEach(function(guest){
				var guestRow = $('#app-event-open-template').clone();
				guestRow.children('tr').attr('data-iid', guest.id);
				guestRow.find('.var-guest-name').html(guest.firstName + " " + guest.lastName);
				guestRow.find('.var-guest-employer').html(guest.employer);
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
	hideAll: function() {
		$("main").children('div').addClass('hidden');
	},
	error: function() {
		this.hideAll();
		$('#app-error').removeClass('hidden');
	},
	login: function() {
		this.hideAll();
		$('.app-nav').addClass('hidden');
		$('#app-login').removeClass('hidden');
	},
	eventList: function() {
		this.hideAll();
		$('.app-nav-eventlist').addClass('hidden');
		$('.app-nav-logout').removeClass('hidden');
		$('#app-event-list').removeClass('hidden');
	},
	eventOpen: function() {
		this.hideAll();
		$('.app-nav-eventlist').removeClass('hidden');
		$('#app-event-open').removeClass('hidden');
	}
};