angular.module('cloudApp', ['ngResource']).controller('CloudController', function ($scope, $http, $interval) {
  /* Get Cloud Entries
    var Cloud = $resource('localhost:3333/cloud');
    var cloud = Cloud.get(function() {
      console.log('got cloud data');
    });
    // GET the single title over API
    // As a top list or fixed position with changing word size
    */
  $scope.nav = 'top';
  $scope.mode = 'desc';

  $scope.selectedChannel = '';
  $scope.channels = [];

  $scope.getChannels = function () {
    $http.get('http://localhost:4242/channels').success(function (channelResp) {
      $scope.channels = channelResp;
    });
  };
  $scope.getChannels();

  $scope.selectChannel = function (string) {
    $scope.selectedChannel = string;
    $scope.getCloud();
  };

  $scope.cloud = [];
  $scope.getCloud = function () {
    $http.get(`http://localhost:4242/cloud${$scope.selectedChannel}?mode=${$scope.mode}`).success(function (cloudResp) {
      $scope.cloud = cloudResp;
      console.log($scope.cloud);
      console.log(`success${cloudResp}`);
    });
  };
  $scope.getCloud();

  $scope.permanentCloudCall = $interval($scope.getCloud, 1000);
});
