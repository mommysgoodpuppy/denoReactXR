
// helpers/Drag.js (Updated)
import { createRef, useCallback, useEffect } from 'react';
import { Vector3 } from 'three';
import { usePointToPointConstraint } from '@react-three/cannon';

export const cursor = createRef();

export let grabbingPointerIdGlobal = undefined; // Changed to 'let' and exported
export const grabbedPositionGlobal = new Vector3(); // Changed to 'const' and exported

export function useDragConstraint(child) {
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] });

  useEffect(() => {
    api.disable();
  }, [api]);

  const onPointerUp = useCallback((e) => {
    if (grabbingPointerIdGlobal == null) return;
    console.log('Pointer Up Handler Triggered');
    grabbingPointerIdGlobal = undefined;
    document.body.style.cursor = 'grab';
    e.target.releasePointerCapture(e.pointerId);
    api.disable();
  }, [api]);

  const onPointerDown = useCallback((e) => {
    if (grabbingPointerIdGlobal != null) return;
    console.log('Pointer Down Handler Triggered');
    grabbingPointerIdGlobal = e.pointerId;
    grabbedPositionGlobal.copy(e.point);
    document.body.style.cursor = 'grabbing';
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    api.enable();
  }, [api]);

  const onPointerMove = useCallback((e) => {
    if (grabbingPointerIdGlobal !== e.pointerId) return;
    console.log('Pointer Move Handler Triggered');
    grabbedPositionGlobal.copy(e.point);
    // Optionally, update cursor's position here
  }, []);

  return { onPointerUp, onPointerMove, onPointerDown };
}
