import { createRef, useCallback, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';

// Create a cursor ref for tracking grab position
const cursor = createRef();
let grabbingPointerId = undefined;
const grabbedPosition = new Vector3();

// Hook to handle grab interactions
function useWindowGrab(ref) {
  const onPointerUp = useCallback((e) => {
    if (grabbingPointerId == null) return;
    grabbingPointerId = undefined;
    e.target.releasePointerCapture(e.pointerId);
  }, []);

  const onPointerDown = useCallback((e) => {
    if (grabbingPointerId != null) return;
    grabbingPointerId = e.pointerId;
    grabbedPosition.copy(e.point);
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (grabbingPointerId != e.pointerId) return;
    grabbedPosition.copy(e.point);
  }, []);

  // Update window position on grab
  useFrame(() => {
    if (grabbingPointerId != null && ref.current) {
      ref.current.position.set(grabbedPosition.x, grabbedPosition.y, grabbedPosition.z);
    }
  });

  return { onPointerDown, onPointerUp, onPointerMove };
}

// Cursor component to track grab position
function GrabCursor() {
  const [, api] = useSphere(
    () => ({
      collisionFilterMask: 0,
      type: 'Kinematic',
      mass: 0,
      args: [0.5]
    }),
    cursor
  );

  useFrame(() => {
    if (grabbingPointerId == null) return;
    api.position.set(grabbedPosition.x, grabbedPosition.y, grabbedPosition.z);
  });

  return null;
}

export function SpatialWindow({ children }) {
  const windowRef = useRef();
  const grabProps = useWindowGrab(windowRef);

  return (
    <group ref={windowRef} {...grabProps}>
      {/* Visual frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.2, 0.8, 0.01]} />
        <meshBasicMaterial
          color={grabbingPointerId ? "#88ff88" : "#444444"}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Content */}
      <Root
        overflow="scroll"
        scrollbarColor="black"
        flexDirection="column"
        gap={32}
        paddingX={32}
        alignItems="center"
        padding={32}
        pixelSize={0.0005}
      >
        <Container>
          {children}
        </Container>
      </Root>

      {/* Cursor for grab tracking */}
      <GrabCursor />
    </group>
  );
}