var widthArr = [60, 40, 50];
var loginUserType;
var TheBranchName;
localStorage.setItem("isLoggedin", "false");
angular.module('starter.controllers', ['firebase'])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

// APP
.controller('AppCtrl', function($scope, $location, $state, $ionicConfig, $rootScope, $http, $ionicPopup) {

	$scope.selectChat = function() {
		console.log('click chat ' + $rootScope.propertyCnt);
		$state.go('chatMain');
	}  
})

// Invest
.controller('InvestCtrl', function($scope, $state) {
	
	$scope.sideMenuNavigation = function() {
		if(localStorage.getItem("email") != null) {
			$state.go('app.overview');
		} else
			$state.go('auth.main');
	}  
})

//LOGIN
.controller('LoginCtrl', function($scope, $rootScope, $http, $state, $location) {

	$scope.rentMe = function() {
		$state.go('app.propertyDetails');
	}
	
	$scope.fixMe = function() {
		$state.go('invest.marketing');
	}
	
	$scope.loginClick = 0;
	$scope.errorLogin = 0;

	$scope.updateMe = function() { 
		$scope.loginClick = 1;
    };
    
    $scope.investMe = function() {
	    $state.go('invest.marketing');
    };

    $scope.userDetail = {};
	
	if(localStorage.getItem("email") != null) {
		$scope.userDetail.email = localStorage.getItem("email");
		$scope.userDetail.password = localStorage.getItem("password");
	}

	$scope.submit = function() {    
	   $http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Login', 
		    method: "POST",
		    data:  {mail:$scope.userDetail.email,
		    	    password:$scope.userDetail.password}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    
		}).then(function(resp) {
			if(resp.data == "false") {
				$scope.msg = "The Email or Password incorrect";
				$scope.errorLogin=1;
				
				Ionic.io();
				// this will give you a fresh user or the previously saved 'current user'
				var user = Ionic.User.current();
				user.id = Ionic.User.anonymousId();

				//persist the user
				user.save();
			}
			else {
				// kick off the platform web client
				Ionic.io();

				// this will give you a fresh user or the previously saved 'current user'
				var user = Ionic.User.current();

				// if the user doesn't have an id, you'll need to give it one.
				if (!user.id) {
					user.id = Ionic.User.anonymousId();
					// user.id = 'your-custom-user-id';
				}

				user.set('name', resp.data["ClientName"]);
				user.set('userid', resp.data["UserId"]);

				//persist the user
				user.save();
				
				localStorage.setItem("loginUserType", resp.data["Type"]);
				if(resp.data["Type"] == "user") {
					loginUserType = "user";
					localStorage.setItem("id", resp.data["UserId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("isAdmin", resp.data["IsAdmin"]);
					localStorage.setItem("branch", resp.data["BranchId"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
					localStorage.setItem("isLoggedin", "true");
				}
				else {
					user.set('name', resp.data["ClientName"]);
					loginUserType = "client";
					localStorage.setItem("id", resp.data["ClientId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
					localStorage.setItem("isLoggedin", "true");
					
					var deviceToken = localStorage.getItem("deviceToken");

					$http({
					    url: 'http://updateme.co.il/index.php/api/Login/setDeviceToken', 
					    method: "POST",
					    data:  {Userid: resp.data["ClientId"],
					    DeviceToken: deviceToken,
					    IsconnectToApp: 1}, 
					    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					    
					}).then(function(resp) {

						console.log(resp);

						});
				}
					
				$state.go('app.overview');
			}
		
		}, function(err) {
		    $scope.msg = err;
		    console.error('ERR', err);
		})
    };
})

//Marketing Ctrl - show all marketing properties per branch
.controller('MarketingCtrl', function($scope, $http, $state, $rootScope, $timeout, $q)  {
    
	var rndval;
	var rndvalKodem = 0;
	var i = 0;
	var $x;
	$scope.selectedBranch = "";
	$scope.showRochester = 1;
	$scope.showCleveland = 1;
	$scope.showColumbus = 1;
	$scope.showJacksonviller = 1;	
	$rootScope.isRouteLoading = true;

	var promise = getProperties($scope, $http, $q);
	promise.then(function() {
	}, function() {
		alert('Failed: ');
	});
	
	$scope.seeMore = function(branchId) {		
		$scope.selectedBranch = branchId;
		$timeout(function() {
			$('.scroll').css('transform', 'translate3d(0px, 0px, 0px) scale(1)');
		});		
	};
	
	$scope.back = function() {
		$scope.selectedBranch = "";
	}
	
	$scope.marketingDetails = function(propertyId) {	
		$state.go('invest.marketingDetails');
		$timeout(function() {
	    	var unbind = $rootScope.$broadcast( "marketingDetails", {marketingPropertyId:propertyId} );
	    });
	};
})

//propertyDetails ctrl
.controller('MarketingDetailsCtrl', function($scope, $http, $rootScope,  $ionicScrollDelegate, $cordovaSocialSharing, $ionicPopup, $q) {
	$scope.MailObj = {};
	
	$rootScope.isMarketingDetailsLoading = true;
	
	$scope.$on( "marketingDetails", function(event, data) {
		propertyId = data.marketingPropertyId;
		var promise = getMarketingDetailsPageData(propertyId, $scope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});			
	});
	
	$scope.share = function(propID) {
		var isLoggedin = localStorage.getItem("isLoggedin");
		
		console.log("propId : " + propID);

		if (isLoggedin == "true") {
			var uri = "http://54.213.146.142/wordpress/?page_id=5639&prop=" + propID;  
			var massage = localStorage.getItem("ClientName") + " wanted to share with you a very interesting investment he thought you might be interested in and grant you with a 5% discount….";
			$cordovaSocialSharing.share(massage, "Me app", null, uri);
		}
		else {
			var alertPopup = $ionicPopup.alert({
				title: 'Me app',
				template: 'You must log in to share property'
			});
		}
	}
	
	$scope.rent = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.sendMail = 1;
	};
	
	$scope.meeting = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.meet = 1;
	};
	
	$scope.closeMailPopup = function() {
		$ionicScrollDelegate.scrollTop();
		$scope.sendMail = 0;
	};
	
	$scope.closeMeetingPopup = function() {
		$ionicScrollDelegate.scrollTop();
		$scope.meet = 0;
	};
	
	$scope.send = function() {
		$ionicScrollDelegate.scrollTop();	
		$scope.sendMail = 0;
		
		var obj = {name: $scope.MailObj.name, mail: $scope.MailObj.mail, phone: $scope.MailObj.phone,
				   address: $scope.MailObj.address};
		console.log(obj);
		
		// send mail to moshe gmail
		$http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Email/rent', 
		    method: "POST",
		    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
				   address: $scope.MailObj.address},
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then(function(resp) {
			console.log("sucess")
		}, function(err) {
		    console.error('ERR', err);
		})	
		
		// save mail details in S_ContactsLeads tbl
		$http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Email/addContactLeads', 
		    method: "POST",
		    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
				   address: $scope.MailObj.address},
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then(function(resp) {
			console.log("sucess")
		}, function(err) {
		    console.error('ERR', err);
		})	
		$scope.MailObj = {};
	}
})

