import React, { useState } from 'react';

function NewTransfer({ createTransfer }) {
  const [transfer, setTransfer] = useState(undefined);

  function submit(e) {
    e.preventDefault(); // to stop refreshing the page
    createTransfer(transfer);
  }

  function updateTransfer(e, field) {
    const value = e.target.value;
    setTransfer({ ...transfer, [field]: value });
  }

  return (
    <div>
      <h2>Create Transfer</h2>
      <form onSubmit={submit}>
        <label>Amount</label>
        <input
          id="amount"
          type="text"
          onChange={(e) => updateTransfer(e, 'amount')}
        />
        <label>To</label>
        <input id="to" type="text" onChange={(e) => updateTransfer(e, 'to')} />
        <button>Submit</button>
      </form>
    </div>
  );
}

export default NewTransfer;
