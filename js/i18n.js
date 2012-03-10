// i18n
function localizePage () {
  $("[i18n]:not(.i18n-replaced)").each(function () {
      $(this).html(translate($(this).attr("i18n")));
      $(this).addClass("i18n-replaced");
  });
  $("[i18n-value]:not(.i18n-replaced)").each(function () {
      $(this).attr("value", translate($(this).attr("i18n-value")));
      $(this).addClass("i18n-replaced")
  });
}

function translate (messageID, args) {
  return chrome.i18n.getMessage(messageID, args);
}
