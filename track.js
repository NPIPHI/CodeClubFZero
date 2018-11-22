
class Track{
    constructor(){
        let arr = Track.makeOval(new v3(320,-15,0), 400,300,Math.PI/4,100,1);
        //let arr = [new v3(-2000,0,-2000), new v3(2000,0,-2000), new v3(-2000,0,2000), new v3(2000,0,2000)];
        //let arr = Track.makeSpiral(200, 100, 50, 3, 100);
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
        let fence = new THREE.TextureLoader().load("./res/fence.png");
        this.mesh = new THREE.BufferGeometry();
        this.mesh.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pos),3));
        this.mesh.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.uvs),2));
        this.mesh.computeVertexNormals();   
        let material =  new THREE.MeshPhongMaterial({color : 0xffffff, map: road});
        this.mesh = new THREE.Mesh( this.mesh, material);
        scene.add(this.mesh);
        this.wallR = new THREE.BufferGeometry();
        this.wallR.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waRPos),3));
        this.wallR.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waRuvs),2));
        this.wallR.computeVertexNormals();
        this.wallR = new THREE.Mesh( this.wallR, new THREE.MeshPhongMaterial({color: 0xffffff, map: fence, transparent: true}));
        scene.add(this.wallR);
        this.wallL = new THREE.BufferGeometry();
        this.wallL.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.waLPos),3));
        this.wallL.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.waLuvs),2));
        this.wallL.computeVertexNormals();
        this.wallL = new THREE.Mesh( this.wallL, new THREE.MeshPhongMaterial({color: 0xffffff, map: fence, transparent: true}));
        scene.add(this.wallL);
    }
    generateWallFromArray(points){
        this.waRPos = [];
        this.waRuvs = [];
        this.waLPos = [];
        this.waLuvs = [];
        let waR = [];
        let waL = [];
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
                
                this.waRPos.push(waR[i].x);
                this.waRPos.push(waR[i].y);
                this.waRPos.push(waR[i].z);
                this.waRPos.push(waR[i+2].x);
                this.waRPos.push(waR[i+2].y);
                this.waRPos.push(waR[i+2].z);
                this.waRPos.push(waR[i+1].x);
                this.waRPos.push(waR[i+1].y);
                this.waRPos.push(waR[i+1].z);
                this.waRuvs.push(0);
                this.waRuvs.push(0);
                this.waRuvs.push(0);
                this.waRuvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                this.waRuvs.push(1);
                this.waRuvs.push(0);

                this.waRPos.push(waR[i+2].x);
                this.waRPos.push(waR[i+2].y);
                this.waRPos.push(waR[i+2].z);
                this.waRPos.push(waR[i+3].x);
                this.waRPos.push(waR[i+3].y);
                this.waRPos.push(waR[i+3].z);
                this.waRPos.push(waR[i+1].x);
                this.waRPos.push(waR[i+1].y);
                this.waRPos.push(waR[i+1].z);
                this.waRuvs.push(0);
                this.waRuvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                this.waRuvs.push(1);
                this.waRuvs.push(Math.min(polyDist+curDist,textWidth)/textWidth);
                this.waRuvs.push(1);
                this.waRuvs.push(0);
            } while(curDist>textWidth);
        }
        for(let i = 0; i < waL.length-2; i+=2){
            this.waLPos.push(waL[i].x);
            this.waLPos.push(waL[i].y);
            this.waLPos.push(waL[i].z);
            this.waLPos.push(waL[i+2].x);
            this.waLPos.push(waL[i+2].y);
            this.waLPos.push(waL[i+2].z);
            this.waLPos.push(waL[i+1].x);
            this.waLPos.push(waL[i+1].y);
            this.waLPos.push(waL[i+1].z);
            this.waLuvs.push(1);
            this.waLuvs.push(0);
            this.waLuvs.push(1);
            this.waLuvs.push(1);
            this.waLuvs.push(0);
            this.waLuvs.push(0);

            this.waLPos.push(waL[i+2].x);
            this.waLPos.push(waL[i+2].y);
            this.waLPos.push(waL[i+2].z);
            this.waLPos.push(waL[i+3].x);
            this.waLPos.push(waL[i+3].y);
            this.waLPos.push(waL[i+3].z);
            this.waLPos.push(waL[i+1].x);
            this.waLPos.push(waL[i+1].y);
            this.waLPos.push(waL[i+1].z);
            this.waLuvs.push(1);
            this.waLuvs.push(1);
            this.waLuvs.push(0);
            this.waLuvs.push(1);
            this.waLuvs.push(0);
            this.waLuvs.push(0);
        }
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
    static makeOval(center, length, width, bankAngle, resolution, trackWidth){
        let points = [];
        for(let i = 0; i <= resolution; i++){
            points.push(v3.sum(new v3(Math.cos(i*Math.PI*2/resolution)*width, 0, Math.sin(i*Math.PI*2/resolution)*length), center));
            points.push(v3.sum(new v3(Math.cos(i*Math.PI*2/resolution)*width*(1+Math.cos(bankAngle)*trackWidth), Math.sin(bankAngle)*trackWidth*100, Math.sin(i*Math.PI*2/resolution)*length*(1+Math.cos(bankAngle)*trackWidth)), center));
        }
        return points;
    }
}