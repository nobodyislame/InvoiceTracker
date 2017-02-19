angular.module('DataStore',[])
.factory ('DataStore', function ($q, LoadingCtrl) {

	var setUp;
	var db;
	return {
		init: function () {

			console.log("Initializing DataStore");
			var deferred = $q.defer();

			if(setUp) {
				deferred.resolve(true);
				return deferred.promise;
			}

			var indexedDB = window.indexedDB || window.webkitIndexedDB;
			
			var openRequest = indexedDB.open("INVOICE_TRACKER",2);
		
			openRequest.onerror = function(e) {
				console.log("Error opening db");
				deferred.reject(e.toString());
			};

			openRequest.onupgradeneeded = function(e) {
		
				console.log("On Upgrade Called...");
				var thisDb = e.target.result;

				var userStore;     // USERS: 
				if(!thisDb.objectStoreNames.contains("USERS")) {
					userStore = thisDb.createObjectStore("USERS", {keyPath: "id", autoIncrement:true});
					userStore.createIndex("USERS_Index", "id", { unique: true });
				}

				var customersStore; // CUSTOMERS 
				if(!thisDb.objectStoreNames.contains("CUSTOMERS")) {
					customersStore = thisDb.createObjectStore("CUSTOMERS", {keyPath: "id", autoIncrement:true});
					customersStore.createIndex("CUSTOMERS_Index", "id", { unique: true });
				}

				var paymentsStore;   // PAYMENTS
				if(!thisDb.objectStoreNames.contains("PAYMENTS")) {
					paymentsStore = thisDb.createObjectStore("PAYMENTS", {keyPath: "id", autoIncrement:true});
					paymentsStore.createIndex("PAYMENTS_Index", "id", { unique: true });
				}

			};

			openRequest.onsuccess = function(e) {
				console.log("OK : DB Created!");
				db = e.target.result;
				
				db.onerror = function(event) {
					console.log('DB operation error');
					deferred.reject("Database error: " + event.target.errorCode);
				};
		
				setUp=true;
				deferred.resolve(true);
			};	

			return deferred.promise;

		},
		clear: function (storeName) {

			var deferred = $q.defer();

			var transaction = db.transaction([storeName],"readwrite");
			var store = transaction.objectStore(storeName);

			var request = store.clear(	);

			request.onerror = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Error while clearing the DB",e.target.error.name);
			    deferred.reject(e.toString());
			}
			 
			request.onsuccess = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Clearing DB: OK");
				deferred.resolve(request.result);
			}

			return deferred.promise;

		},
		add: function (storeName, obj) {
			LoadingCtrl.show();
			var deferred = $q.defer();

			var transaction = db.transaction([storeName],"readwrite");
			var store = transaction.objectStore(storeName);

			var request = store.add(obj);

			request.onerror = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Error Adding to DB",e.target.error.name);
			    deferred.reject(e.toString());
			}
			 
			request.onsuccess = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Add 1 Item: OK");
				deferred.resolve(request.result);
			}
			LoadingCtrl.hide();
			return deferred.promise;

		},
		delete: function (storeName, id) {

			LoadingCtrl.show();
			var deferred = $q.defer();

			var transaction = db.transaction([storeName],"readwrite");
			var store = transaction.objectStore(storeName);

			var request = store.delete(id);

			request.onerror = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Error Deleting from DB",e.target.error.name);
			    deferred.reject(e.toString());
			}
			 
			request.onsuccess = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Delete 1 Item: OK");

				deferred.resolve(request.result);
			}

			LoadingCtrl.hide();
			return deferred.promise;

		},
		updateOne: function(storeName, obj) {

			LoadingCtrl.show();
			var deferred = $q.defer();

			var transaction = db.transaction([storeName],"readwrite");
			var store = transaction.objectStore(storeName);

			var request = store.put(obj);

			request.onerror = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Error Updating to DB",e.target.error.name);
			    deferred.reject(e.toString());
			}
			 
			request.onsuccess = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Updating 1 Item: OK");
				deferred.resolve(request.result);
			}

			LoadingCtrl.hide();
			return deferred.promise;

		},
		getAll: function (storeName, role) {

				LoadingCtrl.show();
				var deferred = $q.defer();

			    var objArr = [];
			 
			    var trans = db.transaction([storeName], "readwrite");
			    var store = trans.objectStore(storeName);
			 

			    var cursorRequest = store.openCursor();
			 
			    cursorRequest.onsuccess = function(e) {
			            var result = e.target.result;

			            if(result === null || result === undefined){
			                deferred.resolve(objArr);
			            }
			            else{

			            	//if (result.value.role == role)
			                	objArr.push(result.value);
			                //if(result.value.id > lastIndex){
			                //    lastIndex=result.value.id;
			                //}

			                result.continue();
			            }

			    };
			 
			    cursorRequest.onerror = function(e){
			            deferred.reject(e.toString());
			    };
			    
			    LoadingCtrl.hide();
			    return deferred.promise;
		},
		getAllObjects: function (storeName) {

				var deferred = $q.defer();

			    var obj = [];
			    var trans = db.transaction(storeName, "readwrite");
			    var store = trans.objectStore(storeName);
			 

			    var cursorRequest = store.openCursor();
			 
			    cursorRequest.onsuccess = function(e) {
			            var result = e.target.result;
			                 
			            if(result === null || result === undefined){
			                deferred.resolve(obj);
			            }else{

			                obj[result.value.id] = result.value;
			                //if(result.value.id > lastIndex){
			                //    lastIndex=result.value.id;
			                //}

			                result.continue();
			            }
			            deferred.resolve(obj);
			    };
			 
			    cursorRequest.onerror = function(e){
			            deferred.reject(e.toString());
			    };
			    
			    return deferred.promise;
		},
		getOne: function (storeName, id) {

			LoadingCtrl.show();
			console.log(storeName+","+id);

			var deferred = $q.defer();

			var transaction = db.transaction([storeName],"readwrite");
			var store = transaction.objectStore(storeName);
			var index = store.index(storeName+"_Index");

			var request = index.get(id);
			
			request.onerror = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Error Retrieving 1 Item from DB",e.target.error.name);
			    deferred.reject(e.toString());
			}
			 
			request.onsuccess = function(e) {
			    console.log("DATASTORE ["+storeName+"]: Retrieving 1 Item: OK");
				deferred.resolve(request.result);
			}
			LoadingCtrl.hide();

			return deferred.promise;

		},
		find : function(storeName, query){

			LoadingCtrl.show();
			var deferred = $q.defer();

			if(query == null || query == undefined || typeof query != "object"){
				deferred.reject("Cannot query with an empty object");
			    return deferred.promise;
			}

		    var objArr = [];
		 	var match = true;
		    var trans = db.transaction([storeName], "readwrite");
		    var store = trans.objectStore(storeName);
		 

		    var cursorRequest = store.openCursor();
		 
		    cursorRequest.onsuccess = function(e) {
		            var result = e.target.result;
		            
		            if(result === null || result === undefined) {
		                
		                deferred.resolve(objArr);
		            }
		            else {

	            		for (var key in query){
	            			if(query[key] instanceof Date){
	            				if(query[key].getDate() != result.value[key].getDate()){
	            					match = false;
	            					break;
	            				}
	            				if(query[key].getMonth() != result.value[key].getMonth()){
	            					match = false;
	            					break;
	            				}
	            			}
	            			else{
	            				if(query[key] != result.value[key]){
	            					match = false;
	            					break;
	            				}
	            			}
	            			
	            		}
	            		if(match) {
	            			objArr.push(result.value);
	            			result.continue();
	            		}

	            		else {
	            			match = true;
	            			result.continue();
	            		}

		            }
		    };
		 
		    cursorRequest.onerror = function(e){
		            deferred.reject(e.toString());
		    };
		    
		    LoadingCtrl.hide();
		    return deferred.promise;
		}
	}
})
