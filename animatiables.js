class thruster extends THREE.Mesh{
    constructor(texture, sides, height, bottomDiameter, topDiameter){
        super(makeCylinder(sides, height, bottomDiameter, topDiameter), new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, transparent: true}))
    }
    setLength(length){
        for(let i = 0; i < this.geometry.attributes.position.array.length; i +=18){
            this.geometry.attributes.position.array[i+4] = length;
            this.geometry.attributes.position.array[i+10] = length;
            this.geometry.attributes.position.array[i+13] = length;
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
    setUvs(scale){
        for(let i = 0; i < this.geometry.attributes.uv.array.length; i += 12){
            this.geometry.attributes.uv.array[i+2] = scale;
            this.geometry.attributes.uv.array[i+6] = scale;
            this.geometry.attributes.uv.array[i+8] = scale;
        }
        this.geometry.attributes.uv.needsUpdate = true;
    }
    rotateUvs(rotateFactor){
        for(let i = 1; i < this.geometry.attributes.uv.array.length; i +=2){
            this.geometry.attributes.uv.array[i] = (this.geometry.attributes.uv.array[i]+rotateFactor>1)?this.geometry.attributes.uv.array[i]+rotateFactor-1:this.geometry.attributes.uv.array[i]+rotateFactor;
        }
    }
}

class exhaust{
    constructor(texture, position, timeOut, movVect, timeOffset){
        let pos = v3.sum(position, movVect.scale(-timeOffset));
        this.timeOut = timeOut;
        this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xffffff, map: texture, transparent: true}));
        this.sprite.position.set(pos.x,pos.y,pos.z);
        scene.add(this.sprite);
        effectList.push(this);
    }
    update(){
        this.timeOut--;
        if(this.timeOut<=0){
            scene.remove(this.sprite);
            effectList.splice(effectList.indexOf(this),1);
        }
    }
}