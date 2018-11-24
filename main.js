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

if ("onpointerlockchange" in document) {
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
  } else if ("onmozpointerlockchange" in document) {
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  }
  
  function lockChangeAlert() {
    if(document.pointerLockElement === renderElement ||
        document.mozPointerLockElement === renderElement) {
        mouseLocked = true;
        // Do something useful in response
    } else {
        mouseLocked = false;    
      // Do something useful in response
    }
}

window.onclick=function(){ // locks pointer
    if(mouseOverRenderer){
        renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
                                                renderer.domElement.mozRequestPointerLock;
        renderer.domElement.requestPointerLock()
        mouseLocked = true;
    }
};

/*window.addEventListener("gamepadconnected", function(e) { // handels gamepad connection
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
});*/

window.addEventListener('resize',()=>{ // resizes screen to fit screen
    renderer.setRenderElement();
});

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
    renderElement = document.createElement("canvas");
    renderElement.onmouseover = ()=>{mouseOverRenderer = true};
    renderElement.onmouseleave = ()=>{mouseOverRenderer = false};
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
    track = new Track();  
    track.generateMap([[new v3(0, 0, 0),new v3(50, 0, 0),new v3(0, 0, 50),new v3(50, 0, 50),new v3(0, 23, 100),new v3(50, 23, 100),new v3(0, 64.79056096076965, 135.81269517540932),new v3(50, 64.79056096076965, 135.81269517540932),new v3(0, 117.7232124209404, 150.88367566466331),new v3(50, 117.7232124209404, 150.88367566466331),new v3(0, 172.11026686429977, 142.4546670615673),new v3(50, 172.11026686429977, 142.4546670615673),new v3(0, 217.99785786867142, 112.06834104657173),new v3(50, 217.99785786867142, 112.06834104657173),new v3(0, 248.61043292284012, 78.60387846827507),new v3(50, 248.61043292284012, 78.60387846827507),new v3(0, 271.66836446523666, 40.06387469172478),new v3(50, 271.66836446523666, 40.06387469172478),new v3(-7.859895984403977, 294.28954828222595, 8.577081568560494),new v3(41.240315278298965, 299.1376846625408, 0.47370121630181217),new v3(-18.128310797605316, 311.56349309860957, -30.38627496006393),new v3(30.451790140330466, 317.8294124085033, -40.43429866657618),new v3(-25.286989994241416, 334.55821926635514, -70.3787630615771),new v3(24.118086305297986, 338.97652937566903, -76.5767157269071),new v3(-42.05315911588133, 350.3559556654525, -100.3359254969046),new v3(3.0638406916801824, 361.55892648751126, -118.65507974142122),new v3(-65.39814706977671, 367.03023513855527, -130.02024658743414),new v3(-24.823791930809815, 381.31100519602234, -155.20938794784388),new v3(-92.77868229747543, 378.32195953529157, -162.32681609696334),new v3(-54.950959096907845, 394.3959511301437, -190.77764615936326)]]);//[Track.makeSpiral(200, 100, 50, 3, 100), Track.makeOval(new v3(320,-15,0), 400,300,Math.PI/4,100,1)]);
    animate();
    gameLoop();
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function gameLoop(){
    p1.update();
    effectList.forEach(e=>{e.update()});
    kbrd.resetToggle();
    requestAnimationFrame( gameLoop );
    if(mode == "start"){
        mode = "play";
    }
}

