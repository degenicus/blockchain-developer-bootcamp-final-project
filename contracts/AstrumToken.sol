//SPDX-License-Identifier: Unlicense
pragma solidity =0.6.10;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AstrumToken is ERC20 {
    constructor() public ERC20("AstrumToken", "AT") {
        _mint(msg.sender, 1000_000);
    }
}
