/// <reference path="../typings/google.maps.d.ts" />
/// <reference path="AngularTS/angular.d.ts" />
/// <reference path="../typings/jquery.d.ts" />
/// <reference path="../typings/jqueryui.d.ts" />

$(function () {
    if (isSmartPhone()) {
        app.searchBusByFromTo.Changecss('smartphone');
    }
    function isSmartPhone() {
        return ((navigator.userAgent.indexOf('iPhone') > 0
                && navigator.userAgent.indexOf('iPad') == -1)
            || navigator.userAgent.indexOf('iPod') > 0
            || navigator.userAgent.indexOf('Android') > 0);
    }
});

angular.module('albus', ['ui']).directive('autoComplete', function () {
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
        private currentPosMarker: google.maps.Marker;
        private busstopList;

        constructor($scope: any, $http: angular.HttpService) {
            this.showMap($scope, $http);
            $scope.busstops = [];
            $scope.busstopMarkers = [];
            $http.jsonp("http://www9264ui.sakura.ne.jp/busstops/result_bts_lines?format=json&format=js&callback=JSON_CALLBACK")
            .success(data => {
                for (var i = 0 ; i < data.busstops.length ; i++) {
                    $scope.busstops.push(data.busstops[i].busstopname);
                }
                this.busstopList = data.busstops;
                this.putMarkers($scope);
            });
            $scope.searchHistories = this.getSearchHistories();
            $scope.historiesDDLChanged = (selectedItem) => {
                $scope.fromBusStop = selectedItem.fromBusStop;
                $scope.toBusStop = selectedItem.toBusStop;
            };
            $scope.fromBusStop = "昭和通り";
            $scope.toBusStop = "五分一西";
            $scope.startTime = this.getNowTime();
            $scope.resultDiagrams = [];
            $scope.swapBusstop = () => {
                var tmp = $scope.toBusStop;
                $scope.toBusStop = $scope.fromBusStop;
                $scope.fromBusStop = tmp;
            };
            $scope.setFromBusStop = $event => {
                $scope.fromBusStop = $scope.currentMarker.title;
            };
            $scope.setToBusStop = $event => {
                $scope.toBusStop = $scope.currentMarker.title;
            };
            $scope.openMarkerInfo = function (marker) {
                $scope.currentMarker = marker;
                //$scope.currentMarkerLat = marker.getPosition().lat();
                //$scope.currentMarkerLng = marker.getPosition().lng();
                //$scope.currentBusstopName = marker.title;
                $scope.busstopInfoWindow.open($scope.myMap, marker);
            };
            $scope.mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            $scope.search = () => { this.searchBusStop($scope, $http) };
        }

        private searchBusStop($scope: any, $http: angular.HttpService) {
            $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?"
                + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop)
                + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop)
                + "&departure_datetime=" + this.getNowDate() + $scope.startTime
                + "&format=js&callback=JSON_CALLBACK")
            .success(data => {
                $scope.resultDiagrams = [];
                $scope.resultDiagrams.push(this.formatResult(data.diagrams));
                var time = (parseInt(data.diagrams[0].diagram.avltime, 10) + 1);
                var t = this.padZero(time);

                $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?"
                        + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop)
                        + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop)
                        + "&departure_datetime=" + this.getNowDate() + t
                        + "&format=js&callback=JSON_CALLBACK")
                    .success(data => {
                        $scope.resultDiagrams.push(this.formatResult(data.diagrams));
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
            this.putSearchHistories($scope.searchHistories,
            {
                fromBusStop: $scope.fromBusStop,
                toBusStop: $scope.toBusStop
            });
        }
        private formatResult(diagrams) {
            return {
                linename: diagrams[1].diagram.linename,
                from: this.formatTime(diagrams[0].diagram.avltime),
                to: this.formatTime(diagrams[1].diagram.avltime)
            };
        }
        private formatTime(t: string): string {
            if (t.length < 4)
                t = " " + t;
            return t.substring(2, 0) + ":" + t.substring(4, 2);
        }
        private padZero(num: number): string {
            if (num < 1000)
                return "0" + num;
            else
                return num.toString();
        }
        private putMarkers($scope) {
            for (var i = 0 ; i < this.busstopList.length ; i++) {
                if (!this.busstopList[i].marker) {
                    this.busstopList[i].marker = this.putMarker(this.busstopList[i], $scope);
                }
            }
        }

        private activeInfoWindow: google.maps.InfoWindow;

        private putMarker(busstop, $scope): google.maps.Marker {
            var marker = new google.maps.Marker({
                map: $scope.myMap,
                title: busstop.busstopname,
                position: new google.maps.LatLng(busstop.gps1, busstop.gps2),
                icon: "Images/busstop.png"
            });
            $scope.busstopMarkers.push(marker);
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
        
        private getSearchHistories(): any {
            var historiesJSON = localStorage.getItem("searchhistories");
            if (!historiesJSON)
                return [];

            var histories = JSON.parse(historiesJSON);
            return histories;
        }

        private putSearchHistories(histories: Array, currentData) {
            for (var i = 0 ; i < histories.length ; i++) {
                if (currentData.fromBusStop == histories[i].fromBusStop
                        && currentData.toBusStop == histories[i].toBusStop) {
                    return;
                }
            }
            if (histories.length > 5) {
                histories.shift();
            }
            currentData.val = currentData.fromBusStop + " → " + currentData.toBusStop;
            histories.push(currentData);
            var historiesJSON = JSON.stringify(histories);
            localStorage.setItem("searchhistories", historiesJSON);
        }

        private showMap($scope: any, $http: angular.HttpService) {
            // 現在の位置情報を取得
            var watchID = navigator.geolocation.watchPosition(
                position => {
                    var currentPos = new google.maps.LatLng(position.coords.latitude,
                                                                position.coords.longitude);
                    $scope.myMap.setCenter(currentPos);
                    if (!this.currentPosMarker) {
                        this.currentPosMarker = new google.maps.Marker({
                            map: $scope.myMap,
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
        }

        public static toggleMap(): void {
            var $map = $('#map_canvas');
            if ($map.css('display') === 'none') {
                $map.css('display', 'block');
            } else {
                $map.css('display', 'none');
            }
        }

        //http://www7a.biglobe.ne.jp/~mkun/css/css_JavaScript.htm
        public static Changecss(ttl) {
            var i, lnklst;
            for (i = 0; (lnklst = document.getElementsByTagName("link")[i]); i++) {
                if (lnklst.getAttribute("rel").indexOf("stylesheet") && lnklst.getAttribute("title")) {
                    lnklst.disabled = true;
                    if (lnklst.getAttribute("title") == ttl) lnklst.disabled = false;
                }
            }
        }
    }
}