<template>
  <div id="map-container">
    <div id="map"></div>
    <div class="text-xs-center">
      <v-btn color="green" @click="displayMarker()">Afficher les marqueurs : {{selection}}</v-btn>
      <v-btn color="green" @click="hideMarker()">Masquer les marqueurs</v-btn>
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
          console.log(this.selection);
          axios.get('/data/marqueur/' + this.selection)
            .then(response => {
              console.log(response);
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
        }
      },
      mounted() {

        const that = this;

        this.myIcon = L.icon({
          iconUrl: require('../assets/images/forest.svg'),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        this.map = L.map('map', {
          dragging: false,
        }).setView([1, 1], 2);

        //let bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(50, 100));

        L.tileLayer('https://oyster.ignimgs.com/ignmedia/wikimaps/fortnite/season-6/{z}/{x}-{y}.jpg', {
          minZoom: 1,
          maxZoom: 6,
          attribution: 'fortnite-map',
          tms: false,
          noWrap: true,
        }).addTo(this.map);

        this.map.on('click', addMarker);

        function addMarker(e){
          let newMarker = new L.marker(e.latlng, {
            icon: this.myIcon,
          }).addTo(this.map);
          let position = this.map.project(e.latlng, this.map.getZoom());
          that.sendPosition(position.x, position.y, this.map.getZoom());
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
