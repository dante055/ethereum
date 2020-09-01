import React, { useState } from 'react';

function Dropdown({ activeItem, items, onSelect }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const selectItem = (e, item) => {
    e.preventDefault();
    setDropdownVisible(!dropdownVisible);
    onSelect(item);
  };

  return (
    <div className="dropdown ml-3">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        {activeItem.lable}
      </button>
      <div className={`dropdown-menu ${dropdownVisible ? 'visible' : ''}`}>
        {items &&
          items.map((item, i) => (
            // eslint-disable-next-line
            <a
              className={`dropdown-item ${
                item.value === activeItem.value ? 'active' : null
              }`}
              href="#"
              key={i}
              onClick={(e) => selectItem(e, item.value)}
            >
              {item.lable}
            </a>
          ))}
      </div>
    </div>
  );
}

export default Dropdown;
