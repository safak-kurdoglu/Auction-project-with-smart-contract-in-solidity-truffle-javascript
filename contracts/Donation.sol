

pragma solidity ^0.6.0;

contract Donation {

    address payable[] public donors;
    mapping(address => uint) donations;
    address owner;

    constructor()  public{
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    function pushDonor(address payable donor) public onlyOwner{
        donors.push(donor);
    }

    function donate(address projectAddress) public payable{
        donations[projectAddress] += msg.value;
    }

    function finishDonation() public onlyOwner{
        for(uint i = 0; i < donors.length; i++){
            donors[i].transfer(donations[donors[i]]);
        }
        selfdestruct(payable(owner));  //Here actually, there must be no fund to send the owner.
    }
}
