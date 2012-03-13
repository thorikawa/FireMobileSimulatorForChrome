var fms;
if (!fms) fms = {};
if (!fms.options) fms.options = {};

fms.options.initializeDevices = function () {
  $(".device-row").remove();
  var deviceCount = fms.pref.getIntPref("msim.devicelist.count");
  var listSize = Math.min(20, 3 + parseInt(deviceCount));
  var carrier;
  var device;
  for (var i = 1; i <= deviceCount; i++) {
    carrier = fms.pref.getPref("msim.devicelist." + i + ".carrier");
    device = fms.pref.getPref("msim.devicelist." + i + ".label");
    if (device) {
      (function () {
        // make this block as an anonymous function to refer "i" as "id"
        var id = i;
        var tr = $("<tr>").addClass("device-row");
        var edit = $("<button>")
          .addClass("button-in-cell")
          .addClass("btn")
          .text(chrome.i18n.getMessage("options_edit"))
          .click(function () {
            fms.options.editDevice(id)
          });
        var del = $("<button>")
          .addClass("button-in-cell")
          .addClass("btn")
          .text(chrome.i18n.getMessage("options_delete"))
          .click(function () {
            fms.options.deleteDevice(id, function () {
              // reload all data because ids are changed
              fms.options.initializeDevices();
            })
          });
        tr.append($("<td>").text(carrier + " " + device))
          .append($("<td>").addClass("button-cell").append(edit))
          .append($("<td>").addClass("button-cell").append(del));
        $("#msim-listbox").append(tr);
      })();
    }
  }
};

k = 0
// Adds a device
fms.options.addDevice = function() {
  fms.options.clearDeviceForm();
  $("#options-device-extra-headers-rows").empty();
  fms.options.addExtraHeaderRow();
  
  // set global
  fms.options.action = "add";
  fms.options.deviceid = null;
  
  // setup modal
  $("#modal_device_form_header").text(chrome.i18n.getMessage("add_device_header"));
  $("#modal_device_form").modal("show");
};

// Deletes a device
fms.options.deleteDevice = function (id, callback) {
  if (confirm(chrome.i18n.getMessage("delete_confirm"))) {
    fms.core.deleteDevice(id);
    callback();
  }
};

fms.options.clearDeviceForm = function () {
  $("#device-form").find("input").each(function (i, e) {
    var type = $(e).attr("type")
    if ("text"==type) {
      $(e).val("");
    }
  });
  // uncheck carrier form
  fms.options.selectCarrier(false);
};

// Edits a device
fms.options.editDevice = function (id) {
  var deviceBox = $("#msim-listbox");
  var extraHeadersRow = $("#options-device-extra-headers-rows");
  var count;
  var carrier = fms.pref.getPref("msim.devicelist." + id + ".carrier");

  document.getElementById("options-device-label").value = 
    fms.pref.getPref("msim.devicelist." + id + ".label");
  fms.options.selectCarrier(carrier);
  fms.options.appendTypeList(carrier);
  fms.options.selectType1(id);

  document.getElementById("options-device-useragent").value = 
    fms.pref.getPref("msim.devicelist." + id + ".useragent");
  document.getElementById("options-device-screen-width").value = 
    fms.pref.getPref("msim.devicelist." + id + ".screen-width");
  document.getElementById("options-device-screen-height").value = 
    fms.pref.getPref("msim.devicelist." + id + ".screen-height");
  document.getElementById("options-device-use-cookie").checked = 
    fms.pref.getPref("msim.devicelist." + id + ".use-cookie");

  extraHeadersRow.empty();
  count = fms.options.appendExtraHeaderRows(id);
  if(count == 0) fms.options.addExtraHeaderRow();

  /* TODO
  document.getElementById("msim-textbox-docomo-uid").value = fms.pref
      .getPref("msim.devicelist." + id + ".docomo-uid");
  document.getElementById("msim-textbox-docomo-ser").value = fms.pref
      .getPref("msim.devicelist." + id + ".docomo-ser");
  document.getElementById("msim-textbox-docomo-icc").value = fms.pref
      .getPref("msim.devicelist." + id + ".docomo-icc");
  document.getElementById("msim-textbox-docomo-guid").value = fms.pref
      .getPref("msim.devicelist." + id + ".docomo-guid");
  document.getElementById("msim-textbox-au-uid").value = fms.pref
      .getPref("msim.devicelist." + id + ".au-uid");
  document.getElementById("msim-textbox-softbank-uid").value = fms.pref
      .getPref("msim.devicelist." + id + ".softbank-uid");
  document.getElementById("msim-textbox-softbank-serial").value = fms.pref
      .getPref("msim.devicelist." + id + ".softbank-serial");
  */

  // set global
  fms.options.action = "edit";
  fms.options.deviceid = id;

  // setup modal
  $("#modal_device_form_header").text(chrome.i18n.getMessage("edit_device_header"));
  $("#modal_device_form").modal("show");

};

