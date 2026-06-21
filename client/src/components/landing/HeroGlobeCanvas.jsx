import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroGlobeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 12;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Base Earth Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(3, 30, 30);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0F5132,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // 2. Outer Dot/Vertex Shell (custom points at vertices)
    const pointsGeo = new THREE.SphereGeometry(3.05, 24, 24);
    const pointsMat = new THREE.PointsMaterial({
      color: 0x34D399,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(points);

    // 3. Glowing City Nodes (custom spheres placed on surface)
    const citiesGroup = new THREE.Group();
    globeGroup.add(citiesGroup);
    
    // Add some random "cities" with connecting lines
    const citiesCount = 12;
    const cityCoords = [];
    const cityMaterial = new THREE.MeshBasicMaterial({
      color: 0x34D399,
      transparent: true,
      opacity: 0.9
    });

    for (let i = 0; i < citiesCount; i++) {
      // Spherical coordinates
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.05;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      cityCoords.push(new THREE.Vector3(x, y, z));

      const cityGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const cityMesh = new THREE.Mesh(cityGeo, cityMaterial);
      cityMesh.position.set(x, y, z);
      citiesGroup.add(cityMesh);
    }

    // 4. Connection Arcs between City Nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x34D399,
      transparent: true,
      opacity: 0.25,
    });

    for (let i = 0; i < cityCoords.length; i++) {
      for (let j = i + 1; j < cityCoords.length; j++) {
        // Connect nodes if they are somewhat close to create a network grid
        if (cityCoords[i].distanceTo(cityCoords[j]) < 3.5) {
          // Draw a curved line (quadratic bezier) to represent satellite arcs
          const start = cityCoords[i];
          const end = cityCoords[j];
          const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(3.6); // pull outward for curve

          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const curvePoints = curve.getPoints(15);
          const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
          const arcLine = new THREE.Line(curveGeo, lineMat);
          citiesGroup.add(arcLine);
        }
      }
    }

    // 5. Orbital Rings (representing AI networks or transactions)
    const ringGeo = new THREE.RingGeometry(3.6, 3.62, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34D399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
    });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.5;
    ring1.rotation.y = Math.PI / 6;
    globeGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = -Math.PI / 8;
    globeGroup.add(ring2);

    // Orbiting Satellite
    const satelliteGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const satelliteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satellite = new THREE.Mesh(satelliteGeo, satelliteMat);
    scene.add(satellite);

    // Light source
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Mouse Interaction Parallax variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      // Calculate normalized mouse coords (-0.5 to 0.5)
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Slow constant rotations
      globeGroup.rotation.y += 0.0015;
      globeGroup.rotation.x += 0.0005;

      // Orbit satellite
      const time = Date.now() * 0.0008;
      satellite.position.x = Math.cos(time) * 4.2;
      satellite.position.z = Math.sin(time) * 4.2;
      satellite.position.y = Math.sin(time * 0.5) * 1.5;

      // Smooth Lerp target camera parallax based on mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 4;
      camera.position.y = -targetY * 4;
      camera.lookAt(scene.position);

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
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // dispose geometries/materials
      sphereGeo.dispose();
      sphereMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      cityMaterial.dispose();
      lineMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      satelliteGeo.dispose();
      satelliteMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
  );
}
