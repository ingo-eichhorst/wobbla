/* global ModernWordCloud */
angular.module('cloudApp', ['ngResource']).controller('CloudController', function ($scope, $http, $interval, $timeout) {
  /* Get Cloud Entries
    var Cloud = $resource('localhost:3333/cloud');
    var cloud = Cloud.get(function() {
      console.log('got cloud data');
    });
    // GET the single title over API
    // As a top list or fixed position with changing word size
    */
  $scope.nav = 'modern';
  $scope.mode = 'desc';

  // Initialize modern word cloud (will be created when the view is shown)
  let modernWordCloud = null;

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

      // Update modern word cloud if it exists and the view is active
      if (modernWordCloud && $scope.nav === 'modern' && cloudResp.length > 0) {
        modernWordCloud.update(cloudResp);
      }
    });
  };
  $scope.getCloud();

  // Watch for navigation changes to initialize modern word cloud
  $scope.$watch('nav', function (newVal, _oldVal) {
    if (newVal === 'modern' && !modernWordCloud) {
      // Wait for DOM to render
      $timeout(function () {
        const container = document.getElementById('modern-word-cloud');
        if (container) {
          modernWordCloud = new ModernWordCloud('modern-word-cloud', {
            width: container.clientWidth,
            height: 600,
            animationDuration: 500,
            staggerDelay: 50,
          });
          // Initial update with current cloud data
          if ($scope.cloud.length > 0) {
            modernWordCloud.update($scope.cloud);
          }
        }
      }, 100);
    }
  });

  $scope.permanentCloudCall = $interval($scope.getCloud, 1000);
});
