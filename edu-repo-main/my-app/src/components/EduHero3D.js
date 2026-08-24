import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * EduHero3D - Premium 3D Educational Hero Experience
 * Renders floating low-poly educational symbols in a modern futuristic layout:
 * - 🧠 AI Neural Core (Top Center)
 * - 📚 Knowledge Book (Mid Left)
 * - 📊 Analytics Visualization (Mid Right)
 * - 🏆 Gamification Trophy (Low Left)
 * - 💻 Digital Tablet (Low Right)
 * - 🎓 Graduation Cap (Bottom Center)
 */
const EduHero3D = ({ onObjectHover }) => {
  const mountRef = useRef(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL support check
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebglAvailable(false);
      return;
    }

    let animationFrameId;
    let scene, camera, renderer;
    const objects = [];
    let particles;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 11);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 1.8);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.4);
    dirLight2.position.set(-10, -10, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 2, 20);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // 3. Materials
    const blueMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
      shininess: 90,
      flatShading: true,
    });

    const purpleMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.3,
      shininess: 80,
      flatShading: true,
    });

    const emeraldMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.25,
      shininess: 100,
      flatShading: true,
    });

    const goldMaterial = new THREE.MeshPhongMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      shininess: 120,
      flatShading: true,
    });

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Object 1: AI Neural Core (Top Center) ---
    const brainGroup = new THREE.Group();
    const brainGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const brainMesh = new THREE.Mesh(brainGeo, emeraldMaterial);
    const wireframeGeo = new THREE.WireframeGeometry(brainGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 1.5 });
    const wireframeLines = new THREE.LineSegments(wireframeGeo, wireframeMat);

    brainGroup.add(brainMesh);
    brainGroup.add(wireframeLines);
    brainGroup.position.set(0, 2.5, 0);
    brainGroup.userData = {
      name: "AI Neural Core",
      floatSpeed: 0.0012,
      rotSpeedY: 0.006,
      rotSpeedX: 0.003,
      baseY: 2.5,
    };
    scene.add(brainGroup);
    objects.push(brainGroup);

    // --- Object 2: Knowledge Book (Mid Left) ---
    const bookGroup = new THREE.Group();
    const coverGeo = new THREE.BoxGeometry(1.6, 2.0, 0.3);
    const coverMesh = new THREE.Mesh(coverGeo, blueMaterial);
    const pagesGeo = new THREE.BoxGeometry(1.4, 1.8, 0.25);
    const pagesMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.05, 0, 0);
    bookGroup.add(coverMesh);
    bookGroup.add(pagesMesh);
    bookGroup.position.set(-3.8, 0.8, -0.5);
    bookGroup.rotation.set(0.3, -0.4, 0.2);
    bookGroup.userData = {
      name: "Knowledge Book",
      floatSpeed: 0.0015,
      rotSpeedY: 0.005,
      rotSpeedX: 0.004,
      baseY: 0.8,
    };
    scene.add(bookGroup);
    objects.push(bookGroup);

    // --- Object 3: Analytics Visualization (Mid Right) ---
    const analyticsGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.2, 0.12, 12, 32);
    const ringMesh = new THREE.Mesh(ringGeo, emeraldMaterial);
    analyticsGroup.add(ringMesh);

    const bar1Geo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
    const bar1Mesh = new THREE.Mesh(bar1Geo, goldMaterial);
    bar1Mesh.position.set(-0.4, 0, 0);

    const bar2Geo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8);
    const bar2Mesh = new THREE.Mesh(bar2Geo, blueMaterial);
    bar2Mesh.position.set(0, 0.3, 0);

    const bar3Geo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
    const bar3Mesh = new THREE.Mesh(bar3Geo, purpleMaterial);
    bar3Mesh.position.set(0.4, 0.6, 0);

    analyticsGroup.add(bar1Mesh);
    analyticsGroup.add(bar2Mesh);
    analyticsGroup.add(bar3Mesh);
    analyticsGroup.position.set(3.8, 0.8, -0.5);
    analyticsGroup.rotation.set(0.5, 0.6, -0.2);
    analyticsGroup.userData = {
      name: "Analytics Metrics",
      floatSpeed: 0.0018,
      rotSpeedY: 0.006,
      rotSpeedX: 0.004,
      baseY: 0.8,
    };
    scene.add(analyticsGroup);
    objects.push(analyticsGroup);

    // --- Object 4: Gamification Trophy (Low Left) ---
    const trophyGroup = new THREE.Group();
    const cupGeo = new THREE.OctahedronGeometry(1.0, 0);
    const cupMesh = new THREE.Mesh(cupGeo, goldMaterial);
    const baseGeo = new THREE.BoxGeometry(1.1, 0.4, 1.1);
    const baseMesh = new THREE.Mesh(baseGeo, purpleMaterial);
    baseMesh.position.y = -1.0;

    trophyGroup.add(cupMesh);
    trophyGroup.add(baseMesh);
    trophyGroup.position.set(-3.6, -1.8, 0);
    trophyGroup.rotation.set(0.2, -0.5, 0.3);
    trophyGroup.userData = {
      name: "Gamification Trophy",
      floatSpeed: 0.0014,
      rotSpeedY: 0.008,
      rotSpeedX: 0.004,
      baseY: -1.8,
    };
    scene.add(trophyGroup);
    objects.push(trophyGroup);

    // --- Object 5: Digital Laptop / Tablet (Low Right) ---
    const tabletGroup = new THREE.Group();
    const screenGeo = new THREE.BoxGeometry(2.0, 1.3, 0.1);
    const screenMesh = new THREE.Mesh(screenGeo, blueMaterial);
    const displayGeo = new THREE.PlaneGeometry(1.8, 1.1);
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.z = 0.06;

    tabletGroup.add(screenMesh);
    tabletGroup.add(displayMesh);
    tabletGroup.position.set(3.6, -1.8, 0);
    tabletGroup.rotation.set(-0.3, 0.1, 0.1);
    tabletGroup.userData = {
      name: "Digital Classroom Tablet",
      floatSpeed: 0.0013,
      rotSpeedY: 0.004,
      rotSpeedX: 0.003,
      baseY: -1.8,
    };
    scene.add(tabletGroup);
    objects.push(tabletGroup);

    // --- Object 6: Graduation Cap (Bottom Center) ---
    const capGroup = new THREE.Group();
    const boardGeo = new THREE.BoxGeometry(2.2, 0.1, 2.2);
    const boardMesh = new THREE.Mesh(boardGeo, purpleMaterial);
    const skullGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 8);
    const skullMesh = new THREE.Mesh(skullGeo, purpleMaterial);
    skullMesh.position.y = -0.35;
    const buttonGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8);
    const buttonMesh = new THREE.Mesh(buttonGeo, goldMaterial);
    buttonMesh.position.y = 0.1;

    capGroup.add(boardMesh);
    capGroup.add(skullMesh);
    capGroup.add(buttonMesh);
    capGroup.position.set(0, -2.6, -1);
    capGroup.rotation.set(0.4, 0.2, -0.15);
    capGroup.userData = {
      name: "Graduation Cap",
      floatSpeed: 0.001,
      rotSpeedY: 0.005,
      rotSpeedX: 0.003,
      baseY: -2.6,
    };
    scene.add(capGroup);
    objects.push(capGroup);

    // 4. Background Floating Particles
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Mouse Parallax & Raycasting Setup
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouse.targetX = (x / rect.width - 0.5) * 2;
      mouse.targetY = -(y / rect.height - 0.5) * 2;

      mouseVector.x = (x / rect.width) * 2 - 1;
      mouseVector.y = -(y / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth camera parallax
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        camera.position.x = mouse.x * 0.8;
        camera.position.y = mouse.y * 0.5;

        // Animate floating objects
        objects.forEach((obj) => {
          obj.rotation.y += obj.userData.rotSpeedY;
          obj.rotation.x += obj.userData.rotSpeedX;
          obj.position.y =
            obj.userData.baseY + Math.sin(elapsedTime * 1.5 + obj.position.x) * 0.22;
        });

        // Slowly rotate particle field
        if (particles) {
          particles.rotation.y = elapsedTime * 0.02;
        }
      }

      camera.lookAt(0, 0, 0);

      // Hover Raycasting check
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(
        objects.map((g) => g.children[0]),
        true
      );

      if (intersects.length > 0) {
        const hoveredGroup = intersects[0].object.parent;
        if (hoveredGroup && hoveredGroup.scale) {
          hoveredGroup.scale.lerp(new THREE.Vector3(1.18, 1.18, 1.18), 0.1);
          if (onObjectHover && hoveredGroup.userData?.name) {
            onObjectHover(hoveredGroup.userData.name);
          }
        }
      } else {
        objects.forEach((g) => {
          g.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // 8. Clean Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose geometries and materials
      objects.forEach((group) => {
        group.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
      if (particles) {
        particles.geometry.dispose();
        particles.material.dispose();
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onObjectHover]);

  // High-End 2D Fallback if WebGL is disabled
  if (!webglAvailable) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 480,
          background:
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            padding: 40,
            opacity: 0.85,
          }}
        >
          {["🧠 AI Neural Core", "📚 Knowledge Book", "📊 Analytics", "🏆 Gamification", "💻 Tablet OS", "🎓 Graduation Cap"].map(
            (label, i) => (
              <div
                key={i}
                className="animate-float"
                style={{
                  animationDelay: `${i * 0.4}s`,
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: "24px 20px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 480,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
};

export default EduHero3D;
