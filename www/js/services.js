angular.module('invoicetracker.services',[])

.factory('Customer',function(DataStore){
	var customers =  [];

  function Address () {
    this.addr1 = null;
    this.addr2 = null;
    this.city = null;
    this.state = null;
    this.pin = null;
  }

  function Asset (){
    this.url = null;
    this.tbUrl = null;
    this.type = null;
    this.size = null;
  }

	function Customer () {
    this.public_id = null;
		this.name = null;
    this.address = new Address();
    this.asset = new Asset();
		this.type = 'Organisation';
    this.status = 'Active';
		this.created = null;
		this.poc = null;
    this.dt_created = null;
    this.dt_modified = null;    
	}

  	return {
  		getModel: function () {
  			return new Customer();
  		},
  		getAll:function(cb) {
  			DataStore
  				.getAll('CUSTOMERS', null)
  				.then(function (result) {
  					cb(null, result);
  				})
  				.catch(function (err) {
  					cb(err, null);
  				})
  		},
  		getById:function(id,callback) {
  			// return customers[id-1];
  			if(typeof id != "number"){
  				id = parseInt(id);
  			}
  			DataStore
  				.getOne('CUSTOMERS', id)
  				.then (function(result) {
  					callback(null, result);
  				})
  				.catch (function(err) {
  					callback(err, null);
  				})
  		},
  		save:function(obj, cb) {

  			obj.dt_created = new Date();
  			obj.dt_modified = new Date();

  			DataStore
  				.add('CUSTOMERS', obj)
  				.then(function (result) {
  					cb(null, result);
  				})
  				.catch(function (err) {
  					cb(err, null);
  				})
  		},
  		update:function(obj,callback) {
 
  			obj.dt_modified = new Date();
  			DataStore
  				.updateOne('CUSTOMERS',obj)
  				.then(function(result) {
  					callback(null, result);
  				})
				.catch(function(err){
					callback(err, null);
				})
  		},
  		delete:function(id, callback) {
  			if(typeof id != "number"){
  				id = parseInt(id);
  			}
  			DataStore
  				.delete('CUSTOMERS', id)
  				.then(function(result){
  					callback(null,result);
  				})
  				.catch(function(err){
  					callback(err,null);
  				})
  		}
  	}
})

.factory('Payment',function(DataStore) {
	var payments = [];

	function Payment() {

    this.invoiced = null;
		this.invoice = null;
    this.description = null;
    this.amount = null;
    this.currency = null;
    this.dt_invoice = null;
    this.dt_due = null;
    this.dt_next_follow_up = null;
    this.dt_received = null;
		this.customerId = null;
		this.customer = {
      name : null,
      phone1 : null,
      email : null
    };
    this.status = null;
    this.dt_created = null;
    this.dt_modified = null;
    this.event_log = new Array();
    this.partial_payments = new Array();
    this.received = false;
	}

	return {
		getModel:function() {
			return new Payment();
		},
		getAll:function(callback) {
			DataStore
				.getAll('PAYMENTS',null)
				.then(function(result) {
					callback(null, result);
				})
				.catch(function(err){
					callback(err,null);
				})
		},
		getById:function(id, callback) {
			if(typeof id != "number"){
				id = parseInt(id);
			}
			DataStore
				.getOne('PAYMENTS',id)
				.then(function(result) { 
					callback(null, result);
				})
				.catch(function(err){
					callback(err, null);
				})
		},
		save:function(obj, callback) {
			obj.dt_created = new Date();
			obj.dt_modified = new Date();
			DataStore
				.add('PAYMENTS',obj)
				.then(function(result) {
					callback(null,result);
				})
				.catch(function(err){
					callback(err,null);
				})
		},
		update:function(obj,callback) {
 
  			obj.dt_modified = new Date();
  			DataStore
  				.updateOne('PAYMENTS',obj)
  				.then(function(result) {
  					callback(null, result);
  				})
				.catch(function(err){
					callback(err, null);
				})
  		},
		delete:function(id, callback) {
			if(typeof id != "number"){
				id = parseInt(id);
			}
			DataStore
				.delete('PAYMENTS', id)
				.then(function(result){
					callback(null,result);
				})
				.catch(function(err){
					callback(err,null);
				})
		},
    find:function(obj,callback){
      console.log("find in payment service called");
      DataStore
        .find('PAYMENTS',obj)
        .then(function(result){
          callback(null, result);
        })
        .catch(function(err){
          callback(err,null);
        })
    }
	}
})

.factory ('Device', function ($rootScope, $cordovaToast, $cordovaCamera, $timeout) {

  var currentDeviceInfo = {
      'name': "", 
          'cordova': "", 
          'platform': '', 
          'uuid': "", 
          'version': "", 
          'model': "", 
          'available': false,
    };

    return {

      init: function () {
        currentDeviceInfo.platform = 'html';
      },
      setDeviceInfo: function (deviceInfo) {
        currentDeviceInfo = deviceInfo;
      },
      getDeviceInfo: function () {
        return currentDeviceInfo;
      },
      showToast: function (message) {
      if (currentDeviceInfo.platform != 'html') {
        $cordovaToast.showLongBottom(message);
      } 
      else 
        console.log(message);
      },
      getUUID: function () {
        return currentDeviceInfo.uuid;
      },
      takePhoto: function (callback) {

        var options;
        var photoDataUrl;

        if (currentDeviceInfo.platform != 'html') {
            options = {
                  quality: 90,
                  destinationType: Camera.DestinationType.DATA_URL,
                  sourceType: Camera.PictureSourceType.CAMERA,
                  allowEdit: false,
                  encodingType: Camera.EncodingType.JPEG,
                  targetWidth: 512,
                  targetHeight: 512,
                  popoverOptions: CameraPopoverOptions,
                  saveToPhotoAlbum: false
            };
        } 

        if (currentDeviceInfo.platform != 'html') {
            $cordovaCamera
                .getPicture(options)
                .then(function(imageData) {
                      photoDataUrl = "data:image/jpeg;base64," + imageData;
                      
                      callback(null, {
                            done: true,
                            url: photoDataUrl,
                            type: "image/jpeg",
                            timestamp: new Date().getTime()
                      })
                      
                }, 
                function(err) {
                      callback(err, null);
                });

        } else {
            $timeout(function () {
                callback(null, {done: false});
            }, 100);
        }
    }
  }

})

.factory('LoadingCtrl', function($rootScope, $ionicLoading) { 

  return {
    show: function() {
      return $ionicLoading.show({
          //template: '<span style="font-size: 44px;">Loading...</span>'
          template: '<ion-spinner icon="android"></ion-spinner>',
          showBackdrop: false
      });
    },
    hide: function() {
      return $ionicLoading.hide();
    }
  }
})

