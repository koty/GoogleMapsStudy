if(isSmartPhone()) {
    document.body.style.fontSize = "20px";
}
function isSmartPhone() {
    return ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0);
}
angular.module('albus', [
    'ui'
]).directive('autoComplete', function () {
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
var app;
(function (app) {
    var searchBusByFromTo = (function () {
        function searchBusByFromTo($scope, $http) {
            var _this = this;
            this.showMap($scope, $http);
            $scope.busstops = [];
            $scope.busstopMarkers = [];
            $http.jsonp("http://www9264ui.sakura.ne.jp/busstops/result_bts_lines?format=json&format=js&callback=JSON_CALLBACK").success(function (data) {
                for(var i = 0; i < data.busstops.length; i++) {
                    $scope.busstops.push(data.busstops[i].busstopname);
                }
                _this.busstopList = data.busstops;
                _this.putMarkers($scope);
            });
            $scope.fromBusStop = "昭和通り";
            $scope.toBusStop = "五分一西";
            $scope.startTime = this.getNowTime();
            $scope.resultDiagrams = [];
            $scope.swapBusstop = function () {
                var tmp = $scope.toBusStop;
                $scope.toBusStop = $scope.fromBusStop;
                $scope.fromBusStop = tmp;
            };
            $scope.setFromBusStop = function ($event) {
                $scope.fromBusStop = $scope.currentMarker.title;
            };
            $scope.setToBusStop = function ($event) {
                $scope.toBusStop = $scope.currentMarker.title;
            };
            $scope.openMarkerInfo = function (marker) {
                $scope.currentMarker = marker;
                $scope.busstopInfoWindow.open($scope.myMap, marker);
            };
            $scope.mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            $scope.search = function () {
                _this.searchBusStop($scope, $http);
            };
        }
        searchBusByFromTo.prototype.searchBusStop = function ($scope, $http) {
            var _this = this;
            $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?" + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop) + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop) + "&departure_datetime=" + this.getNowDate() + $scope.startTime + "&format=js&callback=JSON_CALLBACK").success(function (data) {
                $scope.resultDiagrams = [];
                $scope.resultDiagrams.push(_this.formatResult(data.diagrams));
                var time = (parseInt(data.diagrams[0].diagram.avltime, 10) + 1);
                var t = _this.padZero(time);
                $http.jsonp("http://www9264ui.sakura.ne.jp/diagrams/result?" + "start_busstopnm=" + encodeURIComponent($scope.fromBusStop) + "&arrival_busstopnm=" + encodeURIComponent($scope.toBusStop) + "&departure_datetime=" + _this.getNowDate() + t + "&format=js&callback=JSON_CALLBACK").success(function (data) {
                    $scope.resultDiagrams.push(_this.formatResult(data.diagrams));
                }).error(function (data) {
                    console.log("fail");
                    console.log(data);
                });
            }).error(function (data) {
                console.log("fail");
                console.log(data);
            });
        };
        searchBusByFromTo.prototype.formatResult = function (diagrams) {
            return {
                linename: diagrams[1].diagram.linename,
                from: this.formatTime(diagrams[0].diagram.avltime),
                to: this.formatTime(diagrams[1].diagram.avltime)
            };
        };
        searchBusByFromTo.prototype.formatTime = function (t) {
            return t.substring(2, 0) + ":" + t.substring(4, 2);
        };
        searchBusByFromTo.prototype.padZero = function (num) {
            if(num < 1000) {
                return "0" + num;
            } else {
                return num.toString();
            }
        };
        searchBusByFromTo.prototype.putMarkers = function ($scope) {
            for(var i = 0; i < this.busstopList.length; i++) {
                if(!this.busstopList[i].marker) {
                    this.busstopList[i].marker = this.putMarker(this.busstopList[i], $scope);
                }
            }
        };
        searchBusByFromTo.prototype.putMarker = function (busstop, $scope) {
            var marker = new google.maps.Marker({
                map: $scope.myMap,
                title: busstop.busstopname,
                position: new google.maps.LatLng(busstop.gps1, busstop.gps2),
                icon: "Images/busstop.png"
            });
            $scope.busstopMarkers.push(marker);
            return marker;
        };
        searchBusByFromTo.prototype.getNowTime = function () {
            var Jikan = new Date();
            var time = "";
            var hour = Jikan.getHours();
            if(hour < 10) {
                time += "0";
            }
            time += hour.toString();
            var minute = Jikan.getMinutes();
            if(minute < 10) {
                time += "0";
            }
            time += minute.toString();
            return time;
        };
        searchBusByFromTo.prototype.getNowDate = function () {
            var Jikan = new Date();
            var day = "";
            var year = Jikan.getFullYear();
            day += year.toString();
            var month = Jikan.getMonth();
            if(month < 10) {
                day += "0";
            }
            day += month.toString();
            var d = Jikan.getMonth();
            if(d < 10) {
                day += "0";
            }
            day += d.toString();
            return day;
        };
        searchBusByFromTo.prototype.showMap = function ($scope, $http) {
            var _this = this;
            var watchID = navigator.geolocation.watchPosition(function (position) {
                var currentPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $scope.myMap.setCenter(currentPos);
                if(!_this.currentPosMarker) {
                    _this.currentPosMarker = new google.maps.Marker({
                        map: $scope.myMap,
                        title: "現在地",
                        icon: "Images/male.png"
                    });
                }
                _this.currentPosMarker.setPosition(currentPos);
            }, function (error) {
                switch(error.code) {
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
            }, {
                enableHighAccuracy: true
            });
        };
        searchBusByFromTo.toggleMap = function toggleMap() {
            var $map = $('#map_canvas');
            if($map.css('display') === 'none') {
                $map.css('display', 'block');
            } else {
                $map.css('display', 'none');
            }
        };
        return searchBusByFromTo;
    })();
    app.searchBusByFromTo = searchBusByFromTo;    
})(app || (app = {}));
