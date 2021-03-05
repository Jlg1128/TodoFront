import SecureLayout from '@/layout/layout';

import App from '@/pages/Index/App';
import Settings from '@/pages/user/settings/settings';
import React from 'react';

export interface RouterConfigType {
	path: string;
	component: any;
	layout?: any;
}

const routerConfig: Array<RouterConfigType> = [
	{
		path: '/',
		component: App,
		layout: SecureLayout,
	},
	{
		path: '/user/settings',
		component: Settings,
		layout: SecureLayout,
	},
];

export default routerConfig;
