import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap";
import * as moment from "moment";
import { Router } from "@angular/router";
import { DashboardService } from "../../dashboard.service";
import { ToastrService } from "ngx-toastr";
import { ExcelService } from "../../excel.service";
import { ngxCsv } from "ngx-csv/ngx-csv";

@Component({
  selector: "app-merchandiser-attendance",
  templateUrl: "./merchandiser-attendance.component.html",
  styleUrls: ["./merchandiser-attendance.component.scss"],
})
export class MerchandiserAttendanceComponent {
  title = "Merchandiser Attendance";
}
