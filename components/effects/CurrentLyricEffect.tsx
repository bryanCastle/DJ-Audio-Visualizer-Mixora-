import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Text3D } from '@react-three/drei'
import { useLyricManager } from '../../hooks/useLyricManager'
import { useStore } from '../../store/visualizerStore'

interface CurrentLyricEffectProps {
  data: Uint8Array
  color: string
  settings: {
    fontSize: number
    depth: number
    spacing: number
    animationSpeed: number
    emissiveIntensity: number
    fontFamily: string
  }
}

function splitLyricLine(line: string, maxLen = 32): [string, string?] {
  if (!line) return ["..."];
  if (line.length <= maxLen) return [line];
  // Try to split at the nearest space to the middle
  const mid = Math.floor(line.length / 2);
  let splitIdx = line.lastIndexOf(' ', mid);
  if (splitIdx === -1 || splitIdx < maxLen / 2) splitIdx = line.indexOf(' ', mid);
  if (splitIdx === -1) splitIdx = mid; // fallback: hard split
  return [line.slice(0, splitIdx).trim(), line.slice(splitIdx).trim()];
}

function darkenColor(hex: string, factor = 0.4) {
  const color = new THREE.Color(hex)
  color.r *= factor
  color.g *= factor
  color.b *= factor
  return `#${color.getHexString()}`
}

// Helper to create a subtle gradient color for the front
function gradientColor(hex: string, y: number) {
  const base = new THREE.Color(hex)
  const top = base.clone().lerp(new THREE.Color('#ffffff'), 0.25)
  const bottom = base.clone().lerp(new THREE.Color('#00cfff'), 0.25)
  return y > 0 ? `#${top.getHexString()}` : `#${bottom.getHexString()}`
}

const CurrentLyricEffect = ({ data, color, settings }: CurrentLyricEffectProps) => {
  const { fontSize, depth, spacing, animationSpeed, emissiveIntensity, fontFamily = 'helvetiker_regular' } = settings
  const { activeEffects } = useStore()
  const { currentLineText } = useLyricManager(activeEffects)
  
  // Use useRef to store the previous lyric text
  const prevLyricRef = useRef<string>("")
  
  // Only update when the lyric text actually changes
  const [line1, line2] = useMemo(() => {
    if (currentLineText !== prevLyricRef.current) {
      prevLyricRef.current = currentLineText
      return splitLyricLine(currentLineText || "...")
    }
    return [prevLyricRef.current, undefined]
  }, [currentLineText])

  const sideColor = darkenColor(color, 0.3)
  const bevelColor = darkenColor(color, 0.15)

  // Map font names to their exact file paths
  const fontPathMap: { [key: string]: string } = {
    'helvetiker_regular': '/fonts/helvetiker_regular.typeface.json',
    'Jacquard 12_Regular': '/fonts/Jacquard 12_Regular.json',
    'Kabisat Demo Tall_Italic': '/fonts/Kabisat Demo Tall_Italic.json',
    'Blackletter_ExtraBold': '/fonts/Blackletter_ExtraBold.json',
    'Old London_Regular': '/fonts/Old London_Regular.json'
  }

  const fontPath = fontPathMap[fontFamily] || '/fonts/helvetiker_regular.typeface.json'

  // Materials: [front, side, bevel]
  const frontMaterial = (y: number) => (
    <meshPhysicalMaterial
      attach="material-0"
      color={gradientColor(color, y)}
      emissive={color}
      emissiveIntensity={emissiveIntensity * 1.5}
      metalness={0.7}
      roughness={0.3}
      clearcoat={0.3}
      clearcoatRoughness={0.2}
    />
  );
  const sideMaterial = (
    <meshStandardMaterial
      attach="material-1"
      color={sideColor}
      emissive="#000"
      emissiveIntensity={0.1}
      metalness={0.5}
      roughness={0.5}
    />
  );
  const bevelMaterial = (
    <meshStandardMaterial
      attach="material-2"
      color={bevelColor}
      emissive="#000"
      emissiveIntensity={0.05}
      metalness={0.5}
      roughness={0.5}
    />
  );

  return (
    <group position={[-2, 0, 0]}>
      <Text3D
        font={fontPath}
        size={fontSize / 100}
        height={depth}
        position={[0, line2 ? 0.15 : 0, 0]}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
        castShadow
        receiveShadow
      >
        {line1}
        {frontMaterial(1)}
        {sideMaterial}
        {bevelMaterial}
      </Text3D>
      {line2 && (
        <Text3D
          font={fontPath}
          size={fontSize / 100}
          height={depth}
          position={[0, -0.15, 0]}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          castShadow
          receiveShadow
        >
          {line2}
          {frontMaterial(-1)}
          {sideMaterial}
          {bevelMaterial}
        </Text3D>
      )}
    </group>
  )
}

export default CurrentLyricEffect 