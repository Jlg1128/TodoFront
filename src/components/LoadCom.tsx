/* eslint-disable react/prefer-stateless-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

const loadComp = (Com: React.LazyExoticComponent<any>) => class LoadComp extends React.Component<any, any> {
  render() {
    return (
      <React.Suspense fallback={<div>loading...</div>}>
        <Com />
      </React.Suspense>
    );
  }
};

export default loadComp;