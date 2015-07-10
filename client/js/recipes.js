'use strict';

(function () {
  var app = angular.module('cookbook.recipes', ['angularFileUpload']);

  app.factory('RecipesService', ['$http', function ($http) {
    var promise;
    return {
      get: function (id) {
        return $http.get('/api/recipe/' + id)
          .then(function (res) {
            return res.data;
          });
      },
      getAll: function (reset) {
        if (reset || !promise) {
          promise = $http.get('/api/recipes')
            .then(function (res) {
              console.log(res.data.recipes.length);
              return res.data;
            });
        }
        return promise;
      },
      remove: function (id, callback) {
        $http.delete('/api/recipe/' + id).success(callback);
      },
      save: function (recipe) {
        $http.post('/api/recipe');
      }
    };
  }]);

  app.factory('UserService', ['$http', function ($http) {
    var userPromise;
    return {
      getUserInfo: function () {
        if (!userPromise) {
          userPromise = $http.get('/api/user/current')
            .then(function (res) {
              return res.data;
            });
        }
        return userPromise;
      }
    }
  }]);

  app.controller('RecipeListCtrl', ['RecipesService', function (RecipesService) {
    var ctrl = this;
    ctrl.list = [];
    ctrl.loadAll = function (reset) {
      RecipesService.getAll(reset).then(function (data) {
        ctrl.list = data.recipes;
      });
    };
    ctrl.loadAll();
  }]);

  app.controller('RecipeCtrl', ['RecipesService', '$routeParams',
    function (RecipesService, $routeParams) {
      var ctrl = this;
      ctrl.data = {};
      var recipeId = $routeParams.recipeId;
      RecipesService.get(recipeId)
        .then(function (data) {
          ctrl.data = data;
        });
    }]);

  app.controller('ProfileCtrl', ['RecipesService', function (RecipesService) {
    var ctrl = this;
    ctrl.tab = 1;
    ctrl.setTab = function (num) {
      this.tab = num;
    };
    ctrl.removeRecipe = function (id) {
      RecipesService.remove(id, function () {
        ctrl.loadAll(true);
      });
    };
    ctrl.recipes = [];
    ctrl.loadAll = function (reset) {
      RecipesService.getAll(reset)
        .then(function (data) {
          ctrl.recipes = data.recipes;
        });
    };
    ctrl.loadAll();

    ctrl.addRecipe = function (recipe) {
      RecipesService.save(recipe);
    };
  }]);

  app.controller('UserCtrl', ['UserService', function (UserService) {
    var ctrl = this;
    ctrl.info = {};
    UserService.getUserInfo().then(function (info) {
      console.log(info);
      ctrl.info = info;
    });
  }]);

  app.directive('navMenu', function () {
    return {
      restrict: 'E',
      templateUrl: '/views/nav-menu.html'
    };
  });

  app.directive('footer', function () {
    return {
      restrict: 'E',
      templateUrl: '/views/footer.html'
    };
  });

})();

