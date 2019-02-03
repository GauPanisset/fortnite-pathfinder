<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-dialog v-model="dialogAjout" persistent max-width="290">
        <v-btn slot="activator" color="primary" dark>Ajouter un objet</v-btn>
        <v-card>
          <v-card-title class="headline">Ajouter un objet</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="inputNom"
                label="Nom de l'objet"
                required
              ></v-text-field>
              <v-radio-group v-model="inputMatiere" row>
                <v-radio
                  v-for="(item) in matListe"
                  :key=item.value
                  :label=item.label
                  color="blue"
                  :value=item.value
                ></v-radio>
              </v-radio-group>
              <v-text-field
                v-model="inputVie"
                label="Vie de l'objet"
                required
              ></v-text-field>
              <v-text-field
                v-model="inputMoyenne"
                label="Moyenne"
                required
              ></v-text-field>
              <v-text-field
                v-model="inputVariance"
                label="Variance"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="distributedMap" color="blue" flat @click.native="ajouterObjet">Confirmer</v-btn>
            <v-btn color="blue" flat @click.native="dialogAjout = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogSuppr" persistent max-width="290">
        <v-btn slot="activator" color="primary" dark>Supprimer un objet</v-btn>
        <v-card>
          <v-card-title class="headline">Supprimer l'objet sélectionné ?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="distributedMap" color="blue" flat @click.native="supprimerObjet">Confirmer</v-btn>
            <v-btn color="blue" flat @click.native="dialogSuppr = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogModif" persistent max-width="290">
        <v-btn slot="activator" color="primary" @click="setAttribut(selection)" dark>Modifier un objet</v-btn>
        <v-card>
          <v-card-title class="headline">Modifier l'objet sélectionné</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="inputNom"
                label="Nom de l'objet"
                required
              ></v-text-field>
              <v-radio-group v-model="inputMatiere" row>
                <v-radio
                  v-for="(item) in matListe"
                  :key=item.value
                  :label=item.label
                  color="blue"
                  :value=item.value
                ></v-radio>
              </v-radio-group>
              <v-text-field
                v-model="inputVie"
                label="Vie de l'objet"
                required
              ></v-text-field>
              <v-text-field
                v-model="inputMoyenne"
                label="Moyenne"
                required
              ></v-text-field>
              <v-text-field
                v-model="inputVariance"
                label="Variance"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="distributedMap" color="blue" flat @click.native="modifierObjet">Confirmer</v-btn>
            <v-btn color="blue" flat @click.native="dialogModif = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>

      <v-radio-group v-model="selection" column>
        <v-radio
          v-for="(item) in specialMarker"
          :key=item.value
          :label=item.label
          color="red"
          :value=item.value
        ></v-radio>
      </v-radio-group>
      <v-radio-group v-model="moveSelection" row>
        <v-radio
          v-for="(item) in moveRadio"
          :key=item.value
          :label=item.label
          :color=item.color
          :value=item.value
        ></v-radio>
      </v-radio-group>
      <v-radio-group :disabled="distributedMap" v-model="modeSelection" row>
        <v-radio
          v-for="(item) in modeRadio"
          :key=item.value
          :label=item.label
          color="green"
          :value=item.value
        ></v-radio>
      </v-radio-group>

      <v-divider></v-divider>

      <v-expansion-panel>
        <v-expansion-panel-content>
          <div slot="header">Objets</div>
          <v-radio-group :disabled="distributedMap" v-model="selection" column>
            <v-radio
              v-for="(item) in items"
              :key=item.value
              :label=item.label
              color="blue"
              :value=item.value
            ></v-radio>
          </v-radio-group>
        </v-expansion-panel-content>
      </v-expansion-panel>

    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="modify-tool">
        <v-btn icon @click.stop="toolSelection.draw = !toolSelection.draw; toolSelection.delete = false; selection = null">
          <v-icon :color="toolSelection.draw ? 'primary' : 'black'" :style="toolSelection.draw ? {'border-radius': '50%', 'padding': '5px', 'box-shadow': '0px 0px 3px black'} : {}" v-html="'edit'"></v-icon>
        </v-btn>
        <v-btn icon @click.stop="toolSelection.delete = !toolSelection.delete; toolSelection.draw = false; selection = null">
          <v-icon :color="toolSelection.delete ? 'primary' : 'black'" :style="toolSelection.delete ? {'border-radius': '50%', 'padding': '5px', 'box-shadow': '0px 0px 3px black'} : {}"v-html="'delete'"></v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <Map v-on:position="setPosition($event)" :selection="{'selection': selection, 'mode': modeSelection, 'move': moveSelection, 'tool': toolSelection}" :distributedMap="distributedMap"></Map>
    </v-content>

    <v-footer :fixed="fixed" app>
      <div>{{position}}</div>
    </v-footer>
  </v-app>
