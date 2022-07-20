import { Component, OnInit, ViewChild, Input } from "@angular/core";
import * as moment from "moment";
import { DashboardService } from "../../dashboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { config } from "src/assets/config";
import { NgModel } from "@angular/forms";

@Component({
  selector: "app-distribution-check-in-card",
  templateUrl: "./distribution-check-in-card.component.html",
  styleUrls: ["./distribution-check-in-card.component.scss"],
})
export class DistributionCheckInCardComponent implements OnInit {
  // ip = environment.ip;

  ip: any = config.ip;
  tableData: any = [];
  zones: any = [];
  regions: any = [];
  selectedItem: any = {};
  loadingData: boolean;
  selectedZone: any = {};
  selectedRegion: any = {};
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  startDate = new Date();
  endDate = new Date();
  title = "";
  @ViewChild("childModal") childModal: ModalDirective;
  userType: any;
  clusterList: any = [];
  selectedCluster: any = {};

  surveyors: any = [];
  selectedSurveyor: any = [];

  labels: any;
  isExternalUrl: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private httpService: DashboardService,
    private activeRoute: ActivatedRoute
  ) {
    this.zones = JSON.parse(localStorage.getItem("zoneList"));
    this.clusterList = JSON.parse(localStorage.getItem("clusterList"));
    this.userType = localStorage.getItem("user_type");
    this.labels = JSON.parse(localStorage.getItem("labelProperties"));
    this.title = this.labels.surveyorLabel + " Check In";
  }

  showChildModal(): void {
    this.childModal.show();
  }
  hideChildModal(): void {
    this.childModal.hide();
  }

  setSelectedItem(item) {
    this.selectedItem = item;
  }

  ngOnInit() {}

  getDistributionCheckinData() {
    this.loadingData = true;
    const obj = {
      zoneId: this.selectedZone.id
        ? this.selectedZone.id == -1
          ? localStorage.getItem("zoneId")
          : this.selectedZone.id
        : localStorage.getItem("zoneId"),
      regionId: this.selectedRegion.id
        ? this.selectedRegion.id == -1
          ? localStorage.getItem("regionId")
          : this.selectedRegion.id
        : localStorage.getItem("regionId"),
      startDate: moment(this.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.endDate).format("YYYY-MM-DD"),
      surveyorIds: this.arrayMaker(this.selectedSurveyor),
    };

    this.httpService.getDistributionCheckInList(obj).subscribe(
      (data) => {
        this.tableData = data;
        this.setImageUrl();
        if (this.tableData.length === 0) {
          this.toastr.info("No record found.");
        }
        this.loadingData = false;
      },
      (error) => {}
    );
  }

  goToNewPage(item) {
    window.open(
      `${environment.hash}dashboard/evaluation/list/home?surveyorId=${item.surveyorId}&startDate=${item.date}&endDate=${item.date}&userType=${this.userType}`,
      "_blank"
    );
  }

  zoneChange() {
    this.loadingData = true;
    this.httpService.getRegion(this.selectedZone.id).subscribe(
      (data) => {
        const res: any = data;
        if (res) {
          this.regions = res;
        } else {
          this.loadingData = false;
          this.toastr.info("No Data Found", "Connectivity Message");
        }
        this.loadingData = false;
      },
      (error) => {
        this.toastr.error(
          "Something went wrong,Please retry",
          "Connectivity Message"
        );
        this.loadingData = false;
      }
    );
  }

  arrayMaker(arr) {
    const all = arr.filter((a) => a === "all");
    const result: any = [];
    if (all[0] === "all") {
      arr = this.surveyors.filter(
        (surveyor: any) => surveyor.type == 1 && surveyor.active == "Y"
      );
    }
    arr.forEach((e) => {
      result.push(e.id);
    });
    return result;
  }

  selectAll(select: NgModel, values) {
    select.update.emit(values);
  }

  deselectAll(select: NgModel) {
    select.update.emit([]);
  }

  equals(objOne, objTwo) {
    if (typeof objOne !== "undefined" && typeof objTwo !== "undefined") {
      return objOne.id === objTwo.id;
    }
  }
  loadSurveyors() {
    this.loadingData = true;
    this.httpService
      .getSurveyors(
        -1,
        this.selectedZone.id || -1,
        this.selectedRegion.id || -1
      )
      .subscribe(
        (data) => {
          const res: any = data;
          if (res) {
            this.surveyors = res;
          }
          if (!res) {
            this.toastr.info("No data Found", "Info");
          }
          this.loadingData = false;
        },
        (error) => {
          this.loadingData = false;
          error.status === 0
            ? this.toastr.error("Please check Internet Connection", "Error")
            : this.toastr.error(error.description, "Error");
        }
      );
  }

  getZoneByCluster() {
    this.loadingData = true;
    this.selectedZone = {};
    this.selectedRegion = {};
    this.httpService.getZoneByCluster(this.selectedCluster.id || -1).subscribe(
      (data) => {
        const res: any = data;
        if (res) {
          this.zones = res;
        }
        this.loadingData = false;
      },
      (error) => {
        error.status === 0
          ? this.toastr.error("Please check Internet Connection", "Error")
          : this.toastr.error(error.description, "Error");
        this.loadingData = false;
      }
    );
  }
  setImageUrl() {
    for (const element of this.tableData) {
      if (element.imageUrl.indexOf("http") >= 0) {
        this.isExternalUrl = true;
        return;
      }
    }
  }
}
