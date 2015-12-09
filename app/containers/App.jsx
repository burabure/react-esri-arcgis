import React, { Component } from 'react';

// importamos los modulos de ESRI desde el ambiente global
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
    // Crear un mapa en el 'mapDiv' con la configuracion del estado
    // this.map = ...
  }

  zoomIn() {
    // Calcular el nuevo zoom
    // setear el estado con el zoom nuevo
    // ejecutar el zoom en el mapa
  }

  render() {
    return (
      <div>
        <div id="mapDiv"></div>
        <button>ZOOM IN!</button>
        <span id="messages"></span>
      </div>
    );
  }
}