</template>

<script>
  import Map from './components/Map'
  import axios from 'axios'

  export default {
    data () {
      return {
        distributedMap: false,
        clipped: true,
        drawer: true,
        fixed: false,
        items: [],
        right: true,
        rightDrawer: false,
        title: 'Fortnite Map',
        selection: 'debut',
        position: '(0, 0)',
        dialogAjout: false,    //true si modal affiché, false sinon.
        dialogSuppr: false,
        dialogModif: false,
        inputNom: '',
        inputVie: '',
        inputMoyenne: '',
        inputVariance: '',
        inputMatiere: '',
        inputObjet: '',
        matListe: [{
          value: 'bois',
          label: 'Bois',
        }, {
          value: 'pierre',
          label: 'Pierre',
        }, {
          value: 'metal',
          label: 'Metal',
        }],
        specialMarker: [{
          value: 'debut',
          label: 'Point de départ',
        }, {
          value: 'fin',
          label: "Point d'arriver",
        }],
        modeRadio: [{
          value: 'solo',
          label: 'Solo',
        }, {
          value: 'duo',
          label: 'Duo',
        }, {
          value: 'squad',
          label: 'Squad',
        }],
        modeSelection: 'solo',
        moveRadio: [{
          value: 'pied',
          label: 'Pied',
          color: 'red',
        }, {
          value: 'quad',
          label: 'Quad',
          color: 'blue',
        }, {
          value: 'avion',
          label: 'Avion',
          color: 'green',
        }],
        moveSelection:'pied',
        toolSelection: {
          draw: false,
          delete: false,
        },
      }
    },
    name: 'App',
    components: {
      Map,
    },
    methods: {
      setPosition(e) {

        this.position = '(' + e.x + ',' + e.y + ')';

        if (this.selection !== 'debut' && this.selection !== 'fin') {
          axios.post('/data/place', {
            objet: this.selection,
            posx: e.x,
            posy: e.y,
          })
            .then(response => {
              console.log(response);
            })
            .catch(err => {
              console.log(err);
            })
        }
      },
      ajouterObjet() {

        axios.post('/data/create', {
          nom: this.inputNom,
          vie: this.inputVie,
          moyenne: this.inputMoyenne,
          variance: this.inputVariance,
          matiere: this.inputMatiere,
        })
          .then(response => {
            location.reload();
          })
          .catch(err => {
            console.log(err);
          })
      },
      supprimerObjet() {
        axios.delete('/data/objet/' + this.selection)
          .then(response => {
            location.reload();
          })
          .catch(err => {
            console.log(err);
          })
      },
      modifierObjet() {

        axios.patch('/data/objet/' + this.selection, {
          nom: this.inputNom,
          vie: this.inputVie,
          moyenne: this.inputMoyenne,
          variance: this.inputVariance,
          matiere: this.inputMatiere,
        })
          .then(response => {
            location.reload();
          })
          .catch(err => {
            console.log(err);
          })
      },
      objetListe(items) {
        let res = [];
        items.forEach(objet => {
          res.push(objet.label);
        });
        return res;
      },
      getNameFromId(id) {
        let name = null;
        let i =  0;
        while (name === null || i < this.items.length) {
          if (id === this.items[i].value) {
            name = this.items[i].label;
          }
          i++;
        }
        return name;
      },
      setAttribut(id) {
        axios.get('/data/objet/'+id)
          .then(response => {
            this.inputNom = response.data[0].nom;
            this.inputMatiere = response.data[0].matiere;
            this.inputVie = response.data[0].vie;
            this.inputMoyenne = response.data[0].moyenne;
            this.inputVariance = response.data[0].variance;
          })
          .catch(err => {
            console.log(err);
          })
      }
    },
    mounted() {
      axios.get('/data/objet/all')
        .then(response => {
          response.data.forEach(objet => {
            this.items.push({
              value: objet.id,
              label: objet.nom,
            })
          });
        })
        .catch(err => {
          console.log(err);
        })
    }
  }
</script>
