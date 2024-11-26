import { Canvas } from "@react-three/fiber";
import { Defaults } from "@react-three/uikit-apfel";
import { Container, Text, Root } from '@react-three/uikit';
import { createXRStore, noEvents, PointerEvents, XR, XROrigin } from '@react-three/xr'
import { Card } from "@react-three/uikit-apfel";
import { Button } from "@react-three/uikit-apfel";
import { PlayIcon, SkipBack, SkipForward, Menu, Maximize, Settings } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { useControls } from 'leva';
import { Environment } from '@react-three/drei';

const store = createXRStore({
  hand: {
    teleportPointer: true,
  },
  controller: {
    teleportPointer: true,
  },
})

function MusicPlayer() {
  const [counter, setCounter] = useState(0);

  return (
    <Container flexDirection="column" alignItems="center" gap={32}>
      <Card borderRadius={32} padding={16}>
        <Container flexDirection="column" gap={16}>
          {/* Header */}
          <Container flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text fontSize={18} fontWeight={500}>Music Player</Text>
            <Container flexDirection="row" gap={8}>
              <Button variant="icon" size="xs">
                <Maximize />
              </Button>
              <Button variant="icon" size="xs">
                <Settings />
              </Button>
              <Button variant="icon" size="xs">
                <Menu />
              </Button>
            </Container>
          </Container>

          {/* Now Playing */}
          <Container flexDirection="row" gap={16} alignItems="center">
            <Container
              width={64}
              height={64}
              backgroundColor="rgb(243,244,246)"
              borderRadius={8}
            />
            <Container flexDirection="column" gap={4}>
              <Text fontSize={18} fontWeight={500}>Blowin' in the Wind</Text>
              <Text fontSize={14} color="rgb(107,114,128)">
                Bob Dylan {counter}
              </Text>
            </Container>
          </Container>

          {/* Controls */}
          <Container flexDirection="row" justifyContent="space-between" alignItems="center">
            <Button variant="icon" size="sm">
              <SkipBack />
            </Button>
            <Button
              variant="icon"
              size="sm"
              onClick={() => setCounter((c) => c + 1)}
            >
              <PlayIcon />
            </Button>
            <Button variant="icon" size="sm">
              <SkipForward />
            </Button>
          </Container>

          {/* Playlist */}
          <Container flexDirection="column" gap={8}>
            <Text fontSize={18} fontWeight={500}>Playlist</Text>
            {[
              "Like a Rolling Stone",
              "The Times They Are a-Changin'",
              "Subterranean Homesick Blues"
            ].map((song) => (
              <Container
                key={song}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize={14}>{song}</Text>
                <Button variant="icon" size="xs">
                  <PlayIcon />
                </Button>
              </Container>
            ))}
          </Container>
        </Container>
      </Card>
    </Container>
  );
}

export function App() {
  const { visible } = useControls({ visible: true });

  return (
    <>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas events={noEvents} style={{ width: '100%', flexGrow: 1 }}>
        <PointerEvents batchEvents={false} />
        <XR store={store}>
          <XROrigin visible={visible} />
          <Environment preset="city" />
          <group pointerEventsType={{ deny: 'grab' }} position={[0, 1.5, -0.5]}>
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
              <ambientLight intensity={0.5} />
              <directionalLight intensity={1} position={[-5, 5, 10]} />
              <Container>
                <Defaults>
                  <MusicPlayer />
                </Defaults>
              </Container>
            </Root>
          </group>
        </XR>
      </Canvas>
    </>
  );
}