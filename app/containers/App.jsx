import React, { Component } from 'react';
const { Map, Graphic, Color, InfoTemplate } = window.esri;
const { FeatureLayer } = window.esri.layers;
const { Query, Geoprocessor, FeatureSet } = window.esri.tasks;
const { SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol } = window.esri.symbol;

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      map: {
        basemap: 'streets',
        center : [-95.249, 38.955],
        zoom   : 14
      }
    };
  }

  componentDidMount() {
    this.map = new Map('mapDiv', this.state.map);
    this.map.on('load', ::this.initFunctionality );

    this.censusBlockPointsLayer = new FeatureLayer("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/0", {
      mode: FeatureLayer.MODE_SELECTION,
      infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
      outFields: ["POP2000","HOUSEHOLDS","HSE_UNITS", "TRACT", "BLOCK"]}
    );

    let symbol = new SimpleMarkerSymbol();
    symbol.style = SimpleMarkerSymbol.STYLE_SQUARE;
    symbol.setSize(8);
    symbol.setColor(new Color([255,255,0,0.5]));
    this.censusBlockPointsLayer.setSelectionSymbol(symbol);

    this.map.addLayer(this.censusBlockPointsLayer);

    this.censusBlockPointsLayer.on("selection-complete", () => {
      var totalPopulation = this.sumPopulation(this.censusBlockPointsLayer.getSelectedFeatures());
      //var r = "";
      //r = "<b>The total Census Block population within the drive time polygon is <i>" + totalPopulation + "</i>.</b>";
      //dom.byId('messages').innerHTML = r;
    });
  }

  sumPopulation(features) {
    let popTotal = 0;
    for (let x = 0; x < features.length; x++) {
      popTotal = popTotal + features[x].attributes["POP2000"];
    }
    return popTotal;
  }

  initFunctionality() {
    const query = new Query();
    const gp = new Geoprocessor('http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons');

    // Listen for map onClick event
    this.map.on('click', evt => {
      this.censusBlockPointsLayer.clearSelection();
      this.map.graphics.clear();
      const symbol = new SimpleMarkerSymbol();
      const graphic = new Graphic(evt.mapPoint, symbol);

      const features = [graphic];
      const featureSet = new FeatureSet();
      featureSet.features = features;
      const params = { 'Input_Location': featureSet, 'Drive_Times': 2 };
      gp.outSpatialReference = this.map.spatialReference;
      gp.execute(params);
      //dom.byId('messages').innerHTML = '<b>Executing GP Task...</b>';
    });


    // Listen for GP execute-complete event
    gp.on('execute-complete', evt => {
      const feature = evt.results[0].value.features[0];
      const symbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_NULL,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_DASHDOT,
          new Color([255, 0, 0]),
          2
        ),
        new Color([255, 255, 0, 0.25])
      );
      feature.setSymbol(symbol);
      this.map.graphics.add(feature);

      query.geometry = feature.geometry;
      this.censusBlockPointsLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW);
      //dom.byId('messages').innerHTML = '<b>Selecting Features...</b>';
    });
  }

  zoomIn() {
    const newZoom = this.state.map.zoom + 1;
    this.setState({ map: Object.assign(this.state.map, {zoom: newZoom}) });
    this.map.setZoom(newZoom);
  }

  render() {
    return (
      <div>
        <div id="mapDiv"></div>
        <button onClick={::this.zoomIn}>ZOOM IN!</button>
        <span id="messages"></span>
      </div>
    );
  }
}
