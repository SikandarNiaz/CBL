import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DashboardService } from "../layout/dashboard/dashboard.service";
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";
import { HttpErrorResponse } from "@angular/common/http";
import { config } from "src/assets/config";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  background_color = config.login_theme_color;
  login_logo = config.login_logo;
  loginForm: any = {
    userName: "",
    password: "",
    angularRequest: "Y",
  };
  loading = false;
  constructor(
    private router: Router,
    private httpService: DashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    localStorage.clear();
  }

  onLogin(loginForm: any) {
    this.loading = true;
    // console.log(loginForm);

    this.httpService.login(loginForm).subscribe(
      (data: Response) => {
        const res: any = data;
        // console.log('data', data.headers);
        // this.toastr.success(res, 'Login Status');
        localStorage.setItem("isLoggedin", "true");
        localStorage.setItem("today", moment(new Date()).format("YYYY-MM-DD"));
        localStorage.setItem("user_id", res.user.user_id);
        localStorage.setItem("user_type", res.user.typeID);
        localStorage.setItem("user_name", res.user.userName);
        localStorage.setItem("menu", JSON.stringify(res.list));
        localStorage.setItem("regionId", res.user.regionIds);
        localStorage.setItem("zoneId", res.user.zoneIds);
        localStorage.setItem("Reevaluator", res.ReEvaluator);
        localStorage.setItem("Evaluator", res.Evaluator);
        localStorage.setItem(
          "labelProperties",
          JSON.stringify(res.labelProperties)
        );
        // tslint:disable-next-line:triple-equals
        if (
          (res.user.typeID ==
            res.Evaluator || res.user.typeID == res.ReEvaluator)
        ) {
          this.router.navigate(["/dashboard/merchandiser_List"]);
        } else {
          this.router.navigate(["/dashboard"]);
        }

        setTimeout(() => {
          this.loading = false;
        }, 30000);
      },
      (error: any) => {
        debugger;
        if (!error.error.description) {
          this.toastr.error(error.message, "Login Status");
        } else {
          this.toastr.error(error.error.description, "Login Status");
        }

        console.log("error", error);
        this.loading = false;
      }
    );
  }
}
