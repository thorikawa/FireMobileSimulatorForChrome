/* ***** BEGIN LICENSE BLOCK Version: GPL 3.0 *****
 * FireMobileFimulator is a Chrome Extension that simulate web browsers of
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

var firemobilesimulator;
if (!firemobilesimulator) firemobilesimulator = {};
var fms;
if (!fms) fms = firemobilesimulator;
if (!fms.overlay) fms.overlay = {};

(function (objEvent) {
  console.log("[msim]BrowserOnLoad is fired.");
  chrome.extension.sendRequest({name: "deviceInfo"}, function(deviceInfo) {
    filter(deviceInfo);
  });
})();

function filter (deviceInfo) {
  if (!deviceInfo.carrier) {
    return;
  }

  var isSimulate = false;
  // TODO host specific setting
  isSimulate = fms.core.isSimulate(document.location.hostname);
  if (isSimulate) {
    var contentHandler = firemobilesimulator.contentHandler.factory(deviceInfo.carrier);
    contentHandler && contentHandler.filter(document, deviceInfo);
  }
}

/**
 * タブごとの再描画
 */
fms.overlay.rewrite = function () {
  console.log("[msim]rewrite tab");
  var statusPanel = document.getElementById("msim-status-panel");
  var tabselect_enabled = fms.pref.getPref("msim.config.tabselect.enabled");
  if (!tabselect_enabled) {
    // タブごとに端末選択モードでない場合は、下部ステータスバーの端末選択メニューを非表示にする
    console.log("[msim]tabselect is not enabled");
    statusPanel.setAttribute("style","visibility: collapse");
    return;
  }

  statusPanel.setAttribute("style","visibility: visible");
  var tab = gBrowser.selectedTab;
  var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].getService(Components.interfaces.nsISessionStore);
  var id = ss.getTabValue(tab, "firemobilesimulator-device-id");
  var pref_prefix = "msim.devicelist." + id;
  var carrier = fms.pref.getPref(pref_prefix + ".carrier");
  var name = fms.pref.getPref(pref_prefix + ".label");

  var statusImage = document.getElementById("msim-status-image");
  var statusLabel = document.getElementById("msim-status-label");
  var msimButton = document.getElementById("msim-button");
  var menu = document.getElementById("msim-menu");
  var target = [msimButton, menu];

  if (id) {
    target.forEach(function(item) {
      if (item) {
        item.setAttribute("device", "on");
      }
    });
    statusImage.setAttribute("device", "on");
  } else {
    target.forEach(function(item) {
      if (item) {
        item.removeAttribute("device");
      }
    });
    statusImage.removeAttribute("device");
  }
  statusLabel.setAttribute("value", name);
}

// タブを復元したときに、タブごとに端末選択モードだった場合、再描画する
