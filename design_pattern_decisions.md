### Design patterns used

-"Inter-Contract Execution (Calling functions in external contracts) Inter-Contract Execution, Part 1 and Part 2"
The smart contract is calling the Uniswap V2 router and also the USDC ERC20 contract.

-"Inheritance and Interfaces (Importing and extending contracts and/or using contract interfaces) Inheritances and Interfaces — (note: this is already a requirement in the final project, so you can simply describe which library or interface you use)"
The contract is using the IUniswapV2Router01 interface. Also the IERC20 interface is used for USDC.
The AstrumFarm contract is Ownable and the AstrumToken is ERC20.

-"Oracles (retrieving third-party data) Off-Chain Oracles and Chapter 5: Second-Order Effects — Oracles Revisited"
The contract is basically using Uniswap as a price oracle. This is a security vulnerability since the price on Uniswap
could easily be manipulated and the transactions could get "sandwich attacked". For this reason a 3rd party oracle should
ideally be used but for this implementation there was not enough time.

-"Access Control Design Patterns (Restricting access to certain functions using things like Ownable, Role-based Control) Access Control Design Patterns"
The AstrumFarm contract is Ownable, using the Openzeppelin implementation and it has a function that is onlyOwner.
