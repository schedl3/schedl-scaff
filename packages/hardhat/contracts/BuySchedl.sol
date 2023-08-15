// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BuySchedl {
    address public schedlAddress;
    uint256 public purchaseRate = 0.0005 ether;

    constructor(address _schedlAddress) {
        schedlAddress = _schedlAddress;
    }

    function depositSchedl(uint256 _amount) external {
        IERC20(schedlAddress).transferFrom(msg.sender, address(this), _amount);
    }

    function purchaseSchedl(uint256 _amount) external payable {
        IERC20 token = IERC20(schedlAddress);
        require(token.balanceOf(address(this)) >= _amount, "Not enough tokens in contract");

        uint256 cost = _amount * purchaseRate;
        require(msg.value >= cost, "Insufficient Ether sent");

        token.transfer(msg.sender, _amount);
    }
}
