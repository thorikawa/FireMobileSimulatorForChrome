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

var fms;
if(!fms) fms = {};

fms.pref = {

  getPref : function (key) {
    var value = localStorage[key];
    if (value == "null") return null;
    if (value == "undefined") return undefined;
    if (typeof value == "string" && value.toUpperCase() == "TRUE") return true;
    if (typeof value == "string" && value.toUpperCase() == "FALSE") return false;
    return value;
  },
  
  getIntPref : function (key) {
    var value = localStorage[key];
    if (!isNaN(value)) return parseInt(value);
    return 0;
  },
  
  setPref : function (key, value) {
    console.log("setPref["+key+"]=["+value+"]");
    localStorage[key] = value;
  },
  
  /**
   * delete preference whose key completely matches the input
   */
  deletePref : function (key) {
    if (localStorage[key]) {
      localStorage.removeItem(key);
    }
  },

  /**
   * delete preference whose key matches the input as regular expression
   */
  deleteAllPref : function (keyRegExp) {
    for (var key in localStorage) {
      if (key.match(keyRegExp)) {
        this.deletePref(key);
      }
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