fms.options.clearAllDeviceSettings = function() {
  // TODO
  if (confirm(chrome.i18n.getMessage("confirm_clear_all_devices"))) {
    fms.core.clearAllDevice();
  }

  fms.options.initializeDevices();
};

fms.options.appendExtraHeaderRows = function (deviceId) {
  var extraHeaders = fms.pref.getListPref("msim.devicelist." + deviceId + ".extra-header", ["name", "value"]);
  var count = 0;
  extraHeaders.forEach(function (extraHeader) {
    if (deviceId && extraHeader.value) {
      fms.options.addExtraHeaderRow(extraHeader);
      count++;
    }
  });
  return count;
};

fms.options.addExtraHeaderRow = function (headerObj) {
  var targetNode = $("#options-device-extra-headers-rows");
  var tr = $("<tr>").addClass("extra-header-row");
  var headername = $("<input>").attr("type", "text");
  var headervalue = $("<input>").attr("type", "text");
  if(headerObj && headerObj.name) headername.attr("value", headerObj.name);
  if(headerObj && headerObj.value) headervalue.attr("value", headerObj.value);
  tr.append($("<td>").append(headername));
  tr.append($("<td>").append(headervalue));
  tr.append($("<td>").addClass("button-cell").append(
    $("<button>")
      .addClass("button-in-cell")
      .addClass("btn")
      .text(chrome.i18n.getMessage("delete_button"))
      .click(function () {
        tr.remove();
      })
  ));
  targetNode.append(tr);
};

