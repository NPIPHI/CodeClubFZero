window.onclick=function(){
    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
                                            renderer.domElement.mozRequestPointerLock;
    renderer.domElement.requestPointerLock()
    mouseLocked = true;
};
window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});
function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    let light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(3,3,3);
    scene.add(light);
    light = new THREE.AmbientLight(0x3f3f3f, 1, 100);
    scene.add(light);
    camera.position.z = 5;
    function animate() {
        //cube.rotateX(0.01);
        //cube.rotateY(0.01);
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }
    p1 = new Player();
    camCont = new CameraControl(camera);
    new Track();    
    animate();
    gameLoop();
}
function gameLoop(){
    p1.update();
    kbrd.resetToggle();
    requestAnimationFrame( gameLoop );
}
class CameraControl{
    constructor(camera){
        this.camera = camera;
    }
    setPosition(v3){
        camera.position.x = v3.x;
        camera.position.y = v3.y;
        camera.position.z = v3.z;
    }
    setDirection(v2){
        camera.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), v2.x);
        camera.rotateX(v2.y);
    }
}
class Player{
    constructor(){
        this.pos = new v3(0,0,0);
        this.mov = new v3(0,0,0);
        this.dir = new v2(0,0);
        this.Mesh = new THREE.BoxGeometry(1,1,1);
        this.geom = Polyhedron.make1x1cube();
    }
    update(){
        this.calculateCamera();
    }
    calculateCamera(){
        if(mouseLocked){
            this.dir.x-=kbrd.mouseMov[0]/400;
            this.dir.y-=kbrd.mouseMov[1]/400;
            this.dir.y=Math.min(Math.max(this.dir.y,-PI2),PI2);
            while(this.dir.x>Math.PI*2){
                this.dir.x-=Math.PI*2;
            }
            while(this.dir.x<Math.PI*2){
                this.dir.x+=Math.PI*2;
            }
        }
        camCont.setPosition(new v3(this.pos.x+Math.sin(this.dir.x)*10*Math.cos(this.dir.y),this.pos.y+Math.sin(this.dir.y)*-10,this.pos.z+Math.cos(this.dir.x)*10*Math.cos(this.dir.y)));
        camCont.setDirection(this.dir);
    }
}
class Track{
    constructor(){
        for(let i = 0; i < trackPts.length/9; i++){
            collisionPolys.push(new Polygon(new v3(trackPts[i],trackPts[i+1],trackPts[i+2]), new v3(trackPts[i+3], trackPts[i+4], trackPts[i+5]), new v3(trackPts[i+6],trackPts[i+7],trackPts[i+8])));
        }
        this.mesh = new THREE.BufferGeometry();
        this.mesh.addAttribute('position', new THREE.BufferAttribute(trackPts,3));
        this.mesh.computeVertexNormals();
        this.mesh = new THREE.Mesh( this.mesh, new THREE.MeshLambertMaterial({color : 0xff0000}));
        scene.add(this.mesh);
    }
}
var trackPts = new Float32Array([0,0,0, -10,1,-10 ,-10,1,10,
                                0,0,0, -10,1,10, 10,1,10,
                                0,0,0, 10,1,10, 10,1,-10,
                                0,0,0, 10,1,-10, -10,1,-10])
var collisionPolys = [];
var p1;
var camera;
var cube;
var renderer;
var scene;
var camCont;
var mouseLocked;
var PI2 = Math.PI/2;
var PI = Math.PI;
init();
