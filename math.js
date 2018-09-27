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
}
class Polygon{
    constructor(p1,p2,p3){
        this.staticNormal = v3.cross(v3.dif(p1,p2),v3.dif(p2,p3)).normalise();//normal vector of the polygon
        this.staticVerts = [p1,p2,p3];
        this.staticSideNormals = [v3.cross(v3.dif(p1,p2),this.staticNormal).normalise(),v3.cross(v3.dif(p2,p3),this.staticNormal).normalise(),v3.cross(v3.dif(p3,p1),this.staticNormal).normalise()];//normals of the sides of the triangle
        this.transformMatrix = new Matrix3([0,0,1,0,1,0,0,0,1]);
        this.verts = this.staticVerts;
        this.normal = this.staticNormal;
        this.sideNormals = this.staticSideNormals;
    }

    multiply(matrix){//must be only a rotation matrix
        this.staticVerts[0] = this.staticVerts[0].multiply(this.transformMatrix);
        this.staticVerts[1] = this.staticVerts[1].multiply(this.transformMatrixix);
        this.staticVerts[2] = this.staticVerts[2].multiply(this.transformMatrix);
        this.staticNormal = this.staticNormal.multiply(this.transformMatrix);
        this.staticSideNormals[0] = this.staticSideNormals[0].multiply(this.transformMatrix);
        this.staticSideNormals[1] = this.staticSideNormals[1].multiply(this.transformMatrix);
        this.staticSideNormals[2] = this.staticSideNormals[2].multiply(this.transformMatrix);
    }
    rotateX(theta){//rotate around the x adis in radians
        this.multiply(new Matrix3(  [1,0,0,
                                    0,Math.cos(theta),Math.sin(theta),0,
                                    0,Math.sin(theta),Math.cos(theta)]));
    }
    rotateY(theta){
        this.multiply(new Matrix3([ Math.cos(theta),0,Math.sin(theta),
                                    0,0,0,
                                    -Math.sin(theta),0,Math.cos(theta)]));
    }
    rotateZ(theta){
        this.multiply(new Matrix3([ Math.cos(theta),-Math.sin(theta),0,
                                    Math.sin(theta),Math.cos(theta),
                                    0,0,0]));
    }
}
class Polyhedron{
    constructor(faces){
        this.faces=faces;
    }
}