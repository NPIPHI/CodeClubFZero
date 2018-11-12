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
    renderer.setClearColor( 0xADD8f6);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    let light = new THREE.PointLight(0xffffff, 1, 100);
    {
        let road = new THREE.TextureLoader().load("./road.png");
        road.wrapS = THREE.RepeatWrapping;
        road.wrapT = THREE.RepeatWrapping;
        road.repeat.x = 10;
        road.repeat.y = 10;
        let building = new THREE.TextureLoader().load("./building.png")
        building.wrapS = THREE.RepeatWrapping;
        building.wrapT = THREE.RepeatWrapping;
        building.repeat.x = 5;
        building.repeat.y = 50;
        let box = new THREE.BoxGeometry(50,500,50);
        box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0xffffff, map: building}));
        box.position.x=-150;
        box.position.y=-200;
        box.position.z=0;
        scene.add(box);
        box = new THREE.BoxGeometry(10000,1,10000);
        box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0x8f8f8f, map: road}));
        box.position.y=-400;
        scene.add(box);
        box = new THREE.BoxGeometry(50,500,50);
        box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0xffffff, map: building}));
        box.position.x=-50;
        box.position.y=-200;
        box.position.z=500;
        scene.add(box);
        box = new THREE.BoxGeometry(50,500,50);
        box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0xffffff, map: building}));
        box.position.x=100;
        box.position.y=-200;
        box.position.z=450;
        scene.add(box);
        box = new THREE.BoxGeometry(50,500,50);
        box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0xffffff, map: building}));
        box.position.x=200;
        box.position.y=-200;
        box.position.z=300;
        scene.add(box);
    }
    light.position.set(3,3,3);
    scene.add(light);
    light = new THREE.AmbientLight(0x3f3f3f, 1, 100);
    scene.add(light);
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
    setDirection(rotation){
        camera.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), rotation.x);
        camera.rotateX(rotation.y);
    }
}
class Player{
    constructor(){
        this.gravity = new v3(0,-1,0)
        this.surfaceNormal = new v3(0,1,0);
        this.pos = new v3(0,0,0);
        this.prevpos = new v3(0,0,0);//previous position used for calculation sub frame collisions
        this.mov = new v3(0,0,0);
        this.dir = new v2(0,0);
        this.group = new THREE.Group();
        this.subGroup = new THREE.Group();
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2,1,3),new THREE.MeshLambertMaterial({color : 0xffffff, map: new THREE.TextureLoader().load("test.png")}));
        this.group.add(this.subGroup);
        this.subGroup.add(this.mesh);
        scene.add(this.group);
        this.geom = Polyhedron.make2x3cube();
        this.subGroup.add(camera);
        this.rotation = Matrix3.identity();
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
        this.mov = this.mov.scale(0.9);
        let movV = new v2((kbrd.getKey(65)?-1:0)+(kbrd.getKey(68)?1:0),(kbrd.getKey(87)?-1:0)+(kbrd.getKey(83)?1:0));
        movV.scale(0.3);
        movV = movV.multiply(Matrix2.fromAngle(this.dir.x));
        movV = new v3(movV.x,0,movV.y);
        movV = movV.multiply(this.rotation);
        this.mov = v3.sum(this.mov,this.gravity.scale(0.2));
        this.mov = v3.sum(this.mov,movV);
        this.prevpos = this.pos;
        this.pos = v3.sum(this.mov,this.pos);
        this.calculatePosition();
    }
    calculateCollision(){
        let collisionAxes = [];
        let bufGeom = this.geom.generateMovmentPoly(v3.dif(this.prevpos, this.pos));
        floor.forEach(poly =>{
            let inter = bufGeom.intersectsPolygon(poly);
            if(inter.intersect){
                if(inter.axis.dot(this.mov)<=0.01){
                    this.pos = v3.sum(this.pos, inter.axis.scale(inter.overlap));
                    collisionAxes.push(inter.axis);
                    bufGeom.translate(inter.axis.scale(inter.overlap));
                    this.mov = v3.sum(this.mov, inter.axis.scale(this.mov.dot(inter.axis)*-1));
                    //bufGeom = this.geom.3generateMovmentPoly(v3.dif(this.prevpos, this.pos));
                }
            }
        });
        wall.forEach(poly=>{
            let inter = bufGeom.intersectsPolygon(poly);
            if(inter.intersect){
                if(inter.axis.dot(this.mov)<=0.01){
                    this.pos = v3.sum(this.pos, inter.axis.scale(inter.overlap));
                    bufGeom.translate(inter.axis.scale(inter.overlap));
                    this.mov = v3.sum(this.mov, inter.axis.scale(this.mov.dot(inter.axis)*-1));
                    //bufGeom = this.geom.generateMovmentPoly(v3.dif(this.prevpos, this.pos));
                }
            }
        });
        if(collisionAxes.length){
            try{
                collisionAxes = v3.mean(collisionAxes).normalise();
            } catch(e){
                collisionAxes = new v3(0,1,0);
            }
            this.surfaceNormal = v3.mean([collisionAxes, this.surfaceNormal, this.surfaceNormal, this.surfaceNormal]);
        } else {
            this.surfaceNormal = this.surfaceNormal.scaleByAxis(0.95,1.1,0.95).normalise();
        }
        this.gravity = this.surfaceNormal.scale(-1);
        this.calculatePosition();
        this.rotation = Matrix3.MakeRotationMatrix(new v3(0,1,0), this.surfaceNormal);
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
        }
        this.subGroup.matrix.elements = [this.rotation.m[0],this.rotation.m[1],this.rotation.m[2],this.subGroup.matrix.elements[3],
                                        this.rotation.m[3],this.rotation.m[4],this.rotation.m[5], this.subGroup.matrix.elements[7],
                                        this.rotation.m[6],this.rotation.m[7],this.rotation.m[8], this.subGroup.matrix.elements[11],
                                        this.subGroup.matrix.elements[12], this.subGroup.matrix.elements[13], this.subGroup.matrix.elements[14], this.subGroup.matrix.elements[15]];
        //this.mesh.rotateX(this.dir.x);
        this.subGroup.matrixWorldNeedsUpdate = true;
        this.subGroup.matrixAutoUpdate = false;
        this.mesh.setRotationFromAxisAngle(new THREE.Vector3(0,1,0),this.dir.x);
        camCont.setPosition(new v3(Math.sin(this.dir.x)*10*Math.cos(this.dir.y),Math.sin(this.dir.y)*-10+1,Math.cos(this.dir.x)*10*Math.cos(this.dir.y)));
        camCont.setDirection(this.dir);
    }
}
class Track{
    constructor(){
        let arr = Track.makeSpiral(50,50,80,3,50);
        arr.unshift(new v3(-100,-10,-100));
        arr.unshift(new v3(-100,-10,35));
        this.generateFromArray(arr);
        this.generateWallFromArray(arr);
        for(let i = 0; i < this.pos.length; i+=9){
            floor.push(Polygon.fromArray(this.pos.slice(i,i+9)));
        }
        for(let i = 0; i < this.waRPos.length; i+=9){
            wall.push(Polygon.fromArray(this.waRPos.slice(i,i+9)));
        }
        for(let i = 0; i < this.waLPos.length; i+=9){
            wall.push(Polygon.fromArray(this.waLPos.slice(i,i+9)));
        }
        let fence = new THREE.TextureLoader().load("./fence.png");
        this.mesh = new THREE.BufferGeometry();
        this.mesh.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pos),3));
        this.mesh.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.uvs),2));
        this.mesh.computeVertexNormals();   
        let material =  new THREE.MeshLambertMaterial({color : 0xffffff, map: road});
        this.mesh = new THREE.Mesh( this.mesh, material);
        scene.add(this.mesh);
        this.wallR = new THREE.BufferGeometry();
        this.wallR.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waRPos),3));
        this.wallR.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waRuvs),2));
        this.wallR.computeVertexNormals();
        this.wallR = new THREE.Mesh( this.wallR, new THREE.MeshLambertMaterial({color: 0xffffff, map: fence, transparent: true}));
        scene.add(this.wallR);
        this.wallL = new THREE.BufferGeometry();
        this.wallL.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waLPos),3));
        this.wallL.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waLuvs),2));
        this.wallL.computeVertexNormals();
        this.wallL = new THREE.Mesh( this.wallL, new THREE.MeshLambertMaterial({color: 0xffffff, map: fence, transparent: true}));
        scene.add(this.wallL);
    }
    generateWallFromArray(points){
        let waL = [];
        let waR = [];
        let bufNorm = v3.cross(v3.dif(points[0],points[2]),v3.dif(points[1],points[0])).normalise().scale(-5);
        for(let i = 0; i < points.length-2; i+=2){
            bufNorm = v3.sum(bufNorm,v3.cross(v3.dif(points[i],points[i+2]),v3.dif(points[i+1],points[i])).normalise().scale(-5)).scale(1/2);
            waR.push(points[i+1]);
            waR.push(v3.sum(points[i+1],bufNorm));
            waL.push(v3.sum(points[i],bufNorm));
            waL.push(points[i]);
        }
        waR.push(points[points.length-1]);
        waR.push(v3.sum(points[points.length-1],bufNorm));
        waL.push(v3.sum(points[points.length-2],bufNorm));
        waL.push(points[points.length-2]);
        let list = [];
        let uvs = [];
        let textWidth = 1; // how wide the texture should be
        let curDist = 0; //how far along the textuer is
        let polyDist = 0; //how wide the polygon is
        for(let i = 0; i < waR.length-2; i+=2){
            polyDist = v3.dif(waR[i],waR[i+2]).getMagnitude();
            curDist+=polyDist;
            do{  
                if(curDist>textWidth){
                    curDist-=textWidth;
                }
                
                list.push(waR[i].x);
                list.push(waR[i].y);
                list.push(waR[i].z);
                list.push(waR[i+2].x);
                list.push(waR[i+2].y);
                list.push(waR[i+2].z);
                list.push(waR[i+1].x);
                list.push(waR[i+1].y);
                list.push(waR[i+1].z);
                uvs.push(0);
                uvs.push(0);
                uvs.push(0);
                uvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                uvs.push(1);
                uvs.push(0);

                list.push(waR[i+2].x);
                list.push(waR[i+2].y);
                list.push(waR[i+2].z);
                list.push(waR[i+3].x);
                list.push(waR[i+3].y);
                list.push(waR[i+3].z);
                list.push(waR[i+1].x);
                list.push(waR[i+1].y);
                list.push(waR[i+1].z);
                uvs.push(0);
                uvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                uvs.push(1);
                uvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                uvs.push(1);
                uvs.push(0);
            } while(curDist>textWidth);
        }
        this.waRPos = list;
        this.waRuvs = uvs;
        list = [];
        uvs = [];
        for(let i = 0; i < waL.length-2; i+=2){
            list.push(waL[i].x);
            list.push(waL[i].y);
            list.push(waL[i].z);
            list.push(waL[i+2].x);
            list.push(waL[i+2].y);
            list.push(waL[i+2].z);
            list.push(waL[i+1].x);
            list.push(waL[i+1].y);
            list.push(waL[i+1].z);
            uvs.push(1);
            uvs.push(0);
            uvs.push(1);
            uvs.push(1);
            uvs.push(0);
            uvs.push(0);

            list.push(waL[i+2].x);
            list.push(waL[i+2].y);
            list.push(waL[i+2].z);
            list.push(waL[i+3].x);
            list.push(waL[i+3].y);
            list.push(waL[i+3].z);
            list.push(waL[i+1].x);
            list.push(waL[i+1].y);
            list.push(waL[i+1].z);
            uvs.push(1);
            uvs.push(1);
            uvs.push(0);
            uvs.push(1);
            uvs.push(0);
            uvs.push(0);
        }
        this.waLPos = list;
        this.waLuvs = uvs;
    }
    generateFromArray(points){
        /*organised like    4   5  
                            2   3
                            0   1*/
        let list = [];
        let uvs = [];
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
            uvs.push(0);
            uvs.push(0);
            uvs.push(0);
            uvs.push(1);
            uvs.push(1);
            uvs.push(0);

            list.push(points[i+2].x);
            list.push(points[i+2].y);
            list.push(points[i+2].z);
            list.push(points[i+3].x);
            list.push(points[i+3].y);
            list.push(points[i+3].z);
            list.push(points[i+1].x);
            list.push(points[i+1].y);
            list.push(points[i+1].z);
            uvs.push(0);
            uvs.push(1);
            uvs.push(1);
            uvs.push(1);
            uvs.push(1);
            uvs.push(0);
        }
        this.uvs = uvs;
        this.pos = list;
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
var floor = [];
var wall = [];
var p1;
var camera;
var cube;
var renderer;
var scene;
var camCont;
var mouseLocked;
var PI2 = Math.PI/2;
var PI = Math.PI;
var road = new THREE.TextureLoader().load("./road.png");
init();
