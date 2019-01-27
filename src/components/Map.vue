<template>
  <div id="map-container">
    <div id="map"></div>
    <div class="text-xs-center">
      <v-btn :disabled="selection.selection === 'fin' || selection.selection === 'debut'" color="green" @click="displayMarker()">Afficher les marqueurs : {{selection.selection}}</v-btn>
      <v-btn color="green" @click="hideMarker()">Masquer les marqueurs</v-btn>
      <v-btn disabled="distributedMap" color="red" @click="showPath()">Calculer le chemin</v-btn>
      <p>{{drawConstru}}</p>
    </div>
  </div>
</template>

<script>
    import L from 'leaflet';
    import 'leaflet-draw';

    import axios from 'axios';


    export default {
      name: "Map",
      props: ['selection', 'distributedMap'],
      data() {
        return {
          map: null,
          listMarker: [],
          myIcon: null,
          startMarker: null,
          endMarker: null,
          path: null,
          drawConstru: {
            'bois': 0,
            'pierre': 0,
            'metal': 0,
          },
          visible: [],
          time: 0,
        }
      },
      methods: {
        sendPosition(x, y, zoom) {
          this.$emit("position", {
            x: Math.round(x/Math.pow(2, zoom - 2)),
            y: Math.round(y/Math.pow(2, zoom - 2)),
          })
        },
        displayMarker() {
          axios.get('/data/marqueur/' + this.selection.selection)
            .then(response => {
              response.data.forEach(marker => {

                let pos = this.map.unproject(L.point(marker.x, marker.y));

                let newMarker = new L.marker(pos, {
                  icon: this.myIcon,
                }).addTo(this.map);
              });
            })
            .catch(err => {
              console.log(err);
            })
        },
        hideMarker() {
          location.reload();
        },
        showPath() {
          this.map.setZoom(2);

          const start = {
            x: Math.round(this.map.project(this.startMarker.getLatLng()).x/Math.pow(2, this.map.getZoom() - 2)),
            y: Math.round(this.map.project(this.startMarker.getLatLng()).y/Math.pow(2, this.map.getZoom() - 2)),
          };
          const end = {
            x: Math.round(this.map.project(this.endMarker.getLatLng()).x),
            y: Math.round(this.map.project(this.endMarker.getLatLng()).y),
          };

          axios.get('/data/chemin/?debut={"x":'+start.x+',"y":'+start.y+'}&fin={"x":'+end.x+',"y":'+end.y+'}&mode="'+this.selection.mode+'"')
            .then(response => {
              const colors = ["#cc0000", "#8187ff", "#b0d996", "#ffd700"];
              for (let i = 0 ; i < response.data.path.length; i++) {
                let path = response.data.path[i];
                console.log(path);
                let nodes = [];
                path.forEach(marker => {
                  let pos = this.map.unproject(L.point(marker.x, marker.y));
                  nodes.push(pos);
                });
                this.path = L.polyline(nodes, {color: colors[i]});
                this.path.addTo(this.map);

                this.drawConstru = response.data.mats;
              };
            })
            .catch(err => {
              console.log(err);
            })
        }

      },
      mounted() {
        const that = this;

        let myIcon = L.icon({
          iconUrl: require('../assets/images/forest.svg'),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        let iconDraw = L.icon({
          iconUrl: require('../assets/images/circular.svg'),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        let iconDebut = L.icon({
          iconUrl: require('../assets/images/pinS.svg'),
          iconSize: [64, 64],
          iconAnchor: [32, 64],
        });

        let iconFin = L.icon({
          iconUrl: require('../assets/images/pinE.svg'),
          iconSize: [64, 64],
          iconAnchor: [32, 64],
        });

        this.myIcon = myIcon;

        let map = L.map('map', {
          dragging: false,
        }).setView([1, 1], 2);

        this.map = map;
        //let bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(50, 100));

        L.tileLayer('https://oyster.ignimgs.com/ignmedia/wikimaps/fortnite/season-7/{z}/{x}-{y}.jpg', {
          minZoom: 1,
          maxZoom: 6,
          attribution: 'fortnite-map',
          tms: false,
          noWrap: true,
        }).addTo(map);

        if (that.selection.tool.draw) {
          L.DomUtil.addClass(map._container,'circle-cursor-enabled');
        }

        map.on('click', addMarker);

        function computeTime(){
          if (that.startMarker !== null)
          {
            let positionStart = map.project(that.startMarker.getLatLng());
            let positionEnd = map.project(that.endMarker.getLatLng());
            let dist = Math.sqrt(Math.pow(positionStart.x/Math.pow(2, map.getZoom() - 2) - positionEnd.x/Math.pow(2, map.getZoom() - 2), 2) + Math.pow(positionStart.y/Math.pow(2, map.getZoom() - 2) - positionEnd.y/Math.pow(2, map.getZoom() - 2), 2));
            if (that.selection.move === "pied"){
              that.time = Math.round((1/2.2)*dist);
            } else if (that.selection.move === "quad" ){
              that.time = Math.round((1/4.5)*dist);     //4.5 boost | 3.8 sans boost
            } else if (that.selection.move === "avion" ) {
              that.time = Math.round((1/8)*dist);      //8 boost | 6.6 sans boost
            }
            console.log("Time : "+that.time);
          }
        }

        function addMarker(e){

          if (that.selection.selection !== null) {
            if (that.selection.selection === 'debut') {
              if (that.startMarker === null) {
                that.startMarker = new L.marker(e.latlng, {
                  icon: iconDebut,
                }).addTo(map);
              } else {
                that.startMarker.setLatLng(e.latlng);
              }
              let position = map.project(e.latlng, map.getZoom());
              that.sendPosition(position.x, position.y, map.getZoom());
            } else if (that.selection.selection === 'fin') {
              if (that.distributedMap) {
                if (that.endMarker === null) {
                  that.endMarker = new L.marker(e.latlng, {
                    icon: iconFin,
                  });
                  computeTime();
                  that.endMarker.addTo(map).bindTooltip("<div class='my-tooltip' style='padding: 2px; border: 1px solid black;border-radius: 2px;background-color: rgba(255, 255, 255, 0.8);'>Temps : "+ that.time+"s</div>",
                    {
                      pane: 'markerPane',
                      permanent: true,
                      direction: 'bottom',
                    });
                } else {
                  that.endMarker.setLatLng(e.latlng);
                  computeTime();
                  that.endMarker.setTooltipContent("<div class='my-tooltip' style='padding: 2px; border: 1px solid black;border-radius: 2px;background-color: rgba(255, 255, 255, 0.8);'>Temps : "+ that.time+"s</div>");
                }
                let position = map.project(e.latlng, map.getZoom());
                that.sendPosition(position.x, position.y, map.getZoom());
              } else {
                if (that.endMarker === null) {
                  that.endMarker = new L.marker(e.latlng, {
                    icon: iconFin,
                  }).addTo(map);
                } else {
                  that.endMarker.setLatLng(e.latlng);
                }
                let position = map.project(e.latlng, map.getZoom());
                that.sendPosition(position.x, position.y, map.getZoom());
              }
            } else {
              let newMarker = new L.marker(e.latlng, {
                icon: myIcon,
              }).addTo(map);
              let position = map.project(e.latlng, map.getZoom());
              that.sendPosition(position.x, position.y, map.getZoom());
            }
          } else {
            let position = map.project(e.latlng, map.getZoom());
            axios.get('/data/pointer/draw/?x=' + Math.round(position.x/Math.pow(2, map.getZoom() - 2)) + '&y=' + Math.round(position.y/Math.pow(2, map.getZoom() - 2)))
              .then(response => {
                response.data.forEach(marker => {
                  if (!that.visible.includes(marker.id)) {
                    that.visible.push(marker.id);
                    that.drawConstru[marker.matiere] += marker.moyenne;
                    let newMarker = new L.marker(map.unproject(L.point(marker.x*Math.pow(2, map.getZoom() - 2), marker.y*Math.pow(2, map.getZoom() - 2))), {
                      icon: iconDraw,
                    }).addTo(map);
                  }
                })
              })
          }
        }
      }

    }

</script>

<style scoped>

  #map {
    margin: auto;
    width: 70vw;
    height: 80vh;
  }

  .leaflet-container.circle-cursor-enabled {
    cursor:crosshair;
  }

  .my-tooltip {
    padding: 2px;
    border: 1px solid black;
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.8);
  }

</style>
