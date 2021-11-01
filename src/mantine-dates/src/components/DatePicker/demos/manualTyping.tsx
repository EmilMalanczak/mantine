import React from 'react';
import { DatePicker } from '../DatePicker';

const code = `
<DatePicker placeholder="Pick date" label="Event date" required allowManualTyping />
`;

function Demo() {
  return (
    <div style={{ maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
      <DatePicker placeholder="Pick date" label="Event date" required allowManualTyping />
    </div>
  );
}

export const manualTyping: MantineDemo = {
  type: 'demo',
  code,
  component: Demo,
};
