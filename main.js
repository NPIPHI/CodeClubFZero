Element.prototype.remove = function() {// enables removal of DOM elements
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() { // enables removal of DOM elements
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

window.onclick=function(){ // locks pointer
    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
                                            renderer.domElement.mozRequestPointerLock;
    renderer.domElement.requestPointerLock()
    mouseLocked = true;
};

window.addEventListener("gamepadconnected", function(e) { // handels gamepad connection
    if(e.gamepad.axes.length>=4){
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
        gamePad = e.gamepad;
    }
});

window.addEventListener("gamepaddisconnected", function(e) { // handels gamepad disconnection
    console.log("Gamepad disconnected from index %d: %s",
    e.gamepad.index, e.gamepad.id);
    gamePad = undefined;
});

window.addEventListener('resize',()=>{ // resizes screen to fit screen
    camera.aspect = (window.innerWidth*renderElementDimensions[2])/(window.innerHeight*renderElementDimensions[3])  ;
    camera.updateProjectionMatrix();
    renderer.setRenderElement();
});

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
    renderElement = document.createElement("canvas");
    renderer = new THREE.WebGLRenderer({canvas : renderElement});
    renderer.setClearColor( 0xadd8e6);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setRenderElement();
    document.body.appendChild(renderElement);
    initLoad();  
}

function initLoad(){
    light = new THREE.AmbientLight(0xffffff, 1, 100);
    scene.add(light);
    plazmaTexture = new THREE.TextureLoader().load("./res/plazma.png");
    let road = new THREE.TextureLoader().load("./res/road.png");
    road.wrapS = THREE.RepeatWrapping;
    road.wrapT = THREE.RepeatWrapping;
    road.repeat.x = 10;
    road.repeat.y = 10;
    box = new THREE.BoxGeometry(10000,1,10000);
    box = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0x8f8f8f, map: road}));
    box.position.y=-50;
    scene.add(box);
    loadFinish();
}

function loading(xhr){
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}

function loadFinish(obj){
    playerModel = new THREE.BoxGeometry(2,1,3);//obj.children[0].geometry;
    console.log("starting");
    p1 = new Player();
    new Track();  
    animate();
    gameLoop();
}
var loaded = false;
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function gameLoop(){
    p1.update();
    effectList.forEach(e=>{e.update()});
    kbrd.resetToggle();
    requestAnimationFrame( gameLoop );
}

function debug(){
    if(!isDebug){
        debugConsole = document.createElement("debugConsole");
        debugConsole.
        document.body.appendChild(debugConsole);
        debug = true;
    }
}

function rebug(){
    if(isDebug){
        debugConsole.remove();
        debugConsole = undefined;
        debug = false;
    }
}

THREE.WebGLRenderer.prototype.setRenderElement = function(){
    renderElement.style.left = renderElementDimensions[0]*window.innerWidth+"px";
    renderElement.style.top = renderElementDimensions[1]*window.innerHeight+"px";
    renderer.setSize((renderElementDimensions[2]-renderElementDimensions[0])*window.innerWidth, (renderElementDimensions[3]-renderElementDimensions[1])*window.innerHeight);
}

var floor = [];
var wall = [];
var p1;
var camera;
var renderer;
var scene;
var mouseLocked;
var road = new THREE.TextureLoader().load("./res/road.png");
var gamePad;
var loadProgress;
var playerModel;
var plazmaTexture;
var effectList = []; //list of all animations that are time dependent
var isDebug = false;
var renderElement;
var debugConsole;
var renderElementDimensions = [0,0,1,1]; //x1,y1,x2,y2 portion of window
init();




/*let building = new THREE.TextureLoader().load("./res/building.png")
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
*/