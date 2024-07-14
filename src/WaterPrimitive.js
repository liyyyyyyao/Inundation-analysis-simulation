var Cesium = require("cesium/Cesium")
function WaterPrimitive(options) {
    const { positions, height, extrudedHeight ,img} = options;
    this._positions = positions;
    this._height = height;
    this._extrudedHeight = extrudedHeight;
    this._img=img;
    Object.defineProperty(this, "extrudedHeight", {
        get() {
            return this._extrudedHeight;
        },
        set(newVal) {
            if (Object.prototype.toString.call(newVal) !== "[object Number]") return;
            if (this._primitive) {
                this._primitive._state = 3;
                this._primitive._appearance = undefined;
                if(this._primitive.geometryInstances.geometry){
                    this._primitive.geometryInstances.geometry=null;
                }
                this._extrudedHeight = newVal;
                this._primitive.geometryInstances.geometry = this.getGeometry();
              
            }
        }
    });
    this.init();
}

WaterPrimitive.prototype.getGeometry = function () {
    return new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(this._positions),
        height: this._height,
        extrudedHeight: this._extrudedHeight,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });
};

WaterPrimitive.prototype.update = function (context, frameState, commandList) {
    if (this._primitive) {
        let primitive = this._primitive;
        primitive.update(context, frameState, commandList);
    }
};

WaterPrimitive.prototype.destroy = function () {
    let primitive = this._primitive;
    primitive.destroy()
}

WaterPrimitive.prototype.init = function () {
    let geometry = this.getGeometry();
    console.log(geometry);
    if (!geometry) return;
    this._primitive = new Cesium.Primitive({
        releaseGeometryInstances: false,
        geometryInstances: new Cesium.GeometryInstance({
            geometry
        }),
        asynchronous: false,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            show: true,
            aboveGround: false,
            material: new Cesium.Material({
                fabric: {
                    type: "Water",
                    uniforms: {
                        baseWaterColor: Cesium.Color.fromCssColorString("#80999CBB"),
                        normalMap: this._img,
                        frequency: 1000.0,
                        animationSpeed: 0.01,
                        amplitude: 5.0
                    }
                }
            }),
        })
    });
};

export default WaterPrimitive