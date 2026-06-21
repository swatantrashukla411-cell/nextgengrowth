import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ParticleNetworkCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 20;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create a circular glowing dot texture for soft round particles
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(52, 211, 153, 1)');
      grad.addColorStop(0.3, 'rgba(52, 211, 153, 0.8)');
      grad.addColorStop(0.6, 'rgba(15, 81, 50, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const particleTexture = createCircleTexture();

    // Particles Data
    const particleCount = 280;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = []; // To store original rest coordinates
    const velocities = [];
    const scales = new Float32Array(particleCount);

    // Grid size bounds
    const xRange = 28;
    const yRange = 18;
    const zRange = 10;

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * xRange;
      const y = (Math.random() - 0.5) * yRange;
      const z = (Math.random() - 0.5) * zRange;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions.push(new THREE.Vector3(x, y, z));
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.005
      ));
      scales[i] = Math.random() * 0.5 + 0.5;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Material
    const particlesMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Dynamic Connection Lines (LineSegments)
    // To connect particles that are close together, we will build a dynamic LineSegments mesh
    const maxConnections = 400;
    const lineIndices = new Uint16Array(maxConnections * 2);
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x34D399,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const connectionLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(connectionLines);

    // Mouse Tracking (Raycaster to calculate mouse in 3D space)
    const mouse = new THREE.Vector2(-999, -999);
    const targetMouse = new THREE.Vector2(-999, -999);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Z=0 plane

    const handleMouseMove = (e) => {
      // Normalised mouse coordinates
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Lerp mouse coordinate for smooth lag effect
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      // Find 3D intersection of mouse on Z=0 plane
      raycaster.setFromCamera(mouse, camera);
      const mouse3D = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, mouse3D);

      const posAttribute = particlesGeo.getAttribute('position');
      const posArray = posAttribute.array;

      let lineCount = 0;
      const linePosArray = lineGeo.getAttribute('position').array;

      // Update positions
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        let x = posArray[idx];
        let y = posArray[idx + 1];
        let z = posArray[idx + 2];

        // 1. Natural floating drift
        const vel = velocities[i];
        x += vel.x;
        y += vel.y;
        z += vel.z;

        // Bounce off bounds
        if (Math.abs(x) > xRange / 2) vel.x *= -1;
        if (Math.abs(y) > yRange / 2) vel.y *= -1;
        if (Math.abs(z) > zRange / 2) vel.z *= -1;

        // 2. Cursor repulsion physics
        const currPos = new THREE.Vector3(x, y, z);
        const distToMouse = currPos.distanceTo(mouse3D);
        const repulsionRadius = 6.0;

        if (distToMouse < repulsionRadius && mouse.x > -990) {
          // Calculate push direction
          const dir = new THREE.Vector3().subVectors(currPos, mouse3D);
          dir.z = 0; // Keep push on XY plane
          const force = (repulsionRadius - distToMouse) / repulsionRadius;
          
          // Push particle away
          const push = dir.normalize().multiplyScalar(force * 0.15);
          x += push.x;
          y += push.y;
        } else {
          // Return slowly to baseline drift
          const init = initialPositions[i];
          // Modify baseline slightly over time to allow natural scrolling drift
          init.x += vel.x * 0.1;
          init.y += vel.y * 0.1;
          
          const returnForce = new THREE.Vector3().subVectors(init, currPos).multiplyScalar(0.01);
          x += returnForce.x;
          y += returnForce.y;
          z += returnForce.z;
        }

        // Save updated positions
        posArray[idx] = x;
        posArray[idx + 1] = y;
        posArray[idx + 2] = z;
      }

      posAttribute.needsUpdate = true;

      // 3. Connect nodes that are close to each other
      for (let i = 0; i < particleCount; i++) {
        if (lineCount >= maxConnections) break;

        const ix = posArray[i * 3];
        const iy = posArray[i * 3 + 1];
        const iz = posArray[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          if (lineCount >= maxConnections) break;

          const jx = posArray[j * 3];
          const jy = posArray[j * 3 + 1];
          const jz = posArray[j * 3 + 2];

          // Euclidean distance check
          const dx = ix - jx;
          const dy = iy - jy;
          const dz = iz - jz;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist < 3.8) {
            const lineIdx = lineCount * 6;
            
            // Start Node
            linePosArray[lineIdx] = ix;
            linePosArray[lineIdx + 1] = iy;
            linePosArray[lineIdx + 2] = iz;

            // End Node
            linePosArray[lineIdx + 3] = jx;
            linePosArray[lineIdx + 4] = jy;
            linePosArray[lineIdx + 5] = jz;

            lineCount++;
          }
        }
      }

      // Draw active connections, fill remaining coordinates with 0 to prevent rendering artifacts
      for (let i = lineCount * 6; i < maxConnections * 6; i++) {
        linePosArray[i] = 0;
      }
      lineGeo.getAttribute('position').needsUpdate = true;

      // Slowly rotate the entire system
      particleSystem.rotation.y += 0.0006;
      connectionLines.rotation.y += 0.0006;

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
      particleTexture.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
  );
}