function debug(){
    if(mode == "map"){
        removeTrackConsole();
    }
    if(!(mode=="debug")){
        renderElementDimensions = [0,0,0.8,1];
        debugConsole = document.createElement("debugConsole");
        debugConsole.style.position = "absolute";
        debugConsole.style.left = window.innerWidth*renderElementDimensions[2]+1+"px";

        let text = document.createElement("div");
        text.innerText = "position: "
        debugConsole.appendChild(text);

        debugElements.push(document.createElement("INPUT"));
        debugElements[0].setAttribute("type","number");
        debugElements[0].setAttribute("value",0);
        debugElements[0].style.width = "50px";
        debugElements[0].onmouseover = ()=>p1.disableUpdate(0);
        debugElements[0].onmouseout = ()=>p1.enableUpdate(0);
        debugConsole.appendChild(debugElements[0]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[1].setAttribute("type","number");
        debugElements[1].setAttribute("value",0);
        debugElements[1].style.width = "50px";
        debugElements[1].onmouseover = ()=>p1.disableUpdate(1);
        debugElements[1].onmouseout = ()=>p1.enableUpdate(1);
        debugConsole.appendChild(debugElements[1]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[2].setAttribute("type","number");
        debugElements[2].setAttribute("value",0);
        debugElements[2].style.width = "50px";
        debugElements[2].onmouseover = ()=>p1.disableUpdate(2);
        debugElements[2].onmouseout = ()=>p1.enableUpdate(2);
        debugConsole.appendChild(debugElements[2]);
        
        text = document.createElement("div");
        text.innerText = "movment: "
        debugConsole.appendChild(text);

        debugElements.push(document.createElement("INPUT"));
        debugElements[3].setAttribute("type","number");
        debugElements[3].setAttribute("value",0);
        debugElements[3].style.width = "50px";
        debugElements[3].onmouseover = ()=>p1.disableUpdate(3);
        debugElements[3].onmouseout = ()=>p1.enableUpdate(3);
        debugConsole.appendChild(debugElements[3]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[4].setAttribute("type","number");
        debugElements[4].setAttribute("value",0);
        debugElements[4].style.width = "50px";
        debugElements[4].onmouseover = ()=>p1.disableUpdate(4);
        debugElements[4].onmouseout = ()=>p1.enableUpdate(4);
        debugConsole.appendChild(debugElements[4]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[5].setAttribute("type","number");
        debugElements[5].setAttribute("value",0);
        debugElements[5].style.width = "50px";
        debugElements[5].onmouseover = ()=>p1.disableUpdate(5);
        debugElements[5].onmouseout = ()=>p1.enableUpdate(5);
        debugConsole.appendChild(debugElements[5]);

        text = document.createElement("div");
        text.innerText = "rotation: "
        debugConsole.appendChild(text);

        debugElements.push(document.createElement("INPUT"));
        debugElements[6].setAttribute("type","number");
        debugElements[6].setAttribute("value",0);
        debugElements[6].style.width = "50px";
        debugElements[6].onmouseover = ()=>p1.disableUpdate(6);
        debugElements[6].onmouseout = ()=>p1.enableUpdate(6);
        debugConsole.appendChild(debugElements[6]);

        text = document.createElement("div");
        text.innerText = "pause "
        debugConsole.appendChild(text);

        debugElements.push(document.createElement("INPUT"));
        debugElements[7].setAttribute("type","checkbox");
        debugElements[7].setAttribute("value","pause");
        debugConsole.appendChild(debugElements[7]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[8].setAttribute("type", "button");
        debugElements[8].setAttribute("value", "makeMap");
        debugElements[8].onclick = makeTrackConsole;
        debugConsole.appendChild(debugElements[8]);

        debugElements.push(document.createElement("INPUT"));
        debugElements[9].setAttribute("type", "button");
        debugElements[9].setAttribute("value", "play");
        debugElements[9].onclick = rebug;
        debugConsole.appendChild(debugElements[9]);

        document.body.appendChild(debugConsole);
        renderer.setRenderElement();
        mode = "debug";
    }
}

function rebug(){
    if(mode == "debug"){
        debugConsole.remove();
        debugConsole = undefined;
        renderStats = undefined;
        debugElements = [];
        renderElementDimensions = [0,0,1,1];
        renderer.setRenderElement();
        mode = "start";
    }
}

function makeTrackConsole(){
    if(mode == "debug"){
        rebug();
    }
    if(!trackConsole){
        renderElementDimensions = [0,0,0.8,1];
        trackConsole = document.createElement("trackConsole");
        trackConsole.style.position = "absolute";
        trackConsole.style.left = window.innerWidth*renderElementDimensions[2]+1+"px";

        trackConsoleElements.push(document.createElement("INPUT"));
        trackConsoleElements[0].setAttribute("type", "button");
        trackConsoleElements[0].setAttribute("value", "reset");
        trackConsoleElements[0].onclick = () => track.reset();
        trackConsole.appendChild(trackConsoleElements[0]);

        trackConsoleElements.push(document.createElement("INPUT"));
        trackConsoleElements[1].setAttribute("type", "button");
        trackConsoleElements[1].setAttribute("value", "remove layer");
        trackConsoleElements[1].onclick = ()=>track.remove(1);
        trackConsole.appendChild(trackConsoleElements[1]);

        trackConsoleElements.push(document.createElement("INPUT"));
        trackConsoleElements[2].setAttribute("type", "button");
        trackConsoleElements[2].setAttribute("value", "create cut");
        trackConsoleElements[2].onclick = ()=>track.cut();
        trackConsole.appendChild(trackConsoleElements[2]);
        
        trackConsoleElements.push(document.createElement("INPUT"));
        trackConsoleElements[3].setAttribute("type", "button");
        trackConsoleElements[3].setAttribute("value", "debug");
        trackConsoleElements[3].onclick = ()=>debug();
        trackConsole.appendChild(trackConsoleElements[3]);

        document.body.appendChild(trackConsole);
        renderer.setRenderElement();
        track.previewMesh.visible = true;
        track.previewMesh.frustumCulled = false;
        mode = "map";
    }
}

function removeTrackConsole(){
    if(trackConsole){
        trackConsole.remove();
        trackConsole = undefined;
        trackConsoleElements = [];
        renderElementDimensions = [0,0,1,1];
        renderer.setRenderElement();
        track.previewMesh.visible = false;
        track.previewMesh.frustumCulled = true;
        mode = "start";
    }
}
THREE.WebGLRenderer.prototype.setRenderElement = function(){
    if(debugConsole){
        debugConsole.style.left = window.innerWidth*renderElementDimensions[2]+1+"px";
    }
    camera.aspect = (window.innerWidth*renderElementDimensions[2])/(window.innerHeight*renderElementDimensions[3])  ;
    camera.updateProjectionMatrix();
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
var gamePad;
var loadProgress;
var playerModel;
var plazmaTexture;
var effectList = []; //list of all animations that are time dependent
var renderElement;
var debugConsole;
var renderElementDimensions = [0,0,1,1]; //x1,y1,x2,y2 portion of window
var debugElements = [];
var trackConsole;
var trackConsoleElements = [];
var mouseOverRenderer = false; //which element the mouse pointer is over
var paused = false;
var mode = "start";
var track;
var renderStats;
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