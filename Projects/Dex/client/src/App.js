import React, { useState, useEffect } from 'react';
import Header from './Header.js';
import Footer from './Footer.js';
import Wallet from './Wallet.js';
import NewOrder from './NewOrder.js';
import AllOrders from './AllOrders.js';
import MyOrders from './MyOrders.js';
import AllTrades from './AllTrades.js';
import MyTrades from './MyTrades.js';

const SIDE = {
  BUY: 0,
  SELL: 1,
};

function App({ web3, accounts, contracts }) {
  const [tokens, setTokens] = useState([]);
  const [user, setUser] = useState({
    accounts: [],
    balances: {
      tokenDex: 0,
      tokenWallet: 0,
    },
    selectedToken: undefined,
  });
  const [orders, setOrders] = useState({ buy: [], sell: [] });
  // will contain tader for that token
  const [trades, setTrades] = useState([]);
  // to unscribe the event when token is chabged
  // each time we subscribe to a event a web socket is on
  const [listener, setListener] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const rawTokens = await contracts.dex.methods.getTokens().call();
      const tokens = rawTokens.map((token) => ({
        ...token,
        ticker: web3.utils.hexToUtf8(token.ticker),
      }));
      // ...token ==> tokenAddress: token.tokenAddress, ticker: token.ticker (bit in byte32 with padding)
      const [balances, orders] = await Promise.all([
        getBalances(accounts[0], tokens[0]),
        getOrders(tokens[0]),
      ]);
      // listen to trades when token is not DAI
      if (tokens[0].ticker !== 'DAI') listenToTrades(tokens[0]);
      setTokens(tokens);
      setUser({ accounts, balances, selectedToken: tokens[0] });
      setOrders(orders);
    };
    init();
    // eslint-disable-next-line
  }, []);

  // put a react heook which updates all component when the selected token changes
  useEffect(
    () => {
      const init = async () => {
        const [balances, orders] = await Promise.all([
          getBalances(user.accounts[0], user.selectedToken),
          getOrders(user.selectedToken),
        ]);
        // listen for trade every time token changes
        if (user.selectedToken.ticker !== 'DAI')
          listenToTrades(user.selectedToken);
        // setUser((user) => ({ ...user, balances }));
        setUser({ ...user, balances });
        setOrders(orders);
      };
      if (typeof user.selectedToken !== 'undefined') {
        init();
      }
      // useEffect ha a callback which can bw use to unscribe the event which runs before updating
    },
    // eslint-disable-next-line
    [user.selectedToken],
    () => {
      listener.unsubscribe();
    }
  );

  const selectToken = async (token) => {
    // const balances = await getBalances(user.accounts[0], token);
    setUser({ ...user, selectedToken: token });
  };

  const getBalances = async (account, token) => {
    const tokenDex = await contracts.dex.methods
      .traderBalances(account, web3.utils.asciiToHex(token.ticker))
      .call();
    const tokenWallet = await contracts[token.ticker].methods
      .balanceOf(account)
      .call();
    return { tokenDex, tokenWallet };
  };

  const getOrders = async (token) => {
    const orders = await Promise.all([
      contracts.dex.methods
        .getOrders(web3.utils.asciiToHex(token.ticker), SIDE.BUY)
        .call(),

      contracts.dex.methods
        .getOrders(web3.utils.asciiToHex(token.ticker), SIDE.SELL)
        .call(),
    ]);
    return { buy: orders[0], sell: orders[1] };
  };

  const listenToTrades = (token) => {
    // set to avoid dublicate trades
    const tradeIds = new Set();
    // when selected token cahanges the trades of previous tokens should be flush out
    setTrades([]);

    // const ids = [];    // for testing the toDolist problem of array leength 0

    // listner will contain the event which can be unscribe later
    // in production from block should be the block in which smart contract is deployed
    const listener = contracts.dex.events
      .NewTrade({
        filter: { ticker: web3.utils.asciiToHex(token.ticker) },
        fromBlock: 0,
      })
      .on('data', (newTrade) => {
        if (tradeIds.has(newTrade.returnValues.tradeId)) return;
        tradeIds.add(newTrade.returnValues.tradeId);

        // directry update state
        setTrades((trades) => [...trades, newTrade.returnValues]);

        // ids.push(newTrade.returnValues.tradeId);   // for testing the lentght of id array
      });
    // id array lenght will be zero event  when there is data in the array so dont use this method
    // and if want to use this then u have to put setTimeout() function here
    // console.log(ids, ids.length);
    setListener(listener);
  };

  // will deposit into dex account of user from token smart contract
  // traderBalances[msg.sender][_ticker] = traderBalances[msg.sender][_ticker].add(_amount);
  // if  there are no tokens in the  token smart contrat and u try to deposit it will give error
  const deposit = async (amount) => {
    await contracts[user.selectedToken.ticker].methods
      .approve(contracts.dex.options.address, amount)
      .send({ from: user.accounts[0] });
    await contracts.dex.methods
      .deposit(web3.utils.asciiToHex(user.selectedToken.ticker), amount)
      .send({ from: user.accounts[0] });
    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser({ ...user, balances });
  };

  const withdraw = async (amount) => {
    await contracts.dex.methods
      .withdraw(web3.utils.asciiToHex(user.selectedToken.ticker), amount)
      .send({ from: user.accounts[0] });
    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser({ ...user, balances });
  };

  const createLimitOrder = async (amount, price, side) => {
    await contracts.dex.methods
      .createLimitOrder(
        web3.utils.asciiToHex(user.selectedToken.ticker),
        amount,
        price,
        side
      )
      .send({ from: user.accounts[0] });
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  };

  const createMarketOrder = async (amount, side) => {
    await contracts.dex.methods
      .createMarketOrder(
        web3.utils.asciiToHex(user.selectedToken.ticker),
        amount,
        side
      )
      .send({ from: user.accounts[0] });
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  };

  if (typeof user.selectedToken === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <div id="app">
      <div>
        <Header
          contracts={contracts}
          tokens={tokens}
          user={user}
          selectToken={selectToken}
        />
      </div>
      {/* <main> element should be unique to the document
          not contain any content that is repeated across documents
       */}
      <main className="container-fluid">
        <div className="row">
          <div className="col-sm-4 first-col">
            <Wallet user={user} deposit={deposit} withdraw={withdraw} />
            {user.selectedToken.ticker !== 'DAI' ? (
              <NewOrder
                createLimitOrder={createLimitOrder}
                createMarketOrder={createMarketOrder}
              />
            ) : null}
          </div>
          {user.selectedToken.ticker !== 'DAI' ? (
            <div className="col-sm-8">
              {/* All Trades from every account */}
              <AllTrades trades={trades} />

              {/* My Trades from every account */}
              <MyTrades
                trades={trades.filter(
                  (trade) =>
                    trade.trader2.toLowerCase() === accounts[0].toLowerCase()
                )}
              />

              {/* ALl orders from every trader */}
              <AllOrders orders={orders} />

              {/* My limit buy orders */}
              <MyOrders
                orders={{
                  buy: orders.buy.filter(
                    (order) =>
                      order.trader.toLowerCase() === accounts[0].toLowerCase()
                  ),
                  sell: orders.sell.filter(
                    (order) =>
                      order.trader.toLowerCase() === accounts[0].toLowerCase()
                  ),
                }}
              />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
