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
    let light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(3,3,3);
    scene.add(light);
    light = new THREE.AmbientLight(0x3f3f3f, 1, 100);
    scene.add(light);
    camera.position.z = 5;
    camera.position.y = 2;
    p1 = new Player();
    camCont = new CameraControl(camera);
    new Track();    
    animate();
    gameLoop();
}
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
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
        this.gravity = new v3(0,-1,0)
        this.pos = new v3(0,0,0);
        this.mov = new v3(0,0,0);
        this.dir = new v2(0,0);
        this.group = new THREE.Group();
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color : 0x00ff00}));
        this.group.add(this.mesh);
        scene.add(this.group);
        this.geom = Polyhedron.make1x1cube();
        this.group.add(camera);
    }
    update(){
        this.calculateMovment();
        this.calculateCollision();
        this.calculateCamera();
    }
    calculateMovment(){
        if(kbrd.getKey(32)){
            console.log();
        }
        let movV = new v2((kbrd.getKey(65)?-1:0)+(kbrd.getKey(68)?1:0),(kbrd.getKey(87)?-1:0)+(kbrd.getKey(83)?1:0));
        movV.scale(0.3);
        movV = movV.multiply(Matrix2.fromAngle(this.dir.x));
        movV = new v3(movV.x,0,movV.y);
        movV = movV.multiply(Matrix3.MakeRotationMatrix(new v3(0,1,0),this.gravity.scale(-1)));
        this.pos = v3.sum(this.pos,movV);
        this.pos = v3.sum(this.pos,this.gravity.scale(0.1));
        this.calculatePosition();
    }
    calculateCollision(){
        collisionPolys.forEach(poly =>{
            let inter = this.geom.intersectsPolygon(poly);
            if(inter.intersect){
                this.pos = v3.sum(this.pos, inter.axis.scale(inter.overlap));
                this.gravity = inter.axis.scale(-1);
                this.calculatePosition();
            }
        });
        this.calculatePosition();
    }
    calculatePosition(){
        this.geom.translateAbsolute(this.pos);
        this.geom.rotateAbsolute(Matrix3.fromTHREEGeom(this.mesh));
        this.group.position.set(this.pos.x,this.pos.y,this.pos.z);
    }
    calculateCamera(){  
        if(mouseLocked){
            this.dir.x-=kbrd.mouseMov[0]/400;
            this.dir.y-=kbrd.mouseMov[1]/400;
            this.dir.y=Math.min(Math.max(this.dir.y,-PI2),PI2);
            while(this.dir.x>Math.PI*2){
                this.dir.x-=Math.PI*2;
            }
            while(this.dir.x<0){
                this.dir.x+=Math.PI*2;
            }
            this.mesh.lookAt(this.gravity.scale(-1).getTHREE());
        }
        camCont.setPosition(new v3(Math.sin(this.dir.x)*10*Math.cos(this.dir.y),Math.sin(this.dir.y)*-10,Math.cos(this.dir.x)*10*Math.cos(this.dir.y)));
        camCont.setDirection(this.dir);
    }
}
class Track{
    constructor(){
        let arr = Track.fromArray(Track.makeSpiral(30,10,20,3,20));
        for(let i = 0; i < arr.length; i+=9){
            collisionPolys.push(Polygon.fromArray(arr.slice(i,i+9)));
        }
        this.mesh = new THREE.BufferGeometry();
        this.mesh.addAttribute('position', new THREE.BufferAttribute(new Float32Array(arr),3));
        this.mesh.computeVertexNormals();   
        let material =  new THREE.MeshLambertMaterial({color : 0xff0000});
        this.mesh = new THREE.Mesh( this.mesh, material);
        scene.add(this.mesh);
    }
    static fromArray(points){
        /*organised like    3   5
                            2   3
                            0   1*/
        let list = [];
        for(let i =0; i < (points.length)-2; i+=2){
            list.push(points[i].x);
            list.push(points[i].y);
            list.push(points[i].z);
            list.push(points[i+2].x);
            list.push(points[i+2].y);
            list.push(points[i+2].z);
            list.push(points[i+1].x);
            list.push(points[i+1].y);
            list.push(points[i+1].z);

            list.push(points[i+2].x);
            list.push(points[i+2].y);
            list.push(points[i+2].z);
            list.push(points[i+3].x);
            list.push(points[i+3].y);
            list.push(points[i+3].z);
            list.push(points[i+1].x);
            list.push(points[i+1].y);
            list.push(points[i+1].z);
        }
        return list;
    }
    static makeSpiral(length, radius, width, sprial, resolution){//length: start to end  radius: center to edge  width: width of the track  spiral: number of rotations  resolution: rumber of segments per rotation
        let points = [];
        for(let i = 0; i <= resolution*sprial; i++){
            points.push(new v3(Math.cos(i*Math.PI*2/resolution)*radius,Math.sin(i*Math.PI*2/resolution)*radius,width+length*i/resolution*sprial));
            points.push(new v3(Math.cos(i*Math.PI*2/resolution)*radius,Math.sin(i*Math.PI*2/resolution)*radius,length*i/resolution*sprial));
        }
        return points;
    }
}
var trackPts = new Float32Array([-10,0,-10, -10,0,10, 10,0,10,
                                 -10,0,-10, 10,0,10, 10,0,-10,
                                 -15,5,-15, -15,5,15, 0,-10,0.,
                                 -15,5,15, 15,5,15, 0,-10,0,
                                 15,5,15, 15,5,-15, 0,-10,0,
                                 15,5,-15, -15,5,-15, 0,-10,0,
                                 15,5,-15, -15,15,-15,-15,5,-15,
                                 15,15,-15,-15,15,-15, 15,5,-15,
                                 -15,15,-15, 15,15,-15, 0,20,0]);
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
