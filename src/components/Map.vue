<template>
  <div id="map-container">
    <div id="map"></div>
    <div class="text-xs-center">
      <v-btn :disabled="selection === 'fin' || selection === 'debut'" color="green" @click="displayMarker()">Afficher les marqueurs : {{selection}}</v-btn>
      <v-btn color="green" @click="hideMarker()">Masquer les marqueurs</v-btn>
      <v-btn color="red" @click="showPath()">Calculer le chemin</v-btn>
    </div>
  </div>
</template>

<script>
    import L from 'leaflet';

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
          axios.get('/data/marqueur/' + this.selection)
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

          axios.get('/data/chemin/?debut={"x":'+start.x+',"y":'+start.y+'}&fin={"x":'+end.x+',"y":'+end.y+'}')
            .then(response => {
              let nodes = [];
              let myData = JSON.parse(response.data.split('\'').join('"'));
              myData.forEach(marker => {
                let pos = this.map.unproject(L.point(marker.x, marker.y));
                nodes.push(pos);
              });
              this.path = L.polyline(nodes);
              this.path.addTo(this.map);
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
          if (that.selection === 'debut') {
            if (that.startMarker === null) {
              that.startMarker = new L.marker(e.latlng, {
                icon: iconDebut,
              }).addTo(map);
            } else {
              that.startMarker.setLatLng(e.latlng);
            }
            let position = map.project(e.latlng, map.getZoom());
            that.sendPosition(position.x, position.y, map.getZoom());
          } else if (that.selection === 'fin') {
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
