  var appData = {};
  
  function onInstall () {
    console.log("Extension Installed");
    $.each(data, function (i, e) {
      fms.pref.setPref(e.name, e.value);
    });
  }

  function onUpdate () {
    console.log("Extension Updated");
  }

  function getVersion () {
    var details = chrome.app.getDetails();
    return details.version;
  }

  $(document).ready(function () {
    console.log("ready");
    chrome.webRequest.onBeforeRequest.addListener(
      onBeforeRequest,
      opt_filter,
      ["blocking"]);
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      opt_filter,
      blockingInfoSpec);
    chrome.webRequest.onHeadersReceived.addListener(
      onHeadersReceived,
      opt_filter,
      ["responseHeaders", "blocking"]);
    // Check if the version has changed.
    var currVersion = getVersion();
    var prevVersion = localStorage['version']
    if (currVersion != prevVersion) {
      // Check if we just installed this extension.
      if (typeof prevVersion == 'undefined') {
        onInstall();
      } else {
        onUpdate();
      }
      localStorage['version'] = currVersion;
    }

    // update icon here because the first tab can't be caught in chrome.tabs.onActiveChanged
    fms.core.updateIcon();
  });

  var dolog = true;
  var uaPerTab = new Array();
  var opt_filter = { urls:["*://*/*"] };
  var blockingInfoSpec = ["requestHeaders", "blocking"];
  var activeTabId;

  function tabIsActive(tabId, selectInfo) {
    if (dolog) {
      console.log("(tabIsActive) tab is active:tabId" + tabId + " with selectInfo:" + selectInfo);
    }
    activeTabId = tabId;
    var id = fms.pref.getPref("msim.current.id");
    //var uaOfTab = uaPerTab[tabId];
    if (id) {
      chrome.browserAction.setIcon({path:'ua.png'});
      //changeUserAgent(uaOfTab);
    } else {
      chrome.browserAction.setIcon({path:'ua-disabled.png'});
      //changeUserAgent(originalUa);
    }
  }
  chrome.tabs.onActiveChanged.addListener(tabIsActive);

  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    server[request.name](request, sender, sendResponse);
  });

var server = {
  deviceInfo: function (request, sender, sendResponse) {
    var carrier;
    var id;
    var width;
    var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
    var forceScreenWidth = fms.pref.getPref("msim.config.general.force-screen-width");
    var uid;
    if (tabselect_enabled) {
      // TODO get carrier and id for this tab
    } else {
      id = fms.pref.getPref("msim.current.id");
      carrier = fms.pref.getPref("msim.devicelist." + id + ".carrier");
      width = fms.pref.getPref("msim.devicelist." + id + ".screen-width")
                  || fms.pref.getPref("msim.config.general.screen-width-default");
      uid = fms.carrier.getId(fms.carrier.idType.DOCOMO_UID, id);

      console.log(carrier+":"+id);
      //ホスト制限に指定された端末があれば、その端末を使用する
      if (document.contentType == "text/html") {
        if(id){
          //ホスト制限に指定された端末を取得する
          var deviceObj = fms.core.getDeviceByLimitHost(document.location.hostname);
          if(deviceObj){
            id = deviceObj.index;
            carrier = fms.pref.getPref("msim.devicelist." + id + ".carrier");
          }
        }
      }
    }
    sendResponse({
      carrier: carrier,
      id: id,
      width: width,
      forceScreenWidth: forceScreenWidth,
      uid: uid
    });
  },
  setUtnFlag: function (request, sender, sendResponse) {
    fms.pref.setPref("msim.temp.utnflag", request.value);
  },
  setLcsFlag: function (request, sender, sendResponse) {
    fms.pref.setPref("msim.temp.lcsflag", request.value);
  }
};

