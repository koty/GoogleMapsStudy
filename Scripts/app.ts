/// <reference path="../typings/google.maps.d.ts" />
/// <reference path="AngularTS/angular.d.ts" />
/// <reference path="../typings/jquery.d.ts" />
/// <reference path="../typings/jqueryui.d.ts" />

angular.module('albus', []).directive('autoComplete', function () {
    return function (scope, iElement, iAttrs) {
        scope.$watch(iAttrs.uiItems, function (values) {
            iElement.autocomplete({
                source: values,
                select: function () {
                    setTimeout(function () {
                        iElement.trigger('input');
                    }, 0);
                }
            });

        }, true);
    };
});

module app {
    export class searchBusByFromTo {
        constructor($scope: any, $http: angular.HttpService) {
            $scope.busstops = [];
            $http.jsonp("http://www9264ui.sakura.ne.jp/busstops/result_bts_lines?format=json&format=js&callback=JSON_CALLBACK")
            .success(data => {
                for (var i = 0 ; i < data.busstops.length ; i++) {
                    $scope.busstops.push(data.busstops[i].busstopname);
                }
            });
            $scope.fromBusStop = "昭和通り";
            $scope.toBusStop = "五分一西";
            $scope.startTime = "2000";
            $scope.resultDiagrams = [];
            $scope.search = () => {
                $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?"
                    + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop)
                    + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop)
                    + "&departure_datetime=20130226" + $scope.startTime
                    + "&format=js&callback=JSON_CALLBACK")
                .success(data => {
                    $scope.resultDiagrams = [];
                    var s = data.diagrams[1].diagram.linename
                        + " "
                        + data.diagrams[0].diagram.avltime
                        + " ⇒ "
                        + data.diagrams[1].diagram.avltime;
                    $scope.resultDiagrams.push(s);
                    var time = (parseInt(data.diagrams[0].diagram.avltime, 10) + 1);
                    var t = "";
                    if (time < 1000)
                        t = "0" + time;
                    else
                        t = time.toString();

                    $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?"
                            + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop)
                            + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop)
                            + "&departure_datetime=20130226" + t
                            + "&format=js&callback=JSON_CALLBACK")
                        .success(data => {
                            var s = data.diagrams[1].diagram.linename
                                + " "
                                + data.diagrams[0].diagram.avltime
                                + " ⇒ "
                                + data.diagrams[1].diagram.avltime;
                            $scope.resultDiagrams.push(s);
                        })
                        .error((data: any) => {
                            console.log("fail");
                            console.log(data);
                        });

                })
                .error((data: any) => {
                    console.log("fail");
                    console.log(data);
                });
            }
        }
    }

    export class s {
        public static initialize(): void {
            var latlng = new google.maps.LatLng(35.630442, 139.882951);
            var opts = {
                zoom: 15,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(
                    document.getElementById("map_canvas"), opts);

            var m_latlng1: google.maps.LatLng = new google.maps.LatLng(35.632605, 139.88132);
            var marker1: google.maps.Marker = new google.maps.Marker({
                position: m_latlng1,
                map: map,
                title: "デズニーランド（行ったことない）"
            });

            var m_latlng2: google.maps.LatLng = new google.maps.LatLng(35.625663, 139.884238);
            var marker2: google.maps.Marker = new google.maps.Marker({
                position: m_latlng2,
                map: map,
                title: "デズニーシー（行ったことない）"
            });


            //吹き出しを作成します
            var contentString = '吹き出しを設置してみました。</br>' +
                '×ボタンで閉じてもマーカーをクリックすればまた開きます。';
            var infowindow = new google.maps.InfoWindow({
                content: contentString  //吹き出し内コメント
            });

            //クリックしたときに吹き出しがオープンするイベントを定義します
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
        }
    }
}