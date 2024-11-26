import { Suspense, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { useFrame, Canvas } from '@react-three/fiber'
import { createXRStore, XR, XRSpace, XRHandModel, XROrigin } from '@react-three/xr'
import { Box, OrbitControls, Plane, Sphere, Sky, useMatcapTexture } from '@react-three/drei'
import { usePlane, useBox, Physics, useSphere } from '@react-three/cannon'

import { joints } from './joints.js'
import './styles.css'

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR update accepted');
  });
}

function Cube({ position, args = [0.06, 0.06, 0.06] }) {
  const [boxRef] = useBox(() => ({ position, mass: 1, args }))
  const [tex] = useMatcapTexture('C7C0AC_2E181B_543B30_6B6270')

  return <Box ref={boxRef} args={args} castShadow>
    <meshMatcapMaterial attach='material' matcap={tex} />
  </Box>
}

function Scene() {
  const [floorRef] = usePlane(() => ({
    args: [10, 10],
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 1, 0],
    type: 'Static'
  }))

  return (
    <>
      <OrbitControls target={[0, 1.2, -0.5]} />

      <ambientLight intensity={0.5} />
      <spotLight position={[1, 8, 1]} angle={0.3} penumbra={1} intensity={1} castShadow />

      <Sky />

      <Plane ref={floorRef} args={[10, 10]} receiveShadow>
        <meshStandardMaterial attach='material' color='#fff' />
      </Plane>

      {[...Array(7)].map((_, i) => (
        <Cube key={i} position={[0, 1.1 + 0.07 * i, -0.5]} />
      ))}
    </>
  )
}

const helper_vec3 = new THREE.Vector3()
const JOINT_RADIUS = 0.005

const HandJoint = ({ joint_name }) => {
  if (!joint_name) return

  const ref_joint = useRef()
  const [ref_physics, api] = useSphere(() => ({ args: [JOINT_RADIUS] }))

  useFrame(() => {
    if (ref_joint.current) {
      helper_vec3.setFromMatrixPosition(ref_joint.current.matrixWorld)

      api.position.set(
        helper_vec3.x,
        helper_vec3.y,
        helper_vec3.z
      )
    }
  })

  return <XRSpace space={joint_name} ref={ref_joint}>
    <Sphere args={[JOINT_RADIUS]} ref={ref_physics}>
      <meshBasicMaterial transparent opacity={0} />
    </Sphere>
  </XRSpace>
}

const HandWithPhysics = () => {
  return <>
    <Suspense>
      <XRHandModel />
    </Suspense>

    <Suspense>
      {
        joints.map((name, index) => <HandJoint key={index} joint_name={name} />)
      }
    </Suspense>
  </>
}

const store = createXRStore({
  controller: false,
  hand: HandWithPhysics
})

const App = () => {
  return <>
    <button onClick={() => store.enterVR()}>
      Enter VR
    </button>

    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ position: [0, 1.2, -1.0] }}
    >
      <Physics
        gravity={[0, -2, 0]}
        iterations={20}
        defaultContactMaterial={{ friction: 0.09 }}
      >
        <XR store={store}>
          <XROrigin
            scale={1.0}
            position={[0, 0.2, -1.0]}
            rotation-y={Math.PI}
          />
          <Scene />
        </XR>
      </Physics>
    </Canvas>
  </>
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)