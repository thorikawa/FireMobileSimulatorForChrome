/* ***** BEGIN LICENSE BLOCK Version: GPL 3.0 *****
 * FireMobileFimulator is a Firefox add-on that simulate web browsers of
 * japanese mobile phones.
 * Copyright (C) 2008  Takahiro Horikawa <horikawa.takahiro@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK ***** */

var firemobilesimulator;
if(!firemobilesimulator) firemobilesimulator = {};
var fms;
if(!fms) fms = firemobilesimulator;
if(!fms.common) fms.common = {};

firemobilesimulator.common.pref = {

	getPref : function (preference) {
		return localStorage[preference];
	},
	
	setPref : function (key, value) {
		localStorage[key] = value;
	},
	
	deletePref : function (preference) {
		if (localStorage[preference]) {
			localStorage[preference]=null;
		}
	},

	getListPref : function (parentPreferenceName, childPreferenceNameArray) {
		var count = localStorage[parentPreferenceName+".count"] || 0;
		var resultArray = new Array(count);
		for (var i = 1; i <= count; i++){
			var o = {};
			o.id = i;
			childPreferenceNameArray.forEach(function (childPreferenceName) {
				var childPreferenceValue = localStorage[parentPreferenceName + "." + i + "." + childPreferenceName];
				o[childPreferenceName] = childPreferenceValue;
			});
			resultArray[i-1] = o;
		}
		return resultArray;
	},

	deleteListPref : function (parentPreferenceName, childPreferenceNameArray) {
		var count = localStorage[parentPreferenceName+".count"];
		for (var i = 1; i <= count; i++) {
			for (var j = 0; j < childPreferenceNameArray.length; j++) {
				var childPreferenceName = childPreferenceNameArray[j];
				console.log("delete:"+parentPreferenceName+"."+i+"."+childPreferenceName+"\n");
				this.deletePref(parentPreferenceName+"."+i+"."+childPreferenceName);
			}
		}
		console.log("delete:"+parentPreferenceName+".count"+"\n");
		this.deletePref(parentPreferenceName+".count");
		return;
	}
};
