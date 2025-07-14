angular.module('cloudApp', ['ngResource'])
  .controller('CloudController', function($scope, $http, $interval) {
    
    $scope.nav = 'top';
    $scope.mode = 'desc';
    $scope.selectedChannel = '';
    $scope.channels = [];
    $scope.cloud = [];

    $scope.getChannels = function() {
      $http.get('/channels')
        .then(function(response) {
          $scope.channels = response.data;
        }, function(error) {
          console.error('Error fetching channels:', error);
        });
    };

    $scope.selectChannel = function(channelPath) {
      $scope.selectedChannel = channelPath;
      $scope.getCloud();
    };

    $scope.getCloud = function() {
      $http.get('/cloud' + $scope.selectedChannel + '?mode=' + $scope.mode)
        .then(function(response) {
          $scope.cloud = response.data;
          console.log('Cloud data updated:', $scope.cloud);
        }, function(error) {
          console.error('Error fetching cloud data:', error);
        });
    };

    // Initialize the application
    $scope.getChannels();
    $scope.getCloud();

    // Set up periodic cloud updates
    $scope.permanentCloudCall = $interval($scope.getCloud, 1000);

    // Clean up interval on scope destroy
    $scope.$on('$destroy', function() {
      if ($scope.permanentCloudCall) {
        $interval.cancel($scope.permanentCloudCall);
      }
    });
  });
