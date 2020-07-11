import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes'; // link is use to create custom link

export default () => {
  return (
    <Menu style={{ marginTop: '10px' }}>
      <Link route="/">
        <a className="item">KickStart</a>
        {/* <a> tag is givig us right click functionality and styling*/}
      </Link>
      <Menu.Menu position="right">
        <Link route="/">
          <a className="item">Campaign</a>
        </Link>
        <Link route="/campaigns/new">
          <a className="item">+</a>
        </Link>
      </Menu.Menu>
    </Menu>
  );
};

// Menu.Item styling clashes with Link tag
// Link tag is a generic wrapper component that doesnt have any html of its own
// it wraps it children with click event handeler
