function initializeEvent () {
    $(".tab").each(function () {
        $(this).click(function () {
          $("#content").load("options/" + $(this).attr("page") + ".html", function () {
            // localize again after loading individual page
            bind(function () {
              confirm(chrome.i18n.getMessage("save_done"));
            });
            localizePage();
            // jquery ui
            $("input:button").addClass("btn");
            $("input:submit").addClass("btn").addClass("btn-primary");
          });
          $(".tab.active").removeClass("active");
          $(this).addClass("active");
        });
    });
}

$(document).ready(function () {
    localizePage();
    initializeEvent();
    $($(".tab")[0]).click();
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-6340134-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
