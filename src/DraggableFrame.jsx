// DraggableFrame.jsx (Updated)
import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useDragConstraint } from './helpers/Drag';
import Frame from './Frame';
import { grabbingPointerIdGlobal, grabbedPositionGlobal } from './helpers/Drag'; // Ensure these are exported

const DraggableFrame = ({ children, position = [0, 0, 0] }) => {
    const frameRef = useRef();

    // Create a physics box for the frame
    const [ref, api] = useBox(() => ({
        mass: 1, // Dynamic body
        position,
        args: [1.2, 1.2, 0.05],
        angularDamping: 1,
        linearDamping: 0.5,
    }));

    // Apply drag constraints
    const { onPointerDown, onPointerMove, onPointerUp } = useDragConstraint(ref);

    return (
        <group ref={frameRef}>
            <Frame
                ref={ref}
                onPointerDown={(e) => {
                    console.log('Pointer Down on Frame');
                    onPointerDown(e);
                }}
                onPointerMove={(e) => {
                    console.log('Pointer Move on Frame');
                    onPointerMove(e);
                }}
                onPointerUp={(e) => {
                    console.log('Pointer Up on Frame');
                    onPointerUp(e);
                }}
            />
            {/* Position the MusicPlayer appropriately within the frame */}
            <group position={[0, 0, 0.06]}>
                {children}
            </group>
        </group>
    );
};

export default DraggableFrame;
