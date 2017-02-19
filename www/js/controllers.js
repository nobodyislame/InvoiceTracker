
angular.module('invoicetracker.controllers', [])

.controller('AppCtrl', function($ionicHistory) {

  console.log("in app ctrl...");
    
  })


.controller('LoginCtrl',function($scope,$state,$ionicHistory) {
  
  console.log("in login ctrl..");
  $ionicHistory.nextViewOptions({
      disableAnimation: false,
      disableBack: true
  });
  
  $scope.doLogin = function(){
    $state.go('app.home');
  }
})


.controller('HomeCtrl',function($scope, $ionicHistory, Payment){
  console.log("in home ctrl..");

  $ionicHistory.removeBackView();
  var today = new Date();

  var query = {
    dt_next_follow_up : today
  };


  Payment.find(query, function(err, result){
    if(err) {
      console.log(err);
    }
    $scope.followups = result;
  });

  Payment.getAll(function(err,result){
    if(err){

    }
    else{
      $scope.payments = result;
    }
  })
})


.controller('CustomersCtrl',function($scope, Customer, Device) {
  console.log('in customers ctrl');

  Customer.getAll(function (err, result) {
      if (err) {

        Device.showToast("Unable to load customers.Try Again");
      }

      $scope.customers = result;
  }); 
})


.controller('CustomerCtrl',function( $scope,
                                     $stateParams,
                                     $ionicHistory,
                                     $ionicPopup,
                                     Customer,
                                     Payment,
                                     Device
                                     ){
  console.log("in customer control");
  var id = $stateParams.customerId;
  var query = {};

  $scope.confirm = function() {

    var popup = $ionicPopup.show({
      title : 'Delete Cutomer',
      template : 'Are you sure you want to delete this record ?',
      scope : $scope,
      buttons : [
        { text : 'Cancel'},
        { text : 'Delete',
          onTap : function(e) {
            $scope.delete();
          } 
        }
      ]
    });
  }

  Customer.getById(id,function(err,result) {
    if (err) {

      Device.showToast('Could not load customer.Try Again');
    }
    
    else {

      $scope.customer = result;
      var query = {
        customerId : $scope.customer.id
      };
      Payment.find(query, function(err,result) { 
        if(err){
           
          Device.showToast("Could not load payments.Try again");
        }
        else {

          $scope.payments = result;
        }
      });
    }
  });


  
  $scope.delete = function() {

    Customer.delete($scope.customer.id,function(err,result){
      if(err) {

        Device.showToast("Unable to delete customer.Try Again");
      }

      Device.showToast("Customer successfully removed");
      $ionicHistory.goBack();
      
    });

  }
})



.controller('EditCustomerCtrl',function(  $scope, 
                                          $stateParams, 
                                          $state,
                                          $timeout, 
                                          $ionicHistory, 
                                          $cordovaCamera, 
                                          Customer,
                                          Device
                                        ){

  $scope.newItem = ($stateParams.mode == 'New') ? true : false;
  $scope.itemId = $stateParams.id;
  $scope.tmpItem = {};
  
  $scope.pagetitle = $scope.newItem ? "Add Customer" : "Edit Customer";
  $scope.error = false;
 
  if($scope.newItem) { // New

    $scope.tmpItem = Customer.getModel();

  } 
  else { // Edit

      Customer.getById($scope.itemId, function (err, result) {
        if (err) {
          
          Device.showToast('Unable to load customer.Try again.');
          return;
        }
        var record = result;
        angular.copy(record,$scope.tmpItem);

    });
  }

  $scope.save = function (form) {

    if(form.$invalid) {
      $scope.error = true;
      $timeout(function(){
        $scope.error = false;
      },3000);
      return;
    }
    
    if($scope.newItem) { // New

        Customer.save($scope.tmpItem, function (err, result) {
            if (err) {
                // Go To
                Device.showToast("Failed to save customer.Try again.");
                return;
            }

            // Go To
            Device.showToast('Customer successfully added' );
            $state.go('app.editpayment', {mode : 'New', payid : 0, custid : result});
        })

    } 
    else { // Edit

      Customer.update($scope.tmpItem, function(err,result){
        if(err){

          Device.showToast("Unale to save the changes.Try again");
        }

        Device.showToast("Customer updated successfully");
        $ionicHistory.goBack();
      });
         
    }

  }

  $scope.cancel = function () {
    Device.showToast("Customer cancelled");
    $ionicHistory.goBack();
  }

  $scope.capture = function(){
    Device.takePhoto(function(err,result){
      if(err){
        Device.showToast("Platform does not support photos");
      }
      else{
        $scope.tmpItem.image = result.url;
      }
    })
  }
  
})


