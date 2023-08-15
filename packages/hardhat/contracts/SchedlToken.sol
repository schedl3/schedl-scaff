// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SchedlToken is ERC20, Ownable {
	uint256 private _mintPrice = 0.005 ether;

	mapping(address => uint256) private _depositedTokens;

	constructor() ERC20("Schedl Token", "CHED") {
		_mint(msg.sender, 100 * 10 ** decimals());
	}

	function mint(uint256 amount) public payable {
		uint256 mintCost = (amount * _mintPrice) / (10 ** decimals());
		require(msg.value >= mintCost, "Insufficient payment");

		_mint(msg.sender, amount);

		uint256 MINT_INCREMENT = 1e13; // 0.00001 in normalized amount
		_mintPrice += (amount * MINT_INCREMENT) / (10 ** decimals());
	}

	function mintWithEther() external payable {
		require(msg.value > 0, "No Ether sent");

		uint256 amount = (msg.value * 10 ** decimals()) / _mintPrice;
		require(amount > 0, "Insufficient Ether sent");

		mint(amount);
	}

	function deposit(uint256 amount) public {
		require(amount > 0, "Amount must be greater than 0");

		_depositedTokens[msg.sender] += amount;
		_transfer(msg.sender, address(this), amount);
	}

	function mintAndDeposit(uint256 amount) external payable {
		mint(amount);
		deposit(amount);
	}

	function withdrawDepositedTokens() external {
		uint256 depositedAmount = _depositedTokens[msg.sender];
		require(depositedAmount > 0, "No tokens to withdraw");

		_depositedTokens[msg.sender] = 0;
		_transfer(address(this), msg.sender, depositedAmount);
	}

	function depositedTokensOf(
		address account
	) external view returns (uint256) {
		return _depositedTokens[account];
	}

	function currentMintPrice() external view returns (uint256) {
		return _mintPrice;
	}

	function withdrawFunds() external onlyOwner {
		address payable ownerPayable = payable(owner());
		ownerPayable.transfer(address(this).balance);
	}
}
