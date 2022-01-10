import { DefaultXRControllers, VRCanvas } from '@react-three/xr';
import { Suspense } from 'react';
import Scene from './scenes/Scene';
import './App.css';

function App() {
	return (
		<Suspense fallback={null}>
			<VRCanvas>
				<DefaultXRControllers />
				<Scene />
			</VRCanvas>
		</Suspense>
	);
}

export default App;
