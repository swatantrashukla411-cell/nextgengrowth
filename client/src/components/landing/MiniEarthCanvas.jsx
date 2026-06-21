import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function MiniEarthCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.z = 8;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all objects
    const group = new THREE.Group();
    scene.add(group);

    // 1. Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x34D399,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // 2. Concentric Orbit Rings
    const ringGeo1 = new THREE.RingGeometry(2.1, 2.11, 64);
    const ringGeo2 = new THREE.RingGeometry(2.4, 2.41, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34D399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
    });

    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.x = Math.PI / 2.2;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    group.add(ring2);

    // 3. Orbiting Nodes (Satellites)
    const satCount = 4;
    const satellites = [];
    const satMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const sat = new THREE.Mesh(satGeo, satMaterial);
      group.add(sat);
      satellites.push({
        mesh: sat,
        speed: 0.01 + i * 0.005,
        radius: 2.1 + (i * 0.15),
        offset: i * Math.PI * 0.5
      });
    }

    // 4. Ambient Particle Dust surrounding Earth
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      // Create positions in a spherical shell around the earth
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.5;

      dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dustPositions[i * 3 + 2] = r * Math.cos(phi);
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x34D399,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    group.add(dust);

    // Slow rotation
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Auto rotation
      group.rotation.y += 0.003;
      group.rotation.x += 0.0008;

      // Update Satellites orbital positions
      const time = Date.now();
      satellites.forEach((sat, i) => {
        const angle = time * sat.speed * 0.05 + sat.offset;
        // Orbit on different planes
        if (i % 2 === 0) {
          sat.mesh.position.x = Math.cos(angle) * sat.radius;
          sat.mesh.position.z = Math.sin(angle) * sat.radius;
          sat.mesh.position.y = Math.sin(angle * 0.5) * 0.5;
        } else {
          sat.mesh.position.y = Math.cos(angle) * sat.radius;
          sat.mesh.position.z = Math.sin(angle) * sat.radius;
          sat.mesh.position.x = Math.sin(angle * 0.5) * 0.5;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringMat.dispose();
      satMaterial.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
  );
}
