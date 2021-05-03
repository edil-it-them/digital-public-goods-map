import React, { useRef, useState, useEffect } from 'react';
import ReactMapboxGl, { Layer, Feature, Marker, Popup, ZoomControl } from 'react-mapbox-gl';
import mapboxgl from 'mapbox-gl';
import dynamic from 'next/dynamic';
import implementedpattern from '../public/implemented.svg';
import pathpattern from '../public/pathfinders.svg';

const zoomDefault = 1;

const Map = ReactMapboxGl({
  accessToken: process.env.NEXT_PUBLIC_ACCESS_TOKEN,
  maxZoom: 5,
  minZoom: 0
});


export default function mapComponent(props) {

  const [zoom, setZoom] = useState(zoomDefault);
  const [lonLat, setLonLat] = useState([props.lon, props.lat]);
  const [lonLatMarker, setLonLatMarker] = useState([props.lon, props.lat]);
  const [selectedGood, setSelectedGood] = useState({});
  const [isActive, setActive] = useState(false);

  const isElementInViewport = (el) => {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }
    
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }
  const toggleClass = () => {
    // setActive(!isActive);
    if (!isElementInViewport(document.getElementById("menu"))) {
      document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      // document.getElementById("footer-text").textContent = '';
    };
  };
  console.log('goods', props.digitalGoods);
  console.log('goods', props.countries);
  // useEffect(() => {
  // 	setZoom(zoomDefault);
  // 	setLonLat([props.lon, props.lat]);
  // 	setLonLatMarker([props.lon, props.lat]);
  // }, [props.lon, props.lat]);
  const InfoComponent = dynamic(() => import('../components/infoComponent'));
  useEffect(() => {
    window.onscroll = () => {
      if (!document.getElementById("menu")) {return }
      !isElementInViewport(document.getElementById("menu")) ? document.getElementById("footer-text").textContent = "Tap to see filters and info"
        :
        document.getElementById("footer-text").textContent = "";
    }
  }, []);
  return (
    <div className='map'>
      <Map
        style="mapbox://styles/rolikasi/ckn67a95j022m17mcqog82g05"
        center={lonLat}
        zoom={[zoom]}
        // pitch={[30]} // pitch in degrees
        // bearing in degrees
        containerStyle={{ width: '100%', height: '100%' }}
        movingMethod='jumpTo'
        logoPosition='bottom-right'
        onMoveEnd={(map) => {
          setZoom(map.getZoom());
          setLonLat([map.getCenter().lng, map.getCenter().lat]);
          console.log(map.getCenter().lng, map.getCenter().lat)
        }
        }
        onStyleLoad={(map, loadEvent) => {

          var layers = map.getStyle().layers;
          // Find the index of the first symbol layer in the map style
          var firstSymbolId;
          for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
              firstSymbolId = layers[i].id;
              break;
            }
          }
          //add layer for each good with map
          props.digitalGoods.map(good => {
            map.addLayer({
              id: good.name + '-develop',
              source: {
                type: 'vector',
                url: 'mapbox://rolikasi.2kn4jvyh',
              },
              'source-layer': 'ne_10m_admin_0_countries-dxlasx',
              type: 'fill',
              paint: {
                // 'fill-color': '#db3d44', // this is the color you want your tileset to have (red)
                'fill-pattern': 'hardware-15', //this helps us distinguish individual countries a bit better by giving them an outline
              },
            }, firstSymbolId)
            map.setLayoutProperty(good.name + '-develop', 'visibility', 'none');

            map.setFilter(
              good.name + '-develop',
              ['in', 'ADM0_A3_IS'].concat(Object.keys(good.locations.developmentCountries)),
            ); // This line lets us filter by country codes.

            map.addLayer({
              id: good.name + '-deploy',
              source: {
                type: 'vector',
                url: 'mapbox://rolikasi.2kn4jvyh',
              },
              'source-layer': 'ne_10m_admin_0_countries-dxlasx',
              type: 'fill',
              paint: {
                // 'fill-color': '#db3d44', // this is the color you want your tileset to have (red)
                'fill-color': '#00AEEF', //this helps us distinguish individual countries a bit better by giving them an outline
                'fill-opacity': 0.2,
              },
            }, firstSymbolId)
            map.setLayoutProperty(good.name + '-deploy', 'visibility', 'none');

            map.setFilter(
              good.name + '-deploy',
              ['in', 'ADM0_A3_IS'].concat(Object.keys(good.locations.deploymentCountries)),
            ); // This line lets us filter by country codes.
          });

          // Declare the image

          let pathimg = new Image(20, 20)
          pathimg.onload = () => map.addImage('pathfinders-pattern', pathimg);
          pathimg.src = pathpattern;

          // Use it
          map.addLayer({
            // adding a layer containing the tileset with country boundaries
            id: 'DPG Pathfinders', //this is the name of our layer, which we will need later
            source: {
              type: 'vector',
              url: 'mapbox://rolikasi.2kn4jvyh',
            },
            'source-layer': 'ne_10m_admin_0_countries-dxlasx',
            type: 'fill',
            paint: {
              "fill-pattern": "pathfinders-pattern",
              "fill-opacity": 0.5,
            },
          }, firstSymbolId)
          map.setLayoutProperty('DPG Pathfinders', 'visibility', 'visible');
          map.setFilter(
            'DPG Pathfinders',
            ['in', 'ADM0_A3_IS'].concat(Object.keys(props.pathfinderCountries)),
          ); // This line lets us filter by country codes.





          // Declare the image
          let implementedimg = new Image(20, 20)
          implementedimg.onload = () => map.addImage('implemented-pattern', implementedimg);
          implementedimg.src = implementedpattern;

          // Use it
          map.addLayer({
            // adding a layer containing the tileset with country boundaries
            id: 'DPG Implemented', //this is the name of our layer, which we will need later
            source: {
              type: 'vector',
              url: 'mapbox://rolikasi.2kn4jvyh',
            },
            'source-layer': 'ne_10m_admin_0_countries-dxlasx',
            type: 'fill',
            paint: {
              "fill-pattern": "implemented-pattern",
              "fill-opacity": 0.5,
            },
          }, firstSymbolId)
          map.setLayoutProperty('DPG Implemented', 'visibility', 'visible');

          map.setFilter(
            'DPG Implemented',
            ['in', 'ADM0_A3_IS'].concat(Object.keys(props.pathfinderImplemented)),
          ); // This line lets us filter by country codes.



          map.addLayer({
            // adding a layer containing the tileset with country boundaries
            id: 'countries', //this is the name of our layer, which we will need later
            source: {
              type: 'vector',
              url: 'mapbox://rolikasi.2kn4jvyh',
            },
            'source-layer': 'ne_10m_admin_0_countries-dxlasx',
            type: 'fill',
            paint: {
              'fill-color': 'white', //this helps us distinguish individual countries a bit better by giving them an outline
              'fill-opacity': 0,
            },
          }, firstSymbolId)

          map.setFilter(
            'countries',
            ['in', 'ADM0_A3_IS'].concat(Object.keys(props.countries)),
          ); // This line lets us filter by country codes.


          map.on('click', 'countries', function (mapElement) {
            const countryCode = mapElement.features[0].properties.ADM0_A3_IS; // Grab the country code from the map properties.

            let deployments = props.digitalGoods.filter(good => Object.keys(good.locations.deploymentCountries).includes(countryCode));
            let developments = props.digitalGoods.filter(good => Object.keys(good.locations.developmentCountries).includes(countryCode));
            let countryName = '';
            let deployHtml = '';
            let developHtml = '';
            let pathHtml = '';
            console.log('depl', deployments);
            if (deployments.length > 0) {
              countryName = deployments[0].locations.deploymentCountries[countryCode]
              deployHtml += "<ul><b>Goods deployed:</b>";
              deployments.map(d => { deployHtml += "<li>" + d.name + "</li>" });
              deployHtml += "</ul>";

            }

            if (developments.length > 0) {
              countryName = developments[0].locations.developmentCountries[countryCode]
              developHtml += "<ul><b>Goods developed:</b>";
              developments.map(d => { developHtml += "<li>" + d.name + "</li>" });
              developHtml += "</ul>";

            }

            console.log()

            if (props.countries[countryCode].pathfinder) {
              countryName = props.countries[countryCode].pathfinder.country;
              pathHtml = "✅&nbsp;&nbsp;DPG Pathfinder Country<br/>";
              pathHtml += "<ul>";
              pathHtml += "<li><b>Status:</b> " + props.countries[countryCode].pathfinder.status + "</li>";
              if (props.countries[countryCode].pathfinder.sector) {
                pathHtml += "<li><b>Sector:</b> " + props.countries[countryCode].pathfinder.sector + "</li>";
              }
              if (props.countries[countryCode].pathfinder.comments) {
                pathHtml += "<li><b>Comments:</b> " + props.countries[countryCode].pathfinder.comments + "</li>";
              }
              pathHtml += "</ul>";
            }

            var html = `<h3>${countryName}</h3>
    				${pathHtml}
            ${deployHtml}
            ${developHtml}`;

            new mapboxgl.Popup() //Create a new popup
              .setLngLat(mapElement.lngLat) // Set where we want it to appear (where we clicked)
              .setHTML(html) // Add the HTML we just made to the popup
              .addTo(map); // Add the popup to the map

          });
          //create legend
          layers = ['where it was developed', 'where it was implemented']
          var colors = [
            '#F57F29',
            '#00AEEF'
          ];
          for (i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var color = colors[i];
            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            i == 0 ? key.style.backgroundImage = 'url(hardware.svg)' : key.style.backgroundColor = color;
            

            var value = document.createElement('span');
            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
          }

          // create goods selection
          var prevLayer = '';
          props.digitalGoods.map(good => {
            let layers = document.getElementById('dg-menu-dropdown');
            console.log('good map')
            let li = document.createElement('a');
            li.textContent = good.name;
            li.href = '#';
            li.onclick = function (e) {
              console.log('clicked ', e)
              console.log('prev', prevLayer)
              var clickedGood = this.textContent;
              document.getElementById('legend').style.display = "block";
              setSelectedGood(good);

              e.preventDefault();
              e.stopPropagation();
              if (prevLayer) {
                map.setLayoutProperty(prevLayer + '-develop', 'visibility', 'none');
                map.setLayoutProperty(prevLayer + '-deploy', 'visibility', 'none');
              }
              prevLayer = this.textContent;

              map.setLayoutProperty(clickedGood + '-develop', 'visibility', 'visible');
              map.setLayoutProperty(clickedGood + '-deploy', 'visibility', 'visible');

            }
            layers.appendChild(li);
            // op.appendChild(li);
            
          })

          // set up the corresponding toggle button for each layer
          var toggleableLayerIds = ['DPG Pathfinders', 'DPG Implemented'];
          for (var i = 0; i < toggleableLayerIds.length; i++) {
            var id = toggleableLayerIds[i];
            var linkText = document.createElement('span');
            var link = document.createElement('a');
            var li = document.createElement('li');

            link.href = '#';
            link.className = 'active ' + id;
            li.id = id;
            linkText.textContent = id;
            link.style.backgroundImage = i == 0 ? 'url(pathfinders.svg)' : 'url(implemented.svg)'

            
            li.onclick = function (e) {
              console.log('click', this)
              var clickedLayer = this.id;
              e.preventDefault();
              e.stopPropagation();

              var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

              // toggle layer visibility by changing the layout object's visibility property
              if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none'); //need to refactor
                this.children[1].className = clickedLayer;
                this.children[1].style.backgroundImage = 'none';
                this.children[1].textContent = clickedLayer;
                this.children[0].textContent = '';
              } else {
                this.children[1].className = 'active ' + clickedLayer;
                this.children[1].style.backgroundImage = clickedLayer == 'DPG Pathfinders' ? 'url(pathfinders.svg)' : 'url(implemented.svg)'
                this.children[1].textContent = '';
                this.children[0].textContent = clickedLayer;

                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
              }
            };

            var layers = document.getElementById('menu');
            li.appendChild(linkText)
            li.appendChild(link);

            layers.appendChild(li);
          }

        }}
      >

        <ZoomControl />
      </Map>
      <div className="map-overlay" id="legend"></div>
      <div className='controls' onClick={toggleClass}>
        <div className={isActive ? 'change hamburger-icon' : 'hamburger-icon'}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
        <span id='footer-text'>Tap to see filters and info</span>
      </div>
      <ul id="menu"></ul>

      <InfoComponent selectedGood={selectedGood} />
    </div>
  );
}