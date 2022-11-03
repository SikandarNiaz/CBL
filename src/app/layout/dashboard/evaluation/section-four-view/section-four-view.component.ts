import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { config } from "src/assets/config";
declare const google: any;
declare var ol: any;
@Component({
  selector: 'section-four-view',
  templateUrl: './section-four-view.component.html',
  styleUrls: ['./section-four-view.component.scss']
})
export class SectionFourViewComponent implements OnInit {

  @Input("data") data;
  lat: any;
  long: any;
  mapSrc: SafeResourceUrl;
  map: any;
  center: any;
  locationData: any = [];
  mapArrayIndex = 1;
  configFile = config;
  ip: any = this.configFile.ip;
  constructor(public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.locationData = this.data.mslTable;
    console.log("this.mslData: ", this.data.mslTable);
    this.center = ol.proj.transform(
      [
        parseFloat(this.locationData[0].longitude),
        parseFloat(this.locationData[0].latitude),
      ],
      "EPSG:4326",
      "EPSG:3857"
    );
    this.initialize_map();
  }

  initialize_map() {
    this.map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM({
            url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      view: new ol.View({
        center: this.center,
        zoom: 15,
      }),
    });
    for (const element of this.locationData) {
      this.add_map_point(
        element.latitude,
        element.longitude,
        this.mapArrayIndex++
      );
    }
    this.mapArrayIndex = 1;
  }

  add_map_point(lat, lng, index) {
    const radius = 100;
    const edgeCoordinate = [this.center[0] + radius, this.center[1]];
    const sphere = new ol.Sphere(6378137);
    const groundRadius = sphere.haversineDistance(
      ol.proj.transform(this.center, "EPSG:3857", "EPSG:4326"),
      ol.proj.transform(edgeCoordinate, "EPSG:3857", "EPSG:4326")
    );

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.transform(
                [parseFloat(lng), parseFloat(lat)],
                "EPSG:4326",
                "EPSG:3857"
              )
            ),
            id: index,
          }),
          new ol.Feature(
            new ol.geom.Circle(
              ol.proj.transform(
                [
                  parseFloat(this.locationData[0].longitude),
                  parseFloat(this.locationData[0].latitude),
                ],
                "EPSG:4326",
                "EPSG:3857"
              ),
              groundRadius
            )
          ),
        ],
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.6, 0.6],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          src: this.ip + "/images/" + index + ".png",
        }),
        stroke: new ol.style.Stroke({
          color: "red",
          width: 3,
        }),
        fill: new ol.style.Fill({
          color: "rgba(255, 0, 0, 0.1)",
        }),
      }),
    });
    this.map.addLayer(vectorLayer);
    // this.setPopUp(this.map, popUpInfo);
  }

  setPopUp(map) {
    const locations = this.locationData;
    map.on('singleclick', function (event) {
      const container = document.getElementById('popup');
      const content = document.getElementById('popup-content');
      const closer = document.getElementById('popup-closer');
      const overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      map.addOverlay(overlay);

      closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
      if (map.hasFeatureAtPixel(event.pixel) === true) {
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
          if (feature.get('id')) {
            const coordinate = event.coordinate;
            content.innerHTML =
              '<b>Visit Date: </b>' +
              locations[feature.get('id') - 1].visit_datetime;
            overlay.setPosition(coordinate);
          }
        });
      } else {
        overlay.setPosition(undefined);
        closer.blur();
      }
    });
  }
}