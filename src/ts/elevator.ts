class ElevatorOperator {

	requests: number[];
	elevators: Elevator[];

	constructor(elevatorCount: number) {
		this.requests = [];
		this.elevators = Array.apply(this, new Array(elevatorCount))
			.map((i, ndx: number) => new Elevator(ndx));
	}

	/**
	 * start
	 * 
	 * This kicks off the elevator operator once it has been initialized
	 *
	 * Essentially loops through all elevators and passes them the list of results
	 * Each elevator determines for itself if any of the requests can be picked up by it
	 * 
	 * @type {[type]}
	 */
	start = () => {
		this.elevators.forEach((elevator: Elevator) => 
					this.requests = elevator.takeTurn(this.requests));		

		setTimeout(this.start, 2000);
	}

	/**
	 * addRequest
	 *
	 * Function used to add request(s) to the list.
	 * 
	 * @param {[type]} ...requests array of numbers
	 */
	addRequest(...requests) {
		this.requests.push.apply(this.requests, requests);
	}
}

class Elevator {
	cur: number;
	doorOpen: boolean;
	destinations: number[];
	number: number;

	constructor(number: number) {
		this.cur = 1;
		this.doorOpen = false;
		this.destinations = [];
		this.number = number;
	}

	/**
	 * takeTurn
	 *
	 * Every round, elevators receive a list of requests one at a time
	 * and each elevator determines if there is a request that it makes sense for it to take
	 *
	 * If an elevator has no destinations it is working towards, then it will always take an available request
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	takeTurn(requests: number[]): number[] {

		//filter out requests already queued
		if(this.destinations.length > 0)
			this.destinations.forEach((r: number) => requests = this.filterRequests(requests, r));

		//add new requests
		requests = this.addDestination(requests);

		// console.log(`Elevator: ${this.number} Requests: ${requests}, destinations: ${this.destinations}`);

		this.workTowardsGoal();

		return requests;
	}

	/**
	 * addDestination
	 *
	 * See if any of the current requests are relevant to us
	 *
	 * If there is a relevant result, add 1 to destinations
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	addDestination(requests: number[]): number[] {

		if(requests.length > 0) {

			//we either have current destinations or not
			if(this.destinations.length > 0) {
				//we are moving towards a floor, or waiting to open the doors or close the doors
				
				//we are at the current floor, and will be opening doors.
				if(this.destinations[0] === this.cur)
					return this.solveNextDirecion(requests);
				//we are lower than the destination and will move up
				else if(this.destinations[0] > this.cur)
					return this.solveHigher(requests);
				//we are higher than the destination and will move down
				else if(this.destinations[0] < this.cur)
					return this.solveLower(requests);
				else
					console.error("Current Floor is not == > or <. This case should be impossible.");
			} 
			else { // we are waiting
				//we have a request for the current floor
				if(requests.indexOf(this.cur) !== -1) //push just that request, and reprocess all requests again next time
					return this.holdDoor(requests);
				//handle other requests depending on if there are more up or down
				else
					return this.solveNextDirecion(requests);
			}

		}
		//if none of our conditions were met, we still need to return requests
		return [];
	}

	/**
	 * solveNextDirection
	 * 
	 * When we are in need of another request to handle, we take one that makes sense to us
	 *
	 * Our criteria depends on if there are more requests above or below us
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	solveNextDirecion(requests: number[]): number[] {
		//figure out if there are more requests higher or lower than current floor
		var higher = requests.filter((r) => r > this.cur),
			lower = requests.filter((r) => r < this.cur),
			up = true;

		//if there is a destination we only care about the ones leading up to it
		if(this.destinations.length > 0) {
			higher = higher.filter((r) => r < this.destinations[0]);
			lower = lower.filter((r) => r > this.destinations[0]);
			up  = this.cur < this.destinations[0];
		}
		else
			up = higher.length > lower.length;

		
		if(higher.length > 0 || lower.length > 0) {
			//put the lowest number that is still higher than cur on top
			if(up)
				this.destinations.unshift(higher.sort().pop());
			else //put the highest number that is still lower than cur on top
				this.destinations.unshift(lower.sort().shift());

			requests = this.filterRequests(requests, this.destinations[0]);
		}
		
		return requests;
	}

	/**
	 * solveHigher
	 *
	 * See if there are requests that are between our current floor and our destination as we are going up
	 *
	 * If there are, we should take 1
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	solveHigher(requests: number[]): number[] {
		var higher = requests.filter((r) => r > this.cur && r < this.destinations[0]);

		if(higher.length > 0) {
			this.destinations.unshift(higher.sort().pop());

			requests = this.filterRequests(requests, this.destinations[0]);
		}
		
		return requests;
	}

	/**
	 * solveLower
	 *
	 * See if there are requests that are between our current floor and our destination as we are going down
	 *
	 * If there are, we should take 1
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	solveLower(requests: number[]): number[] {
		var lower = requests.filter((r) => r < this.cur && r > this.destinations[0]);

		if(lower.length > 0) {
			this.destinations.unshift(lower.sort().shift());

			requests = this.filterRequests(requests, this.destinations[0]);
		}
		
		return requests;
	}

	/**
	 * holdDoor
	 *
	 * We have a new request on the floor we are at.  
	 * 
	 * Wait, and then filter our all other requests on that floor
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	holdDoor(requests: number[]): number[] {
		this.destinations.unshift(this.cur);
		return this.filterRequests(requests, this.cur);
	}

	/**
	 * filterRequests
	 * 
	 * @param  {number[]}   requests 	the requests we are handling
	 * @param  {number}   floor         the number of the floor we are filtering out
	 * @return {number[]}   			the requests to overwrite the original array
	 */
	filterRequests(requests: number[], floor: number): number[] {
		return requests.filter((r) => r !== floor);
	}

