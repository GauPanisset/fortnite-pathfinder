<template>
  <div id="map"></div>
</template>

<script>
    import L from 'leaflet';



    export default {
      name: "Map",
      methods: {
        sendPosition(x, y, zoom) {
          this.$emit("position", {
            x: Math.round(x/Math.pow(2, zoom - 2)),
            y: Math.round(y/Math.pow(2, zoom - 2)),
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

        let map = L.map('map', {
          dragging: false,
        }).setView([1, 1], 0);

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
          let newMarker = new L.marker(e.latlng, {
            icon: myIcon,
          }).addTo(map);
          let position = map.project(e.latlng, map.getZoom());
          that.sendPosition(position.x, position.y, map.getZoom());
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
