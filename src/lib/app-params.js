import { getAccessToken } from '@base44/sdk';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('base44_access_token');
	window.localStorage.removeItem('token');
}

const REMEMBER_KEY = 'los-remember-me';
const TAB_KEY = 'los-browser-session';
const HEARTBEAT_KEY = 'los-session-heartbeat';

const anotherTabIsOpen = () => {
	const last = Number(localStorage.getItem(HEARTBEAT_KEY) || 0);
	return Date.now() - last < 12000;
};

const getAppParams = () => {
	if (!isNode && localStorage.getItem('rememberEmail') === 'true' && localStorage.getItem(REMEMBER_KEY) == null) {
		localStorage.setItem(REMEMBER_KEY, '1');
	}
	// Remember Me keeps the Base44 session after the browser closes.
	// Otherwise the session ends with the browser, but a second open tab does not wipe it.
	if (!isNode && localStorage.getItem(REMEMBER_KEY) !== '1' && sessionStorage.getItem(TAB_KEY) !== '1' && !anotherTabIsOpen()) {
		clearStoredAccessToken();
	}
	if (!isNode) {
		sessionStorage.setItem(TAB_KEY, '1');
		localStorage.setItem(HEARTBEAT_KEY, String(Date.now()));
	}
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		appId: import.meta.env.VITE_BASE44_APP_ID,
		token: getAccessToken(),
		functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION,
		appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
	}
}


export const appParams = {
	...getAppParams()
}
