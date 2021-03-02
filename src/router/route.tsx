import React, { Attributes, ReactNode } from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import routerConfig, { RouterConfigType } from './routerConfig';

function renderRouteConf(container: ReactNode | null, router: Array<RouterConfigType>, publicPath: string) {
	const routerArr: ReactNode[] = [];
	function renderRoute(routerItem: RouterConfigType, contextPath: string) {
		const { path, component, layout = null } = routerItem;
		return <Route
			key={path}
			exact
			path={path}
			render={(routeProps: (Attributes & any) | null) => (
				layout
					? React.createElement(layout, routeProps, React.createElement(component, routeProps))
					: React.createElement(component, routeProps)
			)}
		/>;
	}
	router.forEach((routerItem) => routerArr.push(
  <Switch key={routerItem.path}>
    {renderRoute(routerItem, '/')}
  </Switch>,
	));
	return routerArr;
}
const routeChildren = renderRouteConf(null, routerConfig, '/');
export default class Routers extends React.PureComponent {
	render() {
		return (
  <BrowserRouter>
    {routeChildren}
  </BrowserRouter>
		);
	}
}
