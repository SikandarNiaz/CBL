import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DashboardService } from "../dashboard.service";
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";

@Component({
  selector: "app-row-data",
  templateUrl: "./raw-data.component.html",
  styleUrls: ["./raw-data.component.scss"],
})
export class RawDataComponent implements OnInit {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  startDate = new Date();
  endDate = new Date();
  queryList: any = [];
  selectedQuery: any = {};
  loadingData: boolean;
  loadingReportMessage = false;
  p: any = {};
  reportId = -1;
  title = "";
  selectedReportUrl = "";
  clusterList: any = [];
  zones: any = [];
  regions: any = [];
  selectedZone: any = {};
  selectedRegion: any = {};
  selectedCluster: any = {};
  clusterId: any;
  labels: any;
  projectType: any;
  queryParams: any = [];
  areaList: any = [];
  selectedArea: any = {};
  isDashboardDataRequest: boolean = true;
  areas: any = [];

  constructor(
    private activatedRoutes: ActivatedRoute,
    private httpService: DashboardService,
    public router: Router,
    private toastr: ToastrService
  ) {
    this.clusterList = JSON.parse(localStorage.getItem("clusterList"));
    this.zones = JSON.parse(localStorage.getItem("zoneList"));
    this.projectType = localStorage.getItem("projectType");
    this.labels = JSON.parse(localStorage.getItem("labelProperties"));
  }

  ngOnInit() {
    this.activatedRoutes.params.subscribe((params) => {
      if (params.reportId) {
        this.reportId = params.reportId;
        this.isDashboardDataRequest = false;
      }
      this.getQueryTypeList(this.reportId);
    });
  }

  async getZone() {
    const data: any = await this.httpService.getZone().toPromise();
    if (data.zoneList) {
      this.zones = data.zoneList;
    }
  }

  async zoneChange() {
    if (this.selectedQuery.region == "Y") {
      this.loadingData = true;
      this.selectedRegion = {};
      const data: any = await this.httpService
        .getRegion(this.selectedZone.id || -1)
        .toPromise();
      if (data) {
        this.regions = data;
        console.log(this.regions);
      }
      this.clearLoading();
    }
  }