//Chats Ctrl
.controller('ChatsCtrl', function($scope, $ionicHistory, $state, $rootScope, $firebaseObject ,$firebaseArray, $ionicScrollDelegate, $rootScope ) { 
	
 	$scope.myGoBack = function() { 
 		$ionicHistory.goBack(); 
 		$scope.show_chat_bu = true;
    }; 
	
	$scope.show_chat_bu = true;
	
	$scope.hide_chat_box = function() {
		$scope.chatSelected = false;
	}

	$scope.branchToChat = function (BranchName) { 
		TheBranchName = BranchName;	
	 	$scope.chatSelected = false; 
	 	$scope.show_chat_bu = false;	 
	 	$state.go('app.chats'); 
	} 
 
 	$scope.selectChat = function() { 
 		if ($rootScope.propertyCnt > 1 ) { 
 			$scope.chatSelected = true; 
 		} else { 
 			TheBranchName = $rootScope.TheBranchName; 
 			$state.go('app.chats'); 
 			$scope.show_chat_bu = false;
 		} 
 	}  

  	$scope.chatIsActive = false; 
 
  	$scope.myId = localStorage.getItem("id"); 
 	var userId = localStorage.getItem("id"); 
 
 	var ref = new Firebase("https://updatemeapp.firebaseio.com/messages/" + TheBranchName + "/" + userId); 
 
  	ref.on("child_added", function(date) { 
	 	$ionicScrollDelegate.scrollBottom(); 
	 	$ionicScrollDelegate.scrollBottom(); 
 	}); 
 
  	$ionicScrollDelegate.scrollBottom(); 
  
 	$scope.chats = $firebaseArray(ref); 
 
  	var username = localStorage.getItem("ClientName"); 
   
 	$scope.sendChat = function(chat) { 
   		$scope.chats.$add({ 
 			user: username, 
 			userid: userId, 
 	        message: chat.message, 
 	        client: 'true', 
 	        timestamp: new Date().getTime() 
 		}); 
 		chat.message = ""; 
 	} 
 
    $scope.isEmpty = function (obj) {
    	console.log("obj "+ obj);
        if (obj == "") 
        	return false;
        else
        	return true;
    };
}) 

