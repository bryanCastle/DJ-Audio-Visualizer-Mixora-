import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import type { Font } from 'three/examples/jsm/loaders/FontLoader';

interface TitleSongProps {
  data?: Uint8Array;
  color?: string;
  title?: string;
  currentSong?: string;
  isActive?: boolean;
  settings?: {
    size: number;
    height: number;
    position: [number, number, number];
    scale: [number, number, number];
    fontFamily?: string;
  };
}

// Simple text geometry factory for the title
class TitleTextFactory {
  private font: Font;
  private material: THREE.Material;

  constructor(font: Font, material: THREE.Material) {
    this.font = font;
    this.material = material;
  }

  getFont(): Font {
    return this.font;
  }

  getMaterial(): THREE.Material {
    return this.material;
  }

  createTextMesh(text: string, options: { size: number; height: number; color: string }) {
    const geometry = new TextGeometry(text, {
      font: this.font,
      size: options.size,
      height: options.height,
      curveSegments: 8,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 0
    });

    // Center the geometry
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox!;
    const centerOffset = -(boundingBox.max.x + boundingBox.min.x) / 2;
    geometry.translate(centerOffset, 0, 0);

    const mesh = new THREE.Mesh(geometry, this.material);
    return mesh;
  }
}

const TitleSong: React.FC<TitleSongProps> = ({
  data,
  color = '#ffffff',
  title = 'No track playing',
  currentSong,
  isActive,
  settings = {
    size: 2.0,
    height: 0.5,
    position: [0, 0, -2],
    scale: [2, 2, 2],
    fontFamily: 'helvetiker_regular'
  }
}) => {
  const [font, setFont] = useState<Font | null>(null);
  const [isFontLoading, setIsFontLoading] = useState(true);
  const textFactoryRef = useRef<TitleTextFactory | null>(null);
  const activeMeshesRef = useRef<THREE.Mesh[]>([]);

  // Map font names to their exact file paths
  const fontPathMap: { [key: string]: string } = {
    'helvetiker_regular': '/fonts/helvetiker_regular.typeface.json',
    'Jacquard 12_Regular': '/fonts/Jacquard 12_Regular.json',
    'Kabisat Demo Tall_Italic': '/fonts/Kabisat Demo Tall_Italic.json',
    'Blackletter_ExtraBold': '/fonts/Blackletter_ExtraBold.json',
    'Old London_Regular': '/fonts/Old London_Regular.json'
  }

  // Load font
  useEffect(() => {
    setIsFontLoading(true);
    const fontLoader = new FontLoader();
    
    const fontPath = fontPathMap[settings?.fontFamily || 'helvetiker_regular'] || '/fonts/helvetiker_regular.typeface.json';

    fontLoader.load(
      fontPath,
      (loadedFont) => {
        console.log('Font loaded successfully:', loadedFont);
        if (loadedFont && loadedFont.data) {
          setFont(loadedFont);
          setIsFontLoading(false);
        } else {
          console.error('Invalid font data loaded');
          setIsFontLoading(false);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading font:', error);
        setIsFontLoading(false);
      }
    );
  }, [settings?.fontFamily]);

  // Initialize text factory when font is loaded
  useEffect(() => {
    if (!font) return;

    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      shininess: 100,
      specular: new THREE.Color(0xffffff),
      emissive: new THREE.Color(color).multiplyScalar(0.2),
      side: THREE.DoubleSide
    });

    textFactoryRef.current = new TitleTextFactory(font, material);
  }, [font, color]);

  const createTextMesh = () => {
    if (!textFactoryRef.current || !isActive || isFontLoading) {
      console.log('Cannot create text mesh:', {
        hasFactory: !!textFactoryRef.current,
        isActive,
        isFontLoading
      });
      return null;
    }

    try {
      const currentFont = textFactoryRef.current.getFont();
      if (!currentFont || !currentFont.data) {
        console.error('Invalid font data');
        return null;
      }

      const geometry = new TextGeometry(title, {
        font: currentFont,
        size: settings.size,
        height: settings.height,
        curveSegments: 8,
        bevelEnabled: false,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
      });

      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox!;
      const centerOffset = -(boundingBox.max.x + boundingBox.min.x) / 2;
      geometry.translate(centerOffset, 0, 0);

      const mesh = new THREE.Mesh(geometry, textFactoryRef.current.getMaterial());
      mesh.position.set(...settings.position);
      mesh.scale.set(...settings.scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    } catch (error) {
      console.error('Error creating text mesh:', error);
      return null;
    }
  };

  // Create or update mesh when title changes or effect is toggled
  useEffect(() => {
    if (!isActive) {
      // Clean up existing meshes when effect is toggled off
      activeMeshesRef.current.forEach(mesh => {
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      activeMeshesRef.current = [];
      return;
    }

    // Clean up existing meshes
    activeMeshesRef.current.forEach(mesh => {
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    activeMeshesRef.current = [];

    // Create new mesh for text
    const mesh = createTextMesh();
    if (mesh) {
      activeMeshesRef.current.push(mesh);
    }
  }, [title, color, isActive, settings]);

  if (!isActive) return null;

  return (
    <group>
      {activeMeshesRef.current.map((mesh, index) => (
        <primitive
          key={index}
          object={mesh}
          position={settings.position}
          rotation={[0, 0, 0]}
          scale={settings.scale}
        />
      ))}
    </group>
  );
};

export default TitleSong; 