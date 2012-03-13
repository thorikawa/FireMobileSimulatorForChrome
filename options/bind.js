function bind (saveCallback) {
  $("[bind]").each(function () {
    var type=$(this).attr("type");
    if ("text"==type) {
      $(this).val(fms.pref.getPref($(this).attr("bind")));
    } else if ("checkbox"==type) {
      if (fms.pref.getPref($(this).attr("bind"))) {
        $(this).attr('checked', 'checked');
      } else {
        $(this).removeAttr('checked');
      }
    }
  });

  $("form").submit(function () {
    $("[bind]").each(function () {
      var type = $(this).attr("type");
      var key = $(this).attr("bind");
      if ("text"==type) {
        var val = $(this).val();
        fms.pref.setPref(key, val);
      } else if ("checkbox"==type) {
        if ($(this).is(':checked')) {
          fms.pref.setPref(key, true);
        } else {
          fms.pref.setPref(key, false);
        }
      }
    });
    if (saveCallback) saveCallback();
  });
}