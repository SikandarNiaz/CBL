import {
  Component,
  OnInit,
  AfterViewChecked,
  Input,
  ViewChild,
} from "@angular/core";
import { DashboardService } from "../../dashboard.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DashboardDataService } from "../../dashboard-data.service";
import { ToastrService } from "ngx-toastr";
import { Location } from "@angular/common";

declare var tableau: any;

@Component({
  selector: "tableau-helper",
  templateUrl: "./tableau-helper.component.html",
  styleUrls: ["./tableau-helper.component.scss"],
})
export class TableauHelperComponent implements OnInit {
  viz: any;
  ticketUrl: string;
  params: any = {};
  @Input() type;
  @Input() cluster;
  zoneId: any;
  regionId: any;
  constructor(
    private toastr: ToastrService,
    private httpService: DashboardService,
    public router: Router,
    private dataService: DashboardDataService,
    public activatedRoute: ActivatedRoute,
    private readonly location: Location
  ) {
    this.zoneId = localStorage.getItem("zoneId") || -1;
    this.regionId = localStorage.getItem("regionId") || -1;
    this.activatedRoute.queryParams.subscribe((p) => {
      this.params = p;
      if (this.params.link) {
        this.location.replaceState("/dashboard/tableau");
        this.getKey();
      }
    });
  }

  ngOnInit(): void {
    if (!this.params.link) {
      this.getKey();
    }
  }
  getKey() {
    console.log("getTableauKey in innerComponents: ");
    console.log("this .params: ", this.params);
    const obj = {
      type: this.type || "",
      userType: localStorage.getItem("user_type"),
    };
    this.httpService.getKey(obj).subscribe((data: any) => {
      if (this.params.link.indexOf("?") >= 0) {
        this.ticketUrl = `${data.TableauData.tableau_url}/${data.ticket}/${this.params.link}zoneId=${this.zoneId}&regionId=${this.regionId}&:iframeSizedToWindow=${data.TableauData.iframe}&:embed=${data.TableauData.embed}&:showAppBanner=${data.TableauData.showAppBanner}&:display_count=${data.TableauData.display_count}&:showVizHome=${data.TableauData.showVizHome}`;
      
      }
       else {
        this.ticketUrl = `${data.TableauData.tableau_url}/${data.ticket}/${this.params.link}&:iframeSizedToWindow=${data.TableauData.iframe}&:embed=${data.TableauData.embed}&:showAppBanner=${data.TableauData.showAppBanner}&:display_count=${data.TableauData.display_count}&:showVizHome=${data.TableauData.showVizHome}`;
     
      }

      // }
      console.log("url: ", this.ticketUrl);
      this.initViz();
    });
  }

  initViz() {
    const containerDiv = document.getElementById("vizContainer"),
      url = this.ticketUrl,
      options = {
        hideTabs: true,
        onFirstInteractive: function () {},
      };
    if (this.viz) {
      this.viz.dispose();
    }

    // both below lines not working
    // this.viz = new tableau2.Viz(containerDiv, url, options);
    // this.viz = new tableau.Viz2(containerDiv, url, options);

    // u need to add script of tableau api in index.html to make this work
    this.viz = new tableau.Viz(containerDiv, url, options);
  }
}
