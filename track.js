
class Track{
    constructor(){
        this.rotation = Matrix3.identity();
        this.deltaVect = new v3(0,0,50);
        this.previewGeometry = new THREE.BufferGeometry();
        this.previewGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0,1,0, 1,1,0, 0,1,1,  1,1,0, 1,1,1, 0,1,1]),3));
        this.previewMesh = new THREE.Mesh(this.previewGeometry, new THREE.MeshBasicMaterial({color: 0x00ff00}));
        this.previewMesh.name = "preview mesh";
        this.previewMesh.dynamic = true;
        this.trackBuildWidth = 50;
        this.buildRotation =0;
        scene.add(this.previewMesh);
        this.previewMesh.visible = false;
    }
    generateMap(points){
        this.trackPoints = points;
        this.generateFromArray(points);
        this.generateWallFromArray(points);
        for(let i = 0; i < this.pos.length; i+=9){
            floor.push(Polygon.fromArray(this.pos.slice(i,i+9)));
        }
        for(let i = 0; i < this.waRPos.length; i+=9){
            wall.push(Polygon.fromArray(this.waRPos.slice(i,i+9)));
        }
        for(let i = 0; i < this.waLPos.length; i+=9){
            wall.push(Polygon.fromArray(this.waLPos.slice(i,i+9)));
        }
        this.trackMesh = new THREE.Group();
        let fence = new THREE.TextureLoader().load("./res/fence.png");
        let road = new THREE.TextureLoader().load("./res/road.png");
        let roadMesh = new THREE.BufferGeometry();
        roadMesh.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pos),3));
        roadMesh.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.uvs),2));
        roadMesh.computeVertexNormals();   
        let material =  new THREE.MeshBasicMaterial({color : 0xffffff, map: road});
        roadMesh = new THREE.Mesh( roadMesh, material);
        this.trackMesh.add(roadMesh);
        let wallR = new THREE.BufferGeometry();
        wallR.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waRPos),3));
        wallR.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waRuvs),2));
        wallR.computeVertexNormals();
        wallR = new THREE.Mesh( wallR, new THREE.MeshBasicMaterial({color: 0xffffff, map: fence, transparent: true}));
        this.trackMesh.add(wallR);
        let wallL = new THREE.BufferGeometry();
        wallL.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waLPos),3));
        wallL.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waLuvs),2));
        wallL.computeVertexNormals();
        wallL = new THREE.Mesh( wallL, new THREE.MeshBasicMaterial({color: 0xffffff, map: fence, transparent: true}));
        this.trackMesh.add(wallL);
        this.trackMesh.name = "track";
        scene.add(this.trackMesh);
    }
    generateWallFromArray(points){
        this.waRPos = [];
        this.waRuvs = [];
        this.waLPos = [];
        this.waLuvs = [];
        points.forEach(list => {
            let wallRPos = [];
            let wallRUvs = [];
            let wallLPos = [];
            let wallLUvs = [];
            let waR = [];
            let waL = [];
            let bufNorm = v3.cross(v3.dif(list[0],list[2]),v3.dif(list[1],list[0])).normalise().scale(-5);
            for(let i = 0; i < list.length-2; i+=2){
                bufNorm = v3.sum(bufNorm,v3.cross(v3.dif(list[i],list[i+2]),v3.dif(list[i+1],list[i])).normalise().scale(-5)).scale(1/2);
                waR.push(list[i+1]);
                waR.push(v3.sum(list[i+1],bufNorm));
                waL.push(v3.sum(list[i],bufNorm));
                waL.push(list[i]);
            }
            waR.push(list[list.length-1]);
            waR.push(v3.sum(list[list.length-1],bufNorm));
            waL.push(v3.sum(list[list.length-2],bufNorm));
            waL.push(list[list.length-2]);
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
                    
                    wallRPos.push(waR[i].x);
                    wallRPos.push(waR[i].y);
                    wallRPos.push(waR[i].z);
                    wallRPos.push(waR[i+2].x);
                    wallRPos.push(waR[i+2].y);
                    wallRPos.push(waR[i+2].z);
                    wallRPos.push(waR[i+1].x);
                    wallRPos.push(waR[i+1].y);
                    wallRPos.push(waR[i+1].z);
                    wallRUvs.push(0);
                    wallRUvs.push(0);
                    wallRUvs.push(0);
                    wallRUvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                    wallRUvs.push(1);
                    wallRUvs.push(0);

                    wallRPos.push(waR[i+2].x);
                    wallRPos.push(waR[i+2].y);
                    wallRPos.push(waR[i+2].z);
                    wallRPos.push(waR[i+3].x);
                    wallRPos.push(waR[i+3].y);
                    wallRPos.push(waR[i+3].z);
                    wallRPos.push(waR[i+1].x);
                    wallRPos.push(waR[i+1].y);
                    wallRPos.push(waR[i+1].z);
                    wallRUvs.push(0);
                    wallRUvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                    wallRUvs.push(1);
                    wallRUvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                    wallRUvs.push(1);
                    wallRUvs.push(0);
                } while(curDist>textWidth);
            }
            for(let i = 0; i < waL.length-2; i+=2){
                wallLPos.push(waL[i].x);
                wallLPos.push(waL[i].y);
                wallLPos.push(waL[i].z);
                wallLPos.push(waL[i+2].x);
                wallLPos.push(waL[i+2].y);
                wallLPos.push(waL[i+2].z);
                wallLPos.push(waL[i+1].x);
                wallLPos.push(waL[i+1].y);
                wallLPos.push(waL[i+1].z);
                wallLUvs.push(1);
                wallLUvs.push(0);
                wallLUvs.push(1);
                wallLUvs.push(1);
                wallLUvs.push(0);
                wallLUvs.push(0);

                wallLPos.push(waL[i+2].x);
                wallLPos.push(waL[i+2].y);
                wallLPos.push(waL[i+2].z);
                wallLPos.push(waL[i+3].x);
                wallLPos.push(waL[i+3].y);
                wallLPos.push(waL[i+3].z);
                wallLPos.push(waL[i+1].x);
                wallLPos.push(waL[i+1].y);
                wallLPos.push(waL[i+1].z);
                wallLUvs.push(1);
                wallLUvs.push(1);
                wallLUvs.push(0);
                wallLUvs.push(1);
                wallLUvs.push(0);
                wallLUvs.push(0);
            }
            wallRPos.forEach(e => {
                this.waRPos.push(e);
            });
            wallLPos.forEach(e => {
                this.waLPos.push(e);
            });
            wallRUvs.forEach(e => {
                this.waRuvs.push(e);
            });
            wallLUvs.forEach(e => {
                this.waLuvs.push(e);
            });
        });
    }
    generateFromArray(points){
        /*organised like    4   5  
                            2   3
                            0   1*/
        this.uvs = [];
        this.pos = [];
        points.forEach(list => {
            let pos = [];
            let uvs = [];
            for(let i =0; i < (list.length)-2; i+=2){
                pos.push(list[i].x);
                pos.push(list[i].y);
                pos.push(list[i].z);
                pos.push(list[i+2].x);
                pos.push(list[i+2].y);
                pos.push(list[i+2].z);
                pos.push(list[i+1].x);
                pos.push(list[i+1].y);
                pos.push(list[i+1].z);
                uvs.push(0);
                uvs.push(0);
                uvs.push(0);
                uvs.push(1);
                uvs.push(1);
                uvs.push(0);

                pos.push(list[i+2].x);
                pos.push(list[i+2].y);
                pos.push(list[i+2].z);
                pos.push(list[i+3].x);
                pos.push(list[i+3].y);
                pos.push(list[i+3].z);
                pos.push(list[i+1].x);
                pos.push(list[i+1].y);
                pos.push(list[i+1].z);
                uvs.push(0);
                uvs.push(1);
                uvs.push(1);
                uvs.push(1);
                uvs.push(1);
                uvs.push(0);
            }
            uvs.forEach(e => {
                this.uvs.push(e);
            });
            pos.forEach(e => {
                this.pos.push(e);
            });
        });
    }
    static makeSpiral(length, radius, width, sprial, resolution){//length: start to end  radius: center to edge  width: width of the track  spiral: number of rotations  resolution: rumber of segments per rotation
        let points = [];
        for(let i = 0; i <= resolution*sprial; i++){
            points.push(new v3(Math.cos(i*Math.PI*2/resolution)*radius,Math.sin(i*Math.PI*2/resolution)*radius,width+length*i/resolution*sprial));
            points.push(new v3(Math.cos(i*Math.PI*2/resolution)*radius,Math.sin(i*Math.PI*2/resolution)*radius,length*i/resolution*sprial));
        }
        return points;
    }
    static makeOval(center, length, width, bankAngle, resolution, trackWidth){
        let points = [];
        for(let i = 0; i <= resolution; i++){
            points.push(v3.sum(new v3(Math.cos(i*Math.PI*2/resolution)*width, 0, Math.sin(i*Math.PI*2/resolution)*length), center));
            points.push(v3.sum(new v3(Math.cos(i*Math.PI*2/resolution)*width*(1+Math.cos(bankAngle)*trackWidth), Math.sin(bankAngle)*trackWidth*100, Math.sin(i*Math.PI*2/resolution)*length*(1+Math.cos(bankAngle)*trackWidth)), center));
        }
        return points;
    }
    mapEdit(){
        let activeSection = this.trackPoints[this.trackPoints.length-1];
        this.deltaVect = v3.sum(this.deltaVect, new v3(0,((kbrd.getKey(16))?1:0)+((kbrd.getKey(17))?-1:0),((kbrd.getKey(87))?1:0)+((kbrd.getKey(83))?-1:0)));
        this.buildRotation+=(((kbrd.getKey(65))?-0.01:0)+((kbrd.getKey(68))?0.01:0));
        let point0 = activeSection[activeSection.length-4];
        let point1 = activeSection[activeSection.length-3];
        let point2 = activeSection[activeSection.length-2];
        let point3 = activeSection[activeSection.length-1];
        let normal = v3.cross(v3.dif(point0,point2),v3.dif(point2,point3)).normalise();
        this.rotation = Matrix3.makeRotationMatrix(new v3(0,1,0),normal);
        let inverseRotation = Matrix3.makeRotationMatrix(normal, new v3(0,1,0));
        this.planeRotation = Matrix3.fromAxisAngle(normal,this.buildRotation);
        p1.surfaceNormal = normal;
        p1.groundRotation = v3.dif(v3.sum(point2,point3),v3.sum(point0,point1)).multiply(Matrix3.makeRotationMatrix(p1.surfaceNormal, new v3(0,1,0))).get2D().getAngle()-Math.PI/2;        
        p1.pos = v3.sum(v3.sum(point0, point1),v3.sum(point2, point3).scale(4)).scale(0.1);
        let offset = new v3(this.deltaVect.z, 0, 0).normalise().scale(this.trackBuildWidth/2);
        let vect0 = point2;
        let vect1 = point3;
        let vect3 = v3.sum(v3.sum(point2,point3).scale(0.5), v3.sum(this.deltaVect,offset).multiply(this.rotation).multiply(this.planeRotation));
        let vect2 = v3.sum(v3.sum(point2,point3).scale(0.5), v3.sum(this.deltaVect,offset.scale(-1)).multiply(this.rotation).multiply(this.planeRotation));
        if(v3.sum(this.deltaVect,offset).multiply(this.planeRotation).z<0){
            console.log("R");
        }
        if(v3.sum(this.deltaVect,offset.scale(-1)).multiply(this.planeRotation).z<0){
            console.log("L");
        }

        if(kbrd.getToggle(13)){
            this.trackPoints[this.trackPoints.length-1].push(vect2,vect3);
            this.refresh();
        }
        
        this.previewGeometry.attributes.position.array[0] = vect0.x;
        this.previewGeometry.attributes.position.array[1] = vect0.y;
        this.previewGeometry.attributes.position.array[2] = vect0.z;
        
        this.previewGeometry.attributes.position.array[3] = vect2.x;
        this.previewGeometry.attributes.position.array[4] = vect2.y;
        this.previewGeometry.attributes.position.array[5] = vect2.z;
       
        this.previewGeometry.attributes.position.array[6] = vect1.x;
        this.previewGeometry.attributes.position.array[7] = vect1.y;
        this.previewGeometry.attributes.position.array[8] = vect1.z;
        
        this.previewGeometry.attributes.position.array[9] = vect2.x;
        this.previewGeometry.attributes.position.array[10] = vect2.y;
        this.previewGeometry.attributes.position.array[11] = vect2.z;

        this.previewGeometry.attributes.position.array[12] = vect3.x;
        this.previewGeometry.attributes.position.array[13] = vect3.y;
        this.previewGeometry.attributes.position.array[14] = vect3.z;

        this.previewGeometry.attributes.position.array[15] = vect1.x;
        this.previewGeometry.attributes.position.array[16] = vect1.y;
        this.previewGeometry.attributes.position.array[17] = vect1.z;

        this.previewMesh.geometry.attributes.position.needsUpdate = true;
    }
    addSection(){
        this.trackPoints.push([]);
    }
    reset(){
        this.clear();
        this.trackPoints = [[new v3(0,0,0), new v3(50,0,0), new v3(0,0,50), new v3(50,0,50)]];
        this.generateMap(this.trackPoints);
    }
    refresh(){
        this.clear();
        this.generateMap(this.trackPoints);
    }
    finish(){
        this.trackPoints
    }
    clear(){
        scene.remove(this.trackMesh);
        wall = [];
        floor = [];
        this.pos = undefined;
        this.trackMesh = undefined;
        this.uvs = undefined;
        this.waLPos = undefined;
        this.waLuvs = undefined;
        this.waRPos = undefined;
        this.waRuvs = undefined;
    }
    remove(count){

    }
    cut(){

    }
}