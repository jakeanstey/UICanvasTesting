import { useEffect, useRef } from 'react';
import { FrontSide, CanvasTexture, Matrix4, Vector3 } from 'three';
import { useController, useXRFrame, useXREvent } from '@react-three/xr';
import { useThree } from '@react-three/fiber';

export default function UICanvas({ width, height, scale, position, ...props }) {
	const meshRef = useRef();
	const canvasRef = useRef();
	/** @type {import('react').MutableRefObject<CanvasTexture>} */
	const canvasTextureRef = useRef();
	const materialRef = useRef();
	/** @type {import('react').MutableRefObject<CanvasRenderingContext2D>} */
	const contextRef = useRef();
	const rightPointRef = useRef();
	const leftPointRef = useRef();
	const { raycaster } = useThree();
	/** @type {import('react').MutableRefObject<Matrix4>} */
	const tempMartixRef = useRef(new Matrix4());
	const rightHand = useController('right');
	const leftHand = useController('left');
	const rightHoveredItemRef = useRef(null);
	const leftHoveredItemRef = useRef(null);

	useEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');

		canvasTextureRef.current = new CanvasTexture(canvas);
		contextRef.current = context;
		canvasRef.current = canvas;
	}, [width, height]);

	useXRFrame((dt, frame) => {
		const rightIntersections = rightHand
			? getIntersections(rightHand.controller)
			: [];
		const leftIntersections = leftHand
			? getIntersections(leftHand.controller)
			: [];
		let shouldDraw = false;

		if (rightIntersections.length > 0) {
			rightPointRef.current = getPointFromIntersection(rightIntersections[0]);
			shouldDraw = true;
		} else if (rightPointRef.current != null) {
			rightPointRef.current = null;
			shouldDraw = true;
		}

		if (leftIntersections.length > 0) {
			leftPointRef.current = getPointFromIntersection(leftIntersections[0]);
			shouldDraw = true;
		} else if (leftPointRef.current != null) {
			leftPointRef.current = null;
			shouldDraw = true;
		}

		if (shouldDraw) {
			updateCanvas();
		}
	});

	useXREvent(
		'selectstart',
		(e) => {
			if (
				rightHoveredItemRef.current != null &&
				rightHoveredItemRef.current.hasOwnProperty('onSelectStart')
			) {
				rightHoveredItemRef.current.onSelectStart();
			}
		},
		{ handedness: 'right' }
	);

	useXREvent(
		'selectstart',
		(e) => {
			if (
				leftHoveredItemRef.current != null &&
				leftHoveredItemRef.current.hasOwnProperty('onSelectStart')
			) {
				leftHoveredItemRef.current.onSelectStart();
			}
		},
		{ handedness: 'left' }
	);

	useXREvent(
		'selectend',
		(e) => {
			if (
				rightHoveredItemRef.current != null &&
				rightHoveredItemRef.current.hasOwnProperty('onSelectEnd')
			) {
				rightHoveredItemRef.current.onSelectEnd();
			}
		},
		{ handedness: 'right' }
	);

	useXREvent(
		'selectend',
		(e) => {
			if (
				leftHoveredItemRef.current != null &&
				leftHoveredItemRef.current.hasOwnProperty('onSelectEnd')
			) {
				leftHoveredItemRef.current.onSelectEnd();
			}
		},
		{ handedness: 'left' }
	);

	function getPointFromIntersection(intersection) {
		const point = new Vector3().copy(intersection.point);
		intersection.object.worldToLocal(point);
		return {
			x: (point.x + width * scale * 0.5) / scale,
			y: height - (point.y + height * scale * 0.5) / scale,
		};
	}

	function getIntersections(controller) {
		tempMartixRef.current.identity().extractRotation(controller.matrixWorld);
		raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
		raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMartixRef.current);

		return raycaster.intersectObjects([meshRef.current], false);
	}

	function hitTest(position, dx, dy) {
		const { x, y, width, height } = position;
		if (rightPointRef.current != null) {
			if (dx >= x && dx <= x + width && dy >= y && dy <= y + height) {
				return true;
			}
		}
		return false;
	}

	function updateCanvas() {
		const ctx = contextRef.current;
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
			ctx.save();
			ctx.fillStyle = 'green';
			ctx.fillRect(0, 0, width, height);
			ctx.restore();

			let anyRightHits = false;
			let anyLeftHits = false;

			for (let i = 0; i < props.children.length; i++) {
				const child = props.children[i].props;

				if (rightPointRef.current != null && !anyRightHits) {
					anyRightHits = hitTest(
						child.position,
						rightPointRef.current.x,
						rightPointRef.current.y
					);
					if (anyRightHits) {
						rightHoveredItemRef.current = child;
					}
				}

				if (leftPointRef.current != null && !anyLeftHits) {
					anyLeftHits = hitTest(
						child.position,
						leftPointRef.current.x,
						leftPointRef.current.y
					);
					if (anyLeftHits) {
						leftHoveredItemRef.current = child;
					}
				}

				switch (props.children[i].type) {
					case 'uiRect':
						drawRect(ctx, child, anyRightHits || anyLeftHits);
						break;
					case 'uiButton':
						break;
					default:
						break;
				}
			}

			if (!anyRightHits) {
				rightHoveredItemRef.current = null;
			}
			if (!anyLeftHits) {
				leftHoveredItemRef.current = null;
			}

			drawCursor(ctx, rightPointRef.current);
			drawCursor(ctx, leftPointRef.current);

			canvasTextureRef.current.needsUpdate = true;
		}
	}

	function drawRect(ctx, rect, hovered) {
		ctx.save();
		ctx.fillStyle = (hovered && rect.hoverColor) || rect.color;
		ctx.fillRect(
			rect.position.x,
			rect.position.y,
			rect.position.width,
			rect.position.height
		);
		ctx.restore();
	}

	function drawCursor(ctx, point) {
		if (point) {
			ctx.save();
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.restore();
		}
	}

	return (
		<mesh ref={meshRef} position={position} scale={1}>
			<planeGeometry args={[width * scale, height * scale]} />
			<meshBasicMaterial
				ref={materialRef}
				attach='material'
				map={canvasTextureRef.current}
				side={FrontSide}
				transparent={true}
			/>
		</mesh>
	);
}
