  var zoomThreshold = 16;
  var proposed_route;
  var raillines;

  var baseLayers = [{
  label: 'Fly Eagles Fly',
  id: 'outdoors-v10'
 // id:'crvanpollard/cjdb25by21pbu2rl9pf7jk9xt'
  }, {
  label: 'Engage Night Mode',
  id: 'dark-v8'
  }];

  var menu = document.getElementById('menu');
  var geojson;

  $(document).ready(function() {
    //OPEN ABOUT DIALOG
  //  $('#aboutModal').modal(); 
  });

  // $(document).on('hide.bs.modal','#aboutModal', function () {
  //    setTimeout(goHome, 2000);
  //  });
  // This will let you use the .remove() function later on
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
          this.parentNode.removeChild(this);
      }
    };
  }

   $(function () {
      $('.glyphicon').unbind('click');
      $('.glyphicon').click(function (e) {
      $(this).toggleClass('glyphicon glyphicon-plus glyphicon glyphicon-minus');
      $('.content-one').slideToggle('slow'); return false;
  });
    });

  mapboxgl.accessToken = 'pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6ImNqMHdvdnd5MTAwMWEycXBocm4zbXVjZm8ifQ.3zjbFccILu6mL7cOTtp40A';
//  mapboxgl.accessToken = 'pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6Ii00ZklVS28ifQ.Ht4KwAM3ZUjo1dT2Erskgg';
  // This adds the map
  var map = new mapboxgl.Map({
    // container id specified in the HTML
    container: 'map', 
     style: 'mapbox://styles/mapbox/dark-v9', 
  //  style:'mapbox://styles/mapbox/outdoors-v10',
 // style: 'mapbox://styles/crvanpollard/cjdb25by21pbu2rl9pf7jk9xt',
    center: [ -75.172, 39.912293], 
    bearing: 10, // Rotate Philly ~9° off of north, thanks Billy Penn.
    pitch: 60,
    zoom: 14,
     attributionControl: false
  });

    function goHome() {
      // debugger
      if (map.loaded()) {
        var p = map.getPitch();
     //   console.log(p);
        if (p > 0) {
          map.flyTo({
            center: [ -75.172, 39.912293], 
            zoom: 14,
            speed: 0.1,
            bearing: 10,
            pitch: 60
          });
        }
      }
    }
  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(),['top-left']);
  map.addControl(new mapboxgl.AttributionControl(),'bottom-right');

  var stateLegendEl = document.getElementById('extent');

  document.getElementById('export').addEventListener('click', function () {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();

    map.flyTo({
        center: [ -75.172, 39.912293], 
            zoom: 14,
            speed: 0.5,
            bearing: 10,
            pitch: 60
    });
  });

  map.on('click', function (currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
  });


  function addDataLayer() {
    map.addSource('proposed_route', {
      'type': 'geojson',
      'data': proposed_route
  });

  map.addLayer({
     "id": "route",
        "type": "vector",
 'source': 'proposed_route',
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#F74902",
            "line-width": 5
        }
  });
}

// curb cuts layer
map.on('load', function () {

    map.addLayer({
        'id': 'Broad',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': Broad
        },
       'paint': {
            // make circles larger as the user zooms from z12 to z22
                 'circle-radius': 6,
             
  
            // color circles by ethnicity, using a match expression
            // https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            'circle-color': [
                'match',
                ['get', 'EAGLES'],
                'yes', '#fbb03b',
                'no', '#223b53',
                /* other */ '#ccc'
            ]
            }
        });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'Broad', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.STATION)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'Broad', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'Broad', function () {
        map.getCanvas().style.cursor = '';
    });

    });




map.on('style.load', function () {
  // Triggered when `setStyle` is called.
//  alert("NOPE");
  addDataLayer();
   map.addLayer({
        'id': 'Buildings',
        'source': 'composite',
      //  'minzoom':15,
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
      //  'minzoom': 14,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .5
        }
    });
});


// the 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
    map.addLayer({
        'id': 'Buildings',
        'source': 'composite',
      //  'minzoom':15,
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
      //  'minzoom': 14,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .5
        }
    });
    });


map.on('load', function () {
  baseLayers.forEach(function(l) {
    var button = document.createElement('button'); 
    button.textContent = l.label;
    button.addEventListener('click', function() {
      map.setStyle('mapbox://styles/mapbox/' + l.id); 
    });

    menu.appendChild(button);
  });
});
