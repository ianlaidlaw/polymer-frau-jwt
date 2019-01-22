import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './dist/local';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/**
 * `frau-jwt-local`
 * Handles refreshing tokens
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class FrauJwtLocal extends PolymerElement {
	static get is() { return 'frau-jwt-local'; }
	static get properties() {
		return {
			_refreshRate: {
				type: Number,
				observer: '_startInterval'
			},
			scope: {
				type: String,
				value: '*'
			},
			token: {
				type: String,
				reflectToAttribute: true,
				notify: true,
				observer: '_setRefreshRate'
			},
			_interval: {
				type: Object
			}
		};
	}

	_startInterval() {
		this.stopInterval();

		if (this._refreshRate < 1 * MINUTE) {
			return;
		}

		this._interval = setInterval(() => {
			frauJwtlocal._resetCaches();

			frauJwtlocal(this.scope)
				.then(t => {
					this.token = t
				})
				.catch(console.error)
		}, this._refreshRate);
	}

	resetTokenCache() {
		frauJwtlocal._resetCaches();
	}

	stopInterval() {
		clearInterval(this._interval);
	}

	_setRefreshRate(token) {
		try {
			frauJwtlocal._resetCaches();

			const payload = token.split('.')[1];
			const b64 = payload
				.replace(/-/g, '+')
				.replace(/_/g, '/');
			const jwt = JSON.parse(atob(b64));
			const refreshRate = (new Date(jwt.exp * SECOND) - Date.now()) * 0.90;

			this._refreshRate = Math.floor(refreshRate)
		} catch (e) {
			this._refreshRate = 55 * MINUTE;
		}
	}
	disconnectedCallback() {
		super.disconnectedCallback();

		this.stopInterval();
	}
}

window.customElements.define(FrauJwtLocal.is, FrauJwtLocal);
