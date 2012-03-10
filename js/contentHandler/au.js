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
if (!firemobilesimulator)
  firemobilesimulator = {};
if (!firemobilesimulator.contentHandler)
  firemobilesimulator.contentHandler = {};

firemobilesimulator.contentHandler.au = {
  filter : function (ndDocument, deviceInfo) {
    var deviceId = deviceInfo.id;
    var mpc = firemobilesimulator.mpc.factory("AU");
    var imagePath = chrome.extension.getURL("/emoji");
    mpc.setImagePath(imagePath);
    var parser = new fms.contentHandler.parser(ndDocument, mpc);
    parser.parse(ndDocument);
    
    var mpc2 = firemobilesimulator.mpc.factory("DC");
    var imagePath = chrome.extension.getURL("/emoji");
    mpc2.setImagePath(imagePath);
    var parser2 = new fms.contentHandler.parser(ndDocument, mpc2);
    parser2.parse(ndDocument);
    
    firemobilesimulator.contentHandler.common.filter(ndDocument, deviceInfo);    
    // HDML暫定対応
    var hdmls = ndDocument.getElementsByTagName("hdml");
    if (hdmls.length >= 1) {
      var nodisplays = hdmls[0].getElementsByTagName("nodisplay");
      for (var i = 0; i < nodisplays.length; i++) {
        var actions = nodisplays[i].getElementsByTagName("action");
        for (var j = 0; j < actions.length; j++) {
          var task = actions[j].getAttribute("task");
          var dest = actions[j].getAttribute("dest");
          if (task.toUpperCase() == "GO" && dest) {
            console.log("[msim]Debug : hdml go <" + dest + ">\n");
            ndDocument.location.href = dest;
            return;
          }
        }
      }
    }
  
    // WML暫定対応
    var oneventTags = ndDocument.getElementsByTagName("wml:onevent");
    for (var i = 0; i < oneventTags.length; i++) {
      console.log("wml:onevent found:" + i + "\n");
      var onevent = oneventTags[i];
      var type = onevent.getAttribute("type");
      if (type == "onenterforward") {
        var goTags = onevent.getElementsByTagName("wml:go");
        for (var j = 0; j < goTags.length; j++) {
          console.log("wml:go found:" + j + "\n");
          var go = goTags[j];
          var href = go.getAttribute("href");
          if (href) {
            console.log("onenterforward go:" + href + "\n");
            ndDocument.location.href = href;
          }
        }
      }
    }
    var wmlAnchorTags = ndDocument.getElementsByTagName("wml:anchor");
    for (var i = 0; i < wmlAnchorTags.length; i++) {
      var anchor = wmlAnchorTags[i];
      var spawnTags = anchor.getElementsByTagName("wml:spawn");
      for (var j = 0; j < spawnTags.length; j++) {
        var spawn = spawnTags[j];
        var href = spawn.getAttribute("href");
        if (href) {
          console.log("wml:anchor->wml:spawn found. set link:" + href
              + "\n");
          // spawn.addEventListener("click",
          // function() {ndDocument.location.href=href;},
          // false);
          spawn.innerHTML = '<a href="' + href + '">'
              + spawn.innerHTML + "</a>";
        }
      }
    }
  
    //auのみDOMロード後に絵文字変換を行う
    //var pictogramConverterEnabled = fms.pref.getPref("msim.config.AU.pictogram.enabled");
    //if (pictogramConverterEnabled) {
      console.log("[msim]convert pictogram in overlay.js\n");
      var mpc = firemobilesimulator.mpc.factory(fms.carrier.AU);
      var imagePath = chrome.extension.getURL("/emoji");
      mpc.setImagePath(imagePath);
      var imgs = ndDocument.getElementsByTagName("img");
      for (var i = 0; i < imgs.length; i++) {
        var iconno = imgs[i].getAttribute("localsrc")
            || imgs[i].getAttribute("icon");
        if (iconno && !isNaN(iconno)) {
          imgs[i].setAttribute("src", mpc.getImageSrc(parseInt(
                  iconno, 10)));
        } else if (iconno) {
          iconno = mpc.getIconNumFromIconName("_" + iconno);
          if (iconno) {
            imgs[i]
                .setAttribute("src", mpc
                        .getImageSrc(iconno));
          }
        }
  
      }
    //}
    
    //accesskey対応
    ndDocument.addEventListener("keypress", firemobilesimulator.contentHandler.common.createAccessKeyFunction(["accesskey"]), false);
  }
};