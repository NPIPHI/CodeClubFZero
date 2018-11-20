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
}