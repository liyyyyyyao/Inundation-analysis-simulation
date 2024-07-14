<template>
    <div id="cesiumContainer"></div>
    <div id="app">
    <div id="init-viewer-wrapper"></div>
    <div id="controlPanel">
      <div class="panel-item">
        <label>最大高度(米):</label>
        <input type="number" v-model="maxHeight" />
      </div>
      <div class="panel-item">
        <label>最小高度(米):</label>
        <input type="number" v-model="minHeight" />
      </div>
      <div class="panel-item">
        <label>淹没时间(秒):</label>
        <input type="number" v-model="floodTime" />
      </div>
      <div class="panel-buttons">
        <button @click="startFlood">开始淹没</button>
        <button @click="clearFlood">清除</button>
      </div>
    </div>
  </div>
</template>

<script>
import WaterPrimitive from '../WaterPrimitive.js'

var Cesium = require("cesium/Cesium")

export default {
  name: 'FloodAnalyse',
  data() {
    return {
      viewer: null,
      maxHeight: 300,
      minHeight: 0,
      floodTime: 10,
      currentFloodHeight: 0,
      floodInterval: null,
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([115.80, 39.68, 8000, 115.80, 39.66, 8000, 115.83, 39.66, 8000, 115.83, 39.68, 8000, 115.80, 39.68, 8000]),
      water:null,
    };
  },
  mounted(){
    this.initViewer();
  },
  methods: {
    async initViewer(){
      Cesium.Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzYzMTE0NS05NWE4LTRlNzMtOTdmOC05NThmZmQ0NTk5NGEiLCJpZCI6MzMxOTQsImlhdCI6MTcwNTEzMTA2MH0.URG7ktZ-51ImgyThfwG8HkLVRo_naa224Ror5kqAiSM";
      this.viewer = new Cesium.Viewer("cesiumContainer",{

      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: "http://data.mars3d.cn/terrain",
        requestWaterMask: true,
        requestVertexNormals: true
      }),
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      }),
      sceneMode: Cesium.SceneMode.SCENE3D,
        vrButton: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        timeline: false,
        fullscreenButton: false,
        homeButton: false,
        creditContainer: document.createElement('div'),
        infoBox: true,
        navigationHelpButton: false,
        sceneModePicker: false,
        scene3DOnly: true,
    });

      this.viewer.scene.globe.depthTestAgainstTerrain = true;

      this.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(this.positions),
          material: Cesium.Color.WHITE.withAlpha(0.3)
        },
        polyline: {
          positions: this.positions,
          width: 4,
          clampToGround: true
        }
      });
      

      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(115.815, 39.67, 10000) // 根据淹没区的位置调整视角
      });
    }, 


    startFlood(){
      if (this.floodInterval) {
        clearInterval(this.floodInterval);
      }
      if(this.water){
        this.viewer.scene.primitives.remove(this.water); 
      }
      let floodPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
        115.80, 39.68, this.minHeight,
        115.80, 39.66, this.minHeight,
        115.83, 39.66, this.minHeight,
        115.83, 39.68, this.minHeight,
        115.80, 39.68, this.minHeight
      ]);
      this.water = new WaterPrimitive({ 
        positions: floodPositions,
        height: this.minHeight, 
        extrudedHeight: this.minHeight,
        img:'images/waterNormals.jpg'
      })
      this.viewer.scene.primitives.add(this.water)

      this.currentFloodHeight = this.minHeight;
      const heightIncrement = (this.maxHeight - this.minHeight) / (this.floodTime * 20);

      this.floodInterval=window.setInterval(()=>{
        this.currentFloodHeight += heightIncrement;
        if (this.currentFloodHeight >= this.maxHeight) {
          clearInterval(this.floodInterval);
          this.currentFloodHeight = this.maxHeight;
        }
        this.water.extrudedHeight=this.currentFloodHeight
      }, 50); // 每0.05秒更新一次
    },
    
    clearFlood() {
      if (this.floodInterval) {
        clearInterval(this.floodInterval);
      }
      if(this.water){
        this.viewer.scene.primitives.remove(this.water); 
      }
      this.currentFloodHeight = 0;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
html, body, #app, #init-viewer-wrapper {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#controlPanel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 200px;
}

.panel-item {
  margin-bottom: 10px;
}

.panel-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.panel-item input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

.panel-buttons {
  display: flex;
  justify-content: space-between;
}

.panel-buttons button {
  flex: 1;
  padding: 5px;
  margin-right: 5px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.panel-buttons button:last-child {
  margin-right: 0;
}

.panel-buttons button:hover {
  background-color: #0056b3;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
