//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IUniswapV2Router02 {
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

interface ERC20 {
    // function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    // function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    // function transfer(address to, uint tokens) external returns (bool success);
    // function approve(address spender, uint tokens) external returns (bool success);
    // function transferFrom(address from, address to, uint tokens) external returns (bool success);

    // function symbol() external view returns (string memory);
    // function name() external view returns (string memory);
    // function decimals() external view returns (uint8);

    // event Transfer(address indexed from, address indexed to, uint tokens);
    // event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract AstrumFarm {
  address private constant ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  address private constant USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
  IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(ROUTER_ADDRESS);
  ERC20 private constant usdcToken = ERC20(USDC_ADDRESS);
  
  constructor() {
  }

  function swapETHForExactTokens(uint usdcAmount, uint deadline) public payable {
    address[] memory path = new address[](2);
    path[0] = getWETHAddress();
    path[1] = USDC_ADDRESS;
    uniswapRouter.swapETHForExactTokens{ value: msg.value }(usdcAmount, path, address(this), deadline);
  }
  
  function getAmountsInETHToUSDC(uint usdcAmount) public view returns (uint[] memory) {
    address[] memory path = new address[](2);
    path[0] = getWETHAddress();
    path[1] = USDC_ADDRESS;
    return uniswapRouter.getAmountsIn(usdcAmount, path);
  }

  function getWETHAddress() public pure returns (address) {
    return uniswapRouter.WETH();
  }
  
  receive() payable external {}
}