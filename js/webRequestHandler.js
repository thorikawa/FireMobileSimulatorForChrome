/* ***** BEGIN LICENSE BLOCK Version: GPL 3.0 *****
 * FireMobileFimulator is a Firefox add-on that simulate web browsers of
 * japanese mobile phones.
 * Copyright (C) 2012  Takahiro Horikawa <horikawa.takahiro@gmail.com>
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

/**
 * We force "*xhtml*" content-type response to "text/html" response.
 * The reason is chrome browser interpret the xhtml response so strictly that many pages are not rendered properly.
 */
function onHeadersReceived (details) {
  var id = fms.pref.getPref("msim.current.id");
  var isSimulate = fms.core.isSimulate(util.getHost(details.url));
  if (!id || !isSimulate) return;

  var contentTypeHeader = getHeader(details.responseHeaders, "Content-Type");
  if (contentTypeHeader && contentTypeHeader.length > 0 && contentTypeHeader[0].value.match(new RegExp("xhtml"))) {
    contentTypeHeader[0].value = "text/html";
  }
  return {responseHeaders:details.responseHeaders};
};

/**
 * force to modify request URL according to carrier's spec.
 * For example we replace "uid" with our setting when query string "uid=NULLGWDOCOMO" is adreesed.
 */
function onBeforeRequest (details) {
  var id = fms.pref.getPref("msim.current.id");
  var isSimulate = fms.core.isSimulate(util.getHost(details.url));
  var pref_prefix = "msim.devicelist." + id;
  var carrier = fms.pref.getPref(pref_prefix + ".carrier");
  var useragent;
  var uid;
  var uri = details.url;
  
  if (!id || !isSimulate) return;
  
  if (carrier == "DC") {
    var rewriteFlag = false;
    var qs = "";

    var parts = uri.split("?");
    var params = {};
    if (parts.length == 2) {
      var sharps = parts[1].split('#');
      var values = sharps.shift().split("&");

      if (uri.scheme != "https") {
        // don't send uid to SSL page
        values = values.map(function (value) {
          if (value && value.toUpperCase() == "UID=NULLGWDOCOMO") {
            uid = fms.carrier.getId(fms.carrier.idType.DOCOMO_UID,id);
            //console.log("[msim]send uid:"+uid+" for docomo.");
            value = value.substr(0, 3) + "=" + uid;
            rewriteFlag = true;
          }
          return value;
        });
      }
      qs = new Array(values.join("&")).concat(sharps).join('#');
      as = parts[0] + "?" + qs;
    }

    var lcsFlag = fms.pref.getPref("msim.temp.lcsflag");
    if (true == lcsFlag) {
      console.log("[msim]add GPS info for docomo");
      var lat = fms.pref.getPref("msim.config.DC.gps.lat");
      var lon = fms.pref.getPref("msim.config.DC.gps.lon");
      var alt = fms.pref.getPref("msim.config.DC.gps.alt");
      if (parts.length >= 2) {
        if (parts[1]) {
          as += "&lat=" + lat + "&lon=" + lon
              + "&geo=wgs84&xacc=3&alt=" + alt;
        } else {
          as += "lat=" + lat + "&lon=" + lon
              + "&geo=wgs84&xacc=3&alt=" + alt;
        }
      } else {
        as += "?lat=" + lat + "&lon=" + lon
            + "&geo=wgs84&xacc=3&alt=" + alt;
      }
      rewriteFlag = true;
      pref.setBoolPref(
          "msim.temp.lcsflag", false);
    }

    if (uri.host == "w1m.docomo.ne.jp") {
      var param = qs ? "?" + qs : "";
      var path = uri.path.split("?", 2)[0];
      if (path == "/cp/iarea") {
        // TODO: Open iAREA
        // rewriteURI(details,
        //    "chrome://msim/content/html/dc_openiarea.html"
        //        + param);
      }
    } else if (rewriteFlag) {
      console.log("redirect to [" + as + "]");
      return {redirectUrl:as};
    }
  }
};

