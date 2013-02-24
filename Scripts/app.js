var app = (function () {
    function app() { }
    app.initialize = function initialize() {
        var latlng = new google.maps.LatLng(35.630442, 139.882951);
        var opts = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), opts);
        var m_latlng1 = new google.maps.LatLng(35.632605, 139.88132);
        var marker1 = new google.maps.Marker({
            position: m_latlng1,
            map: map,
            title: "デズニーランド（行ったことない）"
        });
        var m_latlng2 = new google.maps.LatLng(35.625663, 139.884238);
        var marker2 = new google.maps.Marker({
            position: m_latlng2,
            map: map,
            title: "デズニーシー（行ったことない）"
        });
        var contentString = '吹き出しを設置してみました。</br>' + '×ボタンで閉じてもマーカーをクリックすればまた開きます。';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        google.maps.event.addListener(marker1, 'click', function () {
            infowindow.open(map, marker1);
        });
        var kmlUrl = "https://maps.google.co.jp/maps/ms?hl=ja&ie=UTF8&brcurrent=3,0x601d805de6344499:0xf128a974072892c8,0&source=embed&authuser=0&msa=0&output=kml&msid=212296178296913481694.00049901c136c56005a6e";
        var kmlLayer = new google.maps.KmlLayer(kmlUrl);
        kmlLayer.setMap(map);
        google.maps.event.addListener(kmlLayer, 'click', function (kmlEvent) {
            var text = kmlEvent.featureData.description;
            showInDiv(text);
        });
        function showInDiv(text) {
            var sidediv = document.getElementById('contentWindow');
            sidediv.innerHTML = text;
        }
    };
    return app;
})();
