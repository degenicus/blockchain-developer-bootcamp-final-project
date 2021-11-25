//SPDX-License-Identifier: Unlicense
pragma solidity =0.6.10;

import {SafeERC20} from "../library/SafeERC20.sol";
import {IERC20} from "../library/IERC20.sol";
import {SafeMath} from "../library/SafeMath.sol";

interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

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

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountToken, uint256 amountETH);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure returns (uint256 amountB);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountOut);

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountIn);

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts);
}

/// @title Astrum Farm
/// @author Magnus Brantheim
/// @notice Supports basic Uniswap functionality through V2
contract AstrumFarm {
    using SafeMath for uint256;
    address private constant ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    IUniswapV2Router01 public immutable uniswapRouter = IUniswapV2Router01(ROUTER_ADDRESS);
    uint256 constant UNLIMITED_APPROVAL = type(uint256).max;
    mapping(address => uint256) public balances;
    address private immutable tokenAddress;
    IERC20 private immutable usdcToken;

    /// @notice Signals the add liquidity event
    /// @dev Currently not used but could be used by front-end
    /// @param _from The address of msg.sender
    /// @param _liquidity The amount of LP tokens minted
    /// @param _amountToken The amount of token used
    /// @param _amountETH The amount of ETH used
    event AddLiquidity(address indexed _from, uint256 _liquidity, uint256 _amountToken, uint256 _amountETH);

    /// @notice Signals the remove liquidity event
    /// @dev Currently not used but could be used by front-end
    /// @param _from The address of msg.sender
    /// @param _liquidity The amount of LP tokens burned
    /// @param _amountToken The amount of token received
    /// @param _amountETH The amount of ETH received
    event RemoveLiquidity(address indexed _from, uint256 _liquidity, uint256 _amountToken, uint256 _amountETH);

    /// @notice Instantiates the USDC token used, could be any ERC20 token on Uniswap
    /// @param _tokenAddress The token address to be used, may change depending on the deployed network
    constructor(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
        usdcToken = IERC20(_tokenAddress);
    }

    /// @notice Swaps ETH for USDC using the uniswap router
    /// @param usdcAmount How much USDC to swap for
    /// @param deadline The block timestamp to cancel transaction on
    function swapETHForExactTokens(uint256 usdcAmount, uint256 deadline) public payable {
        address[] memory path = new address[](2);
        path[0] = getWETHAddress();
        path[1] = tokenAddress;
        uniswapRouter.swapETHForExactTokens{value: msg.value}(usdcAmount, path, address(this), deadline);
        SafeERC20.safeTransfer(usdcToken, msg.sender, usdcAmount);
    }

    /// @notice Gets the amounts of USDC and ETH for swapping or adding liquidity
    /// @param usdcAmount How much USDC
    function getAmountsInETHToUSDC(uint256 usdcAmount) public view returns (uint256[] memory) {
        address[] memory path = new address[](2);
        path[0] = getWETHAddress();
        path[1] = tokenAddress;
        return uniswapRouter.getAmountsIn(usdcAmount, path);
    }

    /// @notice Convenience function get WETH address
    function getWETHAddress() public view returns (address) {
        return uniswapRouter.WETH();
    }

    /// @notice Adds liquidity for USDC-WETH
    /// @dev Can be sandwich attacked if only "getAmountsInETHToUSDC" is used to determine price
    /// @param amountTokenDesired How many USDC tokens to add liquidity for
    /// @param amountTokenMin Sets a limit for slippage for USDC
    /// @param amountETHMin Sets a limit for slippage for ETH
    /// @param deadline Cancels transaction if deadline is reached
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
        uint256 allowance = usdcToken.allowance(address(this), spender);
        if (allowance == 0) {
            SafeERC20.safeIncreaseAllowance(usdcToken, spender, UNLIMITED_APPROVAL);
        }
        (amountToken, amountETH, liquidity) = uniswapRouter.addLiquidityETH{value: msg.value}(
            tokenAddress,
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

    /// @notice Removes liquidity for USDC-WETH
    /// @param liquidity How many LP tokens to remove liquidity for
    /// @param amountTokenMin Sets a limit for slippage for USDC
    /// @param amountETHMin Sets a limit for slippage for ETH
    /// @param deadline Cancels transaction if deadline is reached
    function removeLiquidityETH(
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH) {
        require(balances[msg.sender] >= liquidity, "Attempting to withdraw over the balance for this account");
        balances[msg.sender] = balances[msg.sender].sub(liquidity);
        address spender = ROUTER_ADDRESS;
        address lpAddress = getPairAddress(tokenAddress, getWETHAddress());
        IERC20 usdcETHLPToken = IERC20(lpAddress);
        uint256 allowance = usdcETHLPToken.allowance(address(this), spender);
        if (allowance == 0) {
            SafeERC20.safeIncreaseAllowance(usdcETHLPToken, spender, UNLIMITED_APPROVAL);
        }
        (amountToken, amountETH) = uniswapRouter.removeLiquidityETH(tokenAddress, liquidity, amountTokenMin, amountETHMin, msg.sender, deadline);
        emit RemoveLiquidity(msg.sender, liquidity, amountToken, amountETH);
        return (amountToken, amountETH);
    }

    /// @notice Programmatically determines the address for the LP token for any given pair,
    /// this greatly simplifies not having to know the LP token address on testnets
    /// @param tokenA First token address
    /// @param tokenB Second token address
    function getPairAddress(address tokenA, address tokenB) internal pure returns (address) {
        bytes32 keccak = keccak256(
            abi.encodePacked(
                hex"ff",
                FACTORY,
                keccak256(abi.encodePacked(tokenA, tokenB)),
                hex"96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"
            )
        );
        address pair = address(uint160(uint256(keccak)));
        return pair;
    }

    /// @notice Fallback for payments
    receive() external payable {}
}
