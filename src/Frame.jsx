// Frame.jsx (Updated)
// Frame.jsx (Enhanced with Hover State)
import React, { forwardRef, useState } from 'react';
import { Box } from '@react-three/drei';

const Frame = forwardRef((props, ref) => {
    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            ref={ref}
            {...props}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }}
        >
            <boxGeometry args={[0.2, 0.2, 0.02]} />
            <meshBasicMaterial
                color={hovered ? "blue" : "orange"}
                wireframe
                transparent
                opacity={0.8}
            />
        </mesh>
    );
});

export default Frame;

