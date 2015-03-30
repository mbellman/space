function Quaternion() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
}

function rotationMatrix() {
    this.matrix = [];

    for( var y = 0 ; y < 3 ; y++ ) {
        this.matrix[y] = [];

        for( var x = 0 ; x < 3 ; x++ ) {
            this.matrix[y][x] = 0;
        }
    }
}

Quaternion.prototype.set = function( x, y, z, w ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

Quaternion.prototype.normalize = function() {
    var radius = Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w );

    this.x /= radius;
    this.y /= radius;
    this.z /= radius;
    this.w /= radius;
}

Quaternion.prototype.multiplyBy = function( quaternion ) {
    if( quaternion.hasOwnProperty('x') && quaternion.hasOwnProperty('y') && quaternion.hasOwnProperty('z') && quaternion.hasOwnProperty('w') ) {

        var newX = this.w * quaternion.x + this.x * quaternion.w + this.y * quaternion.z - this.z * quaternion.y;
        var newY = this.w * quaternion.y - this.x * quaternion.z + this.y * quaternion.w + this.z * quaternion.x;
        var newZ = this.w * quaternion.z + this.x * quaternion.y - this.y * quaternion.x + this.z * quaternion.w;
        var newW = this.w * quaternion.w - this.x * quaternion.x - this.y * quaternion.y - this.z * quaternion.z;

        this.x = newX;
        this.y = newY;
        this.z = newZ;
        this.w = newW;
    }
}

Quaternion.prototype.getControlQuaternion = function() {
    var aH = this.w/2;

    var controlQuaternion = new Quaternion();

    controlQuaternion.x = this.x * Math.sin( aH );
    controlQuaternion.y = this.y * Math.sin( aH );
    controlQuaternion.z = this.z * Math.sin( aH );
    controlQuaternion.w = Math.cos( aH );

    return controlQuaternion;
}

Quaternion.prototype.generateRotationMatrix = function() {
    var rotMatrix = new rotationMatrix();

    rotMatrix.matrix[0][0] = 1 - 2*this.y*this.y - 2*this.z*this.z;
    rotMatrix.matrix[0][1] = 2*this.x*this.y - 2*this.w*this.z;
    rotMatrix.matrix[0][2] = 2*this.x*this.z + 2*this.w*this.y;

    rotMatrix.matrix[1][0] = 2*this.x*this.y + 2*this.w*this.z;
    rotMatrix.matrix[1][1] = 1 - 2*this.x*this.x - 2*this.z*this.z;
    rotMatrix.matrix[1][2] = 2*this.y*this.z + 2*this.w*this.x;

    rotMatrix.matrix[2][0] = 2*this.x*this.z - 2*this.w*this.y;
    rotMatrix.matrix[2][1] = 2*this.y*this.z - 2*this.w*this.x;
    rotMatrix.matrix[2][2] = 1 - 2*this.x*this.x - 2*this.y*this.y;

    return rotMatrix;
}

function sq( num ) {
    return num*num;
}

function JS_mod(n, m) {
   return (((n % m) + m) % m);
}

function rnumber( low, high ) {
    return Math.floor(Math.random()*(high-low+1)+low);
}