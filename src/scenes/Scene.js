import { useRef, useState, useEffect, useCallback } from 'react';
import Plane from '../objects/Plane';
import { useThree } from '@react-three/fiber';
import UICanvas from '../controls/UI/UICanvas';

export default function Scene() {
	const sceneRef = useRef();

	const { gl } = useThree();
	const [xrEnabled, setXREnabled] = useState(false);

	const sessionStart = useCallback(() => {
		setXREnabled(true);
		gl.xr.removeEventListener('sessionstart', sessionStart);
	}, [gl.xr]);

	useEffect(() => {
		gl.xr.addEventListener('sessionstart', sessionStart);

		return () => {
			gl.xr.removeEventListener('sessionstart', sessionStart);
		};
	}, [gl.xr, sessionStart]);

	function boxSelected() {}

	return (
		<>
			{xrEnabled && (
				<group ref={sceneRef}>
					<ambientLight />
					<pointLight position={[10, 10, 10]} />
					<Plane position={[0, 0, 0]} color={'gray'} />
					<UICanvas
						position={[0, 1.5, -0.5]}
						width={1024}
						height={768}
						scale={0.001}>
						<uiRect
							position={{ x: 100, y: 100, width: 100, height: 100 }}
							color={'white'}
							hoverColor={'black'}
							onSelectStart={boxSelected}
						/>
						<uiButton
							position={{ x: 100, y: 100, width: 100, height: 100 }}
							color={'black'}
							text={'HASDN'}
						/>
					</UICanvas>
				</group>
			)}
		</>
	);
}
