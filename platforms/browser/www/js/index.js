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
			show.eventList();
		}
    },
	ajaxCall: function(action, request) {
		$.ajax({
			url: 'http://eventmanager.webaholix.sk/api/' + action + '/',
			type: 'POST',
			data: {request: request},
			dataType: 'json',
			success: function (data) { app.ajaxResponse(data); },
			error: function(error) {
				alert(JSON.stringify(error));
			}
		});
	},
	ajaxResponse: function(response) {
		if(response.status === true) {
			switch(response.type) {
				case 'login': app.loginResponse(response.result, response.token); break;
				case 'loadEvents': app.loadEventResponse(response.result); break;
				case 'eventDetail': app.eventDetailResponse(response.result); break;
			}
		} else {
			alert('Error, wrong response!');
		}
	},
	loginResponse: function(result, token) {
		localStorage.setItem('token', token);
		show.eventList();
	},
	loadEventResponse: function(result) {
		var eventList;
		result.forEach(function(event) {
			eventList += '<tr data-event="' + event.eid + '">';
			eventList += '<td>' + event.name + '<br><strong>' + event.start + '</strong> / ' + event.place + '</td>';
			eventList += '<td class="info"><a href="javascript:app.openEvent('+event.eid+');"><i class="icon icon-list"></i></a></td>';
			eventList += '<td><strong>' + event.invited + '</strong> Gäste geladen<br>' + event.checked + ' Gäste eingecheckt (' + Math.round(100 * parseInt(event.checked) / parseInt(event.invited)) + '%)</td>';
			eventList += '</tr>';
		});
		$('#page-event-list tbody').html(eventList);
	},
	eventDetailResponse: function(result) {
		var guestList;
		result.forEach(function(guest){
			guestList += '<tr data-iid="' + guest.iid + '">';
			guestList += '<td>' + guest.lastname + '</td>';
			guestList += '<td>' + guest.firstname + '</td>';
			guestList += '<td>' + guest.title + '</td>';
			guestList += '<td>' + guest.employer + '</td>';
			guestList += '<td>' + guest.plus + '</td>';
			guestList += '<td>' + guest.vip + '</td>';
			guestList += '<td>+</td>';
			guestList += '<td><a href="javascript:app.changeCheckIn(' + guest.iid + ');">' + guest.checkin + '</a></td>';
			guestList += '</tr>';
		});
		$('#page-event-detail tbody').html(guestList);
		show.eventDetail();
	},
	login: function(loginData) {
		var request = {
			action: 'login',
			data: JSON.stringify(loginData),
			device: JSON.stringify(device)
		};
		app.ajaxCall('login', request);
	},
	loadEvents: function() {
		var request = {
			action: 'loadEvents',
			data: JSON.stringify({token: localStorage.getItem('token')}),
			device: JSON.stringify(device)
		};
		app.ajaxCall('login', request);
	},
	openEvent: function(eid) {
		var request = {
			action: 'eventDetail',
			data: JSON.stringify({
				token: localStorage.getItem('token'),
				eid: eid
			}),
			device: JSON.stringify(device)
		};
		app.ajaxCall('login', request);
	},
	changeCheckIn: function(iid) {
		alert(iid);
	}
};

var show = {
	login: function() {
		localStorage.removeItem('token');
		$('main').addClass('hidden');
		$('#page-login').removeClass('hidden');
	},
	eventList: function() {
		$('main').addClass('hidden');
		$('#page-event-list').removeClass('hidden');
		app.loadEvents();
	},
	eventDetail: function() {
		$('main').addClass('hidden');
		$('#page-event-detail').removeClass('hidden');
	}
};