class Player{
    constructor(){
        this.cameraUnlocked = 0;
        this.acceleration = 0.1;
        this.gravity = new v3(0,-1,0)
        this.surfaceNormal = new v3(0,1,0);
        this.pos = new v3(0,0,0);
        this.prevpos = new v3(0,0,0);//previous position used for calculation sub frame collisions
        this.mov = new v3(0,0,0);
        this.cameraOffsetAngle = new v2(0,0);
        this.groundRotation = 0;
        this.lateralMov = 0;
        this.exhaustTexture = new THREE.TextureLoader().load("./res/exhaust.png");
        this.positionGroup = new THREE.Group();
        this.rotationGroup = new THREE.Group();
        this.bodyGroup = new THREE.Group();
        this.animationGroup = new THREE.Group();
        this.cameraGroup = new THREE.Group();
        this.axisRefrence = new THREE.Group();
        let xAxis = new THREE.Mesh(new THREE.BoxGeometry(2,0.1,0.1), new THREE.MeshBasicMaterial({color : 0xff0000}));
        let yAxis = new THREE.Mesh(new THREE.BoxGeometry(0.1,2,0.1), new THREE.MeshBasicMaterial({color : 0x00ff00}));
        let zAxis = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,2), new THREE.MeshBasicMaterial({color : 0x0000ff}));
        xAxis.position.set(1,2,0);
        yAxis.position.set(0,3,0);
        zAxis.position.set(0,2,1);
        this.axisRefrence.add(xAxis);
        this.axisRefrence.add(yAxis);
        this.axisRefrence.add(zAxis);
        this.body = new THREE.Mesh(playerModel,new THREE.MeshLambertMaterial({color : 0xffffff}));
        this.thrust1Light = new THREE.PointLight(0x00edff, 1, 10);
        this.thrust2Light = new THREE.PointLight(0x00edff, 1, 10);
        this.spotLight = new THREE.SpotLight( 0xffffff ,2, 1000, Math.PI/6,1);

        this.thruster1 = new thruster(plazmaTexture,12,1,0.3,0.05);
        this.thruster1.position.set(-0.6,0,1.5);
        this.thruster1.rotateX(Math.PI/2);

        this.thruster2 = new thruster(plazmaTexture,12,1,0.3,0.05);
        this.thruster2.position.set(0.6,0,1.5);
        this.thruster2.rotateX(Math.PI/2);

        this.cameraGroup.position.z = 10;
        this.cameraGroup.position.y = 5;

        this.thrust1Light.position.set(0.6,0,1.5);
        this.thrust2Light.position.set(-0.6,0,1.5);
        //this.spotLight.position.set(0,0,1);
        //this.spotLight.rotateX(Math.PI/2);

        this.positionGroup.add(this.rotationGroup);
        this.positionGroup.add(this.axisRefrence);
        this.rotationGroup.add(this.bodyGroup);
        this.bodyGroup.add(this.cameraGroup);
        this.cameraGroup.add(camera);
        this.bodyGroup.add(this.animationGroup);
        this.animationGroup.add(this.body);
        this.animationGroup.add(this.thruster1);
        this.animationGroup.add(this.thruster2);
        this.animationGroup.add(this.thrust1Light);
        this.animationGroup.add(this.thrust2Light);
        //this.animationGroup.add(this.spotLight);
        //this.animationGroup.add(this.spotLight.target);
        scene.add(this.positionGroup);
        this.geom = Polyhedron.make2x3cube();
        this.rotation = Matrix3.identity();
    }
    update(){
        this.calculateMovment();
        this.calculateCollision();
        this.calculateAnimation();
    }
    calculateMovment(){
        this.mov = this.mov.scale(0.9);
        let movV;
        if(gamePad){
            movV = new v2(0,((gamePad.buttons[6].pressed)?1:0)+((gamePad.buttons[7].pressed)?-1:0));
            this.groundRotation += (Math.abs(gamePad.axes[0])>0.1)?-gamePad.axes[0]/25:0;
        } else {
            movV = new v2(0,(kbrd.getKey(87)?-1:0)+(kbrd.getKey(83)?1:0));
            this.groundRotation += ((kbrd.getKey(65)?1:0)+(kbrd.getKey(68)?-1:0))/25;
        }
        while(this.groundRotation<0){
            this.groundRotation+=Math.PI*2;
        }
        while(this.groundRotation>=Math.PI*2){
            this.groundRotation-=Math.PI*2;
        }
        movV.scale(this.acceleration);
        movV = movV.multiply(Matrix2.fromAngle(this.groundRotation));
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
        this.rotation = Matrix3.makeRotationMatrix(new v3(0,1,0), this.surfaceNormal);
    }
    calculatePosition(){
        this.geom.translateAbsolute(this.pos);
        this.geom.rotateAbsolute(Matrix3.fromTHREEGeom(this.body));
        this.positionGroup.position.set(this.pos.x,this.pos.y,this.pos.z);
    }
    calculateAnimation(){  
        if(mouseLocked){
            this.cameraOffsetAngle.x-=kbrd.mouseMov[0]/400;
            this.cameraOffsetAngle.y-=kbrd.mouseMov[1]/400;
            this.cameraOffsetAngle.y = Math.min(Math.max(this.cameraOffsetAngle.y,-Math.PI/2),Math.PI/2);
            if(!isDebug){
                if(kbrd.mouseMov[0]*kbrd.mouseMov[0]>0.1||kbrd.mouseMov[1]*kbrd.mouseMov[1]>0.1) this.cameraUnlocked = 30;
                else {
                    this.cameraUnlocked--;
                    if(this.cameraUnlocked<0) {
                        if(this.cameraUnlocked>-30){
                            this.cameraOffsetAngle = this.cameraOffsetAngle.scale(0.8);
                        } else this.cameraOffsetAngle = new v2(0,0);
                    }
                }
                if(this.cameraOffsetAngle.x>Math.PI) this.cameraOffsetAngle.x -= Math.PI*2;
                if(this.cameraOffsetAngle.x<-Math.PI) this.cameraOffsetAngle.x += Math.PI*2
            }
        }
        if(gamePad){
            this.cameraOffsetAngle.x=-(Math.abs(gamePad.axes[2])>0.1)?gamePad.axes[2]*Math.PI/2:0;
            this.cameraOffsetAngle.y=(Math.abs(gamePad.axes[3])>0.1)?gamePad.axes[3]*Math.PI/2:0;
            while(this.cameraOffsetAngle.x>Math.PI*2){
                this.cameraOffsetAngle.x-=Math.PI*2;
            }
            while(this.cameraOffsetAngle.x<0){
                this.cameraOffsetAngle.x+=Math.PI*2;
            }
        }
        this.rotationGroup.matrix.elements = [this.rotation.m[0],this.rotation.m[1],this.rotation.m[2],this.rotationGroup.matrix.elements[3],
                                        this.rotation.m[3],this.rotation.m[4],this.rotation.m[5], this.rotationGroup.matrix.elements[7],
                                        this.rotation.m[6],this.rotation.m[7],this.rotation.m[8], this.rotationGroup.matrix.elements[11],
                                        this.rotationGroup.matrix.elements[12], this.rotationGroup.matrix.elements[13], this.rotationGroup.matrix.elements[14], this.rotationGroup.matrix.elements[15]];
        this.rotationGroup.matrixWorldNeedsUpdate = true;
        this.rotationGroup.matrixAutoUpdate = false;

        let D2mov = this.mov.multiply(Matrix3.makeRotationMatrix(p1.surfaceNormal,new v3(0,1,0)));
        D2mov = new v2(D2mov.x,D2mov.z);
        let groundRot = new v2(-Math.sin(this.groundRotation),-Math.cos(this.groundRotation));
        this.lateralMov = Math.min((D2mov.cross(groundRot))/6,1);

        let mag = D2mov.getMagnitude();
        this.thruster1.setLength(Math.random()+mag/3+0.2);
        this.thruster2.setLength(Math.random()+mag/3+0.2);
        this.thruster1.setUvs(10/(mag+2));
        this.thruster2.setUvs(10/(mag+2));
        this.thrust1Light.intensity = mag/6;
        this.thrust2Light.intensity = mag/6;
        for(let i = 0; i < mag; i++){
            //new exhaust(this.exhaustTexture,this.posw,15,this.mov,mag/i);
        }
        this.bodyGroup.setRotationFromAxisAngle(new THREE.Vector3(0,1,0),this.groundRotation);
        this.animationGroup.setRotationFromAxisAngle(new THREE.Vector3(0,0,1),this.lateralMov);
        this.cameraGroup.setRotationFromAxisAngle(new THREE.Vector3(0,1,0),this.cameraOffsetAngle.x);
        this.cameraGroup.rotateX(this.cameraOffsetAngle.y);
    }
}