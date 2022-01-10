import { useRef } from 'react';

export default function Plane({ position, color }) {
	const planeRef = useRef();

	return (
		<mesh
			ref={planeRef}
			position={position}
			scale={1}
			rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[10, 10]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}