.controller('PaymentsCtrl',function($scope, $ionicPopup, Payment, Device){
  console.log("in payments controller");
  
  
  
  $scope.filters = [
    {name:'ALL'},
    {name:'OVERDUE'},
    {name:'DUE'},
    {name:'RECIEVED'},
    {name:'SCHEDULED'}
  ];

  $scope.selected_filter = $scope.filters[0];
  console.log($scope.current_filter);
    
  $scope.confirm = function(id) {
    var popup = $ionicPopup.show({
      title : 'Delete Payment',
      template : 'Are you sure you want to delete this record ?',
      scope : $scope,
      buttons : 
      [
        { text : 'Cancel' },
        { text : 'Delete',
          onTap : function(e) {
            $scope.delete(id);
          }
        }
      ]
    });
  }

  $scope.selectFilter=function(filter) {
    $scope.current_filter = filter;
    console.log($scope.current_filter);
  }

  $scope.delete = function(id){

    Payment.delete(id, function(err, result){
      if(err) {

        Device.showToast("Uable to remove payment.Try Again");
      }

      Device.showToast("Payment successfully removed.");
      $scope.loadData();
    });
  }

  $scope.loadData = function(){

    Payment.getAll(function(err,result){
      if(err) {
        Device.showToast("Unable to load payments.Try again");
      }
      $scope.payments = result;
    });
  }

  $scope.loadData();
})


.controller('EditPaymentCtrl',function( $scope,
                                        $stateParams,
                                        $state,
                                        $timeout,
                                        $ionicHistory,
                                        Payment,
                                        Customer,
                                        Device
                                      ){
  
  $scope.newItem = ($stateParams.mode == 'New') ? true : false;
  $scope.itemId = $stateParams.payid;
  $scope.custId = parseInt($stateParams.custid); 
  $scope.tmpItem = {};
  $scope.show_cust_list = false;
  $scope.selected_customer = {};
  $scope.selected_currency = {};
  $scope.selected_status = {};
  $scope.error = false;
  
  var backtitle = $ionicHistory.backTitle();
  if(backtitle == 'Add Customer'){
    $ionicHistory.removeBackView();
  }

  $scope.pagetitle = $scope.newItem ? "Add Payment" : "Edit Payment";
  $scope.currencies = [ {name : "INR"}, 
                        {name : "USD"},
                        {name : "AUSD"}, 
                        {name : "POUNDS"}
                      ];

  $scope.statuses = [ {name : "SCHEDULED"}, 
                      {name : "FOLLOW-UP"}, 
                      {name : "DUE"}, 
                      {name : "OVERDUE"}, 
                      {name : "RECEIVED"}
                    ];

  if($scope.newItem && $scope.custId == 0) {
    
    $scope.customers;
    $scope.show_cust_list = true;
    $scope.tmpItem = Payment.getModel();

    Customer.getAll(function(err,result){
      if(err){

        Device.showToast("Unable to load Customers.Try again.");
      }

      $scope.customers = result;
    });
  }
  else if($scope.newItem && $scope.custId > 0){
    
    $scope.tmpItem = Payment.getModel();
    $scope.show_cust_list = false;
    Customer.getById($scope.custId,function(err,result){
      if(err){

        Device.showToast("Unable to load Customer.try again");
      }

      $scope.tmpItem.customerId = result.id;
      $scope.tmpItem.customer.name = result.name;
      $scope.tmpItem.customer.phone1 = result.phone1;
      $scope.tmpItem.customer.email = result.email;
    });

  }
  else {

    Payment.getById($scope.itemId,function(err, result){
      if(err) {

        Device.showToast("Unable to load payment.Try Again");
      }
      var record = result;
      angular.copy(record, $scope.tmpItem);
    });

  }

  $scope.save = function(form){
    
    if(form.$invalid){
      $scope.error=true;

      $timeout(function (){
        $scope.error = false;
      },3000);
      return;
    }

    if($scope.newItem) {

      Payment.save($scope.tmpItem,function(err,result){
        if(err) {
          
          Device.showToast('Unable to add payment.Try again');
        }

        Device.showToast("Payment successfully added");
        $state.go('app.payment', {id : result});
      });
    }

    else{

      Payment.update($scope.tmpItem, function(err,result){
        if(err){
          Device.showToast('Unable to save changes.Try again');
        }

        Device.showToast('Payment successfully changed');
        $ionicHistory.goBack();
      });
    }
  }

  $scope.cancel = function () {
    $scope.tmpItem = {};
    
    Device.showToast("Payment canceled");
    $ionicHistory.goBack();
  }
  
  $scope.addDays = function() {
    // body...
    var due = new Date();
    var follow = new Date();
    due.setTime($scope.tmpItem.dt_invoice.getTime() + 14 * 86400000);
    $scope.tmpItem.dt_due = due;
    follow.setTime($scope.tmpItem.dt_due.getTime() + 1 * 86400000);
    $scope.tmpItem.dt_next_follow_up = follow;
    
  }

  $scope.onCustomerSelect = function(selected_customer){

    $scope.selected_customer = selected_customer;

    console.log($scope.selected_customer);
    $scope.tmpItem.customerId = $scope.selected_customer.id;
    $scope.tmpItem.customer.name = $scope.selected_customer.name;
    $scope.tmpItem.customer.phone1 = $scope.selected_customer.phone1;
    $scope.tmpItem.customer.email = $scope.selected_customer.email;
  }


  $scope.selectStatus = function(status) {
    $scope.tmpItem.status = status.name;
  }

  $scope.selectCurrency = function(currency){
    $scope.tmpItem.currency = currency.name;
  }
})

