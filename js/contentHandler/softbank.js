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
if (!firemobilesimulator)
  firemobilesimulator = {};
if (!firemobilesimulator.contentHandler)
  firemobilesimulator.contentHandler = {};

firemobilesimulator.contentHandler.softbank = {
  filter : function (ndDocument, deviceInfo) {
    var deviceId = deviceInfo.id;
    console.log(ndDocument.charset);
    var mpc = firemobilesimulator.mpc.factory("SB");
    var imagePath = chrome.extension.getURL("/emoji");
    mpc.setImagePath(imagePath);
    mpc.charset = ndDocument.charset;
    var parser = new fms.contentHandler.parser(ndDocument, mpc);
    parser.parse(ndDocument);

    firemobilesimulator.contentHandler.common.filter(ndDocument, deviceInfo);
    ndDocument.addEventListener("keypress", firemobilesimulator.contentHandler.common.createAccessKeyFunction(["accesskey", "directkey"]), false);
  }
};