//propertyDetails ctrl
.controller('PropertyDetailsCtrl', function($scope, $ionicScrollDelegate, $http, $rootScope, 
			$timeout, $q, $ionicPopup) {
	
	$scope.showRent = 0;
	$scope.showLease = 0;
	$scope.showEviction = 0;
	
	$scope.requestPopup = 0;
	$scope.Info = {};
	
	$rootScope.isPropertyDetailsLoading = true;
	
	var propertyId = 3;
	
		//propertyId = data.PropertyId;	
		var promise = getOverviewDetailsPageData(propertyId, $scope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});			
	
	$scope.click = function(section) {		
		switch(section){
			case 1:
				$scope.showRent = ($scope.showRent) ? 0 : 1;
				break;
			case 2:
				$scope.showLease = ($scope.showLease) ? 0 : 1;
				break;
			case 3:
				$scope.showEviction = ($scope.showEviction) ? 0 : 1;
				break;
		}		
	};
	
	$scope.requestInfo = function() {
		$ionicScrollDelegate.scrollBottom();		
		$scope.requestPopup = 1;
		$('#requestInfo').removeClass('fadeOut').addClass('fadeIn');		
		$('input[type=checkbox]').removeAttr('checked');
	};
	
	showAlert = false;
	$scope.sendRequestInfo = function() {
		$ionicScrollDelegate.scrollTop();		
		for(var i in $scope.Info) {
			if($scope.Info[i]) {
				showAlert = true;
				$http({
		    	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_RequestUpdate', 
		    	    method: "GET",
		    	    params:  { id:propertyId, table:i }, 
		    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    	}).then(function(resp) {
		    		
		    	}, function(err) {
		    	    console.error('ERR', err);
		    	})
			}
		}
		
		$('#requestInfo').removeClass('fadeIn').addClass('fadeOut');		
		$timeout(function() {					
			$scope.requestPopup = 0;
			$scope.Info = {};
		});	
		
		if(showAlert) {
			var alertPopup = $ionicPopup.alert({
			     title: 'Fix ME',
			     template: 'Your request for update was sent to the office'
			   });
			   alertPopup.then(function(res) {
			     //console.log('Thank you for not eating my delicious ice cream cone');
			   });
			showAlert = false;
		}
	};
	
	$scope.closePopup = function() {
		$scope.requestPopup = 0;
		$ionicScrollDelegate.scrollTop();
	};
})

.controller('DashCtrl', function($scope) {})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

