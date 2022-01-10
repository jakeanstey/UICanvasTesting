import { useXRFrame, useController } from '@react-three/xr';
import { useRef, useEffect } from 'react';
import { CanvasTexture, FrontSide } from 'three';
import { useThree } from '@react-three/fiber';
import { Matrix4 } from 'three';
import { Vector3 } from 'three';

export default function MainMenu({ position }) {
	const canvasRef = useRef();
	/** @type {import('react').MutableRefObject<CanvasRenderingContext2D>} */
	const contextRef = useRef();
	const meshRef = useRef();
	/** @type {import('react').MutableRefObject<CanvasTexture>} */
	const canvasTextureRef = useRef();
	const { raycaster } = useThree();
	/** @type {import('react').MutableRefObject<Matrix4>} */
	const tempMartixRef = useRef(new Matrix4());
	const controller = useController('right');
	const intersectingRef = useRef(false);
	const materialRef = useRef();
	const pointRef = useRef();

	const width = 1024;
	const height = 768;
	const padding = 5;
	const radius = 20;

	useXRFrame((dt, frame) => {
		const intersections = getIntersections();
		if (intersections.length > 0) {
			var point = new Vector3().copy(intersections[0].point);
			intersections[0].object.worldToLocal(point);
			pointRef.current = {
				x: (point.x + 1.024 / 2) * 1000,
				y: 768 - (point.y + 0.768 / 2) * 1000,
			};
			update();
			canvasTextureRef.current.needsUpdate = true;
		} else {
			if (pointRef.current != null) {
				pointRef.current = null;
				update();
				canvasTextureRef.current.needsUpdate = true;
			}
		}
		console.log(pointRef.current);
	});

	function getIntersections() {
		tempMartixRef.current
			.identity()
			.extractRotation(controller.controller.matrixWorld);

		raycaster.ray.origin.setFromMatrixPosition(
			controller.controller.matrixWorld
		);
		raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMartixRef.current);

		return raycaster.intersectObjects([meshRef.current], false);
	}

	useEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');

		canvasTextureRef.current = new CanvasTexture(canvas);
		contextRef.current = context;
		canvasRef.current = canvas;

		update();
	}, []);

	function update() {
		const ctx = contextRef.current;
		if (ctx) {
			ctx.clearRect(0, 0, 1024, 768);
			ctx.translate(0.5, 0.5);
			ctx.lineWidth = 5;
			ctx.strokeStyle = intersectingRef.current ? 'green' : 'red';

			ctx.beginPath();
			ctx.moveTo(padding + radius, padding);
			ctx.lineTo(width - padding - radius, padding);
			ctx.quadraticCurveTo(
				width - padding,
				padding,
				width - padding,
				padding + radius
			);
			ctx.lineTo(width - padding, height - padding - radius);
			ctx.quadraticCurveTo(
				width - padding,
				height - padding,
				width - padding - radius,
				height - padding
			);
			ctx.lineTo(padding + radius, height - padding);
			ctx.quadraticCurveTo(
				padding,
				height - padding,
				padding,
				height - padding - radius
			);
			ctx.lineTo(padding, padding + radius);
			ctx.quadraticCurveTo(padding, padding, padding + radius, padding);

			ctx.stroke();

			ctx.closePath();

			ctx.lineWidth = 1;
			ctx.strokeStyle = 'black';

			if (pointRef.current != null) {
				ctx.font = '20px arial';
				const coords =
					'X: ' +
					parseInt(pointRef.current.x) +
					' Y: ' +
					parseInt(pointRef.current.y);
				const size = ctx.measureText(coords);
				const height =
					size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
				ctx.fillText(coords, padding + 5, padding + height + 5);

				ctx.save();
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(pointRef.current.x, pointRef.current.y, 10, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.restore();
			}

			ctx.translate(-0.5, -0.5);
		}
	}

	return (
		<mesh ref={meshRef} scale={1} position={position}>
			<planeGeometry args={[1.024, 0.768]} />
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
