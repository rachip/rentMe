// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic','ionic.service.core', 'ngCordova', 'starter.controllers', 'starter.services', 'firebase', 'ionicLazyLoad', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
 var io = Ionic.io();
    var push = new Ionic.Push({
      "onNotification": function(notification) {
        alert('Received push notification!');
      },
      "pluginConfig": {
        "android": {
          "iconColor": "#ccc"
        }
      }
    });
    var user = Ionic.User.current();
    
    if (!user.id) {
      user.id = Ionic.User.anonymousId();
    }
    
    // Just add some dummy data..
    user.set('name', 'Simon');
    user.set('bio', 'This is my little bio');
    user.save();
   
    var callback = function(data) {
        push.addTokenToUser(user);
        localStorage.setItem("deviceToken", data.token);
         user.save();
       };
    push.register(callback);
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.directive('input', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element, attr) {
      element.bind('focus', function(e) {
        if (scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });
      element.bind('blur', function(e) {
        if (scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          if (scope.returnClose) element[0].blur();
          if (scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  }
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  
  .state('auth', {
    url: "/auth",
    templateUrl: "views/auth/auth.html",
    abstract: true,
    controller: 'AuthCtrl'
  })
  
  .state('auth.main', {
    url: '/main',
    templateUrl: "views/auth/main.html",
    controller: 'LoginCtrl'
  })
  
  .state('app', {
    url: "/app",
    templateUrl: "views/app/template.html",
    abstract: true,
    controller: 'ChatsCtrl'
  })
  
  //overview
  .state('app.overview', {
    url: "/overview",
    views: {
    	'menuContent': {
		  templateUrl: "views/app/overview.html",
		  controller: 'OverviewPropertiesCtrl'
    	}
    }
  })
  
  //property details
  .state('app.propertyDetails', {
    url: "/propertyDetails",
    views: {
    	'menuContent': {
    		templateUrl: "views/app/propertyDetails.html",
    		controller: 'PropertyDetailsCtrl'
    	}
    }
  })
  
  // setup an abstract state for the tabs directive
  .state('invest', {
    url: '/invest',
    abstract: true,
    templateUrl: 'views/invest/index.html',
    controller: 'InvestCtrl'
  })

  // Each tab has its own nav history stack:
  .state('invest.marketing', {
	  url: '/marketing',
    views: {
      'menuContent': {
		  templateUrl: 'views/invest/marketing.html',
          controller: 'MarketingCtrl'
    }
  }
  })
  
   // Each tab has its own nav history stack:
  .state('invest.marketingDetails', {
	  url: '/marketingDetails',
    views: {
      'menuContent': {
		  templateUrl: 'views/invest/marketingDetails.html',
          controller: 'MarketingDetailsCtrl'
    }
  }
  })

 .state('chatMain', {
    url: '/chatMain',
      templateUrl: 'templates/chatsMain.html',
          controller: 'ChatsCtrl'
  })


 .state('app.chats', {
	 url: '/chats',
	 views: {
	    'menuContent': {
	    	templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
	    }
	 }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/main');

});