function getPropertyImage(propertyId, $scope, $http) {	
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_PropertyImage/getPropertyImageAPI', 
	    method: "GET",
	    params:  {PropertyId: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.allImages = resp.data;			
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getRentDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Rent', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.rent = resp.data[0];
		
			$scope.rent['PaymentMadeSum'] = numberWithCommas($scope.rent['PaymentMadeSum']);
			$scope.rent['OutstandingBalance'] = ($scope.rent['OutstandingBalance'] != '0') ? numberWithCommas($scope.rent['OutstandingBalance']) : 0;
			$scope.rent['PaymentDate1'] = dateFormat($scope.rent['PaymentDate1']);
			$scope.rent['PaymentDate2'] = dateFormat($scope.rent['PaymentDate2']);
			$scope.rent['PaymentDate3'] = dateFormat($scope.rent['PaymentDate3']);
			$scope.rent['PaymentDate4'] = dateFormat($scope.rent['PaymentDate4']);
			$scope.rent['PaymentDate5'] = dateFormat($scope.rent['PaymentDate5']);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getLeaseDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Lease', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.lease = resp.data[0];
		
			$scope.lease['LeaseStartDate'] = dateFormat($scope.lease['LeaseStartDate']);
			$scope.lease['LeaseEndDate'] = dateFormat($scope.lease['LeaseEndDate']);
		}		
	}, function(err) {
	    console.error('ERR', err);
	})	
}

function getEvictionDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Eviction', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.eviction = resp.data[0];

			$scope.eviction["OutStandingBalance"] = numberWithCommas($scope.eviction["OutStandingBalance"]);
			
			$scope.eviction['CourtDate'] = dateFormat($scope.eviction['CourtDate']);
			$scope.eviction['LockOut'] = dateFormat($scope.eviction['LockOut']);
			$scope.eviction['EvictionField'] = dateFormat($scope.eviction['EvictionField']);
			
			$scope.isCourtDate = $scope.eviction['IsCourtDate'] == 1 ? true : false;
			$scope.isLockOut = $scope.eviction['IsLockOut'] == 1 ? true : false;
			$scope.isEvictionField = $scope.eviction['IsEvictionField'] == 1 ? true : false;
			
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function addClass(data) {
	var length = data.length;
	var rndvalKodem;
	var rndval;
	
	//----------------------
	//add col- class
	if(data.length % 2 != 0) {
		data[data.length - 1].class = "col-100";
		length -= 1;
	}
	
	rndvalKodem = 0;
	for(var i = 0; i < length; i+=2) {
		do {
			rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
		} while (rndval == rndvalKodem);
		rndvalKodem = rndval;				
		data[i].class = "col-" + rndval;
		rndval = 100 - rndval;
		data[i+1].class = "col-" + rndval;
	}
	
	//----------------------
	//add desaturate class
	for(i = 0; i < data.length; i++) {
		if(data[i]["Status"] == 'Rented') {
			data[i].class += " desaturate";
		}
	}
}

