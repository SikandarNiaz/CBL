import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../dashboard.service";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-merchandiser-list",
  templateUrl: "./merchandiser-list.component.html",
  styleUrls: ["./merchandiser-list.component.scss"],
})
export class MerchandiserListComponent implements OnInit {
  title = "merchandiser List";
  minDate = new Date(2000, 0, 1);
  maxDate: any = new Date();
  startDate: any = new Date();
  endDate = new Date();
  loadingReportMessage = false;
  selectedEvaluator: any = {};
  evaluatorList: any = [];
  userTypeId: any;
  ReEvaluatorId: any;
  userId: any;
  merchandiserList: any = [];
  loading = true;
  loadingData: boolean;
  cardLoading: boolean;
  evaluationSummary: any;
  p = 1;
  sortOrder = true;
  sortBy: "m_code";
  constructor(
    private httpService: DashboardService,
    private toastr: ToastrService
  ) {
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.startDate.setDate(this.startDate.getDate() - 1);
    this.endDate.setDate(this.endDate.getDate() - 1);
  }

  ngOnInit() {
    this.loadingData = false;
    this.userTypeId = localStorage.getItem("user_type");
    this.ReEvaluatorId = localStorage.getItem("Reevaluator");
    this.loadEvaluationSummary();
    this.getMerchandiserList();
    this.sortIt("m_code");
    this.loadEvaluators();
    this.userId = localStorage.getItem("user_id");
  }

  getArrowType(key) {
    if (key === this.sortBy) {
      return this.sortOrder ? "arrow_upward" : "arrow_downward";
    } else {
      return "";
    }
  }
  sortIt(key) {
    this.sortBy = key;
    this.sortOrder = !this.sortOrder;
  }

  getMerchandiserList() {
    this.loadingData = true;
    const obj = {
      evaluatorId: localStorage.getItem("user_id"),
      selectedEvaluator: this.selectedEvaluator.id || -1,
      userTypeId: this.userTypeId,
      startDate: moment(this.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.endDate).format("YYYY-MM-DD"),
    };

    this.httpService
      .getMerchandiserListForEvaluation(obj)
      .subscribe((data: any) => {
        // console.log('merchandiser list for evaluation',data);
        if (data) {
          this.merchandiserList = data;
          this.loading = false;
          this.loadingData = false;
        }
      });
  }

  modifyDate(date) {
    return moment(date).format("YYYY-MM-DD");
  }

  gotoNewPage(item) {
    window.open(
      `${environment.hash}dashboard/evaluation/list/home?surveyorId=${
        item.id
      }&startDate=${this.modifyDate(this.startDate)}&endDate=${this.modifyDate(
        this.endDate
      )} &userType=${this.userTypeId}`,
      "_blank"
    );
  }

  loadEvaluators() {
    this.httpService.getEvaluatorList().subscribe(
      (data) => {
        if (data) {
          this.evaluatorList = data;
        }
      },
      (error) => {
        error.status === 0
          ? this.toastr.error("Please check Internet Connection", "Error")
          : this.toastr.error(error.description, "Error");
      }
    );
  }

  loadEvaluationSummary() {
    this.cardLoading = true;
    const obj = {
      evaluatorId:
        this.userTypeId == this.ReEvaluatorId
          ? this.selectedEvaluator.id || -1
          : localStorage.getItem("user_id"),
      startDate: moment(this.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.endDate).format("YYYY-MM-DD"),
    };

    this.httpService.getEvaluationSummary(obj).subscribe((data: any) => {
      // console.log('merchandiser list for evaluation',data);
      if (data) {
        this.evaluationSummary = data;
        this.cardLoading = false;
      }
    });
  }
}