function onBeforeSendHeaders (details) {

  var id;
  var carrier;

  // set id and carrier
  var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
  if (tabselect_enabled) {
    // TODO
  } else {
    id = fms.pref.getPref("msim.current.id");
    var pref_prefix = "msim.devicelist." + id;
    carrier = fms.pref.getPref(pref_prefix + ".carrier");
    //console.log(carrier+":"+id);
    // TODO: ホスト制限に端末が指定されていればそれを優先する
    if(id){
      // TODO: ホスト制限に設定されている端末情報を取得する
      var deviceObj = fms.core.getDeviceByLimitHost(util.getHost(details.url));
      if(deviceObj){
        id = deviceObj.index;
        pref_prefix = "msim.devicelist." + id;
        carrier = fms.pref.getPref(pref_prefix + ".carrier");
      }
    }
  }


  var isSimulate = fms.core.isSimulate(util.getHost(details.url));

  if (!id || !isSimulate) return;

  var useragent = fms.pref.getPref(pref_prefix + ".useragent");
  if (fms.carrier.SOFTBANK == carrier) {
    useragent = fms.carrier.getSoftBankUserAgent(useragent, id);
  }else if (fms.carrier.DOCOMO == carrier) {
    useragent = fms.carrier.getDoCoMoUserAgent(useragent, id);
  }

  setHeader(details.requestHeaders, "x-msim-use", "on");

  var uri = details.url;
  //console.log("[msim]uri=[" + uri + "]");

  if (carrier == "DC") {

    var ser = fms.carrier.getId(fms.carrier.idType.DOCOMO_SER,id);
    var icc = fms.carrier.getId(fms.carrier.idType.DOCOMO_ICC,id);
    var guid = fms.carrier.getId(fms.carrier.idType.DOCOMO_GUID,id);

    // change User-Agent for UTN
    var utnFlag = fms.pref.getPref("msim.temp.utnflag");
    if (true == utnFlag) {
      // DoCoMo2.0
      var useragentTmp = useragent
          .match(/DoCoMo\/2\.0[^(]+\((?:[^;]*;)*[^)]*(?=\))/);
      if (useragentTmp) {
        console.log("##add utn match1 for DoCoMo2.0##");
        useragent = useragentTmp[0] + ";ser" + ser + ";icc" + icc + ")";
      }

      // DoCoMo1.0
      useragentTmp = useragent.match(/DoCoMo\/1\.0\/.+/);
      if (useragentTmp) {
        console.log("##add utn match for DoCoMo1.0##");
        useragent = useragentTmp[0] + "/ser" + ser;
      }
    }

    // parse query string
    var parts = uri.split("?");
    var params = {};
    if (parts.length == 2) {
      var sharps = parts[1].split('#');
      var values = sharps.shift().split("&");

      if (uri.scheme != "https") {
        // don't send guid to SSL page
        values = values.map(function (value) {
          if (value && value.toUpperCase() == "GUID=ON") {
            console.log("[msim]send guid:"+guid+" for docomo.");
            setHeader(details.requestHeaders, "X-DCMGUID", guid);
          }
          return value;
        });
      }
    }

    // TODO: this code have to be changed for SmartPhone
    // var useCookie = fms.pref.getPref("msim.devicelist."+id+".use-cookie");
    // if (!useCookie) {
    //  console.log("cookie is disabled");
    //  setHeader(details.requestHeaders, "Cookie", null);
    //}

  } else if (carrier == "SB") {
    var type = fms.pref.getPref("msim.devicelist."+id+".type1");
    if(type != "iPhone"){
      var sbUid = fms.carrier.getId(fms.carrier.idType.SB_UID,id);
      setHeader(details.requestHeaders, "x-jphone-uid",sbUid);
    }
  } else if (carrier == "AU") {
    var auUid = fms.carrier.getId(fms.carrier.idType.AU_UID,id);
    setHeader(details.requestHeaders, "x-up-subno", auUid);

    if (uri.host == "movie.ezweb.ne.jp") {
      console.log("host is mos. rewrite URI.");
      var path = uri.path;
      console.log("#Au path:" + path);
      var parts = path.split("?");
      var param = parts.length == 2 ? "?" + parts[1] : "";
      rewriteURI(details,
          "chrome://msim/content/html/au_mos.html?"
              + parts[0]);
    }
  }

  setHeader(details.requestHeaders, "User-Agent", useragent);
  // set extra http headers
  var extraHeaders = fms.pref.getListPref("msim.devicelist." + id
          + ".extra-header", ["name", "value"]);
  extraHeaders.forEach(function (extraHeader) {
    if (extraHeader.value) {
      setHeader(details.requestHeaders, extraHeader.name, extraHeader.value);
    }
  });
  return {requestHeaders:details.requestHeaders};
}

/**
 * get single header object whose header name matches the input from headers
 */
function getHeader (headers, name) {
  if (!name) return;
  var header = $.grep(headers, function (e, i) {
    if (e.name.toUpperCase() == name.toUpperCase()) {
      return true;
    } else {
      return false;
    }
  });
  return header;
}

/**
 * replace header if exist and append header if not exist
 */
function setHeader (headers, name, value) {
  if (undefined == name) {
      return;
  }
  if (undefined == value) {
      value = "";
  }
  console.log("set header [" + name + "]=[" + value + "]");
  var find = false;
  $.each(headers, function (i, e) {
      if (e.name.toUpperCase() == name.toUpperCase()) {
        e.value = value;
        headers[i].value = value;
        find = true;
      }
      return;
  });
  if (!find) {
    headers.push({name: name, value: value});
  }
}

function rewriteURI(details, url) {
  // TODO
  console.log("rewrite:" + url);
}
