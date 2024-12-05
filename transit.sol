// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract SmartBusTransit {
    // Constants and state variables
    uint256 constant SEAT_CAPACITY = 40;
    uint256 public passengerCount;
    uint256 public soldTicketsCount;
    uint256 public ticketPrice; // Price per ticket in wei
    address public operator;
    uint256[40] public ticketArray; // Array to store 40 ticket IDs
    uint256 public currentBusArrivalTime;
    uint256 public nextBusArrivalTime;

    mapping(address => uint256) public userTickets;
    uint256 ticketCounter=0;
    // Modifier to restrict access to operator functions
    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can perform this action");
        _;
    }

    // Event for ticket purchase
    event TicketPurchased(address indexed user, uint256 ticketID);

    // Event for fund withdrawal by the operator
    event FundsWithdrawn(address indexed operator, uint256 amount);

    // Event for resetting the bus tickets and passenger count
    event BusReset();

    // Constructor to set the operator during contract deployment
    constructor() {
        operator = msg.sender; // The address deploying the contract is the operator
    }

    // Function to set ticket price (only operator can set)
    function setTicketPrice(uint256 _price) public onlyOperator {
        ticketPrice = _price;
    }

    // Function to generate random ticket IDs (only operator can call)
    function generateRandomNumbers() public onlyOperator {
        for (uint256 i = 0; i < 40; i++) {
            // Generate a random 5-digit integer using block timestamp and current index
            ticketArray[i] = uint256(keccak256(abi.encodePacked(block.timestamp, i))) % 90000 + 10000;
        }
    }

    // Function to display all ticket IDs generated
    function getTicketIds() public view returns (uint256[40] memory) {
        return ticketArray;
    }

    // Function to validate a 5-digit ticket number
    function validateTicket(uint256 _ticket) public view returns (string memory) {
        for (uint256 i = 0; i < 40; i++) {
            if (ticketArray[i] == _ticket) {
                return "Validation successful"; // Ticket validation successful
            }
        }
        return "Ticket validation failed"; // Ticket validation failed
    }

    // Function for users to purchase tickets
    function buyTicket() public payable returns (uint256) {
        require(soldTicketsCount < 40, "All tickets Sold"); // Ensure the bus isn't full
        require(msg.value == ticketPrice, "Incorrect ticket price"); // Ensure the user sent the correct amount
        uint256 ticketID;

        // Assign this ticket to the user
        ticketID = ticketArray[ticketCounter];
        ticketCounter++;
        // Increment the sold tickets count
        soldTicketsCount++;
        // Store the ticket ID for the user
        userTickets[msg.sender] = ticketID;

        // Emit event for ticket purchase
        emit TicketPurchased(msg.sender, ticketID);

        // Return the ticket ID to the user
        return ticketID;
    }

    // Function to withdraw funds to the operator's wallet
    function withdrawFunds() public onlyOperator {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // Transfer the contract balance to the operator
        payable(operator).transfer(balance);

        // Emit event for fund withdrawal
        emit FundsWithdrawn(operator, balance);
    }

    // Function to add a passenger by ticket ID and mark the ticket as used (set to 0 in the ticket array)
    function addPassenger(uint256 _ticketID) public {
        // Ensure the bus is not full
        require(passengerCount < SEAT_CAPACITY, "Bus is full");

        bool ticketFound = false;
        uint256 ticketIndex = 0;

        // Find the ticket ID in the ticketArray
        for (uint256 i = 0; i < 40; i++) {
            if (ticketArray[i] == _ticketID) {
                ticketFound = true;
                ticketIndex = i;
                break;
            }
        }

        require(ticketFound, "Ticket not found"); // Ticket must exist

        // Mark the ticket as used by setting it to 0 in the array
        ticketArray[ticketIndex] = 0;

        // Increment the passenger count
        passengerCount++;
    }

    // Function to get the current passenger count
    function getPassengerCount() public view returns (uint256) {
        return passengerCount;
    }

    // Function to check if there is available capacity on the bus
    function hasCapacity() public view returns (bool) {
        return passengerCount < SEAT_CAPACITY;
    }

    // Function to compare bus arrival times
    function compareBusArrivalTimes(uint256 t1, uint256 t2) public pure returns (bool) {
        return t1 < t2; // Return true if next bus arrives before delayed bus
    }

    // Function to reset the bus tickets and passenger count for a new bus
    function resetBus() public onlyOperator {
        // Reset all ticket IDs (set to 0)
        for (uint256 i = 0; i < 40; i++) {
            ticketArray[i] = 0;
        }
        
        // Reset passenger count
        passengerCount = 0;
        soldTicketsCount=0;
        // Emit event for bus reset
        emit BusReset();
    }
    function setBusArivalTime(uint256 currentBusTime,uint256 nextBusTime) public onlyOperator {
        require(currentBusTime>block.timestamp,"invalid current buss time");
        require(nextBusTime>block.timestamp,"invalid next buss time");
        currentBusArrivalTime=currentBusTime;
        nextBusArrivalTime=nextBusTime;
    }
}