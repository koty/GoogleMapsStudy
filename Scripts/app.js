var app = (function () {
    function app() { }
    app.initialize = function initialize() {
        var latlng = new google.maps.LatLng(35.709984, 139.810703);
        var opts = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), opts);
    };
    return app;
})();
