import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import * as olProj from 'ol/proj';
import OSM from 'ol/source/OSM';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import XYZ from 'ol/source/XYZ';

const contr = document.getElementById('control')

//init Map
const map = new Map({
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([16.372, 48.209]),
    zoom: 14
  })
});

// Satelliten-Layer einrichten
const satLayer = new TileLayer({
    source: new XYZ({
    attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: false,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 23
  })
});

const baseLayer = new TileLayer({
  source: new OSM()
});

//Base Layer von OSM hinzufügen
map.addLayer(baseLayer);

// Get the base Sat-Button
const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
  contr.style.color = 'ffffff';
  //Anderen Layer entfernen
  map.removeLayer(baseLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(satLayer);
});

// Get the base Base-Button
const base = document.getElementById('base');
base.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(satLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(baseLayer);
});


// //People Layer
// const peopleLayer = new VectorLayer({
//   source: new Vector({
//     url: 'data/map.geojson',
//     format: new GeoJSON()
//   })
// });
// peopleLayer.setStyle(function(feature) {
//   return new Style({
//     text: new Text({
//       text: feature.get('name'),
//       font: 'Bold 8pt Verdana',
//       stroke: new Stroke({
//         color: 'white',
//         width: 3
//       })
//     })
//   });
// });
//
// map.addLayer(peopleLayer);


//Search Layer
const searchResultSource = new Vector();
const searchResultLayer = new VectorLayer({
  source: searchResultSource
});

searchResultLayer.setStyle(new Style({
  image: new Circle({
    fill: new Fill({
      color: 'rgba(255,255,255,0.4)'
    }),
    stroke: new Stroke({
      color: '#3399CC',
      width: 1.25
    }),
    radius: 15
  })
}));
searchResultLayer.setZIndex(100); //Damit die Adressmarkierung immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(searchResultLayer);

// Koordinatensuche
const xhr = new XMLHttpRequest;


// Get the input field
var input = document.getElementById("search");
// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();

    searchResultSource.clear(); // Löscht alle features
    console.log(input.value);

    xhr.open('GET', 'https://photon.komoot.de/api/?q=' + input.value + ' Wien'); //input eingeben
    xhr.onload = function() {
      const json = JSON.parse(xhr.responseText);
      const geoJsonReader = new GeoJSON({
        featureProjection: 'EPSG:3857'
      });
      var features = geoJsonReader.readFeatures(json);
      // console.log(features[0]);
      var feature = features[0]
      searchResultSource.addFeature(feature); //Source Hinzufügen

      var ext=feature.getGeometry().getExtent();
      console.log(ext);
      map.getView().fit(ext, {maxZoom: 18});

      // var center = ol.extent.getCenter(ext);
      // map.setView( new ol.View({
      //     projection: 'EPSG:4326',//or any projection you are using
      //     center: [center[0] , center[1]],//zoom to the center of your feature
      //     zoom: 12 //here you define the levelof zoom
      // }));
    };
    xhr.send();

  }
});
