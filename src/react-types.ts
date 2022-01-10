export class uiElement {
	position: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	color: string;
	hoverColor: string;
}

export class uiRect extends uiElement {
	fill: string;
}

export class uiButton extends uiElement {
	text: string;
	textColor: string;
	onSelectStart: () => void;
	onSelectEnd: () => void;
	onHover: () => void;
}

declare namespace JSX {
	class IntrinsicElements {
		uiRect: uiRect;
		uiButton: uiButton;
	}
}
