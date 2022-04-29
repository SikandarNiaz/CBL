import {
  Component,
  OnInit,
  AfterViewChecked,
  Input,
  ViewChild,
} from "@angular/core";
import { DashboardService } from "../../dashboard.service";
import * as moment from "moment";
import { subscribeOn } from "rxjs/operators";
import { Router } from "@angular/router";
import { DashboardDataService } from "../../dashboard-data.service";
import { ToastrService } from "ngx-toastr";
import { MatTableDataSource } from "@angular/material";
import { environment } from "src/environments/environment";
import { NgModel } from "@angular/forms";
import { ModalDirective } from "ngx-bootstrap";
import * as _ from "lodash";
import { config } from "src/assets/config";

@Component({
  selector: "filter-bar",
  templateUrl: "./filter-bar.component.html",
  styleUrls: ["./filter-bar.component.scss"],
})
export class FilterBarComponent implements OnInit {
  //#endregion

  constructor(
    private toastr: ToastrService,
    private httpService: DashboardService,
    public router: Router,
    private dataService: DashboardDataService
  ) {
    this.zones = JSON.parse(localStorage.getItem("zoneList"));
    this.categoryList = JSON.parse(localStorage.getItem("assetList"));
    this.channels = JSON.parse(localStorage.getItem("channelList"));

    console.log(this.categoryList);
    this.sortIt("completed");
  }
  tableData: any = [];
  // ip = environment.ip;
  configFile = config;

  ip: any = this.configFile.ip;

  distributionList: any = [];
  selectedDistribution: any = {};
  storeType: any = ["Elite", "Platinum", "Gold", "Silver", "Others"];
  selectedStoreType = null;
  //#region veriables
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  @Input() title;
  zones: any = [];
  loadingData: boolean;
  regions: any = [];
  channels: any = [];

  selectedZone: any = {};
  selectedRegion: any = {};
  selectedChannel: any = [];
  startDate = new Date();
  endDate = new Date();
  areas: any = [];
  selectedArea: any = {};
  lastVisit: any = [];
  selectedLastVisit = 1;
  mustHave: any = [];
  mustHaveAll: any = [];
  selectedMustHave = false;
  selectedMustHaveAll = "";
  merchandiserList: any = [];
  selectedMerchandiser: any = {};
  clickedOnce = 1;
  categoryList: any = [];
  selectedCategory: any = {};
  cities: any = [];
  selectedCity: any = {};
  productsList: any = [];
  selectedProduct: any = [];
  selectedImpactType: any = {};
  impactTypeList: any = [];
  selectedOption = 0;

  queryList: any = [];
  selectedQuery: any = {};

  loadingReportMessage = false;
  tabsData: any = [];
  loading = true;
  sortOrder = true;
  sortBy: "completed";
  selectedRemark = 0;
  remarksList = [];
  options: any = [
    { title: "By Visit Date", value: "1" },
    { title: "By Evaluation Date", value: "2" },
  ];

  // @ViewChild('remarksModal') remarksModal: ModalDirective;
  // showRemarksModal(){this.remarksModal.show(); }
  // hideRemarksModal(){
  //   // removePlanedCall(item)
  //   this.remarksModal.hide();
  //     }

  applyFilter(filterValue: string) {
    this.tableData = this.tableData.filter((f) => f.shop_title);
    console.log(this.tableData, "table data filter");
  }

  sortIt(key) {
    this.sortBy = key;
    this.sortOrder = !this.sortOrder;
  }

