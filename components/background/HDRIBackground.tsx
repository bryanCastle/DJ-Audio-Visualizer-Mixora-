import React, { useRef, useEffect, useMemo } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { PMREMGenerator, CubeTexture, Texture, DirectionalLight } from 'three';
import { useStore } from '../../store/visualizerStore';

interface HDRIBackgroundProps {
  hdriPath: string;
  intensity?: number;
  rotation?: number;
}

const HDRIBackground = ({ 
  hdriPath, 
  intensity = 1,
  rotation = 0 
}: HDRIBackgroundProps) => {
  const { gl, scene } = useThree();
  const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl]);
  const { background } = useStore();
  const sunLightRef = useRef<DirectionalLight | null>(null);
  
  // Determine loader based on file extension
  const isEXR = hdriPath.toLowerCase().endsWith('.exr');
  const loader = isEXR ? EXRLoader : RGBELoader;
  
  // Load and process HDRI
  const texture = useLoader(loader, hdriPath);
  
  useEffect(() => {
    // Generate PMREM (Pre-filtered Mipmapped Radiance Environment Map)
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    
    // Apply to scene
    scene.environment = envMap;
    scene.background = envMap;
    
    // Add sun light if using sky background
    if (hdriPath.includes('sky.exr')) {
      if (!sunLightRef.current) {
        const sunLight = new DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 5, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -10;
        sunLight.shadow.camera.right = 10;
        sunLight.shadow.camera.top = 10;
        sunLight.shadow.camera.bottom = -10;
        scene.add(sunLight);
        sunLightRef.current = sunLight;
      }
    } else {
      // Remove sun light if switching to studio background
      if (sunLightRef.current) {
        scene.remove(sunLightRef.current);
        sunLightRef.current = null;
      }
    }
    
    // Cleanup
    return () => {
      if (sunLightRef.current) {
        scene.remove(sunLightRef.current);
        sunLightRef.current = null;
      }
      texture.dispose();
      envMap.dispose();
    };
  }, [texture, scene, pmremGenerator, hdriPath]);

  // Update background intensity
  useEffect(() => {
    if (scene.environment) {
      const envMap = scene.environment as Texture;
      envMap.matrixAutoUpdate = true;
      envMap.needsUpdate = true;
    }
    // Update sun light intensity
    if (sunLightRef.current) {
      sunLightRef.current.intensity = intensity;
    }
  }, [intensity, scene]);

  // Update background rotation
  useEffect(() => {
    if (scene.background) {
      const bgMap = scene.background as Texture;
      bgMap.matrixAutoUpdate = true;
      bgMap.needsUpdate = true;
    }
    // Update sun light position based on rotation
    if (sunLightRef.current) {
      const angle = (rotation * Math.PI) / 180;
      sunLightRef.current.position.set(
        5 * Math.cos(angle),
        5,
        5 * Math.sin(angle)
      );
    }
  }, [rotation, scene]);

  return null; // This component doesn't render anything directly
};

export default HDRIBackground; 