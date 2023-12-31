// SPDX-License-Identifier: MIT
//Pragma:
pragma solidity ^0.8.7;

//Imports:
//import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//Error codes:
error FundMe__NotOwner();


//Libraries,Interfaces,Contracts:

/**
 * @title A contract for crowd funding
 * @author Harsh Kumbhat
 * @notice This is a sample contract for demo
 * @dev This implements price feeds as our library
 */
contract FundMe {
    //Type Declarations:
    using PriceConverter for uint256;

    //State variables:
    mapping(address => uint256) public s_addressToAmountFunded;  //we can make this private too
    address[] private s_funders;  //lets make this public -> private

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public  immutable  i_owner;  
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;   
    AggregatorV3Interface public s_priceFeed;
   
   //Modifiers:
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    //Functions:
    // constructor
    // receive
    // fallback
    // external
    // public
    // internal
    // private
    // view / pure


    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }


    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    // function getVersion() public view returns (uint256){
    //     // ETH/USD price feed address of Sepolia Network.
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return priceFeed.version();
    // }
    
    //only user can withdraw money ,no one else has the authority
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); 
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
    

    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders = s_funders;
        //mapping cant be in memory
        for(
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
            )
        {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }


    //View / pure:
    
    //after making private make a fn ...
    //so ones who dont access our code wouldnt 
    //have to go through s_funders and simply do getFunder
    function getFunder(uint256 index) public view returns (address){
        return s_funders[index];
    }
}

