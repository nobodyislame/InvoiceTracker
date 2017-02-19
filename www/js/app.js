// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('invoicetracker', 
      [ 'ionic',
        'ngCordova',
        'invoicetracker.controllers',
        'invoicetracker.services',        
        'DataStore'])

.run(function($state, $ionicPlatform, $ionicHistory, DataStore, Device, Payment) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

var no_of_status_done = 0;
  var total_status;

  var updateStatus = function(obj){
    Payment.update(obj,function(err, result){
      if(err){

      }

      no_of_status_done++;
      console.log("Item "+ no_of_status_done+" done");
      
      if(no_of_status_done == total_status){
        console.log("Changing state now..");
        $state.go('app.home');
      }
    });
  }

  var getPayments = function(callback){

    Payment.getAll( function(err,result) {
      
      if(err) {
        return err;
      }
      total_status = result.length;
      callback(result);
    });
  }

  var calculateStatus = function(payments,callback){

    for(var i=0; i < payments.length; i++){

      var date = new Date();
      var obj = payments[i];

      var created = obj.dt_created.getTime();
      var invoice = obj.dt_invoice.getTime();
      var due = obj.dt_due.getTime();
      var today = date.getTime();

      if(created < today && today < invoice) {
        obj.status = "SCHEDULED";
      }

      else if (invoice < today && today < due) {
        obj.status = "DUE";
      }

      else if(today > due) {
          obj.status = "OVERDUE";
        }        
      
      else {
        
      }

      callback(obj);
    }

  }

  DataStore.init()
  .then(
    function(result) {
      getPayments(
        function(result) {
          calculateStatus(result,
            function(obj){
              updateStatus(obj);
            });
      });    
  });

  

  console.log("Initializating device on Device ready....");
  Device.init();
  
  document.addEventListener("deviceready", function (device) {
        Device.setDeviceInfo(device);
  }, false);
  console.log(Device.getDeviceInfo());


  $state.go('app.loading');

  
  });


  
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  

  $ionicConfigProvider.views.maxCache(0);

  $stateProvider


  .state('login', {
    url: '/login',
    abstract : false,
    templateUrl : 'templates/login.html',
    controller : 'LoginCtrl'
  })

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('app.customers', {
      url: '/customers',
      views: {
        'menuContent': {
          templateUrl: 'templates/customers.html',
          controller: 'CustomersCtrl'
        }
      }
    })


    .state('app.customer',{
      url:'/customer/:customerId',
      views:{
        'menuContent': {
          templateUrl: 'templates/customer.html',
          controller: 'CustomerCtrl'
        }
      }
    })

    .state('app.selectcustomer',{
      url :'/selectcustomer',
      views : {
        'menuContent' :{
          templateUrl : 'templates/selectcustomer.html',
          controller : 'SelectCustomerCtrl'
        }
      }
    })
    
    .state('app.editcustomer',{
      url:'/editcustomer/:mode/:id',
      views:{
        'menuContent': {
          templateUrl: 'templates/editcustomer.html',
          controller: 'EditCustomerCtrl'
        }
      }
    })

    .state('app.payments', {
      url: '/payments',
      views: {
        'menuContent': {
          templateUrl: 'templates/payments.html',
          controller: 'PaymentsCtrl'
        }
      }
    })

    .state('app.payment', {
      url:'/payment/:id',
      views:{
        'menuContent' : {
          templateUrl : 'templates/payment.html',
          controller : 'PaymentCtrl'
        }
      }
    })

    .state('app.editpayment',{
      url:'/editpayment/:mode/:payid/:custid',
      views:{
        'menuContent': {
          templateUrl: 'templates/editpayment.html',
          controller: 'EditPaymentCtrl'
        }
      }
    })

    .state('app.loading', {
      url : '/loading',
      views : {
        'menuContent' : {
          templateUrl : 'templates/loading.html',
          controller : 'LoadCtrl'
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/loading');
});
