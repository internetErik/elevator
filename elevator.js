var eo = (function(){
	var destinations = [];
	var cur = 1;
	var self;

	function ElevatorOperator() {	
		self = this;
		self.doorOpen = false;
		self.requests = [];
	}

	ElevatorOperator.prototype.process = function () {

		//filter out requests already queued
		destinations.forEach(filterRequests);

		//add new requests
		addRequests();

		console.log("Requests:", self.requests, " destinations:", destinations);

		if(destinations.length > 0){
			if(cur === destinations[0])
				openDoors();
			else if(self.doorOpen)
				closeDoors();
			else
				move();
		}
		else if(self.doorOpen)
			closeDoors();
		else
			wait();

	}

	function addRequests() {
		var tmp;

		if(self.requests.length > 0) {

			//we either have current destinations or not
			if(destinations.length > 0) {
				//we are moving towards a floor, or waiting to open the doors or close the doors
				
				//we are at the current floor, and will be opening doors.
				if(destinations[0] === cur)//if there are more higher or lower will determine next direction
					solveNextDirecion();
				//we are lower than the destination and will move up
				else if(destinations[0] > cur)
					solveHigher();
				//we are higher than the destination and will move down
				else if(destinations[0] < cur)
					solveLower();
			} 
			else {
				//we are waiting

				//we have a request for the current floor
				if(self.requests.indexOf(cur) !== -1) //push just that request, and reprocess all requests again next time
					holdDoor();
				//handle other requests depending on if there are more up or down
				else
					solveNextDirecion();
			}
		}
	}

	function solveNextDirecion() {
		//figure out if there are more requests higher or lower than current floor
		var higher = self.requests.filter(function(r){ return r > cur; }),
			lower = self.requests.filter(function(r){ return r < cur; }),
			up = true;

		//if there is a destination we only care about the ones leading up to it
		if(destinations.length > 0) {
			higher = higher.filter(function(r){ return r < destinations[0]; });
			lower = lower.filter(function(r){ return r > destinations[0]; });
			up  = cur < destinations[0];
		}
		else
			up = higher.length > lower.length;

		
		if(higher.length > 0 || lower.length > 0) {
			//put the lowest number that is still higher than cur on top
			if(up)
				destinations.unshift(higher.sort().pop());
			else //put the highest number that is still lower than cur on top
				destinations.unshift(lower.sort().shift());

			filterRequests(destinations[0]);
		}
	}

	function solveHigher() {
		var higher = self.requests.filter(function(r){ return r > cur && r < destinations[0]; });

		if(higher.length > 0) {
			destinations.unshift(higher.sort().pop());

			filterRequests(destinations[0]);
		}
	}

	function solveLower() {
		var lower = self.requests.filter(function(r){ return r < cur && r > destinations[0]; });

		if(lower.length > 0) {
			destinations.unshift(lower.sort().shift());

			filterRequests(destinations[0]);
		}
	}

	function filterRequests(floor) {
		self.requests = self.requests.filter(function(r){ return r !== floor });
	}

	function holdDoor() {
		destinations.unshift(cur);
		filterRequests(cur);
	}

	function openDoors() {
		if(self.doorOpen) {
			//we have another request for this floor and will wait a bit
			console.log(". . . Another request on this floor. Waiting . . .")
		}
		else {
			console.log("doors open");
			self.doorOpen = true;
		}

		destinations.shift();
	}

	function closeDoors() {
		console.log("doors close");
		self.doorOpen = false;
	}

	function move() {
		console.log((cur > destinations[0]) ?
			"moving from " + cur + " to " + --cur + " towards " + destinations[0]:
			"moving from " + cur + " to " + ++cur + " towards " + destinations[0]
		);
	}

	function wait() {
		console.log(". . . waiting on floor " + cur + " . . .");
	}

	return new ElevatorOperator();

})();


var btnReq = document.querySelector('.btn-request');
var btnDest = document.querySelector('.btn-destination');
var btnBoth = document.querySelector('.btn-both');

var inpFloor = document.querySelector('.request-floor-input');
var inpDest = document.querySelector('.request-destination-input');


function step() {

	eo.process();

	setTimeout(step, 2000);
}

btnReq.addEventListener('click', function() {
	insert(inpFloor.value*1);//*1 is for coercion 
});

btnDest.addEventListener('click', function() {
	insert(inpDest.value*1); //*1 is for coercion
});

btnBoth.addEventListener('click', function() {
	insert(inpFloor.value*1);//*1 is for coercion
	insert(inpDest.value*1); 
});

function insert(v) {;
	if(eo.requests.indexOf(v) === -1)
		eo.requests.push(v);
}
//start working
step();




