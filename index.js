require("dotenv").config();
const Web3 = require("web3");
const bigNumber = require("bignumber.js");
const oneSplitAbi = require("./abis/1splitabi.json");
const erc20abi = require("./abis/erc20abi.json");
const DexesList = require("./exchangeList");
const weiEthDecimals = 18;

const api_provider = process.env.API_PROVIDER;

// Set the provider
// const provider = new Web3.providers.HttpProvider(api_provider);
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");

// Initialize web3
var web3 = new Web3(provider);

// var fromAddress = "0x3f7347391ebF77bEa8A15CF3EA19e53041736386";
var fromAddress = "0xBEEFBaBEeA323F07c59926295205d3b7a17E8638";
var toTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";   // ETH
var fromTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"; // Dai address
var oneSplitAddress = "0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E";  // 1split address
var amountToSwap = 2000;
var amountToSwapWei = new bigNumber(amountToSwap).shiftedBy(weiEthDecimals);
var expectedSwap = null;

// Call the contact
var OneSplitContract = new web3.eth.Contract(oneSplitAbi, oneSplitAddress);
var DaiContract = new web3.eth.Contract(erc20abi, fromTokenAddress);

async function getExpectedReturn() {
  // Get expected return from 1split (Calling smart contract method)
  await OneSplitContract.methods
    .getExpectedReturn(
      fromTokenAddress,
      toTokenAddress,
      new bigNumber(amountToSwap).shiftedBy(weiEthDecimals),
      100,
      0
    )
    .call({}, async(err, result) => {
      console.log(result)
      if (err) console.log(err);
      expectedSwap = result;
      // console.log(result);
      console.log(`
      fromTokenAddress: ${fromTokenAddress}
      toTokenAddress: ${toTokenAddress}
      amountToSwap: ${amountToSwap}
      returnAount: ${new bigNumber(result.returnAmount)
        .shiftedBy(-weiEthDecimals)
        .toString()}
      `);

      DexesList.forEach((dex, i) => {
         console.log(`${dex} : ${result.distribution[i]}`);
      })
      await approveSpender();

      // for (let i = 0; i < result.distribution.length; i++) {
      //   console.log(splitExchanges[i] + " : " + result.distribution[i]);
      // }
    });
}

function wait(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

async function awaitTransaction(tx) {

   var reciept = null;
   do {
      await web3.eth.getTransactionReceipt(tx, (err, result) => {
         if (result) reciept = result;
         wait(2000);
      })
   } while(reciept == null);

   console.log(`Transaction went successful: ${reciept.transactionHash}`);
   return reciept.status;
}


async function approveSpender() {
   await DaiContract.methods.approve(oneSplitAddress, amountToSwapWei)
   .send({from: fromAddress}, async (err, tx) => {
      if(err) console.log("ERC20 token approve error: ", err);
      console.log(`ERC20 token approved to: ${oneSplitAddress}`);
      await awaitTransaction(tx);
      await excecutSwap();
   })
}

function fromWeiConverter(amount) {
   return new bigNumber(amount).shiftedBy(-weiEthDecimals).toFixed(2);
}

async function excecutSwap() {
   // Eth and Dai balance before to swap
   var ethBefore = await web3.eth.getBalance(fromAddress);
   var daiBefore = await DaiContract.methods.balanceOf(fromAddress).call();

   await OneSplitContract.methods
   .swap(
      fromTokenAddress,
      toTokenAddress,
      amountToSwapWei,
      expectedSwap.returnAmount,
      expectedSwap.distribution,
      0
   )
   .send({from: fromAddress, gas:9999999}, async (err, tx) => {
      if(err) console.log("The sap couldn't be executed: ", err);
      await awaitTransaction(tx);

      // Eth and Dai balance after to swap
      var ethAfter= await web3.eth.getBalance(fromAddress);
      var daiAfter = await DaiContract.methods.balanceOf(fromAddress).call();
      console.log(`
         The swap was executed successfully,

         Eth Balances before swap: ${fromWeiConverter(ethBefore)} ETH => ${fromWeiConverter(ethAfter)} ETH
         Dai Balances before & after swap: ${fromWeiConverter(daiBefore)} DAI => ${fromWeiConverter(daiAfter)} DAI
      `)
   })
}

getExpectedReturn();