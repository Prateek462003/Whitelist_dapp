// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Whitelist{

    uint8 public maxWhiteListedAddress;
    uint8 public whiteListed ;

    mapping(address => bool) public whiteListedAddresses;

    constructor(uint8 _maxWhiteListedAddress){
        maxWhiteListedAddress = _maxWhiteListedAddress ;
    } 

    function addWhiteList() public {
        require(!whiteListedAddresses[msg.sender], "User already has been whitelisted");
        require(whiteListed < maxWhiteListedAddress, "More address can't be added, Limit reached!");
        whiteListedAddresses[msg.sender] = true;
        whiteListed +=1;
    }
}