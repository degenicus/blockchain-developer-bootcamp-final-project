### Techniques used to avoid attacks

-"Using Specific Compiler Pragma"
The contract is using the 0.6.10 compiler specifically

-"Checks-Effects-Interactions (Avoiding state changes after external calls)"
The remove liquidity function checks the balance (check), then subtracts the balance (effects), and then calls removeLiquidity (interactions). For add liquidity the add to balance happens after the addLiquidity call because it returns
how much liquidity was added.
require(balances[msg.sender] >= liquidity, "Attempting to withdraw over the balance for this account");
balances[msg.sender] = balances[msg.sender].sub(liquidity);

-"Proper Use of Require, Assert and Revert"
Most functions use require to do some validation.
