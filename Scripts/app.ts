/// <reference path="../typings/google.maps.d.ts" />
/// <reference path="AngularTS/angular.d.ts" />
/// <reference path="../typings/jquery.d.ts" />
/// <reference path="../typings/jqueryui.d.ts" />

if (isSmartPhone()) {
    document.body.style.fontSize = "20px";
}

function isSmartPhone() {
    return ((navigator.userAgent.indexOf('iPhone') > 0
            && navigator.userAgent.indexOf('iPad') == -1)
        || navigator.userAgent.indexOf('iPod') > 0
        || navigator.userAgent.indexOf('Android') > 0);
}

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
        private map: google.maps.Map;
        private currentPosMarker: google.maps.Marker;
        private busstopList;

        constructor($scope: any, $http: angular.HttpService) {
            this.showMap($scope, $http);
            $scope.busstops = [];
            $http.jsonp("http://www9264ui.sakura.ne.jp/busstops/result_bts_lines?format=json&format=js&callback=JSON_CALLBACK")
            .success(data => {
                for (var i = 0 ; i < data.busstops.length ; i++) {
                    $scope.busstops.push(data.busstops[i].busstopname);
                }
                this.busstopList = data.busstops;
                this.putMarkers();
            });
            $scope.fromBusStop = "昭和通り";
            $scope.toBusStop = "五分一西";
            $scope.startTime = this.getNowTime();
            $scope.resultDiagrams = [];
            $scope.swapBusstop = () => {
                var tmp = $scope.toBusStop;
                $scope.toBusStop = $scope.fromBusStop;
                $scope.fromBusStop = tmp;
            };
            $scope.search = () => {
                $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?"
                    + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop)
                    + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop)
                    + "&departure_datetime=" + this.getNowDate() + $scope.startTime
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
                            + "&departure_datetime=" + this.getNowDate() + t
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

                this.map.addListener("center_changed", () => {
                    //イベント発生ごとに必ず配置しなおすと重くならないかな？
                    //mapが表示している範囲のバス停を表示する。
                });
            }
        }

        private putMarkers() {
            for (var i = 0 ; i < this.busstopList.length ; i++) {
                if (!this.busstopList[i].marker) {
                    this.busstopList[i].marker = this.putMarker(this.busstopList[i]);

                    //範囲内なら表示
                    //this.busstopList[i].marker
                    //this.busstopList[i].marker.setVisible(true);
                }
            }
        }

        private activeInfoWindow: google.maps.InfoWindow;

        private putMarker(busstop): google.maps.Marker {
            var marker = new google.maps.Marker({
                map: this.map,
                title: busstop.busstopname,
                position: new google.maps.LatLng(busstop.gps1,
                                                 busstop.gps2),
                icon: "Images/busstop.png"
            });
            var infowindow = new google.maps.InfoWindow({
                content: "<p>" + busstop.busstopname + "</p>"
                     + "<button disabled='disabled' onclick=\"$('#id_fromBusStop').val('" + busstop.busstopname + "'); \">乗車</button>"
                     + "<button disabled='disabled' onclick=\"$('#id_toBusStop'  ).val('" + busstop.busstopname + "'); \">降車</button>"
            });

            google.maps.event.addListener(marker, 'click', () => {
                if (this.activeInfoWindow) {
                    this.activeInfoWindow.close();
                }
                infowindow.open(this.map, marker);
                this.activeInfoWindow = infowindow;
            });

            return marker;
        }

        private getNowTime(): string {
            var Jikan = new Date();
            var time = "";
            //時・分・秒を取得する
            var hour = Jikan.getHours();
            if (hour < 10) {
                time += "0";
            }
            time += hour.toString();
            var minute = Jikan.getMinutes();
            if (minute < 10) {
                time += "0"
            }
            time += minute.toString();

            return time;
        }
        private getNowDate(): string {
            var Jikan = new Date();
            var day = "";
            //時・分・秒を取得する
            var year = Jikan.getFullYear();
            day += year.toString();
            var month = Jikan.getMonth();
            if (month < 10) {
                day += "0"
            }
            day += month.toString();
            var d = Jikan.getMonth();
            if (d < 10) {
                day += "0"
            }
            day += d.toString();

            return day;
        }

        private showMap($scope: any, $http: angular.HttpService) {
            // 現在の位置情報を取得
            var watchID = navigator.geolocation.watchPosition(
                position => {
                    var currentPos = new google.maps.LatLng(position.coords.latitude,
                                                                position.coords.longitude);
                    this.map.setCenter(currentPos);
                    if (!this.currentPosMarker) {
                        this.currentPosMarker = new google.maps.Marker({
                            map: this.map,
                            title: "現在地",
                            icon: "Images/male.png"
                        });
                    }
                    this.currentPosMarker.setPosition(currentPos);
                },
                error => {
                    switch (error.code) {
                        case 1:
                            alert("位置情報の利用が許可されていません");
                            break;
                        case 2:
                            alert("デバイスの位置が判定できません");
                            break;
                        case 3:
                            alert("タイムアウトしました");
                            break;
                    }
                },
                { enableHighAccuracy: true }
            );

            var opts = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            this.map = new google.maps.Map(
                    document.getElementById("map_canvas"), opts);
        }

        public static toggleMap(): void {
            var $map = $('#map_canvas');
            if ($map.css('display') === 'none') {
                $map.css('display', 'block');
            } else {
                $map.css('display', 'none');
            }
        }
    }
}