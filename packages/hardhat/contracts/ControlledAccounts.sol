// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract ControlledAccounts is Ownable, EIP712 {
	using ECDSA for bytes32;

	enum AccountType {
		Twitter,
		Telegram,
		ENS,
		Ethereum
	}

	struct Account {
		AccountType accountType;
		bytes value;
	}

	mapping(address => Account[]) public accounts;

	constructor() EIP712("ControlledAccounts", "1.0.0") {}

	function initAccount() public {
		require(
			accounts[msg.sender].length == 0,
			"Account already initialized"
		);

		Account memory newAccount = Account({
			accountType: AccountType.Ethereum,
			value: abi.encode(msg.sender)
		});

		accounts[msg.sender].push(newAccount);
	}

	function addAccount(
		Account memory _account,
		bytes memory _signature,
		address _address
	) public {
		bytes32 messageHash = _hashTypedDataV4(
			keccak256(
				abi.encode(
					keccak256("Account(uint8 accountType,bytes value)"),
					_account.accountType,
					keccak256(_account.value)
				)
			)
		);

		require(
			owner() == messageHash.recover(_signature),
			"Invalid signature"
		);

		accounts[_address].push(_account);
	}

	function getAccounts(
		address _address
	) public view returns (Account[] memory) {
		return accounts[_address];
	}
}
