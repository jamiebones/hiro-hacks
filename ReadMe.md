**Description**

This is a project submitted for the hackathon organized by Hiro and Developer Dao to show the usage of ChainHook. The project is a simple one that allowws a user bets on the price of BTC. A user can supply liquidity to the vault which is used to payout the stakers.

The project consist of four contracts that are namely;

*vault*
This contract acts like a bank and handles the liquidity deposisted into the system by liquidity providers. The implementation is very limited. Users can deposit PToken into this contract and they are given shares which represents their percentage of ownership of the vault.

*ptoken*
This is a token contract that is used for payment throughout the system. It uses 6 decimal points

*pythMock*
This is a contract that uses a rudimentary way to try and get the current price of BTC. I tried the real Pyth contract but was not able to make it work for this hackathon. I created this rudimentary contract to serve as a price getter for BTC.

*perpsprotocol*

This is the main contract that handles the opening of position by a trader/user. This implementaion is very limited as traders can only open and liquidate a position. 

Three chainhooks are setup for contract call for when a user is minting, depositLiquidity and openPosition function calls. The chainhook data is displayed on the Nextjs page when any of the listed contract calls is executed.

**Steps to Run the project**
1. Clone the project into your local dev environment
2. cd into the contracts folder and run *npm install*
3. cd also into the frontend and install dependencies by running *npm install*
4. cd into the inner contracts folder; *contracts/contracts*
5. start the devnet blockchain explorer by running *clarinet devnet start*
6. start the NextJS frontend application by running *npm run dev*
7. the application is setup to work with the first address in the Devnet.toml file "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
8. Mint tokens for the first address.
9. Check the View Chainhook Data page to see the chainhook data displayed on the page
10. Call the Deposit Liquidity function
11. Open a position bearing in mind the maximum leverage of 15x (you can open a position using 3000 / 300)
12. Liquidate a position passing in the principal account



**Limitation**
This is my first stab at the Clarity smart contract language; my code quality is a little over the place. The implementation of what I tried to make is somehow limited. I will update this repo as I learn more about Clarity. 