// save device
fms.options.saveDevice = function () {
  // If the window type is add or edit
  var saveId;
  var carrier = $("#options-device-carrierlist").find("option:selected").attr("value");
  var deviceName = document.getElementById("options-device-label").value;
  var userAgent = document.getElementById("options-device-useragent").value;
  var type1 = $("#options-device-type-menupopup").find("option:selected").attr("value");
  var screenWidth = document.getElementById("options-device-screen-width").value;
  var screenHeight = document.getElementById("options-device-screen-height").value;
  var useCookie = document.getElementById("options-device-use-cookie").checked;

  // input check
  if (!deviceName || !carrier || !userAgent) {
    console.log("Warning : Required field is null.");
    alert(chrome.i18n.getMessage("required_field_is_blank"));
    return false;
  }

  if (fms.options.action == "edit") {
    saveId = fms.options.deviceid;
  } else {
    console.log(fms.pref.getIntPref("msim.devicelist.count"));
    saveId = fms.pref.getIntPref("msim.devicelist.count") + 1;
    fms.pref.setPref("msim.devicelist.count", saveId);
    fms.pref.setPref("msim.devicelist." + saveId + ".carrier", carrier);
  }

  console.log("save-carrier:" + carrier);
  console.log("save-id:" + saveId);

  fms.pref.setPref("msim.devicelist." + saveId + ".label", deviceName);
  fms.pref.setPref("msim.devicelist." + saveId + ".carrier", carrier);
  fms.pref.setPref("msim.devicelist." + saveId + ".useragent", userAgent);
  fms.pref.setPref("msim.devicelist." + saveId + ".type1", type1);
  fms.pref.setPref("msim.devicelist." + saveId + ".screen-width", screenWidth);
  fms.pref.setPref("msim.devicelist." + saveId + ".screen-height", screenHeight);
  fms.pref.setPref("msim.devicelist." + saveId + ".use-cookie", useCookie);

  // save extra headers
  var extraHeaders = $("#options-device-extra-headers-rows").find("tr.extra-header-row");
  var headerId = 0;
  for (var i = 0; i < extraHeaders.length; i++) {
    var extraHeader = extraHeaders[i];
    var extraHeaderAttributes = $(extraHeader).find("input");
    var name = extraHeaderAttributes[0].value;
    var value = extraHeaderAttributes[1].value;

    if (name) {
      headerId++;
      fms.pref.setPref("msim.devicelist." + saveId + ".extra-header." + headerId + ".name", name);
      fms.pref.setPref("msim.devicelist." + saveId + ".extra-header." + headerId + ".value", value);
    }
  }
  fms.pref.setPref("msim.devicelist." + saveId + ".extra-header.count", headerId);
  
  confirm(chrome.i18n.getMessage("save_complete"));
  
  fms.options.initializeDevices();
  fms.options.addDevice();
  
  /* TODO
  var docomoUid = document.getElementById("msim-textbox-docomo-uid").value;
  var docomoSer = document.getElementById("msim-textbox-docomo-ser").value;
  var docomoIcc = document.getElementById("msim-textbox-docomo-icc").value;
  var docomoGuid = document.getElementById("msim-textbox-docomo-guid").value;
  var auUid = document.getElementById("msim-textbox-au-uid").value;
  var softbankUid = document.getElementById("msim-textbox-softbank-uid").value;
  var softbankSerial = document.getElementById("msim-textbox-softbank-serial").value;
  fms.pref.setPref("msim.devicelist." + saveId + ".docomo-uid", docomoUid);
  fms.pref.setPref("msim.devicelist." + saveId + ".docomo-ser", docomoSer);
  fms.pref.setPref("msim.devicelist." + saveId + ".docomo-icc", docomoIcc);
  fms.pref.setPref("msim.devicelist." + saveId + ".docomo-guid", docomoGuid);
  fms.pref.setPref("msim.devicelist." + saveId + ".au-uid", auUid);
  fms.pref.setPref("msim.devicelist." + saveId + ".softbank-uid", softbankUid);
  fms.pref.setPref("msim.devicelist." + saveId + ".softbank-serial", softbankSerial);
  */
  
  // dismiss modal
  $("#modal_device_form").modal("hide");
};

fms.options.appendTypeList = function (carrier) {
  //console.log("appendTypeList");
  var ele = $("#options-device-type-menupopup");
  var typeObj = fms.carrier.Type[carrier];
  var key;
  var type;
  ele.empty();
  for (key in typeObj) {
    var type = typeObj[key];
    ele.append($("<option>")
      .text(type)
      .attr("id", "type1-" + type)
      .attr("value", type));
  }
};

fms.options.createCarrierMenuList = function () {
  //console.log("createCarrierMenuList");
  var carrierList = $("#options-device-carrierlist");
  carrierList.empty();
  [""].concat(fms.carrier.carrierArray)
      .forEach(function (carrierTemp) {
        carrierList.append($("<option>")
          .text(fms.carrier.carrierName[carrierTemp]
                    ||  chrome.i18n.getMessage("select_carrier"))
          .attr("id", "carrier-" + carrierTemp)
          .attr("value", carrierTemp));
      });
  carrierList.change(function () {
    var selectedItem = carrierList.find("option:selected");
    var carrier = selectedItem.attr("value");
    fms.options.appendTypeList(carrier);
  });
};

fms.options.selectCarrier = function (carrier) {
  carrier = carrier || "";
  var menuItem = $("#carrier-" + carrier);
  menuItem.attr("selected", "selected");
};

fms.options.selectType1 = function (id) {
  //console.log("selectType1");
  var type1 = fms.pref.getPref("msim.devicelist." + id + ".type1");
  var typeMenu = $("#type1-" + type1);
  if (typeMenu) {
    typeMenu.attr("selected", "selected");
  }
};

