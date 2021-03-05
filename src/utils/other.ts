// 禁止React Developer Tools
export const disableReactDevTools = () => {
  const noop = () => undefined;
  /* eslint-disable no-underscore-dangle */
  // @ts-ignore
  const DEV_TOOLS = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (typeof DEV_TOOLS === 'object') {
    for (const [key, value] of (Object).entries(DEV_TOOLS)) {
      DEV_TOOLS[key] = typeof value === 'function' ? noop : null;
    }
  }
};
