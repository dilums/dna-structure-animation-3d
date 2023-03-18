let renderer;
let scene;
let particles;
const { innerWidth, innerHeight } = window;
const {sin, cos } = Math;
const DENSITY_RADIOUS = 16;
const PHASE_SHIFT = 120;
let allPoints = []
const connectionPoints = [];

const rad = deg => (deg / 180) * Math.PI;
const getRandomPoint = () => DENSITY_RADIOUS * Math.random() - (DENSITY_RADIOUS / 2);
const range = x => Array(x).fill(0).map((_, index) => index)
const norm = (val, min, max)=>(val - min) / (max - min)
const lerp = (nrm, min, max)=>(max - min) * nrm + min
const lerpMap = (val, sMin, sMax, dMin, dMax)=>lerp(norm(val, sMin, sMax), dMin, dMax)

const init = () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(
    15,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = 2500;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
};

const addParticles = particleArray => {
  const geometry = new THREE.Geometry();
  particleArray.forEach(particle => {geometry.vertices.push(particle)});
  const material = new THREE.PointsMaterial({
    size: 2,
    opacity: 0.4,
    alphaTest: 0.4,
    transparent: true
  });
  material.color.setHSL(0.58, 1, 0.5);
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

const getPoints = p => {
  const { x, y, z } = p;
  return range(100).map(() => ({
    x: x + getRandomPoint(),
    y: y + getRandomPoint(),
    z: z + getRandomPoint()
  }));
};

const getCirclePoins = a => {
  const angle = rad(a);
  const r = 100;
  const x = r * sin(angle);
  const z = r * cos(angle);
  return { x, z };
};

const addConnection = ({ pa, pb }) => {
  const connectionDensity = 100
  const connectionPoints = range(connectionDensity).reduce(
    (acc, i) => [
      ...acc,
      ...getPoints({
        x: lerpMap(i, 0, connectionDensity, pa.x, pb.x),
        y: pa.y,
        z: lerpMap(i, 0, connectionDensity, pa.z, pb.z)
      })
    ],
    []
  );
  allPoints =  allPoints.concat(connectionPoints)
};

const calculateDnaPoints = ()=>{
  range(360).forEach(a => {
    const pa = { ...getCirclePoins(a), y: 1.5*(a - 180 )};
    const pb = { ...getCirclePoins(a + PHASE_SHIFT), y: 1.5*(a - 180 )};
    allPoints = allPoints.concat(getPoints(pa))
    allPoints =  allPoints.concat(getPoints(pb))
    if (a % 36 === 0) {
      connectionPoints.push({ pa, pb });
    }
  });
  connectionPoints.map(i => addConnection(i));
}

init();
calculateDnaPoints()
addParticles(allPoints)



const loop = ()=>{
  particles.rotation.y += 0.01
  requestAnimationFrame(loop)
  renderer.render(scene, camera);
}

loop()