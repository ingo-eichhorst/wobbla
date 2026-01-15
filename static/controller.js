angular.module('cloudApp', ['ngResource']).controller('CloudController', function ($scope, $http, $interval) {
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
    });
  };
  $scope.getCloud();

  $scope.permanentCloudCall = $interval($scope.getCloud, 1000);

  $scope.themePreference = window.WobblaTheme ? window.WobblaTheme.getStoredPreference() : 'auto';
  $scope.effectiveTheme = window.WobblaTheme ? window.WobblaTheme.getEffectiveTheme($scope.themePreference) : 'light';
  window.wobblaThemeScope = $scope;

  $scope.toggleTheme = function () {
    if (!window.WobblaTheme) return;
    $scope.themePreference = window.WobblaTheme.getNextTheme($scope.themePreference);
    $scope.effectiveTheme = window.WobblaTheme.getEffectiveTheme($scope.themePreference);
    window.WobblaTheme.storePreference($scope.themePreference);
    window.WobblaTheme.applyTheme($scope.effectiveTheme);
  };

  $scope.getThemeLabel = function () {
    return window.WobblaTheme ? window.WobblaTheme.getThemeLabel($scope.themePreference) : 'Auto';
  };

  $scope.getThemeIconClass = function () {
    return window.WobblaTheme ? window.WobblaTheme.getThemeIconClass($scope.themePreference) : 'theme-icon-auto';
  };

  $scope.$on('$destroy', function () {
    window.wobblaThemeScope = null;
  });
});
