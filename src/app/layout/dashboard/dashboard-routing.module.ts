import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { AuthGuard } from "src/app/shared/guard";
import { DashboardGuard } from "./dashboard.guard";
import { HomeComponent } from "./innerComponents/home/home.component";
import { ShopListComponent } from "./innerComponents/shop-list/shop-list.component";
import { SummaryComponent } from "./innerComponents/summary/summary.component";
import { ProductivityComponent } from "./innerComponents/productivity/productivity.component";
import { DetailsComponent } from "./innerComponents/details/details.component";
import { DailyVisitReportComponent } from "./innerComponents/daily-visit-report/daily-visit-report.component";
import { pathToFileURL } from "url";
import { ShopDetailComponent } from "./innerComponents/shop-detail/shop-detail.component";
import { MslDashboardComponent } from "./innerComponents/msl-dashboard/msl-dashboard.component";
import { ProductivityDashboardComponent } from "./innerComponents/productivity-dashboard/productivity-dashboard.component";
import { TposmDeploymentReportComponent } from "./innerComponents/tposm-deployment-report/tposm-deployment-report.component";
import { UpdatePasswordComponent } from "./user/update-password/update-password.component";
import { RawDataComponent } from "./raw-data/raw-data.component";
import { DataAvailabilityComponent } from "./data-availability/data-availability.component";
import { MerchandiserListComponent } from "./innerComponents/merchandiser-list/merchandiser-list.component";
import { AbnormalityComponent } from "./innerComponents/abnormality/abnormality.component";
import { TimeAnalysisReportComponent } from "./innerComponents/time-analysis-report/time-analysis-report.component";
import { MerchandiserAttendanceComponent } from "./innerComponents/merchandiser-attendance/merchandiser-attendance.component";
import { DailyEvaluationReportComponent } from "./innerComponents/daily-evaluation-report/daily-evaluation-report.component";
import { EmailManagerComponent } from "./innerComponents/email-manager/email-manager.component";
import { UploadRoutesComponent } from "./innerComponents/upload-routes/upload-routes.component";
import { SingleRouteDetailComponent } from "./innerComponents/upload-routes/routes-inner-pages/single-route-detail/single-route-detail.component";
import { ShopsForSingleRouteComponent } from "./innerComponents/upload-routes/routes-inner-pages/shops-for-single-route/shops-for-single-route.component";
import { AddDeviceComponent } from "./innerComponents/add-device/add-device.component";
import { SupervisorWwwrSummaryComponent } from "./innerComponents/supervisor-wwwr-summary/supervisor-wwwr-summary.component";
import { ShopListReportComponent } from "./innerComponents/shop-list-report/shop-list-report.component";
import { MerchandiserRosterComponent } from "./innerComponents/merchandiser-roster/merchandiser-roster.component";
import { UniqueBasedProductivityReportComponent } from "./innerComponents/unique-based-productivity-report/unique-based-productivity-report.component";
import { VoErrorReportComponent } from "./innerComponents/vo-error-report/vo-error-report.component";
import { MerchandiserWiseScoreComponent } from "./innerComponents/merchandiser-wise-score/merchandiser-wise-score.component";
import { MerchandiserScoreComponent } from "./innerComponents/merchandiser-score/merchandiser-score.component";
import { SupervisorProductivityComponent } from "./innerComponents/supervisor-productivity/supervisor-productivity.component";
import { MerchandiserPlannedCallsComponent } from "./innerComponents/merchandiser-planned-calls/merchandiser-planned-calls.component";
import { DistributionCheckInCardComponent } from "./innerComponents/distribution-check-in-card/distribution-check-in-card.component";
import { UploadHurdleRateComponent } from "./innerComponents/upload-hurdle-rate/upload-hurdle-rate.component";
import { TableauHelperComponent } from "./innerComponents/tableau-helper/tableau-helper.component";

const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    canActivate: [DashboardGuard],
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "home", component: HomeComponent },
      { path: "daily_visit_report", component: DailyVisitReportComponent },
      { path: "oos_details_report", component: DetailsComponent },
      { path: "shop_list_report", component: ShopListComponent },
      { path: "summary_report", component: SummaryComponent },
      { path: "productivity_report", component: ProductivityComponent },
      { path: "msl_dashboard", component: MslDashboardComponent },
      {
        path: "tableau",
        component: TableauHelperComponent,
      },
      {
        path: "productivity_dashboard",
        component: ProductivityDashboardComponent,
      },
      {
        path: "tposm_deployment_report",
        component: TposmDeploymentReportComponent,
      },
      {
        path: "daily_evaluation_report",
        component: DailyEvaluationReportComponent,
      },
      { path: "update_password", component: UpdatePasswordComponent },
      { path: "raw_data", component: RawDataComponent },
      { path: "raw_data/:reportId", component: RawDataComponent },
      { path: "brand_sku_oos", component: DataAvailabilityComponent },
      {
        path: "supervisor_wwwr_summary",
        component: SupervisorWwwrSummaryComponent,
      },
      { path: "data_abnormality_report", component: AbnormalityComponent },
      { path: "time-analysis-report", component: TimeAnalysisReportComponent },
      { path: "shop-list-report", component: ShopListReportComponent },
      { path: "merchandiser_List", component: MerchandiserListComponent },
      { path: "upload_hurdle_rates", component: UploadHurdleRateComponent },
      {
        path: "merchandiser_attendance",
        component: MerchandiserAttendanceComponent,
      },
      { path: "sms_manager", component: EmailManagerComponent },
      { path: "upload_routes/route_list", component: UploadRoutesComponent },
      {
        path: "upload_routes/single_route_details",
        component: SingleRouteDetailComponent,
      },
      {
        path: "upload_routes/shops_for_single_route",
        component: ShopsForSingleRouteComponent,
      },
      { path: "add_device", component: AddDeviceComponent },
      { path: "merchandiser_roster", component: MerchandiserRosterComponent },
      {
        path: "capturedAbnormalUnvisited",
        component: UniqueBasedProductivityReportComponent,
      },
      { path: "vo_error_report", component: VoErrorReportComponent },
      { path: "merchandiser_score", component: MerchandiserScoreComponent },
      {
        path: "merchandiser_wise_score",
        component: MerchandiserWiseScoreComponent,
      },
      {
        path: "supervisor_productivity",
        component: SupervisorProductivityComponent,
      },
      {
        path: "merchandiser_score/:surveyorId/:startDate/:endDate",
        component: MerchandiserScoreComponent,
      },
      {
        path: "merchandiser-planned-calls",
        component: MerchandiserPlannedCallsComponent,
      },
      {
        path: "distribution-check-in",
        component: DistributionCheckInCardComponent,
      },
    ],
  },
  // { path: 'shop_detail/:id', component: ShopDetailComponent },
  { path: "shop_detail/:id", component: ShopDetailComponent },

  {
    path: "evaluation",
    loadChildren: "./evaluation/evaluation.module#EvaluationModule",
  },
  {
    path: "instogram",
    loadChildren: "./instotracker/instotracker.module#InstotrackerModule",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
