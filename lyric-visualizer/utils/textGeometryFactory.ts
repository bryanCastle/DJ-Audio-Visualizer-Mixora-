import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import type { Font } from 'three/examples/jsm/loaders/FontLoader';
import { LyricData, LyricMesh } from '../types';

export class TextGeometryFactory {
  private font: Font;
  private material: THREE.MeshPhongMaterial;
  private meshPool: LyricMesh[] = [];

  constructor(font: Font, material: THREE.MeshPhongMaterial) {
    this.font = font;
    this.material = material;
  }

  createTextMesh(lyric: LyricData, settings: {
    size: number;
    height: number;
    color: string;
  }): LyricMesh {
    // Try to reuse a mesh from the pool
    const recycledMesh = this.meshPool.find(mesh => !mesh.userData.isActive);
    if (recycledMesh) {
      this.updateMesh(recycledMesh, lyric, settings);
      return recycledMesh;
    }

    // Create new mesh if no recycled mesh is available
    const geometry = new TextGeometry(lyric.text, {
      font: this.font,
      size: settings.size,
      height: settings.height,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    });

    geometry.computeBoundingBox();
    geometry.center();

    const mesh = new THREE.Mesh(geometry, this.material.clone()) as unknown as LyricMesh;
    mesh.userData = {
      lyric,
      isActive: true
    };

    // Set initial properties
    this.updateMesh(mesh, lyric, settings);

    return mesh;
  }

  private updateMesh(mesh: LyricMesh, lyric: LyricData, settings: {
    size: number;
    height: number;
    color: string;
  }): void {
    // Update geometry if text has changed
    if (mesh.userData.lyric.text !== lyric.text) {
      const geometry = new TextGeometry(lyric.text, {
        font: this.font,
        size: settings.size,
        height: settings.height,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });

      geometry.computeBoundingBox();
      geometry.center();

      mesh.geometry.dispose();
      mesh.geometry = geometry;
    }

    // Update material color
    (mesh.material as THREE.MeshPhongMaterial).color.set(settings.color);
    
    // Update user data
    mesh.userData.lyric = lyric;
    mesh.userData.isActive = true;

    // Reset position and scale
    mesh.position.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    mesh.rotation.set(0, 0, 0);
  }

  recycleMesh(mesh: LyricMesh): void {
    mesh.userData.isActive = false;
    this.meshPool.push(mesh);
  }

  dispose(): void {
    // Clean up all meshes in the pool
    this.meshPool.forEach(mesh => {
      mesh.geometry.dispose();
      (mesh.material as THREE.MeshPhongMaterial).dispose();
    });
    this.meshPool = [];
  }
} 