  getArrowType(key) {
    if (key === this.sortBy) {
      return this.sortOrder ? "arrow_upward" : "arrow_downward";
    } else {
      return "";
    }
  }
  clearAllSections() {
    this.selectedZone = {};
    this.selectedRegion = {};
    this.selectedArea = {};
    this.selectedCategory = {};
    this.selectedChannel = [];
    this.selectedProduct = [];
    this.selectedCity = {};
    this.selectedDistribution = {};
    this.distributionList = [];
    this.startDate = new Date();
    this.endDate = new Date();
  }
  ngOnInit() {
    this.httpService.checkDate();
    console.log("router", this.router.url);
    this.lastVisit = this.dataService.getLastVisit();
    this.mustHave = this.dataService.getYesNo();
    this.mustHaveAll = this.dataService.getYesNoAll();
    // this.httpService.getZone();
    this.impactTypeList = this.dataService.getImpactType();
    if (this.router.url !== "/dashboard/raw_data") {
      this.getZone();
    }

    if (
      this.router.url === "/dashboard/productivity_report" ||
      this.router.url === "/dashboard/merchandiser_attendance"
    ) {
      this.getTabsData();
    }

    if (this.router.url === "/dashboard/raw_data") {
      this.getQueryTypeList();
    }
  }

  getQueryTypeList() {
    this.httpService.getQueryTypeList(-1).subscribe(
      (data) => {
        console.log("qurry list", data);
        if (data) {
          this.queryList = data;
        }
      },
      (error) => {
        error.status === 0
          ? this.toastr.error("Please check Internet Connection", "Error")
          : this.toastr.error(error.description, "Error");
      }
    );
  }

  getAbnormalityReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
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
        channelId: this.arrayMaker(this.selectedChannel),
        cityId: this.selectedCity.id || -1,
        areaId: this.selectedArea.id || -1,
      };

      const url = "abnormalityShopList";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "query list");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: res.fileType,
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
          } else {
            this.clearLoading();

            this.toastr.info(
              "Something went wrong,Please retry",
              "AbnormalityReport Message"
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
        "Something went wrong,Please retry",
        "dashboard Data Availability Message"
      );
    }
  }

  getBrandSKUOOS() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
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
        channelId: this.arrayMaker(this.selectedChannel),
        cityId: this.selectedCity.id || -1,
        areaId: this.selectedArea.id || -1,
        mustHaveAll: this.selectedMustHaveAll || "",
      };

      const url = "brandSKUOOS";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "query list");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: res.fileType,
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
          } else {
            this.clearLoading();

            this.toastr.info(
              "Something went wrong,Please retry",
              "dashboard Data Availability Message"
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
        "Something went wrong,Please retry",
        "dashboard Data Availability Message"
      );
    }
  }

  getDashboardData() {
    this.loadingData = true;
    this.loadingReportMessage = true;
    const obj = {
      queryId: this.selectedQuery.id,
      zoneId: this.selectedZone.id || -1,
      regionId: this.selectedRegion.id || -1,
      cityId: this.selectedCity.id || -1,
      areaId: this.selectedArea.id || -1,
      startDate: moment(this.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
          const url =
            this.selectedQuery.type == 1
              ? "downloadcsvReport"
              : "downloadReport";

          this.getproductivityDownload(obj2, url);
        } else {
          this.clearLoading();

          this.toastr.info(
            "Something went wrong, please retry",
            "Connectivity Message"
          );
        }
      },
      (error) => {
        this.clearLoading();
      }
    );
  }

  //#region filters logic

  getZone() {
    this.httpService.getZone().subscribe(
      (data) => {
        const res: any = data;
        if (res.zoneList) {
          localStorage.setItem("zoneList", JSON.stringify(res.zoneList));
          localStorage.setItem("assetList", JSON.stringify(res.assetList));
          localStorage.setItem("channelList", JSON.stringify(res.channelList));
        }
      },
      (error) => {
        this.clearLoading();

        error.status === 0
          ? this.toastr.error("Please check Internet Connection", "Error")
          : this.toastr.error(error.description, "Error");
      }
    );
  }

  zoneChange() {
    this.loadingData = true;
    // this.regions = [];
    // this.channels = [];
    if (
      this.router.url === "/dashboard/productivity_report" ||
      this.router.url === "/dashboard/merchandiser_attendance"
    ) {
      this.getTabsData();
    }
    if (this.router.url === "/dashboard/supervisor_productivity") {
      this.getSupTabsData();
    }

    this.httpService.getRegion(this.selectedZone.id).subscribe(
      (data) => {
        const res: any = data;
        if (res) {
          this.regions = res;
        } else {
          this.clearLoading();

          this.toastr.info(
            "Something went wrong,Please retry",
            "Connectivity Message"
          );
        }

        setTimeout(() => {
          this.loadingData = false;
        }, 500);
      },
      (error) => {
        this.clearLoading();
      }
    );
  }

  regionChange() {
    this.selectedArea = {};
    this.selectedCity = {};
    this.selectedDistribution = {};
    if (this.router.url === "/dashboard/daily_visit_report") {
      this.getMerchandiserList(this.startDate);
    }

    if (
      this.router.url === "/dashboard/productivity_report" ||
      this.router.url === "/dashboard/merchandiser_attendance"
    ) {
      this.getTabsData();
    }
    if (this.router.url === "/dashboard/supervisor_productivity") {
      this.getSupTabsData();
    }
    if (this.router.url !== "/dashboard/daily_visit_report") {
      this.loadingData = true;

      console.log("regions id", this.selectedRegion);
      this.httpService.getCities(this.selectedRegion.id).subscribe(
        (data) => {
          // this.channels = data[0];
          const res: any = data;
          if (res) {
            this.areas = res.areaList;
            this.cities = res.cityList;
            this.distributionList = res.distributionList;
          } else {
            this.clearLoading();
            this.toastr.info(
              "Something went wrong,Please retry",
              "Connectivity Message"
            );
          }

          setTimeout(() => {
            this.loadingData = false;
          }, 500);
        },
        (error) => {
          this.clearLoading();
        }
      );
    }
    if (this.router.url === "/dashboard/daily_visit_report") {
      this.getMerchandiserList(this.startDate);
    }
  }

  categoryChange() {
    // this.loadingData = true;
    // this.httpService.getProducts(this.selectedCategory.id).subscribe(
    //   data => {
    //     this.productsList = data;
    //     setTimeout(() => {
    //       this.loadingData = false;
    //     }, 500);
    //   },
    //   error => {
    // this.clearLoading()
    //  }
    // );
  }

  cityChange() {
    // this.httpService.getAreas(this.selectedChannel).subscribe(
    //   data => {
    //     this.areas = data;
    //     // this.filterAllData();
    //   },
    //   error => {
    // this.clearLoading()
    // }
    // );
  }

  chanelChange() {
    // console.log('seelcted chanel', this.selectedChannel);
    // this.httpService.getAreas(this.selectedChannel).subscribe(
    //   data => {
    //     this.areas = data;
    //     // this.filterAllData();
    //   },
    //   error => {
    // this.clearLoading()
    // }
    // );
  }
  //#endregion
  tposmDeploymentReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
        // channelId: this.arrayMaker(this.selectedChannel),
      };

      const url = "tposmDeploymentTracker";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "oos shoplist");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

  dailyEvaluationRport() {
    if (this.endDate >= this.startDate && this.selectedOption !== 0) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
        type: this.selectedOption,
        // channelId: this.arrayMaker(this.selectedChannel),
      };

      const url = "evaluation-report";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "evaluation data");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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
      this.toastr.info("Plz Enter a Valid Date and Type", "Required Fields");
    }
  }

  timeAnalysisReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
        // channelId: this.arrayMaker(this.selectedChannel),
      };

      const url = "time-analysis";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "oos shoplist");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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
        "Enter a valid Date and Type",
        "Required Fields Selected"
      );
    }
  }

  shopListReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
        // channelId: this.arrayMaker(this.selectedChannel),
      };

      const url = "shop-list-report";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "oos shoplist");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

  getOOSDetailReport() {
    if (this.endDate >= this.startDate) {
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
        channelId: this.selectedChannel.id || -1,
        areaId: "",
        distId: "",
        actionType: "1",
        pageType: "8",
      };
      const url = "oosDetail";

      this.httpService.DownloadResource(obj, url);
    } else {
      this.clearLoading();

      this.toastr.info(
        "End date must be greater than start date",
        "Date Selection"
      );
    }
  }
  clearLoading() {
    this.loading = false;
    this.loadingData = false;
    this.loadingReportMessage = false;
  }

  getMerchandiserList(event?) {
    console.log(event);
    this.clickedOnce = 1;
    if (event) {
      this.startDate = event;
    }

    this.merchandiserList = [];
    if (!this.selectedZone.id || !this.selectedRegion.id) {
      // console.log(this.selectedZone.id,this.selectedRegion.id)
      this.toastr.info(
        "Please select zone and region to proceed",
        "PDF Download"
      );
    } else {
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
      };
      this.httpService.getMerchandiserList(obj).subscribe(
        (data) => {
          console.log("merchandiser", data);
          const res: any = data;
          if (!res) {
            this.toastr.warning("NO record found", "Merchandiser List");
            this.merchandiserList = [];
          } else if (res.length === 0) {
            this.toastr.info(
              "NO record found,Please try again",
              "Merchandiser List"
            );
          } else {
            this.merchandiserList = res;
          }
        },
        (error) => {
          this.clearLoading();
          error.status === 0
            ? this.toastr.error("Please check Internet Connection", "Error")
            : this.toastr.error(error.description, "Error");
        }
      );
    }
  }

  downloadDailyReport() {
    this.loadingData = true;
    this.loadingReportMessage = true;
    // this.clickedOnce++;

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
      reportType: "",
      surveyorId: this.selectedMerchandiser.id,
      excelDump: "Y",
      mailData: "Y",
      reportLink: "",
    };
    const url = "cbl-pdf";
    this.httpService.DownloadResource(obj, url);

    setTimeout(() => {
      this.loadingData = false;
      this.loadingReportMessage = false;
      // this.clearAllSections()
    }, 1000);
  }

  arrayMaker(arr) {
    const all = arr.filter((a) => a === "all");
    const result: any = [];
    if (all[0] === "all") {
      arr = this.channels;
    }
    arr.forEach((e) => {
      result.push(e.id);
    });
    return result;
  }

  getOOSShopListReport() {
    if (this.endDate >= this.startDate) {
      this.loadingReportMessage = true;
      this.loadingData = true;

      const obj = {
        zoneId: this.selectedZone.id || "",
        regionId: this.selectedRegion.id || "",
        cityId: this.selectedCity.id || "",
        areaId: this.selectedArea.id || "",
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        // category: -1,
        lastVisit: this.selectedLastVisit || 1,
        // productId: -1,
        mustHave: "n",
      };

      const url = "shopwise-ost-report";
      const body = this.httpService.UrlEncodeMaker(obj);
      //  `pageType=2&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&cityId=${obj.cityId}&areaId=${obj.areaId}&channelId=${obj.channelId}&category=${obj.category}&lastVisit=${obj.lastVisit}&productId=${obj.productId}&mustHave=${obj.mustHave}`;

      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "oos shoplist");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

    // let url = 'downloadReport';
    // this.httpService.DownloadResource(obj, url);
  }

  getOOSSummary() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        zoneId: this.selectedZone.id || "",
        regionId: this.selectedRegion.id || "",
        cityId: this.selectedCity.id || "",
        areaId: this.selectedArea.id || "",
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        category: -1,
        productId: -1,
        mustHave: "N",
        chillerAllocated: -1,
        type: 2,
        pageType: 3,
      };

      const encodeURL: any = this.httpService.UrlEncodeMaker(obj);

      const url = "oosSummaryReport";
      const body = encodeURL;
      // `chillerAllocated=${obj.chillerAllocated}&type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&mustHave=${obj.mustHave}&channelId=${obj.channelId}`;
      // encodeURL      //

      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;
          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
          } else {
            this.clearLoading();

            this.toastr.info(
              "Something went wrong,Please retry",
              "Connectivity Message"
            );
          }
          // let obj2 = {
          //   key: res.key,
          //   fileType: 'json.fileType'
          // }
          // let url = 'downloadReport'
          // this.getproductivityDownload(obj2, url)
        },
        (error) => {
          this.clearLoading();

          console.log(error, "summary report");
        }
      );
    } else {
      this.clearLoading();
      this.toastr.info(
        "End date must be greater than start date",
        "Date Selection"
      );
    }

    // let url = 'oosSummaryReport';
    // this.httpService.DownloadResource(obj, url);
  }
  getMSLReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
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
        cityId: this.selectedCity.id || -1,
        areaId: this.selectedArea.id || -1,
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        // category: -1,
        // productId: -1,
        // mustHave: 'N',
        // chillerAllocated: -1,
        // type:2,
        // pageType:1
      };

      const encodeURL: any = this.httpService.UrlEncodeMaker(obj);

      const url = "mslDashboard";
      const body = encodeURL;
      // `chillerAllocated=${obj.chillerAllocated}&type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&mustHave=${obj.mustHave}&channelId=${obj.channelId}`;
      //     //

      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
          } else {
            this.clearLoading();

            this.toastr.info(
              "Something went wrong,Please retry",
              "Connectivity Message"
            );
          }

          // let obj2 = {
          //   key: res.key,
          //   fileType: 'json.fileType'
          // }
          // let url = 'downloadReport'
          // this.getproductivityDownload(obj2, url)
        },
        (error) => {
          this.clearLoading();

          console.log(error, "summary report");
        }
      );
    } else {
      this.clearLoading();

      this.toastr.info(
        "End date must be greater than start date",
        "Date Selection"
      );
    }

    // let url = 'oosSummaryReport';
    // this.httpService.DownloadResource(obj, url);
  }

  getProuctivityDashboardReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
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
        cityId: this.selectedCity.id || -1,
        areaId: this.selectedArea.id || -1,
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        // category: -1,
        // productId: -1,
        // mustHave: 'N',
        // chillerAllocated: -1,
        // type:2,
        // pageType:1
      };

      const encodeURL: any = this.httpService.UrlEncodeMaker(obj);

      const url = "productivityDashboard";
      const body = encodeURL;
      // `chillerAllocated=${obj.chillerAllocated}&type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&mustHave=${obj.mustHave}&channelId=${obj.channelId}`;
      //     //

      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

          console.log(error, "summary report");
        }
      );
    } else {
      this.loading = false;
      this.loadingData = false;
      this.loadingReportMessage = false;
      this.toastr.info(
        "End date must be greater than start date",
        "Date Selection"
      );
    }

    // let url = 'oosSummaryReport';
    // this.httpService.DownloadResource(obj, url);
  }
  MProductivityReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
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
        cityId: this.selectedCity.id || -1,
        distributionId: this.selectedDistribution.id || -1,
        storeType: this.selectedStoreType || null,
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        // totalShops: this.selectedImpactType,
        channelId: -1,
      };
      const url = "productivityreport";
      const body = `type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&distributionId=${obj.distributionId}&cityId=${obj.cityId}&storeType=${obj.storeType}&channelId=${obj.channelId}`;

      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

          console.log(error, "productivity error");
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

  getproductivityDownload(obj, url) {
    const u = url;
    this.httpService.DownloadResource(obj, u);
    setTimeout(() => {
      this.loadingData = false;
      this.loadingReportMessage = false;
      this.httpService.updatedDownloadStatus(false);
    }, 1000);
  }

  getPercentage(n) {
    return Math.round(n) + " %";
  }
  getTabsData(data?: any, dateType?: string) {
    this.loadingData = true;
    let startDate =
      dateType === "start"
        ? moment(data).format("YYYY-MM-DD")
        : moment(this.startDate).format("YYYY-MM-DD");
    let endDate =
      dateType === "end"
        ? moment(data).format("YYYY-MM-DD")
        : moment(this.endDate).format("YYYY-MM-DD");
    // for merchandiser attendance only
    if (this.router.url === "/dashboard/merchandiser_attendance") {
      startDate = moment(this.startDate).format("YYYY-MM-DD");
      endDate = moment(this.startDate).format("YYYY-MM-DD");
    }

    this.loading = true;
    const obj: any = {
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
      startDate: startDate,
      endDate: endDate,
      cityId: this.selectedCity.id || -1,
      distributionId: this.selectedDistribution.id || -1,
      storeType: this.selectedStoreType || null,
      channelId: -1,
      type: 1,
    };
    localStorage.setItem("obj", JSON.stringify(obj));
    this.getTableData(obj);

    this.httpService.getDashboardData(obj).subscribe(
      (data) => {
        // console.log(data, 'home data');
        this.loadingData = false;
        const res: any = data;
        if (res) {
          this.tabsData = data;
        }
        this.loading = false;
        // if (res.planned == 0)
        //   this.toastr.info('No data available for current selection', 'Summary')
      },
      (error) => {
        this.clearLoading();

        console.log(error, "home error");
      }
    );
  }
  getTableData(obj) {
    this.httpService.merchandiserShopList(obj).subscribe(
      (data) => {
        console.log(data, "table data");
        const res: any = data;

        if (res) {
          this.tableData = res;
        }
        this.loading = false;
        // if (res.planned == 0)
        //   this.toastr.info('No data available for current selection', 'Summary')
      },
      (error) => {
        this.clearLoading();

        console.log(error, "home error");
      }
    );
  }
  getSupTabsData(data?: any, dateType?: string) {
    this.loadingData = true;
    let startDate =
      dateType === "start"
        ? moment(data).format("YYYY-MM-DD")
        : moment(this.startDate).format("YYYY-MM-DD");
    let endDate =
      dateType === "end"
        ? moment(data).format("YYYY-MM-DD")
        : moment(this.endDate).format("YYYY-MM-DD");

    this.loading = true;
    const obj: any = {
      zoneId: this.selectedZone.id
        ? this.selectedZone.id
        : localStorage.getItem("zoneId"),
      regionId: this.selectedRegion.id
        ? this.selectedRegion.id
        : localStorage.getItem("regionId"),
      startDate: startDate,
      endDate: endDate,
      cityId: this.selectedCity.id || -1,
      type: 2,
      channelId: -1,
    };
    localStorage.setItem("obj", JSON.stringify(obj));
    this.getSupTableData(obj);

    this.httpService.getDashboardData(obj).subscribe(
      (data) => {
        // console.log(data, 'home data');
        this.loadingData = false;
        const res: any = data;
        if (res) {
          this.tabsData = data;
        }
        this.loading = false;
        // if (res.planned == 0)
        //   this.toastr.info('No data available for current selection', 'Summary')
      },
      (error) => {
        this.clearLoading();

        console.log(error, "home error");
      }
    );
  }
  getSupTableData(obj) {
    this.httpService.merchandiserShopList(obj).subscribe(
      (data) => {
        console.log(data, "table data");
        const res: any = data;

        if (res) {
          this.tableData = res;
        }
        this.loading = false;
        // if (res.planned == 0)
        //   this.toastr.info('No data available for current selection', 'Summary')
      },
      (error) => {
        this.clearLoading();

        console.log(error, "home error");
      }
    );
  }
  // getMerchandiserDetailPage(id){
  //   this.router.navigate
  // }

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

  uniqueBasedReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        zoneId: this.selectedZone.id || -1,
        regionId: this.selectedRegion.id || -1,
      };

      const url = "capturedAbnormalUnvisited";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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
      this.toastr.info("Plz Enter a Valid Date and Type", "Required Fields");
    }
  }

  VOErrorReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
        zoneId: this.selectedZone.id || -1,
        regionId: this.selectedRegion.id || -1,
        environment: environment.hash,
      };

      const url = "vo-error-report";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "Vo Error Data");
          const res: any = data;

          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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

  getAttendanceReport() {
    if (this.endDate >= this.startDate) {
      const obj = {
        startDate: moment(this.startDate).format("YYYY-MM-DD"),
        endDate: moment(this.endDate).format("YYYY-MM-DD"),
      };
      const url = "merchandiser_attendance_report";
      const body = this.httpService.UrlEncodeMaker(obj);
      this.httpService.getKeyForProductivityReport(body, url).subscribe(
        (data) => {
          console.log(data, "attendance");
          const res: any = data;
          if (res) {
            const obj2 = {
              key: res.key,
              fileType: "json.fileType",
            };
            const url = "downloadReport";
            this.getproductivityDownload(obj2, url);
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
}
