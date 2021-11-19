//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {SafeERC20} from "../library/SafeERC20.sol";
import {IERC20} from "../library/IERC20.sol";
import {SafeMath} from "../library/SafeMath.sol";

interface IUniswapV2Router02 {
    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts);

    function WETH() external pure returns (address);

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);
}

contract AstrumFarm {
    using SafeMath for uint256;
    address private constant ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant USDC_ETH_LP_ADDRESS = 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc;
    IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(ROUTER_ADDRESS);
    IERC20 private constant usdcToken = IERC20(USDC_ADDRESS);
    IERC20 private constant usdcETHLPToken = IERC20(USDC_ETH_LP_ADDRESS);
    uint256 constant UNLIMITED_APPROVAL = type(uint256).max;
    mapping(address => uint256) public balances;
    event AddLiquidity(address indexed _from, uint256 _liquidity, uint256 _amountToken, uint256 _amountETH);
    event RemoveLiquidity(address indexed _from, uint256 _liquidity, uint256 _amountToken, uint256 _amountETH);

    constructor() {}

    function swapETHForExactTokens(uint256 usdcAmount, uint256 deadline) public payable {
        address[] memory path = new address[](2);
        path[0] = getWETHAddress();
        path[1] = USDC_ADDRESS;
        uniswapRouter.swapETHForExactTokens{value: msg.value}(usdcAmount, path, address(this), deadline);
        SafeERC20.safeTransfer(usdcToken, msg.sender, usdcAmount);
    }

    function getAmountsInETHToUSDC(uint256 usdcAmount) public view returns (uint256[] memory) {
        address[] memory path = new address[](2);
        path[0] = getWETHAddress();
        path[1] = USDC_ADDRESS;
        return uniswapRouter.getAmountsIn(usdcAmount, path);
    }

    function getWETHAddress() public pure returns (address) {
        return uniswapRouter.WETH();
    }

    function approve() public {
        address spender = address(this);
        SafeERC20.safeIncreaseAllowance(usdcToken, spender, UNLIMITED_APPROVAL); // Safely set unlimited allowance with USDC
    }

    function addLiquidityETH(
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        )
    {
        require(msg.value > amountETHMin, "Must send more eth than amountETHMin");
        SafeERC20.safeTransferFrom(usdcToken, msg.sender, address(this), amountTokenDesired);
        address spender = ROUTER_ADDRESS;
        SafeERC20.safeIncreaseAllowance(usdcToken, spender, UNLIMITED_APPROVAL);
        (amountToken, amountETH, liquidity) = uniswapRouter.addLiquidityETH{value: msg.value}(
            USDC_ADDRESS,
            amountTokenDesired,
            amountTokenMin,
            amountETHMin,
            address(this),
            deadline
        );
        balances[msg.sender] = balances[msg.sender].add(liquidity);
        emit AddLiquidity(msg.sender, liquidity, amountToken, amountETH);
        return (amountToken, amountETH, liquidity);
    }

    function removeLiquidityETH(
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH) {
        require(balances[msg.sender] >= liquidity, "Attempting to withdraw over the balance for this account");
        balances[msg.sender] = balances[msg.sender].sub(liquidity);
        address spender = ROUTER_ADDRESS;
        SafeERC20.safeIncreaseAllowance(usdcETHLPToken, spender, UNLIMITED_APPROVAL);
        (amountToken, amountETH) = uniswapRouter.removeLiquidityETH(USDC_ADDRESS, liquidity, amountTokenMin, amountETHMin, msg.sender, deadline);
        emit RemoveLiquidity(msg.sender, liquidity, amountToken, amountETH);
        return (amountToken, amountETH);
    }

    receive() external payable {}
}