	workTowardsGoal(): void {
		if(this.destinations.length > 0){
			if(this.cur === this.destinations[0])
				this.openDoors();
			else if(this.doorOpen)
				this.closeDoors();
			else
				this.move();
		}
		else if(this.doorOpen)
			this.closeDoors();
		else
			this.wait();
	}

	/**
	 * openDoors
	 *
	 * Open the door or hold door.  
	 * 
	 * if we are opening the door, set doorOpen
	 * After that, remove the destination from our list
	 */
	openDoors(): void {
		if (this.doorOpen) {
			//we have another request for this floor and will wait a bit
			console.log(`. . . Another request on floor ${this.cur}. Elevator ${this.number} Waiting . . .`);
		}
		else {
			console.log(`Elevator ${this.number} is opening doors on floor ${this.cur}`);
			this.doorOpen = true;
		}

		//this is the only location we remove elements from destinations
		this.destinations.shift();
	}

	/**
	 * closeDoors
	 *
	 * Close the door, and set the doorOpen flag
	 */
	closeDoors(): void {
		console.log(`Elevator ${this.number} is closing doors on this.cur`);
		this.doorOpen = false;
	}

	move(): void {
		console.log(`Elevator ${this.number} is moving from ${this.cur} to ${(this.cur > this.destinations[0]) ? --this.cur : ++this.cur} towards ${this.destinations[0]}`);
	}

	wait(): void {
		console.log(`. . . Elevator ${this.number} waiting on floor ${this.cur} . . .`);
	}

}

(function() {

	//cache the current interface
	var btnReq = <HTMLButtonElement>document.querySelector('.btn-request');
	var btnDest = <HTMLButtonElement>document.querySelector('.btn-destination');
	var btnBoth = <HTMLButtonElement>document.querySelector('.btn-both');
	var inpFloor = <HTMLSelectElement>document.querySelector('.request-floor-input');
	var inpDest = <HTMLSelectElement>document.querySelector('.request-destination-input');

	btnReq.addEventListener('click', () => eo.addRequest(<any>inpFloor.value * 1));

	btnDest.addEventListener('click', ()=> eo.addRequest(<any>inpDest.value * 1));

	btnBoth.addEventListener('click', () => {
		eo.addRequest(<any>inpFloor.value * 1, <any>inpDest.value * 1);//*1 is for coercion
	});

	var eo = new ElevatorOperator(1);

	eo.start();
})();