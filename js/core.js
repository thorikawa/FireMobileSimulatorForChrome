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
if (!firemobilesimulator) firemobilesimulator = {};
var fms;
if (!fms) fms = firemobilesimulator;
if (!fms.core) fms.core = {};
core = fms.core;

fms.core.resetDevice = function (e) {
  var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
  if (tabselect_enabled) {
    // TODO tab specific setting
  } else {
    fms.pref.deletePref("msim.current.carrier");
    fms.pref.deletePref("msim.current.id");
    fms.core.updateIcon();
  }
};

fms.core.setDevice = function (id) {

  //console.log("[msim]setDevice:" + carrier + ",id:" + id + "\n");

  if (!id) {
    console.log("[msim]Error : the attribute which you have selected is insufficient.\n");
    return;
  }

  var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
  if (tabselect_enabled) {
    // TODO tab specific setting
  } else {
    var pref_prefix = "msim.devicelist." + id;
    var carrier = fms.pref.getPref(pref_prefix + ".carrier");

    fms.pref.setPref("msim.current.carrier", carrier);
    fms.pref.setPref("msim.current.id", id);
    fms.core.updateIcon();
  }
};

/**
 * 指定されたIDの端末を削除する
 */
fms.core.deleteDevice = function (deletedId) {
  var prefPrefix = "msim.devicelist." + deletedId + ".";
  var deletedDeviceId = fms.pref.getPref(prefPrefix+"device-id");
  fms.carrier.deviceBasicAttribute.forEach(function (attribute) {
    fms.pref.deletePref(prefPrefix+attribute);
  });

  //ホストの端末指定も削除する
  fms.core.deleteLimitHostDeviceByDeviceId(deletedDeviceId);

  //各端末のidを再計算
  var count = fms.pref.getPref("msim.devicelist.count");
  for (var i=deletedId+1; i<=count; i++) {
    var sPrefPrefix = "msim.devicelist." + i + ".";
    var ePrefPrefix = "msim.devicelist." + (i-1) + ".";
    fms.carrier.deviceBasicAttribute.forEach(function(attribute) {
      if (attribute == "extra-header") {
        var extraHeaders = fms.pref.getListPref(sPrefPrefix + "extra-header", ["name", "value"]);
        extraHeaders.forEach(function (extraHeader) {
          if (extraHeader.value) {
            fms.pref.setPref(ePrefPrefix + "extra-header." + extraHeader.id + ".name", extraHeader.name);
            fms.pref.setPref(ePrefPrefix + "extra-header." + extraHeader.id + ".value", extraHeader.value);
            fms.pref.deletePref(sPrefPrefix + "extra-header." + extraHeader.id + ".name");
            fms.pref.deletePref(sPrefPrefix + "extra-header." + extraHeader.id + ".value");
          }
        });
        fms.pref.setPref(ePrefPrefix + "extra-header.count", extraHeaders.length);
        fms.pref.setPref(sPrefPrefix + "extra-header.count", 0);
      } else if (attribute == "use-cookie") {
        fms.pref.setPref(ePrefPrefix+attribute, fms.pref.getPref(sPrefPrefix+attribute));
        fms.pref.deletePref(sPrefPrefix+attribute);
      } else {
        fms.pref.setPref(ePrefPrefix+attribute, fms.pref.getPref(sPrefPrefix+attribute));
        fms.pref.deletePref(sPrefPrefix+attribute);
      }
    });
  }
  fms.pref.setPref("msim.devicelist.count", count-1);

  // 現在選択されている端末IDの付け替え、または既に使われている端末だったら設定をリセット
  var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
  if (tabselect_enabled) {
  	// TODO tab specific setting
  } else {
    var id = fms.pref.getPref("msim.current.id");
    if (id > deletedId) {
      fms.pref.setPref("msim.current.id", id-1);
    } else if (id == deletedId) {
      fms.core.resetDevice();
    }
  }
};

fms.core.deleteLimitHost = function (deletedId) {

  var prefKey = "msim.limitHost." + deletedId + ".value";
  fms.pref.deletePref(prefKey);

  //ホスト制限に指定している端末IDも削除する
  var prefKey = "msim.limitHost." + deletedId + ".device-id";
  fms.pref.deletePref(prefKey);

  //idを再計算
  var count = fms.pref.getPref("msim.limitHost.count");
  for (var i=deletedId+1; i<=count; i++) {
    var sPrefKey = "msim.limitHost." + i + ".value";
    var ePrefKey = "msim.limitHost." + (i-1) + ".value";

    fms.pref.setPref(ePrefKey, fms.pref.getPref(sPrefKey));
    fms.pref.deletePref(sPrefKey);

    //ホスト制限に指定している端末IDも移動させる
    sPrefKey = "msim.limitHost." + i + ".device-id";
    ePrefKey = "msim.limitHost." + (i-1) + ".device-id";

    fms.pref.setPref(ePrefKey, fms.pref.getPref(sPrefKey));
    fms.pref.deletePref(sPrefKey);
  }
  fms.pref.setPref("msim.limitHost.count", count-1);
};

