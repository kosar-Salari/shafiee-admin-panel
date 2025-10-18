

import React from 'react';
import { useNode } from '@craftjs/core';

export const Container = ({ children, padding, bgColor }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div ref={(ref) => connect(drag(ref))} className="min-h-screen" style={{ padding: `${padding}px`, backgroundColor: bgColor }}>
      {children}
    </div>
  );
};

Container.craft = {
  props: { padding: 20, bgColor: '#ffffff' },
};

