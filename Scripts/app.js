var app;
(function (app) {
    var searchBusByFromTo = (function () {
        function searchBusByFromTo($scope, $http) {
            $scope.fromBusStop = "昭和通り";
            $scope.toBusStop = "五分一西";
            $scope.startTime = "2000";
            $scope.resultDiagrams = [];
            $scope.search = function () {
                $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?" + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop) + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop) + "&departure_datetime=20130226" + $scope.startTime + "&format=js&callback=JSON_CALLBACK").success(function (data) {
                    $scope.resultDiagrams = [];
                    var s = data.diagrams[1].diagram.linename + " " + data.diagrams[0].diagram.avltime + " ⇒ " + data.diagrams[1].diagram.avltime;
                    $scope.resultDiagrams.push(s);
                    $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?" + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop) + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop) + "&departure_datetime=20130226" + (parseInt(data.diagrams[0].diagram.avltime, 10) + 1) + "&format=js&callback=JSON_CALLBACK").success(function (data) {
                        var s = data.diagrams[1].diagram.linename + " " + data.diagrams[0].diagram.avltime + " ⇒ " + data.diagrams[1].diagram.avltime;
                        $scope.resultDiagrams.push(s);
                    }).error(function (data) {
                        console.log("fail");
                        console.log(data);
                    });
                }).error(function (data) {
                    console.log("fail");
                    console.log(data);
                });
            };
        }
        return searchBusByFromTo;
    })();
    app.searchBusByFromTo = searchBusByFromTo;    
    var s = (function () {
        function s() { }
        s.initialize = function initialize() {
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
        return s;
    })();
    app.s = s;    
})(app || (app = {}));
