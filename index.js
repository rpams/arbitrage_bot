const Web3 = require("web3");
const bigNumber = require("bignumber.js");
const oneSplitAbi = require("./abis/1splitabi.json");
const { config } = require('dotenv');
const weiEthDecimals = 18;

// Initialize .env variable
config();
const api_provider = process.env.API_PROVIDER;


// Set the provider
const provider = new Web3.providers.HttpProvider(api_provider);

// Initialize web3
var web3 = new Web3(provider);
var fromTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
var toTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
var amount = 1;

// Call the contact
var OneSplitContract = new web3.eth.Contract(oneSplitAbi, '0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E');

// Exchanges list
let splitExchanges = [
   "Uniswap",
   "Kyber",
   "Bancor",
   "Oasis",
   "Curve Compound",
   "Curve USDT",
   "Curve Y",
   "Curve Binance",
   "Curve Synthetix",
   "Uniswap Compound",
   "Uniswap CHAI",
   "Uniswap Aave",
   "Mooniswap",
   "Uniswap V2",
   "Uniswap V2 ETH",
   "Uniswap V2 DAI",
   "Uniswap V2 USDC",
   "Curve Pax",
   "Curve renBTC",
   "Curve tBTC",
   "Dforce XSwap",
   "Shell",
   "mStable mUSD",
   "Curve sBTC",
   "Balancer 1",
   "Balancer 2",
   "Balancer 3",
   "Kyber 1",
   "Kyber 2",
   "Kyber 3",
   "Kyber 4"
];

// Get expected return from 1split
OneSplitContract.methods.getExpectedReturn(
   fromTokenAddress,
   toTokenAddress,
   new bigNumber(amount).shiftedBy(weiEthDecimals).toString(),
   100,
   0
).call({}, (err, result) => {

   if(err) console.log(err);
   // console.log(result);
   console.log(`
   fromTokenAddress: ${fromTokenAddress}
   toTokenAddress: ${toTokenAddress}
   amount: ${amount}
   returnAount: ${new bigNumber(result.returnAmount).shiftedBy(-weiEthDecimals).toString()}
   `);

   for(let i = 0; i < result.distribution.length; i++) {
      console.log(splitExchanges[i] + " : " + result.distribution[i])
   }
})