fms.core.updateIcon = function () {
  //TODO notify update icon
  var id = fms.pref.getPref("msim.current.id");
  if (id) {
    
  } else {

  }
/*
  while (windowEnumeration.hasMoreElements()) {
    var windowObj = windowEnumeration.getNext();
    var msimButton = windowObj.document.getElementById("msim-button");
    var menu = windowObj.document.getElementById("msim-menu");
    var target = [msimButton, menu];
    target.forEach(function(item) {
      if (item) {
        var id = fms.pref.getPref("msim.current.id");
        if (!id) {
          item.removeAttribute("device");
        } else {
          item.setAttribute("device", "on");
        }
      }
    });
  }
*/
};

fms.core.parseDeviceListXML = function (filePath, postData) {
  var request = new XMLHttpRequest();
  var xmlDocument = null;

  if (postData) {
    console.log("try post:"+postData+"\n");
    request.open("post", filePath, false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(postData);
  } else {
    console.log("try get:"+filePath+"\n");
    request.open("get", filePath, false);
    request.send(null);
  }

  var xmlDocumentNode = request.responseXML;
  if (!xmlDocumentNode) return;
  var xmlDocumentElement = xmlDocumentNode.documentElement;
  if (xmlDocumentNode.nodeName == "parsererror") return;

  var deviceResults = null;
  var deviceElement = null;
  var xPathEvaluator = new XPathEvaluator();
  var resolver = xPathEvaluator.createNSResolver(xmlDocumentElement);
  deviceResults = xPathEvaluator.evaluate("//DeviceList/Device",
      xmlDocumentNode, resolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null);
  if (deviceResults.length == 0) return;

  //XMLから端末情報を順次解析
  var devices = new Array();
  var i = 0;
  while ((deviceElement = deviceResults.iterateNext()) != null) {
    devices[i] = {};
    fms.carrier.deviceBasicAttribute.forEach(function (key) {
      if (key == "extra-header") {
        var headerResults = xPathEvaluator.evaluate("ExtraHeaders/Header",
            deviceElement, resolver,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var headerElement = null;

        //ExtraHeaderエレメントの取得
        var headers = new Array();
        var j = 0;
        while ((headerElement = headerResults.iterateNext()) != null) {
          var name = xPathEvaluator.evaluate("Name", headerElement, resolver,
              XPathResult.STRING_TYPE, null).stringValue;
          var value = xPathEvaluator.evaluate("Value", headerElement,
              resolver, XPathResult.STRING_TYPE, null).stringValue;
          headers[j] = {
            name : name,
            value : value
          };
          j++;
        }
        devices[i]["headers"] = headers;
      } else {
        var tagName = fms.carrier.xmlTagName[key];
        var value = xPathEvaluator.evaluate(tagName, deviceElement,
            resolver, XPathResult.STRING_TYPE, null).stringValue;
        if (tagName == "Carrier") {
          value = fms.core.isValidCarrier(value) ? value : fms.core.getCarrierCode(value);
        }
        devices[i][key] = value;
      }
    });
    i++;
  }
  return devices;
};

fms.core.LoadDevices = function (devices, overwrite) {
  var currentId = 0;
  if (!overwrite) {
    currentId = fms.pref.getPref("msim.devicelist.count");
    if (isNaN(currentId)) currentId = 0;
  }
  // update preference
  overwrite && firemobilesimulator.options.clearAllDeviceSettings();
  devices.forEach(function (device) {
    var id = ++currentId;
    var carrier = device.carrier;
    for (var key in device) {
      var value = device[key];
      if (key == "headers") {
        var i = 1;
        value.forEach(function (header) {
          fms.pref.setPref("msim.devicelist." + id + ".extra-header." + i + ".name", header.name);
          fms.pref.setPref("msim.devicelist." + id + ".extra-header." + i + ".value", header.value);
          i++;
        });
        fms.pref.setPref("msim.devicelist." + id + ".extra-header.count", value.length);
      } else if (key == "id") {
      } else if (key == "use-cookie") {
        fms.pref.setPref("msim.devicelist." + id + "." + key, value);
      } else {
        fms.pref.setPref("msim.devicelist." + id + "." + key, value);
      }
    }
  });

  //set device count
  fms.pref.setPref("msim.devicelist.count", currentId);
  return true;
};

fms.core.getCarrierCode = function (carrierName) {
  var carrierCode = fms.carrier[carrierName.toUpperCase()];
  return carrierCode || fms.carrier.OTHER;
};

fms.core.isValidCarrier = function (carrierCode) {
  return fms.carrier.carrierArray.some(function (c) { return carrierCode == c; });
};

fms.core.refreshRegisteredDevices = function () {
  var deviceCount = fms.pref.getPref("msim.devicelist.count");
  fms.core.deviceIdArray = new Array();
  for (var i = 1; i <= deviceCount; i++) {
    var deviceId = fms.pref.getPref("msim.devicelist." + i + ".device-id");
    if(deviceId) {
      fms.core.deviceIdArray.push(deviceId);
    }
  }
};

fms.core.getRegisteredDevices = function () {
  if(!fms.core.deviceIdArray) {
    fms.core.refreshRegisteredDevices();
  }
  return fms.core.deviceIdArray;
};

fms.core.isRegistered = function (deviceId, refreshFlag) {
  return fms.core.getRegisteredDevices().some(function (_deviceId) {
    return _deviceId == deviceId;
  });
};

fms.core.clearAllDevice = function () {
  var reg = new RegExp("^msim\.devicelist\..+");
  fms.pref.deleteAllPref(reg);
  fms.pref.deletePref("msim.current.carrier");
  fms.pref.deletePref("msim.current.id");
  // load initial data again
  // "data" is a global variable from /js/initialData.js
  var len = data.length;
  for (var i = 0; i<len; i++) {
    var name = data[i].name;
    if (name.match(reg)) {
      fms.pref.setPref(data[i].name, data[i].value);
    }
  }
  fms.core.resetDevice();
};

fms.core.isSimulate = function (hostName) {
  var isSimulate = true;
  var limithost_enabled = fms.pref.getPref("msim.limitHost.enabled");
  if (limithost_enabled) {
    var id = fms.pref.getPref("msim.current.id");
    var limitHosts = fms.pref.getListPref("msim.limitHost",new Array("value"));
    isSimulate = limitHosts.some(function (limitHost, index, array) {
      // console.log("[msim]compare:"+limitHost.value+":"+hostName+"\n");
      return (limitHost.value && hostName.match(limitHost.value));
    });
  }
  return isSimulate;
}

//msim.devicelist.X.device-idが一致するデバイスを返す
fms.core.getDeviceByDeviceId = function (deviceId){
  var deviceCount = fms.pref.getPref("msim.devicelist.count");
  var deviceIndex = -1;

  for(var i = 1; i <= deviceCount; i++){
    var _deviceId = fms.pref.getPref("msim.devicelist." + i + ".device-id");
    if(_deviceId == deviceId){
      deviceIndex = i;
      break;
    }
  }

  if(deviceIndex == -1){
    return null;
  }

  var ret = {};
  ret.id = deviceId;
  ret.index = deviceIndex;
  ret.label = fms.pref.getPref("msim.devicelist." + deviceIndex + ".label");
  ret.carrier = fms.pref.getPref("msim.devicelist." + deviceIndex + ".carrier");
  return ret;
}

//msim.limithost.X.valueがhostNameに一致するものをを探して、
//そのホスト制限に指定されている端末情報を返す
fms.core.getDeviceByLimitHost = function (hostName) {
  var limithost_enabled = fms.pref.getPref("msim.limitHost.enabled");
  if(! limithost_enabled){
    return null;
  }

  var count = fms.pref.getPref("msim.limitHost.count");
  for(var i = 1; i <= count; i++){
   var host = fms.pref.getPref("msim.limitHost." + i + ".value");
   if(hostName.match(host)){
     var deviceId = fms.pref.getPref("msim.limitHost." + i + ".device-id");
     return fms.core.getDeviceByDeviceId(deviceId);
   }
  }

  return null;
}

//ホスト制限に指定されている端末でdeviceIdと一致する物を削除する
fms.core.deleteLimitHostDeviceByDeviceId = function (deviceId) {
  var count = fms.pref.getPref("msim.limitHost.count");
  for(var i = 1; i <= count; i++){
    var _deviceId = fms.pref.getPref("msim.limitHost." + i + ".device-id");
    if(_deviceId == deviceId){
      fms.pref.setPref("msim.limitHost." + i + ".device-id", "-1");
    }
  }
}
