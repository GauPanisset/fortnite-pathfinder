<template>
  <div id="map-container">
    <div id="map"></div>
    <div class="text-xs-center">
      <v-btn :disabled="selection.selection === 'fin' || selection.selection === 'debut'" color="green" @click="displayMarker()">Afficher les marqueurs : {{selection.selection}}</v-btn>
      <v-btn color="green" @click="hideMarker()">Masquer les marqueurs</v-btn>
      <v-btn color="red" @click="showPath()">Calculer le chemin</v-btn>
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
      props: ['selection'],
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
              for (let i = 0 ; i < response.data.length; i++) {
                let path = response.data[i];
                console.log(path);
                let nodes = [];
                path.forEach(marker => {
                  let pos = this.map.unproject(L.point(marker.x, marker.y));
                  nodes.push(pos);
                });
                this.path = L.polyline(nodes, {color: colors[i]});
                this.path.addTo(this.map);
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

        L.tileLayer('https://oyster.ignimgs.com/ignmedia/wikimaps/fortnite/season-6/{z}/{x}-{y}.jpg', {
          minZoom: 1,
          maxZoom: 6,
          attribution: 'fortnite-map',
          tms: false,
          noWrap: true,
        }).addTo(map);

        map.on('click', addMarker);

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
              if (that.endMarker === null) {
                that.endMarker = new L.marker(e.latlng, {
                  icon: iconFin,
                }).addTo(map);
              } else {
                that.endMarker.setLatLng(e.latlng);
              }
              let position = map.project(e.latlng, map.getZoom());
              that.sendPosition(position.x, position.y, map.getZoom());
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
</style>
