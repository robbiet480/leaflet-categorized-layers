/* 
 * Leaflet Categorized Layers v0.0.1 - 2014-05-21
 * 
 * Copyright 2014 Robbie Trencheny
 * me@robbiet.us
 * http://robbie.io/ 
 * 
 * Licensed under the MIT license. 
 * 
 */
(function() {

L.Control.PanelLayers = L.Control.Layers.extend({
	options: {
		collapsed: false,
    groupsCollapsed: true,
    collapseActiveGroups: false,
		position: 'topright',
		autoZIndex: true
	},
	
	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);
		this._layers = {};
    this._overlays = {};
    this._groups = {};
    this._lastZIndex = 0;
		this._handlingClick = false;
    for (var category in baseLayers) {
      this._layers[category] = {};
      for (var layer in baseLayers[category]) {
        baseLayers[category][layer]._category = category;
        baseLayers[category][layer]._name = layer;
        baseLayers[category][layer]._overlay = false;
        this._addLayer(baseLayers[category][layer], category, false);
      }
    }

    for (var category in overlays) {
      this._overlays[category] = {};
      for (var layer in overlays[category]) {
        overlays[category][layer]._category = category;
        overlays[category][layer]._name = layer;
        overlays[category][layer]._overlay = true;
        this._addLayer(overlays[category][layer], category, true);
      }
    }
	},
  _onLayerChange: function (e) {
    var category = e.layer._overlay ? this._overlays[e.layer._category] : this._layers[e.layer._category];

    if (!category) { return; }
    
    var obj = category[L.stamp(e.layer)];
    
    if (!obj) { return; }

    if (!this._handlingClick) {
      this._update();
    }

    var type = obj._overlay ?
      (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
      (e.type === 'layeradd' ? 'baselayerchange' : null);

    if (type) {
      this._map.fire(type, e);
    }
  },
	_addLayer: function (obj, category, overlay) {
		var id = L.stamp(obj);
    if(obj._overlay) {
      this._overlays[obj._category][id] = obj;
    } else {
      this._layers[obj._category][id] = obj;
    }
    
    if (this.options.autoZIndex && obj.setZIndex) {
      this._lastZIndex++;
      obj.setZIndex(this._lastZIndex);
    }
	},
  _update: function () {
    if (!this._container) {
      return;
    }

    this._baseLayersList.innerHTML = '';
    this._overlaysList.innerHTML = '';
    this._groups = [];

    var baseLayersPresent = false,
        overlaysPresent = false,
        i, obj;

    for (category in this._layers) {
      for (layer in this._layers[category]) {
        obj = this._layers[category][layer];
        this._addItem(obj);
        overlaysPresent = overlaysPresent || obj._overlay;
        baseLayersPresent = baseLayersPresent || !obj._overlay;
      }
    }

    for (category in this._overlays) {
      for (layer in this._overlays[category]) {
        obj = this._overlays[category][layer];
        this._addItem(obj);
        overlaysPresent = overlaysPresent || obj._overlay;
        baseLayersPresent = baseLayersPresent || !obj._overlay;
      }
    }

    this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
  },
	_addItem: function (obj) {
    var className = 'leaflet-control-layers',
      label, input, checked, appendTo;
    if(!this._groups[obj._category]) {
      var group = L.DomUtil.create('div', className + '-group');

      var name = document.createElement('span');
      var collapsed = this.options.groupsCollapsed ? name.innerHTML = ' &#9658; ' : name.innerHTML = ' &#9660; '
      name.innerHTML += obj._category;
      name.className = 'groupHeader';
      name.category = obj._category;
      name.collapsed = collapsed;
      L.DomEvent.on(name, 'click', this._onLabelClick);
      group.appendChild(name);

      var layers = document.createElement('span');
      layers.className = 'groupLayers';
      if(collapsed) {
        layers.style.height = '0';
        layers.style.display = 'none';
      }
      group.appendChild(layers);

      var container = obj._overlay ? this._overlaysList : this._baseLayersList;
      container.appendChild(group);
      this._groups[obj._category] = layers;
    }

    appendTo = this._groups[obj._category];

    layer = document.createElement('label');
    checked = this._map.hasLayer(obj);
    if((checked) && (!this.options.collapseActiveGroups)) {
      appendTo.previousSibling.innerHTML = ' &#9660; '+appendTo.previousSibling.category;
      appendTo.previousSibling.collapsed = false;
      appendTo.style.height = '100%';
      appendTo.style.display = 'block';
    }
    
    if (obj._overlay) {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'leaflet-control-layers-selector';
      input.defaultChecked = checked;
    } else {
      input = this._createRadioElement('leaflet-base-layers', checked);
    }
    
    input.layerId = L.stamp(obj);
    input.category = obj._category;
    input.overlay = obj._overlay;

    L.DomEvent.on(input, 'click', this._onInputClick, this);
    layer.appendChild(input);

    var name = document.createElement('span');
    name.innerHTML = ' ' + obj._name;
    layer.appendChild(name);
    appendTo.appendChild(layer);
    return layer;
	},
  _onLabelClick: function () {
    if(!this.collapsed) {
      this.collapsed = true;
      this.innerHTML = ' &#9658;' + this.category;
      this.nextElementSibling.style.height = '0';
      this.nextElementSibling.style.display = 'none';
    } else {
      this.collapsed = false;
      this.innerHTML = ' &#9660;' + this.category;
      this.nextElementSibling.style.height = '100%';
      this.nextElementSibling.style.display = 'block';
    }
  },
	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
      var obj = input.overlay ? this._overlays[input.category][input.layerId] : this._layers[input.category][input.layerId]
			if (input.checked && !this._map.hasLayer(obj)) {
				this._map.addLayer(obj);

			} else if (!input.checked && this._map.hasLayer(obj)) {
				this._map.removeLayer(obj);
			}
		}

		this._handlingClick = false;
	},	
	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
      //Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
      L.DomEvent.on(form, 'click', function () {
        setTimeout(L.bind(this._onInputClick, this), 0);
      }, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-sub-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
    container.appendChild(form);
	},
	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},
	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});


}).call(this);
