'use strict';

(function () {

  var app = angular.module('cookbook', ['ngRoute', 'cookbook.recipes']);
  app.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {templateUrl: '/views/recipe-list.html'})
        .when('/recipe/:recipeId', {templateUrl: '/views/recipe.html'})
        .when('/profile', {templateUrl: '/views/profile.html'})
        .otherwise({redirectTo: '/'});

      $locationProvider.html5Mode({ enabled: true, requireBase: false });

    }]);

})();
