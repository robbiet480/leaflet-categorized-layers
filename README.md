Leaflet Categorized Layers
==============

Leaflet Control Layers extended for group of base and overlay layers

Copyright 2014 [Robbie Trencheny](http://robbie.io/)

Tested in Leaflet 0.7

**Source code:**  
[Github](https://github.com/robbiet480/leaflet-categorized-layers)   

#Usage

```javascript
var baseLayers = {
  "Esri": {
    "WorldStreetMap": L.tileLayer.provider('Esri.WorldStreetMap'),
    "DeLorme": L.tileLayer.provider('Esri.DeLorme'),
  }
};
var overlayLayers = {
  "Weather": {
    "OpenWeatherMap Clouds": L.tileLayer.provider('OpenWeatherMap.Clouds'),
    "OpenWeatherMap Precipitation": L.tileLayer.provider('OpenWeatherMap.Precipitation'),
    "OpenWeatherMap Rain": L.tileLayer.provider('OpenWeatherMap.Rain'),
    "OpenWeatherMap Pressure": L.tileLayer.provider('OpenWeatherMap.Pressure'),
    "OpenWeatherMap Wind": L.tileLayer.provider('OpenWeatherMap.Wind')
  }
};

map.addControl( new L.Control.CategorizedLayers(baseLayers, overLayers, {collapsed: false}) );
```

#Thanks
Thanks to [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/) for the initial idea in his [leaflet-panel-layers](https://github.com/stefanocudini/leaflet-panel-layers) project. 