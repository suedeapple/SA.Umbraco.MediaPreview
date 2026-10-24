import { css, customElement, html } from '@umbraco-cms/backoffice/external/lit';
import { UUIModalElement } from '@umbraco-cms/backoffice/external/uui';

/**
 * A full screen, dark modal container used instead of Umbraco's white dialog, so media is shown lightbox style.
 * Escape and clicks on the dark backdrop close it.
 */
@customElement('sa-lightbox-modal')
export class SaLightboxModalElement extends UUIModalElement {
	#onClick = (event: MouseEvent) => {
		// Only clicks on the backdrop itself, not on the media or controls inside it.
		if (event.target === this._dialogElement) this.close();
	};

	override render() {
		return html`<dialog @click=${this.#onClick}><slot></slot></dialog>`;
	}

	static override styles = [
		...UUIModalElement.styles,
		css`
			dialog {
				position: fixed;
				inset: 0;
				width: 100vw;
				height: 100vh;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 56px 24px 24px;
				background: rgba(10, 10, 14, 0.94);
				backdrop-filter: blur(6px);
				color: #fff;
				opacity: 1;
				transition: opacity var(--uui-modal-transition-duration, 250ms);
			}

			:host(:not([is-open])) dialog,
			:host([is-closing]) dialog {
				opacity: 0;
			}

			dialog::after {
				display: none;
			}
		`,
	];
}

export { SaLightboxModalElement as element };
export default SaLightboxModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'sa-lightbox-modal': SaLightboxModalElement;
	}
}
