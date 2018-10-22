//contains all math related things
//vectors, polygons, polyhedrons
class v2{// 2D vector. pertend that it is immutable
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    dot(vect){//dot product of this and given vect
        return this.x*vect.x+this.y*vect.y;
    }
    getMagnitude(){// magnitude of this vect
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    getMagnitude2(){// magnitude squared of this vect. Use when efficency is important 
        return this.x*this.x+this.y*this.y;
    }
    getAngle(){
        return Math.atan2(this.y,this.x);
    }
    static sum(v1,v2){//sum of two vectors
        return new v3(v1.x+v2.x,v1.y+v2.y);
    }
    static dif(v1,v2){//v1 - v2
        return new v3(v1.x-v2.x,v1.y-v2.y);
    }
}
class v3{//3D vector. pertend that it is immutable
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    dot(vect){//dot product of this and given vect
        return this.x*vect.x+this.y*vect.y+this.z*vect.z;
    }
    cross(vect){// cross product of this and given vect
        return new v3(this.y*vect.z-this.z*vect.y, this.z*vect.x-this.x*vect.z, this.x*vect.y-this.y*vect.x);
    }
    getMagnitude(){// magnitude of this vect
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    }
    getMagnitude2(){// magnitude squared of this vect. Use when efficency is important 
        return this.x*this.x+this.y*this.y+this.z*this.z;
    }
    normalise(){
        return this.scale(1/this.getMagnitude());
    }
    scale(scaleFactor){
        return new v3(this.x*scaleFactor,this.y*scaleFactor,this.z*scaleFactor);
    }
    multiply(matrix){//matrix 3. Use for rotations and scaling operations
        return new v3(this.x*matrix.m[0]+this.y*matrix.m[3]+this.z*matrix.m[6],this.x*matrix.m[1]+this.y*matrix.m[4]+this.z*matrix.m[7],this.x*matrix.m[2]+this.y*matrix.m[5]+this.z*matrix.m[8]);
    }
    clone(){
        throw "vectors should be immutable. If you are using this function you are doing it wrong";
    }
    static dot(v1,v2){
        return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
    }
    static cross(v1,v2){
        return new v3(v1.y*v2.z-v1.z*v2.y, v1.z*v2.x-v1.x*v2.z, v1.x*v2.y-v1.y*v2.x);
    }
    static sum(v1,v2){//sum of two vectors
        return new v3(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z);
    }
    static dif(v1,v2){//v1 - v2
        return new v3(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
    }
    static fromTHREEGeom(object3D){
        return new v3(object3D.matrix.elements[12],object3D.matrix.elements[13],object3D.matrix.elements[14]);
    }
    static getRotateMatrixFromVect(vect){
        let zAng = (vect.x||vect.y)?new v2(vect.x, vect.y).getAngle() - Math.PI/2:0;
        let xAng = (vect.z||vect.y)?new v2(vect.z, vect.y).getAngle() - Math.PI/2:0;
        return new Matrix3([Math.cos(zAng),-Math.sin(zAng),0,Math.sin(zAng),Math.cos(zAng),0,0,0,1]).multiply(new Matrix3([1,0,0,0,Math.cos(xAng),-Math.sin(xAng),0,Math.sin(xAng),Math.cos(xAng)]))
    }
}
class Matrix3{// pertend it is immutable
    constructor(values){//9 element list. left to right top to bottom
        if(values.length!=9){
            throw "incorect length"
        }
        this.m = new Float32Array(values);
    }
    multiply(matrix){//matrix3 only
        return new Matrix3([this.m[0]*matrix.m[0]+this.m[1]*matrix.m[3]+this.m[2]*matrix.m[6],this.m[0]*matrix.m[1]+this.m[1]*matrix.m[4]+this.m[2]*matrix.m[7],this.m[0]*matrix.m[2]+this.m[1]*matrix.m[5]+this.m[2]*matrix.m[8],
                            this.m[3]*matrix.m[0]+this.m[4]*matrix.m[3]+this.m[5]*matrix.m[6],this.m[3]*matrix.m[1]+this.m[4]*matrix.m[4]+this.m[5]*matrix.m[7],this.m[3]*matrix.m[2]+this.m[4]*matrix.m[5]+this.m[5]*matrix.m[8],
                            this.m[6]*matrix.m[0]+this.m[7]*matrix.m[3]+this.m[8]*matrix.m[6],this.m[6]*matrix.m[1]+this.m[7]*matrix.m[4]+this.m[8]*matrix.m[7],this.m[6]*matrix.m[2]+this.m[7]*matrix.m[5]+this.m[8]*matrix.m[8]]);
    }
    static fromTHREEGeom(object3D){
        return new Matrix3([object3D.matrix.elements[0],object3D.matrix.elements[1],object3D.matrix.elements[2],object3D.matrix.elements[4],object3D.matrix.elements[5],object3D.matrix.elements[6],object3D.matrix.elements[8],object3D.matrix.elements[9],object3D.matrix.elements[10]]);
    }
}
class Polygon{
    constructor(p1,p2,p3){
        this.staticNormal = v3.cross(v3.dif(p1,p2),v3.dif(p2,p3)).normalise();//normal vector of the polygon
        this.staticVerts = [p1,p2,p3];
        this.staticSideNormals = [v3.cross(v3.dif(p1,p2),this.staticNormal).normalise(),v3.cross(v3.dif(p2,p3),this.staticNormal).normalise(),v3.cross(v3.dif(p3,p1),this.staticNormal).normalise()];//normals of the sides of the triangle
        this.transformMatrix = new Matrix3([1,0,0,0,1,0,0,0,1]);
        this.transformVector = new v3(0,0,0);
        this.verts = [,,,];
        this.sideNormals = [,,,];
        this.boundingBox = [];//minX. minY, minZ, maxX, maxY, maxZ
        this.updatePos();
    }

