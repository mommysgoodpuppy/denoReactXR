// helpers/Cursor.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import { cursor } from './Drag';

let grabbingPointerIdGlobal = undefined;
const grabbedPositionGlobal = new Vector3();

export function Cursor() {
    const [, api] = useSphere(() => ({
        collisionFilterMask: 0,
        type: 'Kinematic',
        mass: 0,
        args: [0.5]
    }), cursor);

    useFrame(() => {
        if (grabbingPointerIdGlobal == null) return;
        api.position.set(grabbedPositionGlobal.x, grabbedPositionGlobal.y, grabbedPositionGlobal.z);
    });

    return null;
}
