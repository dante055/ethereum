const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const EthSwap = artifacts.require('EthSwap');
const CustomCoin = artifacts.require('CustomCoin');
const Dai = artifacts.require('Dai');

function tokens(ethAmount) {
  return web3.utils.toWei(ethAmount, 'ether');
}

function asciiToBytes32(tickerString) {
  return web3.utils.asciiToHex(tickerString);
}

function numberToBN(number) {
  return web3.utils.toBN(number);
}

contract(
  'Tests for EthSwap and Token contracts',
  ([admin, trader1, trader2]) => {
    let ethSwap, customCoin, dai;

    beforeEach(async () => {
      customCoin = await CustomCoin.new({ from: admin });
      dai = await Dai.new({ from: admin });
      ethSwap = await EthSwap.new({ from: admin });
    });

    describe('Token Deployment ', async () => {
      it('Should deployed all the tokens', async () => {
        const customCoinAdmin = await customCoin.admin();
        const daiAdmin = await dai.admin();
        assert(
          customCoinAdmin === daiAdmin && daiAdmin === admin,
          'Admin dont match!'
        );
      });
    });

    describe('EthSwap Deploymnent', async () => {
      it('Should deployed ethSwap contract', async () => {
        const ethSwapAdmin = await ethSwap.admin();

        assert(ethSwapAdmin === admin, 'Admin dont match!');
      });
    });

    describe('Mine tokens for ethSwap', async () => {
      it('Should mine customCoin token for ethSwap', async () => {
        const initialEthSwapCcBalance = await customCoin.balanceOf(
          ethSwap.address
        );
        await customCoin.faucet(ethSwap.address, tokens('10'), { from: admin });
        const ethSwapCcBalance = await customCoin.balanceOf(ethSwap.address);

        assert(
          initialEthSwapCcBalance.toString() === '0',
          'Intial token balance of ethSwap should be zero!'
        );
        assert(
          ethSwapCcBalance.toString() === tokens('10'),
          'Ethswap token balance is not equal to the mined amount!'
        );
      });

      it('Should mine dai token for ethSwap', async () => {
        const initialEthSwapDaiBalance = await dai.balanceOf(ethSwap.address);
        await dai.faucet(ethSwap.address, tokens('10'), { from: admin });
        const ethSwapDaiBalance = await dai.balanceOf(ethSwap.address);

        assert(
          initialEthSwapDaiBalance.toString() === '0',
          'Intial token balance of ethSwap should be zero!'
        );
        assert(
          ethSwapDaiBalance.toString() === tokens('10'),
          'Ethswap token balance is not equal to the mined amount!'
        );
      });

      it('Should not mine tokens, if caller is not the admin', async () => {
        await expectRevert(
          dai.faucet(ethSwap.address, tokens('10'), { from: trader1 }),
          'Only admin can mine the token!'
        );
      });
    });

    describe('addTokens()', async () => {
      it('Should add coustomCoin token to ethSwap', async () => {
        const ticker = asciiToBytes32('CC');
        const tokenAddress = customCoin.address;
        const conversionRate = 500;

        await ethSwap.addTokens(ticker, tokenAddress, conversionRate, {
          from: admin,
        });

        const ccToken = await ethSwap.tokens(ticker);
        assert(ccToken.ticker === ticker, 'Ticker dont match!');
        assert(
          ccToken.tokenAddress === tokenAddress,
          'Token address dont match!'
        );
      });

      it('Should add dai token to ethSwap', async () => {
        const ticker = asciiToBytes32('DAI');
        const tokenAddress = dai.address;
        const conversionRate = 1000;

        await ethSwap.addTokens(ticker, tokenAddress, conversionRate, {
          from: admin,
        });

        const daiToken = await ethSwap.tokens(ticker);
        assert(daiToken.ticker === ticker, 'Ticker dont match!');
        assert(
          daiToken.tokenAddress === tokenAddress,
          'Token address dont match!'
        );
      });

      it('Should not add tokens, if caller is not the admin', async () => {
        const ticker = asciiToBytes32('DAI');
        const tokenAddress = dai.address;
        const conversionRate = 1000;
        await expectRevert(
          ethSwap.addTokens(ticker, tokenAddress, conversionRate, {
            from: trader1,
          }),
          'Caller is not admin!'
        );
      });
    });

    describe('buyTokens()', async () => {
      let daiTicker,
        daiTokenAddress,
        daiConversionRate,
        tokenAmount,
        totalSupply;

      beforeEach(async () => {
        daiTicker = asciiToBytes32('DAI');
        daiTokenAddress = dai.address;
        daiConversionRate = 1000;
        totalSupply = 1000;
        tokenAmount = 50;

        await dai.faucet(ethSwap.address, totalSupply, { from: admin });
        await ethSwap.addTokens(daiTicker, daiTokenAddress, daiConversionRate, {
          from: admin,
        });
      });

      it('Should buy tokens from ethSwap', async () => {
        const trader1InitialDaiBalance = await dai.balanceOf(trader1);
        const contractInitialEthBalance = await ethSwap.balanceOf();
        //  50 dai tokens = 1000 * 50 = 50,000 wei
        const receipt = await ethSwap.buyTokens(daiTicker, {
          from: trader1,
          value: tokenAmount * daiConversionRate,
        });
        const trader1DaiBalance = await dai.balanceOf(trader1);
        const contractEthBalance = await ethSwap.balanceOf();

        assert(
          trader1InitialDaiBalance.toNumber() === 0,
          'Intial dai balance of trader1 isnt zero!'
        );
        assert(
          trader1DaiBalance.toNumber() === tokenAmount,
          'After buying dai balance of trader1 doest not match!'
        );
        assert(
          contractEthBalance.sub(contractInitialEthBalance).toString() ===
            '50000',
          'After buying contract eth balance dont match1'
        );

        // const event = receipt.logs[0].args;

        expectEvent(receipt, 'BuyTokens', {
          buyer: trader1,
          ticker: daiTicker,
          amount: numberToBN(tokenAmount),
          ethSend: numberToBN(tokenAmount * daiConversionRate),
          conversionRate: numberToBN(daiConversionRate),
        });
      });

      it('Should not buy tokens, if token does not exit', async () => {
        await expectRevert(
          ethSwap.buyTokens(asciiToBytes32('CC'), {
            from: trader1,
            value: tokenAmount * 2000,
          }),
          'Token does not exist!'
        );
      });

      it('Should not buy tokens, if wrong amount of eth is send', async () => {
        await expectRevert(
          ethSwap.buyTokens(daiTicker, {
            from: trader1,
            value: tokenAmount * 1001,
          }),
          'You have send wrong amount to buy the token, recheck the conversion rate!'
        );
      });

      it('Should not buy tokens, if contract have insufficient supply of token', async () => {
        await expectRevert(
          ethSwap.buyTokens(daiTicker, {
            from: trader1,
            value: (totalSupply + 1) * daiConversionRate,
          }),
          'Contract have insufficient supply of this types of tokens!'
        );
      });
    });

    describe('sellTokens()', async () => {
      let daiTicker,
        daiTokenAddress,
        daiConversionRate,
        tokenBuyAmount,
        tokenSellAmount,
        totalSupply;

      beforeEach(async () => {
        daiTicker = asciiToBytes32('DAI');
        daiTokenAddress = dai.address;
        daiConversionRate = tokens('1');
        totalSupply = 100;
        tokenBuyAmount = 20;
        tokenSellAmount = 10;

        await dai.faucet(ethSwap.address, totalSupply, { from: admin });
        await ethSwap.addTokens(daiTicker, daiTokenAddress, daiConversionRate, {
          from: admin,
        });
        await ethSwap.buyTokens(daiTicker, {
          from: trader2,
          value: tokenBuyAmount * daiConversionRate,
        });
      });

      it('Should allow trader to sell tokens', async () => {
        const trader2InitialDaiBalance = await dai.balanceOf(trader2);
        const contractInitialDaiBalance = await dai.balanceOf(ethSwap.address);
        const trader2InitialEthBalance = numberToBN(
          await web3.eth.getBalance(trader2)
        );
        const contractInitialEthBalance = await ethSwap.balanceOf();

        await dai.approve(ethSwap.address, tokenSellAmount, { from: trader2 });
        const receipt = await ethSwap.sellTokens(daiTicker, tokenSellAmount, {
          from: trader2,
        });

        const trader2DaiBalance = await dai.balanceOf(trader2);
        const contractDaiBalance = await dai.balanceOf(ethSwap.address);
        const trader2EthBalance = numberToBN(
          await web3.eth.getBalance(trader2)
        );
        const contractEthBalance = await ethSwap.balanceOf();

        assert(
          trader2InitialDaiBalance.sub(trader2DaiBalance).toString() ===
            tokenSellAmount.toString(),
          'Trader dai balance dont match!'
        );
        // approx as for running approve and sell function gas will be cost
        assert(
          trader2EthBalance
            .sub(trader2InitialEthBalance)
            .gt(numberToBN((tokenSellAmount - 1) * daiConversionRate)) &&
            trader2EthBalance
              .sub(trader2InitialEthBalance)
              .lt(numberToBN(tokenSellAmount * daiConversionRate)),
          'Trader eth balance dont match!'
        );
        assert(
          contractDaiBalance.sub(contractInitialDaiBalance).toString() ===
            tokenSellAmount.toString(),
          'Contract eth balance dont match!'
        );
        assert(
          contractInitialEthBalance.sub(contractEthBalance).toString() ===
            (tokenSellAmount * daiConversionRate).toString(),
          'Contract dai balance dont match!'
        );

        expectEvent(receipt, 'SellTokens', {
          seller: trader2,
          ticker: daiTicker,
          amount: numberToBN(tokenSellAmount),
          ethReceived: numberToBN(tokenSellAmount * daiConversionRate),
          conversionRate: numberToBN(daiConversionRate),
        });
      });

      it('Should not sell tokens, if token does not exit', async () => {
        await customCoin.approve(ethSwap.address, tokenSellAmount, {
          from: trader2,
        });
        await expectRevert(
          ethSwap.sellTokens(asciiToBytes32('CC'), tokenSellAmount, {
            from: trader2,
          }),
          'Token does not exist!'
        );
      });

      it('Should not sell tokens, if seller has not approove the transaction', async () => {
        await expectRevert(
          ethSwap.sellTokens(daiTicker, tokenSellAmount, {
            from: trader2,
          }),
          'ERC20: transfer amount exceeds allowance'
        );
      });

      it('Should not sell tokens, if seller has insufficient funds', async () => {
        await customCoin.approve(ethSwap.address, tokenBuyAmount + 1, {
          from: trader2,
        });
        await expectRevert(
          ethSwap.sellTokens(daiTicker, tokenBuyAmount + 1, {
            from: trader2,
          }),
          'You have insufficient funds to complete the transaction!'
        );
      });

      it('Should not sell tokens, if contract have insufficient funds to buy them', async () => {
        await dai.faucet(trader2, tokenBuyAmount, { from: admin });

        await dai.approve(ethSwap.address, tokenBuyAmount + tokenSellAmount, {
          from: trader2,
        });

        await expectRevert(
          ethSwap.sellTokens(daiTicker, tokenBuyAmount + tokenSellAmount, {
            from: trader2,
          }),
          'Contract have insufficient funds to buy this amount of token!'
        );
      });
    });
  }
);
