import { getWeb3, getDeedFactory } from './utils.js';
import { getDeed } from './deedInstance.js';

const initApp = async (web3, deedFactory) => {
  const $deedFactoryAddress = document.getElementById('deedFactoryAddress');
  const $deedFactoryOwner = document.getElementById('deedFactoryOwner');
  const $deployedDeeds = document.getElementById('deployedDeeds');

  const $createDeed = document.getElementById('createDeed');
  const $createDeedResult = document.getElementById('createDeed-result');

  const $DeedDiv = document.getElementById('deedDiv');

  const accounts = await web3.eth.getAccounts();
  let deployedDeeds;

  $deedFactoryAddress.innerHTML = deedFactory._address;
  deedFactory.methods
    .deedFactoryOwner()
    .call()
    .then((result) => ($deedFactoryOwner.innerHTML = result));

  const getDeployedDeeds = async () => {
    deployedDeeds = await deedFactory.methods.getAllDeployedDeeds().call();
    $deployedDeeds.innerHTML = deployedDeeds.length;

    renderDeedDiv();
    await renderDeedDetails();
  };
  getDeployedDeeds();

  const renderDeedDiv = () => {
    if (deployedDeeds.length == 0) {
      $DeedDiv.innerHTML = `<div class="alert alert-dark w-100" role="alert"><b>Curently there are no deed deployed!<b></div>`;
      return;
    }
    for (var i = 0; i < deployedDeeds.length; i++) {
      $DeedDiv.innerHTML = `<div class="col-sm-12 pt-5">
      <div class="card h-100">
        <div class="card-header">
          <b> Deed ${i + 1} </b>
        </div>
        <div class="card-body">
          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable" > Deed Address </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_Address_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Deed Owner </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_Owner_${i}"></span> <br />
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Deed Lawyer </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_Lawyer_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Deed Beneficiary </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_Benificiary_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Deed Value </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_value_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Earliest Transfer Time </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_earliestTransferTime_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Total No Payouts </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_totalPayouts_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Payout interval </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_payoutInterval_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Paid Payouts </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_paidPayouts_${i}"></span>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-4">
              <label class="deedDetailsLable"> Single Payout Amount </label>
            </div>
            <div class="col-sm-7">
              <span class="deedDetailsSpan" id="deed_payoutAmount_${i}"></span>
            </div>
          </div>

          <button
            type="button"
            id="deed_transfer_${i}"
            class="btn btn-primary"
          >
            Transfer
          </button>
          <p id="deed_result_${i}" class="pt-2"></p>
        </div>
      </div>
    </div>`;
    }
  };

  const renderDeedDetails = async () => {
    for (var i = 0; i < deployedDeeds.length; i++) {
      let $DeedOwner = document.getElementById(`deed_Owner_${i}`);
      let $DeedLawyer = document.getElementById(`deed_Lawyer_${i}`);
      let $DeedBeneficiary = document.getElementById(`deed_Benificiary_${i}`);
      let $DeedValue = document.getElementById(`deed_value_${i}`);
      let $DeedEarliestTransferTime = document.getElementById(
        `deed_earliestTransferTime_${i}`
      );
      let $DeedTotalPayout = document.getElementById(`deed_totalPayouts_${i}`);
      let $DeedInterval = document.getElementById(`deed_payoutInterval_${i}`);
      let $DeedPaidPayouts = document.getElementById(`deed_paidPayouts_${i}`);
      let $DeedPayoutAmount = document.getElementById(`deed_payoutAmount_${i}`);
      let $transferButton = document.getElementById(`deed_transfer_${i}`);
      let $deedResult = document.getElementById(`deed_result_${i}`);

      let deedInstance = await getDeed(deployedDeeds[i], web3);

      document.getElementById(`deed_Address_${i}`).innerHTML =
        deedInstance._address;

      $DeedOwner.innerHTML = await deedInstance.methods.deedOwner().call();

      $DeedLawyer.innerHTML = await deedInstance.methods.lawyer().call();

      $DeedBeneficiary.innerHTML = await deedInstance.methods
        .beneficiary()
        .call();

      $DeedValue.innerHTML = await deedInstance.methods.balanceOf().call();

      $DeedEarliestTransferTime.innerHTML = await deedInstance.methods
        .earliestTransferTime()
        .call();

      $DeedTotalPayout.innerHTML = await deedInstance.methods
        .totalPayouts()
        .call();

      $DeedInterval.innerHTML = await deedInstance.methods.interval().call();

      $DeedPaidPayouts.innerHTML = await deedInstance.methods
        .paidPayouts()
        .call();

      $DeedPayoutAmount.innerHTML = await deedInstance.methods
        .payoutAmount()
        .call();

      $transferButton.addEventListener('click', async () => {
        $transferButton.setAttribute('disabled', 'true');
        $transferButton.innerHTML = `Loading... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
        $deedResult.innerHTML = '';
        try {
          await deedInstance.methods.transfer().send({ from: accounts[0] });
          await renderDeedDetails();
          $deedResult.innerHTML = `<div class="alert alert-success" role="alert">The transfer was successfully completed</div`;
        } catch (error) {
          console.log(error);
          $deedResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
            Opps... Something went worng... See console for more info!!!
            </div>`;
        } finally {
          $transferButton.removeAttribute('disabled');
          $transferButton.innerHTML = `Transfer`;
        }
      });
    }
  };

  $createDeed.addEventListener('submit', async (e) => {
    e.preventDefault();

    const $submitButton = $createDeed.lastElementChild;

    $submitButton.setAttribute('disabled', 'true');
    $submitButton.innerHTML = `Loading... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    $createDeedResult.innerHTML = '';

    const lawyer = e.target.elements[0].value;
    const beneficiary = e.target.elements[1].value;
    const deedValue = e.target.elements[2].value;
    const earliestTransferTime = Date.parse(e.target.elements[3].value) / 1000;
    const totalPayouts = e.target.elements[4].value;
    const $intervalType = e.target.elements[5]; // interval type button
    let interval;
    if ($intervalType.innerHTML === 'Years') {
      interval = e.target.elements[6].value * 365 * 24 * 60 * 60;
    } else if ($intervalType.innerHTML === 'Months') {
      interval = e.target.elements[6].value * 30 * 24 * 60 * 60;
    } else {
      interval = e.target.elements[6].value * 24 * 60 * 60;
    }

    // interval = 20; //testing

    try {
      await deedFactory.methods
        .createNewDeed(
          lawyer,
          beneficiary,
          earliestTransferTime,
          totalPayouts,
          interval
        )
        .send({ value: deedValue, from: accounts[0] });

      await getDeployedDeeds();
      $createDeedResult.innerHTML = `<div class="alert alert-success" role="alert">
            Successfully created a deed of <b> ${deedValue} wei </b> for <b>  ${accounts[0]} </b> address!!!
        </div>`;
    } catch (error) {
      console.log(error);
      $createDeedResult.innerHTML = `
      <div class="alert alert-danger" role="alert">
      Opps... Something went worng... See console for more info!!!
      </div>`;
    } finally {
      $submitButton.removeAttribute('disabled');
      $submitButton.innerHTML = `Submit`;
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const web3 = await getWeb3();
  const deedFactory = await getDeedFactory(web3);
  initApp(web3, deedFactory);
});
