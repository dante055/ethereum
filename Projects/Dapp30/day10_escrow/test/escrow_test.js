const { ExpectRevert, expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { assert } = require('console');
const Escrow = artifacts.require('Escrow');

// accounts[0]: escrow agetn
// account[1]: sender
// accounts[2]: buyer

contract('Test for Escrow smart contract', (accounts) => {
  let escrow;
  const amount = web3.utils.toWei('2', 'ether');
  const senderLockEth = web3.utils.toWei('4', 'ether'); // 2x times
  const buyerLockEth = web3.utils.toWei('8', 'ether'); // 4x times

  beforeEach(async () => {
    escrow = await Escrow.new(accounts[1], accounts[2], { from: accounts[0] });
  });

  it('should set the sender, buyer and escrow agent', async () => {
    const escrowAgent = await escrow.escrowAgent();
    const sender = await escrow.sender();
    const buyer = await escrow.buyer();

    assert(escrowAgent === accounts[0], 'escrow agent address dont match');
    assert(sender === accounts[1], 'sender address dont match');
    assert(buyer == accounts[2], 'sender or buyer address dont match');
  });

  it('should lock eth for sender', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });

    const balanceOfContract = await escrow.balanceOf();
    assert(
      balanceOfContract.toString() === senderLockEth,
      'lock eth amount do not match'
    );
  });

  it('should not lock eth for sender if caller is not sender', async () => {
    await expectRevert(
      escrow.senderLockEth(amount, {
        value: senderLockEth,
        from: accounts[4],
      }),
      'caller is not the sender'
    );
  });

  it('should not lock eth for sender if buyer has already locked eth', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({ value: buyerLockEth, from: accounts[2] });
    await escrow.senderUnlockEth({ from: accounts[1] });

    await expectRevert(
      escrow.senderLockEth(web3.utils.toWei('3', 'ether'), {
        value: web3.utils.toWei('6', 'ether'),
        from: accounts[1],
      }),
      'buyer has alrealy lock eth'
    );
  });

  it('should not lock eth for sender if eth has already been locked', async () => {
    escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    }),
      await expectRevert(
        escrow.senderLockEth(amount, {
          value: senderLockEth,
          from: accounts[1],
        }),
        'alrealy lock eth'
      );
  });

  it('should not lock eth for sender if lock amount is less than 2x', async () => {
    await expectRevert(
      escrow.senderLockEth(amount, {
        value: web3.utils.toWei('2', 'ether'),
        from: accounts[1],
      }),
      'eth to lock is 2x time the amount'
    );
  });

  it('should unlock eth for sender', async () => {
    const initialBalanceOfContract = await escrow.balanceOf();
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });

    const senderAccountBalanceAfterLock = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );

    await escrow.senderUnlockEth({
      from: accounts[1],
    });

    const balanceOfContractAfterUnlock = await escrow.balanceOf();
    const senderAccountBalanceAfterUnlock = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );

    assert(
      initialBalanceOfContract.toString() ===
        balanceOfContractAfterUnlock.toString(),
      'contract balnce to not match'
    );
    assert(
      senderAccountBalanceAfterUnlock
        .sub(senderAccountBalanceAfterLock)
        .toString() > web3.utils.toWei('3.8', 'ether'),
      'account balance do not match'
    );
  });

  it('should not unlock eth for sender if caller is not sender', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    }),
      await expectRevert(
        escrow.senderUnlockEth({
          from: accounts[4],
        }),
        'caller is not the sender'
      );
  });

  it('should not unlock eth for sender if sender has not lock it', async () => {
    await expectRevert(
      escrow.senderUnlockEth({
        from: accounts[1],
      }),
      'either you have not lock eth or you have already unlock it'
    );
  });

  it('should not unlock eth for sender if sender has already unlock eth', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.senderUnlockEth({
      from: accounts[1],
    });
    await expectRevert(
      escrow.senderUnlockEth({
        from: accounts[1],
      }),
      'either you have not lock eth or you have already unlock it'
    );
  });

  it('should not unlock eth for sender if sender has alreaddy sent the asset', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderSendAsset({ from: accounts[1] }),
      expectRevert(
        escrow.senderUnlockEth({
          from: accounts[1],
        }),
        'asset has already been sent'
      );
  });

  it('should lock eth for buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });

    const balanceOfContractBeforeLock = await escrow.balanceOf();

    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });

    const balanceOfContractAfterLock = await escrow.balanceOf();

    assert(
      balanceOfContractAfterLock.sub(balanceOfContractBeforeLock).toString() ===
        buyerLockEth,
      'lock eth amount do not match'
    );
  });

  it('should not lock eth for buyer if caller is not the buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });

    await expectRevert(
      escrow.buyerLockEth({
        value: buyerLockEth,
        from: accounts[5],
      }),
      'caller is not buyer'
    );
  });

  it('should not lock eth for buyer if sender has not lock eth yet', async () => {
    await expectRevert(
      escrow.buyerLockEth({
        value: buyerLockEth,
        from: accounts[2],
      }),
      'sender has not lock eth yet'
    );
  });

  it('should not lock eth for buyer if buyer have already locked it', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    }),
      await expectRevert(
        escrow.buyerLockEth({
          value: buyerLockEth,
          from: accounts[2],
        }),
        'alrealy lock eth'
      );
  });

  it('should not lock eth for buyer if locked amount is less than 4x', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });

    await expectRevert(
      escrow.buyerLockEth({
        value: web3.utils.toWei('5', 'ether'),
        from: accounts[2],
      }),
      'eth to be lock is 4x time the amount'
    );
  });

  it('should unlock eth for buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });

    const balanceOfContractAfterLock = await escrow.balanceOf();
    const buyerAccountBalanceAfterLock = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    await escrow.buyerUnlockEth({ from: accounts[2] });

    const balanceOfContractAfterUnlock = await escrow.balanceOf();
    const buyerAccountBalanceAfterUnlock = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    assert(
      balanceOfContractAfterLock
        .sub(balanceOfContractAfterUnlock)
        .toString() === buyerLockEth,
      'contract balance do not match'
    );
    assert(
      buyerAccountBalanceAfterUnlock
        .sub(buyerAccountBalanceAfterLock)
        .toString() > web3.utils.toWei('7.8', 'ether'),
      'account balance do not match'
    );
  });

  it('should not unlock eth for buyer if caller is not buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });

    await expectRevert(
      escrow.buyerUnlockEth({ from: accounts[5] }),
      'caller is not buyer'
    );
  });

  it('should not unlock eth for buyer if buyer not locked eth', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await expectRevert(
      escrow.buyerUnlockEth({ from: accounts[2] }),
      'either eth has not been locked or it has been already unlocked'
    );
  });

  it('should not unlock eth for buyer if buyer have already unlock eth', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.buyerUnlockEth({ from: accounts[2] }),
      await expectRevert(
        escrow.buyerUnlockEth({ from: accounts[2] }),
        'either eth has not been locked or it has been already unlocked'
      );
  });

  it('should not unlock eth for buyer if sender has alreaddy sent the asset', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderSendAsset({ from: accounts[1] }),
      await expectRevert(
        escrow.buyerUnlockEth({ from: accounts[2] }),
        'asset has already been sent'
      );
  });

  it('should allow sender to send assets to buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    const beforeAssetSent = await escrow.assetSent();
    await escrow.senderSendAsset({ from: accounts[1] });
    const afterAssetSent = await escrow.assetSent();

    assert(
      beforeAssetSent === false && afterAssetSent === true,
      'asset has not been properly sent'
    );
  });

  it('should not send assets to buyer if caller is not sender', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await expectRevert(
      escrow.senderSendAsset({ from: accounts[0] }),
      'caller is not the sender'
    );
  });

  it('should not allow sender to send assets to buyer if sender has not locked the eth yet', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderUnlockEth({ from: accounts[1] });
    await expectRevert(
      escrow.senderSendAsset({ from: accounts[1] }),
      'sender has not yet lock the eth'
    );
  });

  it('should not allow sender to send assets to buyer if buyer has not locked the eth yet', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await expectRevert(
      escrow.senderSendAsset({ from: accounts[1] }),
      'buyer has not yet lock the eth'
    );
  });

  it('should not allow sender to send assets to buyer if sender has alrealy sent the assets', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderSendAsset({ from: accounts[1] });
    await expectRevert(
      escrow.senderSendAsset({ from: accounts[1] }),
      'asset already sent'
    );
  });

  it('should allow buyer to confirn the transfer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderSendAsset({ from: accounts[1] });

    const beforeConfirmTransfer = await escrow.confirmTransfer();
    const senderAccountBalanceBeforeConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    const buyerAccountBalanceBeforeConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    await escrow.buyerConfirmTranfer({ from: accounts[2] });

    const afterConfirmTransfer = await escrow.confirmTransfer();
    const senderAccountBalanceAfterConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    const buyerAccountBalanceAfterConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    assert(
      beforeConfirmTransfer === false && afterConfirmTransfer === true,
      'confirm transfer not properly working'
    );
    assert(
      senderAccountBalanceAfterConfirmation
        .sub(senderAccountBalanceBeforeConfirmation)
        .toString() > web3.utils.toWei('5.8', 'ether'),
      'sender account balance do not match'
    );
    assert(
      buyerAccountBalanceAfterConfirmation
        .sub(buyerAccountBalanceBeforeConfirmation)
        .toString() > web3.utils.toWei('5.8', 'ether'),
      'buyer account balance do not match'
    );
  });

  it('should not confirn the transfer if caller is not buyer', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });
    await escrow.senderSendAsset({ from: accounts[1] });

    await expectRevert(
      escrow.buyerConfirmTranfer({ from: accounts[6] }),
      'caller is not buyer'
    );
  });

  it('should not allow buyer confirn the transfer if sender has not sent the assets', async () => {
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[1],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[2],
    });

    await expectRevert(
      escrow.buyerConfirmTranfer({ from: accounts[2] }),
      'asset has not been sent'
    );
  });

  it('should not allow buyer confirn the transfer if buyer has already cofirm the transfer', async () => {
    // create new escrow contract
    escrow = await Escrow.new(accounts[3], accounts[4], { from: accounts[0] });

    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[3],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[4],
    });
    await escrow.senderSendAsset({ from: accounts[3] });
    await escrow.buyerConfirmTranfer({ from: accounts[4] });
    await expectRevert(
      escrow.buyerConfirmTranfer({ from: accounts[4] }),
      'transfer has already confirm'
    );
  });

  /* 
  it('should allow sender to lock eth for a new asset after the transfer for previous asset has been confirn', async () => {
    // create new escrow contract
    escrow = await Escrow.new(accounts[3], accounts[4], { from: accounts[0] });

    // 1st asset transfer
    await escrow.senderLockEth(amount, {
      value: senderLockEth,
      from: accounts[3],
    });
    await escrow.buyerLockEth({
      value: buyerLockEth,
      from: accounts[4],
    });
    await escrow.senderSendAsset({ from: accounts[3] });
    await escrow.buyerConfirmTranfer({ from: accounts[4] });

    const contractBalanceAfter1stTansfer = await escrow.balanceOf();

    // 2nd asset transfer
    await escrow.senderLockEth(web3.utils.toWei('4', 'ether'), {
      value: web3.utils.toWei('8', 'ether'),
      from: accounts[3],
    });
    await escrow.buyerLockEth({
      value: web3.utils.toWei('16', 'ether'),
      from: accounts[4],
    });

    const contractBalanceAfter2stLock = await escrow.balanceOf();

    await escrow.senderSendAsset({ from: accounts[3] });

    const senderAccountBalanceBefore2ndConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[3])
    );
    const buyerAccountBalanceBefore2ndConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    await escrow.buyerConfirmTranfer({ from: accounts[4] });

    const contractBalanceAfter2ndTansfer = await escrow.balanceOf();
    const senderAccountBalanceAfter2ndConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[3])
    );
    const buyerAccountBalanceAfter2ndConfirmation = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    assert(
      contractBalanceAfter2stLock.toString() ===
        web3.utils.toWei('24', 'ether'),
      'amount of eth lock for 2nd transfer do not match'
    );
    assert(
      ((contractBalanceAfter1stTansfer.toString() ===
        contractBalanceAfter2ndTansfer.toString()) ===
        0,
      'contract balannce after both the tranfer completed should be 0')
    );
    assert(
      senderAccountBalanceAfter2ndConfirmation
        .sub(senderAccountBalanceBefore2ndConfirmation)
        .toString() > web3.utils.toWei('11.8', 'ether'),
      'sender account balance do not match'
    );
    assert(
      buyerAccountBalanceAfter2ndConfirmation
        .sub(buyerAccountBalanceBefore2ndConfirmation)
        .toString() > web3.utils.toWei('11.8', 'ether'),
      'buyer account balance do not match'
    );
  });
  */
});