function getRochesterProperties($scope, $http) {
	// get properties to Rochester branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:1}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.rochesterProperties = [];
		$scope.rochesterProperties = resp.data;
		
		if(resp.data.length == 0) {
			$scope.showRochester = 0;
		}
		addClass($scope.rochesterProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getClevelandProperties($scope, $http) {
	// get properties to cleveland branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:2}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.clevelandProperties = [];
		$scope.clevelandProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showCleveland = 0;
		}
		addClass($scope.clevelandProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
} 


function getColumbusProperties($scope, $http) {
	// get properties to columbus branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:3}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.columbusProperties = [];
		$scope.columbusProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showColumbus = 0;
		}
		addClass($scope.columbusProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getJacksonvilleProperties($scope, $http) {
	// get properties to jacksonville branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:4}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.jacksonvilleProperties = [];
		$scope.jacksonvilleProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showJacksonviller = 0;
		}
		addClass($scope.jacksonvilleProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	}); 
}

function getProperties($scope, $http, $q) {	 
	return $q.all([getRochesterProperties($scope, $http), 
	               getClevelandProperties($scope, $http), 
	               getColumbusProperties($scope, $http), 
	               getJacksonvilleProperties($scope, $http)]).
	                then(function(results) {
		$scope.isRouteLoading = false;
	});
}

function getAllMarketingPropertyImages(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getAllMarketingPropertyImages', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.marketingPropertyImages = resp.data;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getMarketingPropertyInfo(propertyId, $scope, $http) {
	var address;
	
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/Students/api/S_Marketing/getMarketingId', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.marketingData = resp.data[0];
			
			$scope.marketingData["Price"] = numberWithCommas($scope.marketingData["Price"]);
			$scope.marketingData["AvailableDate"] = dateFormat($scope.marketingData["AvailableDate"]);
			$scope.marketingData["OpenShowingDate"] = dateFormat($scope.marketingData["OpenShowingDate"]);
			
			address = $scope.marketingData["Address"];
			rating = $scope.marketingData["Rating"];
			
			console.log($scope.marketingData);

			drawRating(rating);
			darwGoogleMap(address);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function drawRating(rating) {
	var imageUrl = '';
	switch (rating) {
	    case "A":  $('.ratingImg').html('<img src="css/img/A.png" height="auto" width="100%">');
	               break;
	    case "B":  $('.ratingImg').html('<img src="css/img/B.png" height="auto" width="100%">');
        		   break;
	    case "C":  $('.ratingImg').html('<img src="css/img/C.png" height="auto" width="100%">');
        		   break;
	    case "D":  $('.ratingImg').html('<img src="css/img/D.png" height="auto" width="100%">');
        		   break;
	    case "E":  $('.ratingImg').html('<img src="css/img/E.png" height="auto" width="100%">');
        		   break;
	    case "F":  $('.ratingImg').html('<img src="css/img/F.png" height="auto" width="100%">');
        		   break;
	}
}

function darwGoogleMap(address) {
	var geocoder;
	var map;
	var address = address;
    
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(-34.397, 150.644);
        
    var mapOptions = {
		zoom: 8,
	    center: latlng,
	    mapTypeControl: true,
	    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
	    navigationControl: true,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        
    if (geocoder) {
        geocoder.geocode( { 'address': address}, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
		        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {		        	
		        	map.setCenter(results[0].geometry.location);		
		        	
		        	var infowindow = new google.maps.InfoWindow(
		              { content: '<b>'+address+'</b>',
		                size: new google.maps.Size(150,50)
		              });
		
		        	var marker = new google.maps.Marker(
		        	  { position: results[0].geometry.location,
		        		map: map, 
		                title:address
		              }); 
		          
		        	google.maps.event.addListener(marker, 'click', function() {
		        		infowindow.open(map,marker);
		        	});
		
		        } else {
		          alert("No results found");
		        }
	        } else {
	          alert("Geocode was not successful for the following reason: " + status);
	        }
	    });
    }
}

function getMarketingDetailsPageData(propertyId, $scope, $http, $q) {
	return $q.all([getAllMarketingPropertyImages(propertyId, $scope, $http),
	               getMarketingPropertyInfo(propertyId, $scope, $http)]).
	                then(function(results) {
		$scope.isMarketingDetailsLoading = false;
	});
}

function getOverviewDetailsPageData(propertyId, $scope, $http, $q) {
	return $q.all([getPropertyImage(propertyId, $scope, $http),
	               getRentDetails(propertyId, $scope, $http), 
	               getLeaseDetails(propertyId, $scope, $http),
	               getEvictionDetails(propertyId, $scope, $http)]).
	                then(function(results) {
		$scope.isPropertyDetailsLoading = false;
	});
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dateFormat(date) {
	var formattedDate = new Date(date);
	return (formattedDate.getMonth() + 1) + '/' + formattedDate.getDate() + '/' +  formattedDate.getFullYear();
}

function calcPercent(sum, percent, operator) {
	var val;
	if(operator == 'minus') {
		return val = sum * ((100 - percent) / 100);
	} else {
		return val = sum * ((100 + percent) / 100);
	}
}