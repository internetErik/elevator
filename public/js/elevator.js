var ElevatorOperator = (function () {
    function ElevatorOperator(elevatorCount) {
        var _this = this;
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
        this.start = function () {
            _this.elevators.forEach(function (elevator) {
                return _this.requests = elevator.takeTurn(_this.requests);
            });
            setTimeout(_this.start, 2000);
        };
        this.requests = [];
        this.elevators = Array.apply(this, new Array(elevatorCount))
            .map(function (i, ndx) { return new Elevator(ndx); });
    }
    /**
     * addRequest
     *
     * Function used to add request(s) to the list.
     *
     * @param {[type]} ...requests array of numbers
     */
    ElevatorOperator.prototype.addRequest = function () {
        var requests = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            requests[_i - 0] = arguments[_i];
        }
        this.requests.push.apply(this.requests, requests);
    };
    return ElevatorOperator;
})();
var Elevator = (function () {
    function Elevator(number) {
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
    Elevator.prototype.takeTurn = function (requests) {
        var _this = this;
        //filter out requests already queued
        if (this.destinations.length > 0)
            this.destinations.forEach(function (r) { return requests = _this.filterRequests(requests, r); });
        //add new requests
        requests = this.addDestination(requests);
        // console.log(`Elevator: ${this.number} Requests: ${requests}, destinations: ${this.destinations}`);
        this.workTowardsGoal();
        return requests;
    };
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
    Elevator.prototype.addDestination = function (requests) {
        if (requests.length > 0) {
            //we either have current destinations or not
            if (this.destinations.length > 0) {
                //we are moving towards a floor, or waiting to open the doors or close the doors
                //we are at the current floor, and will be opening doors.
                if (this.destinations[0] === this.cur)
                    return this.solveNextDirecion(requests);
                else if (this.destinations[0] > this.cur)
                    return this.solveHigher(requests);
                else if (this.destinations[0] < this.cur)
                    return this.solveLower(requests);
                else
                    console.error("Current Floor is not == > or <. This case should be impossible.");
            }
            else {
                //we have a request for the current floor
                if (requests.indexOf(this.cur) !== -1)
                    return this.holdDoor(requests);
                else
                    return this.solveNextDirecion(requests);
            }
        }
        //if none of our conditions were met, we still need to return requests
        return [];
    };
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
    Elevator.prototype.solveNextDirecion = function (requests) {
        var _this = this;
        //figure out if there are more requests higher or lower than current floor
        var higher = requests.filter(function (r) { return r > _this.cur; }), lower = requests.filter(function (r) { return r < _this.cur; }), up = true;
        //if there is a destination we only care about the ones leading up to it
        if (this.destinations.length > 0) {
            higher = higher.filter(function (r) { return r < _this.destinations[0]; });
            lower = lower.filter(function (r) { return r > _this.destinations[0]; });
            up = this.cur < this.destinations[0];
        }
        else
            up = higher.length > lower.length;
        if (higher.length > 0 || lower.length > 0) {
            //put the lowest number that is still higher than cur on top
            if (up)
                this.destinations.unshift(higher.sort().pop());
            else
                this.destinations.unshift(lower.sort().shift());
            requests = this.filterRequests(requests, this.destinations[0]);
        }
        return requests;
    };
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
    Elevator.prototype.solveHigher = function (requests) {
        var _this = this;
        var higher = requests.filter(function (r) { return r > _this.cur && r < _this.destinations[0]; });
        if (higher.length > 0) {
            this.destinations.unshift(higher.sort().pop());
            requests = this.filterRequests(requests, this.destinations[0]);
        }
        return requests;
    };
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
    Elevator.prototype.solveLower = function (requests) {
        var _this = this;
        var lower = requests.filter(function (r) { return r < _this.cur && r > _this.destinations[0]; });
        if (lower.length > 0) {
            this.destinations.unshift(lower.sort().shift());
            requests = this.filterRequests(requests, this.destinations[0]);
        }
        return requests;
    };
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
    Elevator.prototype.holdDoor = function (requests) {
        this.destinations.unshift(this.cur);
        return this.filterRequests(requests, this.cur);
    };
    /**
     * filterRequests
     *
     * @param  {number[]}   requests 	the requests we are handling
     * @param  {number}   floor         the number of the floor we are filtering out
     * @return {number[]}   			the requests to overwrite the original array
     */
    Elevator.prototype.filterRequests = function (requests, floor) {
        return requests.filter(function (r) { return r !== floor; });
    };
    Elevator.prototype.workTowardsGoal = function () {
        if (this.destinations.length > 0) {
            if (this.cur === this.destinations[0])
                this.openDoors();
            else if (this.doorOpen)
                this.closeDoors();
            else
                this.move();
        }
        else if (this.doorOpen)
            this.closeDoors();
        else
            this.wait();
    };
    /**
     * openDoors
     *
     * Open the door or hold door.
     *
     * if we are opening the door, set doorOpen
     * After that, remove the destination from our list
     */
    Elevator.prototype.openDoors = function () {
        if (this.doorOpen) {
            //we have another request for this floor and will wait a bit
            console.log(". . . Another request on floor " + this.cur + ". Elevator " + this.number + " Waiting . . .");
        }
        else {
            console.log("Elevator " + this.number + " is opening doors on floor " + this.cur);
            this.doorOpen = true;
        }
        //this is the only location we remove elements from destinations
        this.destinations.shift();
    };
    /**
     * closeDoors
     *
     * Close the door, and set the doorOpen flag
     */
    Elevator.prototype.closeDoors = function () {
        console.log("Elevator " + this.number + " is closing doors on this.cur");
        this.doorOpen = false;
    };
    Elevator.prototype.move = function () {
        console.log("Elevator " + this.number + " is moving from " + this.cur + " to " + ((this.cur > this.destinations[0]) ? --this.cur : ++this.cur) + " towards " + this.destinations[0]);
    };
    Elevator.prototype.wait = function () {
        console.log(". . . Elevator " + this.number + " waiting on floor " + this.cur + " . . .");
    };
    return Elevator;
})();
(function () {
    //cache the current interface
    var btnReq = document.querySelector('.btn-request');
    var btnDest = document.querySelector('.btn-destination');
    var btnBoth = document.querySelector('.btn-both');
    var inpFloor = document.querySelector('.request-floor-input');
    var inpDest = document.querySelector('.request-destination-input');
    btnReq.addEventListener('click', function () { return eo.addRequest(inpFloor.value * 1); });
    btnDest.addEventListener('click', function () { return eo.addRequest(inpDest.value * 1); });
    btnBoth.addEventListener('click', function () {
        eo.addRequest(inpFloor.value * 1, inpDest.value * 1); //*1 is for coercion
    });
    var eo = new ElevatorOperator(1);
    eo.start();
})();
