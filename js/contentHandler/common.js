/*******************************************************************************
 * ***** BEGIN LICENSE BLOCK Version: GPL 3.0 FireMobileFimulator is a Firefox
 * add-on that simulate web browsers of japanese mobile phones. Copyright (C)
 * 2008 Takahiro Horikawa <horikawa.takahiro@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>. ***** END LICENSE
 * BLOCK *****
 */

var firemobilesimulator;
if (!firemobilesimulator)
  firemobilesimulator = {};
if (!firemobilesimulator.contentHandler)
  firemobilesimulator.contentHandler = {};

firemobilesimulator.contentHandler.common = {

  parse : function (p) {
    var nodes = p.childNodes;
    var n = nodes.length;
    for(var i=0; i<n; i++) {
      var node = nodes[i];
      if (node.nodeType == Node.TEXT_NODE) {
        var convertedArray = this.mpc.convertBinary(node.data);
        var len = convertedArray.length;
        var lastNode = node;
        if (len <= 1) {
          // ノードが分割されない場合、絵文字をまったく含まないということなので元のテキストノードのままでよい
          continue;
        }
        // 絵文字によってテキストノードが分割される場合
        for(var j=0; j<len; j++) {
          var converted = convertedArray[j];
          var newNode;
          if (0==converted.type) {
            newNode = this.doc.createTextNode(converted.value);
          } else if (1==converted.type) {
            newNode = this.doc.createElement("img");
            newNode.setAttribute("src", converted.value);
            newNode.setAttribute("width", 12);
            newNode.setAttribute("height", 12);
            newNode.setAttribute("border", 0);
            newNode.setAttribute("alt", "");
          }
          if (newNode) {
            fms.common.util.insertAfter(newNode, lastNode);
            lastNode = newNode;
            n++; i++;
          }
        }
        node.parentNode.removeChild(node);
        n--; i--;
      } else {
        this.parse(node);
      }
    }
  },

  filter : function (ndDocument, deviceInfo) {
    if (ndDocument.body) {
      // force font family to monospace
      ndDocument.body.style.fontFamily = "monospace";
      // currently set only width
      if (deviceInfo.forceScreenWidth) {
        ndDocument.body.style.width = deviceInfo.width + "px";
        ndDocument.body.style.border = "2px solid black";
      }
    }
  },

  createAccessKeyFunction : function (keyNameArray) {
    return function(e) {
      if(this.activeElement && (this.activeElement.tagName == "INPUT" || this.activeElement.tagName == "TEXTAREA")){
        console.log("[msim]skip accesskey.\n")
        return;
      }

      var anchorTags = this.getElementsByTagName("a");
      for (var i = 0; i < anchorTags.length; i++) {
        var anchorTag = anchorTags[i];
        var accesskey;
        for (var j = 0; j < keyNameArray.length; j++) {
          accesskey = anchorTag.getAttribute(keyNameArray[j]);
          if(accesskey){
            break;
          }
        }
        if (accesskey && accesskey.match(/^(\d|\*|\#)$/)) {
          accesskey = accesskey.charCodeAt(0);
          if (e.charCode == accesskey) {
            anchorTag.focus();
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0,
                0, 0, 0, 0, false, false, false, false, 0,
                null);
            anchorTag.dispatchEvent(evt);
            break;
          }
        }
      }
    };
  }
};