    multiply(matrix){//must be only a rotation matrix
        this.transformMatrix =  this.transformMatrix.multiply(matrix);
        this.updatePos();
    }
    updatePos(){
        this.verts[0] = this.staticVerts[0].multiply(this.transformMatrix);
        this.verts[1] = this.staticVerts[1].multiply(this.transformMatrix);
        this.verts[2] = this.staticVerts[2].multiply(this.transformMatrix);
        this.normal = this.staticNormal.multiply(this.transformMatrix);
        this.sideNormals[0] = this.staticSideNormals[0].multiply(this.transformMatrix);
        this.sideNormals[1] = this.staticSideNormals[1].multiply(this.transformMatrix);
        this.sideNormals[2] = this.staticSideNormals[2].multiply(this.transformMatrix);
        this.verts[0] = v3.sum(this.staticVerts[0],this.transformVector);
        this.verts[1] = v3.sum(this.staticVerts[1],this.transformVector);
        this.verts[2] = v3.sum(this.staticVerts[2],this.transformVector);
        this.boundingBox = [this.verts[0].x,this.verts[0].y,this.verts[0].z,this.verts[0].x,this.verts[0].y,this.verts[0].z]; 
        this.boundingBox = [Math.min(this.boundingBox[0],this.verts[1].x),Math.min(this.boundingBox[1],this.verts[1].y),Math.min(this.boundingBox[2],this.verts[1].z),Math.max(this.boundingBox[3],this.verts[1].x),Math.max(this.boundingBox[4],this.verts[1].y),Math.max(this.boundingBox[5],this.verts[1].z)]; 
        this.boundingBox = [Math.min(this.boundingBox[0],this.verts[2].x),Math.min(this.boundingBox[1],this.verts[2].y),Math.min(this.boundingBox[2],this.verts[2].z),Math.max(this.boundingBox[3],this.verts[2].x),Math.max(this.boundingBox[4],this.verts[2].y),Math.max(this.boundingBox[5],this.verts[2].z)];
    }
    rotateX(theta){//rotate around the x adis in radians
        this.multiply(new Matrix3(  [1,0,0,
                                    0,Math.cos(theta),Math.sin(theta),
                                    0,-Math.sin(theta),Math.cos(theta)]));
    }
    rotateY(theta){//rotate around the y adis in radians
        this.multiply(new Matrix3([ Math.cos(theta),0,Math.sin(theta),
                                    0,1,0,
                                    -Math.sin(theta),0,Math.cos(theta)]));
    }
    rotateZ(theta){//rotate around the z adis in radians
        this.multiply(new Matrix3([ Math.cos(theta),-Math.sin(theta),0,
                                    Math.sin(theta),Math.cos(theta),0,
                                    0,0,1]));
    }
    transformFromTHREEGeom(object3D){
        this.transformMatrix = Matrix3.fromTHREEGeom(object3D);
        this.transformVector = Matrix3.fromTHREEGeom(object3D);
        this.updatePos();
    } 
    transform(vect){
        this.transformVector = v3.sum(this.transformVector,vect);
        this.updatePos();
    }
    getMinMaxOnAxis(axis){
        return [Math.min(this.verts[0].dot(axis),this.verts[1].dot(axis),this.verts[2].dot(axis)),Math.max(this.verts[0].dot(axis),this.verts[1].dot(axis),this.verts[2].dot(axis))];
    }
    getMinOnAxis(axis){
        return Math.min(this.verts[0].dot(axis),this.verts[1].dot(axis),this.verts[2].dot(axis));
    }
    getMaxOnAxis(axis){
        return Math.max(this.verts[0].dot(axis),this.verts[1].dot(axis),this.verts[2].dot(axis));
    }
}
class Polyhedron{
    constructor(faces){
        this.faces=faces;
        this.updatePos();
    }
    updatePos(){
        this.calcBoundingBox();
    }
    calcBoundingBox(){
        this.boundingBox = this.faces[0].boundingBox;
        this.faces.forEach(f=>{
            this.boundingBox = [Math.min(this.boundingBox[0],f.boundingBox[0]),Math.min(this.boundingBox[1],f.boundingBox[1]),Math.min(this.boundingBox[1],f.boundingBox[1]),Math.max(this.boundingBox[3],f.boundingBox[3]),Math.max(this.boundingBox[4],f.boundingBox[4]),Math.max(this.boundingBox[5],f.boundingBox[5])];
        })
    }
    transformFromTHREEGeom(object3D){
        this.faces.forEach(f => {
            f.transformFromTHREEGeom(object33D);
        });
        this.updatePos();
    }
    translate(vect){
        this.faces.forEach(f => {
            f.transform(vect);
        });
        this.updatePos();
    }
    rotateX(theta){
        this.faces.forEach(f => {
            f.rotateX(theta);
        });
    }
    rotateY(theta){
        this.faces.forEach(f => {
            f.rotateY(theta);
        });
    }
    rotateZ(theta){
        this.faces.forEach(f => {
            f.rotateZ(theta);
        });
    }
    intersectsPolygon(poly){//returns an object with properties intersect, axis, and overlap
        if(!this.intersectsBoundingBox(poly)){
            return {intersect : false}
        }
        let polyO = poly.getMinMaxOnAxis(poly.normal);
        let polyhed = this.getMinMaxOnAxis(poly.normal);
        let overlap = polyO[0]-polyhed[0];
        if(polyhed[1]>=polyO[0]&&polyhed[0]<=polyO[1]){
            let inter = true;
            for(let i = 0; i < 3 && inter; i ++){
                polyO = poly.getMaxOnAxis(poly.sideNormals[i]);
                polyhed = this.getMinOnAxis(poly.sideNormals[i]);
                inter = (polyO>=polyhed);
            }
            if(!inter) return {intersect : false};
            for(let i = 0; i < this.faces.length && inter; i ++){
                polyO = poly.getMinOnAxis(this.faces[i].normal);
                polyhed = this.getMaxOnAxis(this.faces[i].normal);
                inter = (polyhed>=polyO);
            }
            if(!inter) return {intersect : false}
            return {intersect : true, axis : poly.normal, overlap : overlap}
        } else {
            return {intersect : false}
        }
    }
    intersectsPolyhedron(polyhedron){
        
    }
    getMinMaxOnAxis(axis){
        let outliers = this.faces[0].getMinMaxOnAxis(axis);
        for(let i = 1; i < this.faces.length; i++){
            let bufO = this.faces[i].getMinMaxOnAxis(axis);
            outliers = [Math.min(outliers[0],bufO[0]),Math.max(outliers[1],bufO[1])];
        }
        return outliers;
    }
    getMinOnAxis(axis){
        let outliers = this.faces[0].getMinOnAxis(axis);
        for(let i = 1; i < this.faces.length; i++){
            outliers = Math.min(outliers,this.faces[i].getMinOnAxis(axis));
        }
        return outliers;
    }
    getMaxOnAxis(axis){
        let outliers = this.faces[0].getMaxOnAxis(axis);
        for(let i = 1; i < this.faces.length; i++){
            outliers = Math.max(outliers,this.faces[i].getMaxOnAxis(axis));
        }
        return outliers;
    }
    static make1x1cube(){
        let p1 = new v3(-0.5,-0.5,-0.5);
        let p2 = new v3(0.5,-0.5,-0.5);
        let p3 = new v3(0.5,-0.5,0.5);
        let p4 = new v3(-0.5,-0.5,0.5);
        let p5 = new v3(-0.5,0.5,-0.5);
        let p6 = new v3(0.5,0.5,-0.5);
        let p7 = new v3(0.5,0.5,0.5);
        let p8 = new v3(-0.5,0.5,0.5);
        return new Polyhedron([new Polygon(p1,p2,p3), new Polygon(p1,p3,p4), new Polygon(p1,p5,p6), new Polygon(p1,p6,p2), new Polygon(p2,p6,p7), new Polygon(p2,p7,p3),
                            new Polygon(p3,p7,p8), new Polygon(p3,p8,p4), new Polygon(p4,p8,p5), new Polygon(p4,p5,p1), new Polygon(p5,p8,p7), new Polygon(p5,p7,p6)]);
    }
    intersectsBoundingBox(poly){
        return this.boundingBox[0]<=poly.boundingBox[3]&&poly.boundingBox[0]<=this.boundingBox[3]&&this.boundingBox[1]<=poly.boundingBox[4]&&poly.boundingBox[1]<=this.boundingBox[4]&&this.boundingBox[2]<=poly.boundingBox[5]&&poly.boundingBox[2]<=this.boundingBox[5];
    }
}