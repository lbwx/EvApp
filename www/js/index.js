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
	ajaxCall: function(action, param) {
		var request = {
			action: action,
			data: param,
			device: device,
			token: localStorage.getItem('token')
		};

		$.ajax({
			url: 'http://eventmanager.webaholix.sk/api/',
			type: 'POST',
			data: {request: JSON.stringify(request)},
			dataType: 'json',
			success: function (data) { app.ajaxResponse(data); },
			error: function(error) {
				alert("ERROR!");
				$('body').html(error.responseText);
			}
		});
	},
	ajaxResponse: function(response) {
		if(response.status === true) {
			switch(response.type) {
				case 'login': app.loginResponse(response.result, response.token); break;
				case 'loadEvents': app.loadEventResponse(response.result); break;
				case 'eventDetail': app.eventDetailResponse(response.result); break;
				case 'changeCheckIn': app.changeCheckInResponse(response.result); break;
				case 'guestDetail': app.guestDetailResponse(response.result); break;
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
			guestList += '<td>' + ((guest.title === null) ? '' : guest.title) + '</td>';
			guestList += '<td>' + guest.employer + '</td>';
			guestList += '<td>' + guest.plus + '</td>';
			guestList += '<td><i class="icon ' + (guest.vip ? 'icon-is-vip' : 'icon-no-vip') + '"></i></td>';
			guestList += '<td><a href="javascript:app.openGuestDetail(' + guest.iid + ');"><i class="icon icon-info-open"></i></a></td>';
			guestList += '<td class="app-checkin"><a href="javascript:app.changeCheckIn(' + guest.iid + ');"><i class="icon icon-' + (guest.checkin ? 'checked':'unchecked') + '"></i></a></td>';
			guestList += '</tr>';
		});
		$('#page-event-detail tbody').html(guestList);
		show.eventDetail();
	},
	changeCheckInResponse: function(result) {
		$('#page-event-detail tr[data-iid="' + result.iid + '"] .app-checkin a').html('<i class="icon icon-' + (result.checkIn ? 'checked':'unchecked') + '"></i>');
	},
	guestDetailResponse: function(result) {
		$('#app-info .modal-title').html(result.header);
		$('#app-info .modal-body').html(createHtml.guestDetail(result));
		$('#app-info').modal('show');
	},
	login: function(loginData) {
		app.ajaxCall('login', loginData);
	},
	loadEvents: function() {
		app.ajaxCall('loadEvents', null);
	},
	openEvent: function(eid) {
		app.ajaxCall('eventDetail', {eid: eid});
	},
	changeCheckIn: function(iid) {
		app.ajaxCall('changeCheckIn', {iid: iid});
	},
	openGuestDetail: function(iid) {
		app.ajaxCall('guestDetail', {iid: iid});
	}
};

var createHtml = {
	guestDetail: function (data) {
		var structure = [
			['name: ', data.title + ' ' + data.firstName + ' ' + data.lastName],
			[data.employer, data.plus]
		];
		return this.tableStructure(structure);
	},
	tableStructure: function(structure) {
		var rows = '';
		structure.forEach(function(row){
			var cols = '';
			row.forEach(function(col){
				cols += createHtml.wrapTd(col);
			});
			rows += createHtml.wrapTr(cols);
		});
		return createHtml.wrapTable(rows);
	},
	wrapTable: function(content){
		return '<table class="table table-responsive">' + content + '</table>';
	},
	wrapTr: function(content){
		return '<tr>' + content + '</tr>';
	},
	wrapTd: function(content) {
		return '<td>' + content + '</td>';
	},
	wrapByElement: function(con,ele,cla) {
		return '<' + ele + ((cla !== null) ? ' class="' + cla + '"' : '') + '>' + con + '</' + ele + '>';
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