.controller('PaymentCtrl', function($scope, 
                                    $stateParams,
                                    $state, 
                                    $timeout,
                                    $ionicPopover, 
                                    $ionicModal,
                                    $ionicHistory,
                                    Payment,
                                    Device
                                    ){

  console.log("inside payment ctrl");

  $scope.itemId = $stateParams.id;
  $scope.popover_on = false;
  $scope.disable_receive = true;
  $scope.error = false;
  $scope.amountError = false;
  
  var backtitle = $ionicHistory.backTitle();
  if(backtitle == "Add Payment"){
    $ionicHistory.removeBackView();
  }

  $scope.getPayment = function(){
    Payment.getById($scope.itemId, function(err,result){
    if(err){

      Device.showToast("Could not load payment.Try again");
    }

    $scope.payment = result;
    $scope.calcBalance();
    });
  }

  $ionicPopover.fromTemplateUrl('templates/paymentOptions.html',{
    scope : $scope
  })
    .then(function(popover) {
      $scope.popover = popover;
    });

  $ionicModal.fromTemplateUrl('templates/followup.html',{
    scope : $scope,
    animation : 'slide-in-up'
  })
    .then(function(modal){
      $scope.followup_modal = modal;
    });

  $ionicModal.fromTemplateUrl('templates/payment_recv.html',{
    scope : $scope,
    animation : 'slide-in-up'
  })
    .then(function(modal) {
      $scope.payment_rec_modal= modal;
    });

  $ionicModal.fromTemplateUrl('templates/partialpayment.html',{
    scope : $scope,
    animation : 'slide-in-up'
  })
    .then(function(modal){
      $scope.partial_payment_modal = modal;
    });


  $scope.popoverOptions = function(e){
    $scope.popover_on = !$scope.popover_on;
    if($scope.popover_on){
      $scope.popover.show(e);
    }
    else{
      $scope.popover.hide(e);
    }
  }

  $scope.openFollowUp = function($event){
    $scope.tmpObj = {};
    $scope.followup_modal.show();
    $scope.popoverOptions($event);
  }

  $scope.closeFollowUp = function(){
    $scope.followup_modal.hide();
  }

  $scope.openPaymentReceived = function($event){
    $scope.tmpObj = {};
    $scope.popoverOptions($event);
    $scope.payment_rec_modal.show();
  }

  $scope.closePaymentReceived = function(){
    $scope.payment_rec_modal.hide();
  }

  $scope.openPartialPayment = function(){
    $scope.tmpObj = {};
    $scope.partial_payment_modal.show();
  }

  $scope.closePartialPayment = function(){
    $scope.partial_payment_modal.hide();
  }


  $scope.updateFollowUp = function(form){

    if(form.$invalid){
      $scope.error = true;
      $timeout(function(){
        $scope.error = false;
      },3000);
      return;
    }

    var date = $scope.tmpObj.dt_next_follow_up;
    var comment = $scope.tmpObj.comment;

    $scope.payment.dt_next_follow_up = date;
    
    $scope.payment.event_log.push({
        event : "Follow Up",
        comment : comment,
        date : date
    });

    Payment.update($scope.payment,function(err,result){
      
      if(err){
  
        Device.showToast("Unable to update next follow up. Try Again");
      }
      Device.showToast("Next follow up updated");
    });
    $scope.getPayment();
    $scope.closeFollowUp();

  }

  $scope.confirmAmount = function(){

    $scope.disable_receive = !($scope.balance == $scope.tmpObj.amount);
  }

  $scope.updateReceived = function(form){
    
    if(form.$invalid) {
      $scope.error = true;
      $timeout(function(){
        $scope.error = false;
      },3000)
      return;
    }


    if($scope.balance !=$scope.tmpObj.amount){
      $scope.amountError = true;
      $timeout(function(){
        $scope.amountError = false;
      },3000);
      return;
    }


    var date = $scope.tmpObj.dt_received;
    var comment = $scope.tmpObj.comment;
    var amount = $scope.tmpObj.amount;

    $scope.payment.received = true;
    $scope.payment.dt_received = date;
    
    $scope.payment.event_log.push({
      event : "Received",
      comment : comment,
      date : date,
      amount : amount
    });

    Payment.update($scope.payment, function(err,result){
    
      if(err) {
        Device.showToast("Unable to make full payment.Try Again");
      }
      Device.showToast("Full payment received");
      $scope.getPayment();
      $scope.closePaymentReceived();   
    });   
  }

  $scope.updatePartialPayment = function(form){

    if(form.$invalid){
      $scope.error = true;
      $timeout(function(){
        $scope.error = false;
      },3000);
      return;
    }

    var date = $scope.tmpObj.dt_partial_payment;
    var comment = $scope.tmpObj.comment;
    var amount = $scope.tmpObj.partial_payment_amount;


    $scope.payment.partial_payments.push ({amount : amount});
    $scope.payment.event_log.push({
      date : date,
      event : "Partial Payment",
      comment : comment,
      amount : amount
    });

    Payment.update($scope.payment,function(err,result){
      if(err){
      
        Device.showToast("Unable to make partial payment.Try again.");
      }

      Device.showToast("Partial Payment made successfully");
    });

    $scope.getPayment();
    $scope.closePartialPayment();
  }

  $scope.calcBalance = function() {
    var partial_paid = 0;
    var fully_paid = 0;
    var amount = parseInt($scope.payment.amount);

    
    for(i=0;i<$scope.payment.partial_payments.length;i++){

      partial_paid += parseInt($scope.payment.partial_payments[i].amount);
    }

    for(var i=0;i < $scope.payment.event_log.length; i++) {
      if($scope.payment.event_log[i].event == "Received") {
        fully_paid = $scope.payment.event_log[i].amount;
      }
    }
    
    $scope.balance = amount - partial_paid - fully_paid;
    if($scope.balance == 0) {
      $scope.payment.received = true;
      $scope.payment.status = "RECEIVED";
    }

  }

  $scope.getPayment();
})


.controller('SelectCustomerCtrl', function($scope, Customer, Device){
  $scope.search = '';

  Customer.getAll(function(err, result){
    if(err){

      Device.showToast("Unable to load customers");

    }
    $scope.customers = result;
  });
})

.controller('LoadCtrl', function(LoadingCtrl, $ionicHistory) {
  console.log('in loading Ctrl');
  LoadingCtrl.show();
  $ionicHistory.nextViewOptions({
    disableAnimation : false,
    disableBack : true
  });
})