  async regionChange() {
    if (this.selectedQuery.area == "Y") {
      this.loadingData = true;
      this.selectedArea = {};
      const data: any = await this.httpService
        .getAreaByRegion(this.selectedRegion.id || -1)
        .toPromise();
      if (data) {
        this.areaList = data;
      }
      this.clearLoading();
    }
  }
  getQueryTypeList(reportId: number) {
    this.loadingData = true;
    this.httpService.getQueryTypeList(-1).subscribe(
      (data) => {
        console.log("qurry list", data);
        if (data) {
          this.queryList = data;

          this.loadQuery(reportId);
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

  async getDashboardData() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      // tslint:disable-next-line:triple-equals
      const obj = {
        queryId: this.selectedQuery.id,
        clusterId:
          this.selectedQuery.cluster == "Y"
            ? this.selectedCluster.id
              ? this.selectedCluster.id == -1
                ? localStorage.getItem("clusterId")
                : this.selectedCluster.id
              : localStorage.getItem("clusterId")
            : null,
        zoneId:
          this.selectedQuery.zone == "Y"
            ? this.selectedZone.id
              ? this.selectedZone.id == -1
                ? localStorage.getItem("zoneId")
                : this.selectedZone.id
              : localStorage.getItem("zoneId")
            : null,
        regionId:
          this.selectedQuery.region == "Y"
            ? this.selectedRegion.id
              ? this.selectedRegion.id == -1
                ? localStorage.getItem("regionId")
                : this.selectedRegion.id
              : localStorage.getItem("regionId")
            : null,
        areaId:
          this.selectedQuery.area == "Y"
            ? this.selectedArea.id
              ? this.selectedArea.id == -1
                ? localStorage.getItem("areaId")
                : this.selectedArea.id
              : localStorage.getItem("areaId")
            : null,
        startDate:
          this.selectedQuery.date == "Y"
            ? moment(this.startDate).format("YYYY-MM-DD")
            : null,
        endDate:
          this.selectedQuery.date == "Y"
            ? moment(this.endDate).format("YYYY-MM-DD")
            : null,
      };

      const url = "dashboard-data";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: res.fileType,
            };
            // tslint:disable-next-line:triple-equals
            if (this.selectedQuery.type == 1) {
              this.selectedReportUrl = "downloadcsvReport";
            } else {
              this.selectedReportUrl = "downloadReport";
            }

            this.getproductivityDownload(obj2, this.selectedReportUrl);
          } else {
            this.clearLoading();

            this.toastr.info(
              "Something went wrong,Please retry",
              "Connectivity Message"
            );
          }
        },
        (error) => {
          this.clearLoading();
        }
      );
    } else {
      this.clearLoading();
      this.toastr.info(
        "End date must be greater than start date",
        "Date Selection"
      );
    }
  }

  getproductivityDownload(obj: { key: any; fileType: any }, url: string) {
    const u = url;
    this.httpService.DownloadResource(obj, u);
    setTimeout(() => {
      this.loadingData = false;
      this.loadingReportMessage = false;
      this.httpService.updatedDownloadStatus(false);
    }, 1000);
  }

  clearLoading() {
    this.loadingData = false;
    this.loadingReportMessage = false;
  }

  getZoneByCluster() {
    if (this.selectedQuery.zone == "Y") {
      this.loadingData = true;
      this.selectedZone = {};
      this.selectedRegion = {};
      this.httpService
        .getZoneByCluster(this.selectedCluster.id || -1)
        .subscribe(
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
  }

  async zoneCheck() {
    const zoneId = this.selectedZone.id
      ? this.selectedZone.id == -1
        ? localStorage.getItem("zoneId")
        : this.selectedZone.id
      : localStorage.getItem("zoneId");
    let zoneArray: any = [];
    if (zoneId == -1 && this.selectedQuery.zone == "Y") {
      if (this.zones.length == 0) {
        await this.getZone();
      }
      this.zones.forEach((e: { id: number }) => {
        if (e.id != -1) {
          zoneArray.push(e.id);
        }
      });
      zoneArray = zoneArray.join();
      return zoneArray;
    }
    return zoneId;
  }
  async regionCheck() {
    const regionId = this.selectedRegion.id
      ? this.selectedRegion.id == -1
        ? localStorage.getItem("regionId")
        : this.selectedRegion.id
      : localStorage.getItem("regionId");
    let regionArray: any = [];
    if (regionId == -1 && this.selectedQuery.region == "Y") {
      if (this.regions.length == 0) {
        await this.zoneChange();
      }
      this.regions.forEach((e: { id: number }) => {
        console.log(e.id);
        if (e.id != -1) {
          regionArray.push(e.id);
        }
      });
      regionArray = regionArray.join();
      return regionArray;
    }
    return regionId;
  }

  async areaCheck() {
    const areaId = this.selectedArea.id
      ? this.selectedArea.id == -1
        ? localStorage.getItem("areaId")
        : this.selectedArea.id
      : localStorage.getItem("areaId");
    let areaArray: any = [];
    if (areaId == -1 && this.selectedQuery.area == "Y") {
      if (this.areaList.length == 0) {
        await this.regionChange();
      }
      this.areaList.forEach((e: { id: number }) => {
        if (e.id != -1) {
          areaArray.push(e.id);
        }
      });
      areaArray = areaArray.join();
      return areaArray;
    }
    return areaId;
  }
  loadQuery(reportId: number) {
    if (reportId > -1) {
      for (const element of this.queryList) {
        if (element.id == reportId) {
          this.selectedQuery = element;
          this.title = this.selectedQuery.title;
          break;
        }
      }
      this.queryList = [];
      this.queryList.push(this.selectedQuery);
    } else {
      this.title = "Raw Data";
    }
    this.selectedQuery = this.queryList[0];
  }

  clusterCheck() {
    const clusterId = this.selectedCluster.id
      ? this.selectedCluster.id == -1
        ? localStorage.getItem("clusterId")
        : this.selectedCluster.id
      : localStorage.getItem("clusterId");
    let clusterArray: any = [];
    if (clusterId == -1 && this.selectedQuery.cluster == "Y") {
      this.clusterList.forEach((e: { id: number }) => {
        if (e.id != -1) {
          clusterArray.push(e.id);
        }
      });
      clusterArray = clusterArray.join();
      return clusterArray;
    }
    return clusterId;
  }
}
