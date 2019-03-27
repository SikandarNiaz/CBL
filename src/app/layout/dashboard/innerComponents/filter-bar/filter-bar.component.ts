import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import * as moment from 'moment';
import { subscribeOn } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DashboardDataService } from '../../dashboard-data.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
@Component({
  selector: 'filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //#region veriables
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);
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
  selectedLastVisit = 0;
  mustHave: any = [];
  selectedMustHave = false;
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
  loadingReportMessage: boolean = false;
  tabsData: any = [];
  loading = true;
  //#endregion

  constructor(
    private toastr: ToastrService,
    private httpService: DashboardService,
    public router: Router,
    private dataService: DashboardDataService
  ) {
    this.zones = JSON.parse(localStorage.getItem('zoneList'));
    this.categoryList = JSON.parse(localStorage.getItem('assetList'));
    this.channels = JSON.parse(localStorage.getItem('channelList'));

    console.log(this.categoryList);

    this.getZone();

  }

  clearAllSections() {
    this.selectedZone = {};
    this.selectedRegion = {};
    this.selectedArea = {};
    this.selectedCategory = {};
    this.selectedChannel = [];
    this.selectedProduct = [];
    this.selectedCity = {};
    this.startDate = new Date();
    this.endDate = new Date();
  }

  ngOnInit() {
    console.log('router', this.router.url);
    this.lastVisit = this.dataService.getLastVisit();
    this.mustHave = this.dataService.getYesNo();
    this.httpService.getZone();
    this.impactTypeList = this.dataService.getImpactType();
    this.getTabsData()
  }
  //#region filters logic

  getZone() {
    this.httpService.getZone().subscribe(
      data => {
        const res: any = data;
        if (res.zoneList) {
          localStorage.setItem('zoneList', JSON.stringify(res.zoneList));
          localStorage.setItem('assetList', JSON.stringify(res.assetList));
          localStorage.setItem('channelList', JSON.stringify(res.channelList));
        }
      },
      error => {
        error.status === 0 ? this.toastr.error('Please check Internet Connection', 'Error') : this.toastr.error(error.description, 'Error');
      }
    );
  }

  zoneChange() {
    this.loadingData = true;
    // this.regions = [];
    // this.channels = [];
    if (this.router.url === '/dashboard/productivity_report')
      this.getTabsData()

    this.httpService.getRegion(this.selectedZone.id).subscribe(
      data => {
        let res: any = data;
        this.regions = res;
        setTimeout(() => {
          this.loadingData = false;
        }, 500);
      },
      error => { }
    );
  }

  regionChange() {


    if (this.router.url === '/dashboard/productivity_report')
      this.getTabsData()
    if ((this.router.url !== '/dashboard/productivity_report') && (this.router.url !== '/dashboard/daily_visit_report')) {
      this.loadingData = true;

      console.log('regions id', this.selectedRegion);
      this.httpService.getCities(this.selectedRegion.id).subscribe(
        data => {
          // this.channels = data[0];
          let res: any = data;
          this.areas = res.areaList;
          this.cities = res.cityList;

          setTimeout(() => {
            this.loadingData = false;
          }, 500);
        },
        error => { }
      );
    }
    if (this.router.url === '/dashboard/daily_visit_report') {
      this.getMerchandiserList(this.startDate)
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
    //   error => { }
    // );
  }

  cityChange() {
    // this.httpService.getAreas(this.selectedChannel).subscribe(
    //   data => {
    //     this.areas = data;
    //     // this.filterAllData();
    //   },
    //   error => { }
    // );
  }

  chanelChange() {
    // console.log('seelcted chanel', this.selectedChannel);
    // this.httpService.getAreas(this.selectedChannel).subscribe(
    //   data => {
    //     this.areas = data;
    //     // this.filterAllData();
    //   },
    //   error => { }
    // );
  }
  //#endregion

  getOOSDetailReport() {
    if (this.endDate >= this.startDate) {
      const obj = {
        startDate: moment(this.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.endDate).format('YYYY-MM-DD'),
        zoneId: this.selectedZone.id || -1,
        regionId: this.selectedRegion.id || -1,
        channelId: this.selectedChannel.id || -1,
        areaId: '',
        distId: '',
        actionType: '1',
        pageType: '8'
      };
      let url = 'oosDetail';

      this.httpService.DownloadResource(obj, url);
    }
    else {
      this.toastr.info('End date must be greater than start date', 'Date Selection')
    }
  }

  getMerchandiserList(event) {
    console.log(event);
    this.clickedOnce = 1;
    this.startDate = event;
    this.merchandiserList = [];
    if (!this.selectedZone.id || !this.selectedRegion.id) {
      // console.log(this.selectedZone.id,this.selectedRegion.id)
      this.toastr.info('Please select zone and region to proceed', 'PDF Download');
    } else {
      let obj = {
        zoneId: this.selectedZone.id,
        regionId: this.selectedRegion.id,
        startDate: moment(this.startDate).format('YYYY-MM-DD')
      };
      this.httpService.getMerchandiserList(obj).subscribe(
        data => {
          console.log('merchandiser', data);
          let res: any = data;
          if (!res) {
            this.toastr.warning('NO record found', 'Merchandiser List');
            this.merchandiserList = [];
          } else if (res.length == 0) {
            this.toastr.info('NO record found,Please try again', 'Merchandiser List');
          } else {
            this.merchandiserList = res;
          }
        },
        error => {
          error.status === 0
            ? this.toastr.error('Please check Internet Connection', 'Error')
            : this.toastr.error(error.description, 'Error');
        }
      );
    }
  }

  downloadDailyReport() {
    this.loadingData = true;
    this.loadingReportMessage = true;
    // this.clickedOnce++;

    let obj = {
      zoneId: this.selectedZone.id,
      regionId: this.selectedRegion.id,
      startDate: moment(this.startDate).format('YYYY-MM-DD'),
      reportType: '',
      surveyorId: this.selectedMerchandiser.id,
      excelDump: 'Y',
      mailData: 'Y',
      reportLink: ''
    };
    let url = 'cbl-pdf';
    // this.httpService.downloadMerchandiserPDF(obj).subscribe(d => { }, error => {

    // });

    this.httpService.DownloadResource(obj, url);

    setTimeout(() => {
      this.loadingData = false;
      this.loadingReportMessage = false;
      this.clearAllSections()
    }, 20000);
  }

  arrayMaker(arr) {
    let all = arr.filter(a => a === 'all')
    let result: any = []
    if (all[0] === 'all') {
      arr = this.channels;
    }
    arr.forEach(e => {
      result.push(e.id);

    });
    return result;
  }

  getOOSShopListReport() {
    if (this.endDate >= this.startDate) {
      this.loadingReportMessage = true;
      this.loadingData = true

      let obj = {
        zoneId: this.selectedZone.id || "",
        regionId: this.selectedRegion.id || "",
        cityId: this.selectedCity.id || "",
        areaId: this.selectedArea.id || "",
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.endDate).format('YYYY-MM-DD'),
        category: -1,
        lastVisit: this.selectedLastVisit || "",
        productId: -1,
        mustHave: 'n'
      };

      let url = 'shopwise-ost-report';
      let body = `pageType=2&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&cityId=${obj.cityId}&areaId=${obj.areaId}&channelId=${obj.channelId}&category=${obj.category}&lastVisit=${obj.lastVisit}&productId=${obj.productId}&mustHave=${obj.mustHave}`;
      this.httpService.getKeyForProductivityReport(body, url).subscribe(data => {
        console.log(data, 'oos shoplist');
        let res: any = data
        let obj2 = {
          key: res.key,
          fileType: 'json.fileType'
        }
        let url = 'downloadReport'
        this.getproductivityDownload(obj2, url)

      }, error => {

      })
    } else {
      this.toastr.info('End date must be greater than start date', 'Date Selection')

    }


    // let url = 'downloadReport';
    // this.httpService.DownloadResource(obj, url);
  }

  getOOSSummary() {

    if (this.endDate >= this.startDate) {
      this.loadingData = true
      this.loadingReportMessage = true
      let obj = {
        zoneId: this.selectedZone.id,
        regionId: this.selectedRegion.id,
        cityId: this.selectedCity.id,
        areaId: this.selectedArea.id,
        channelId: this.arrayMaker(this.selectedChannel),
        startDate: moment(this.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.endDate).format('YYYY-MM-DD'),
        category: -1,
        productId: -1,
        mustHave: 'n'
      };

      let url = 'oosSummaryReport'
      let body = `type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}&mustHave=${obj.mustHave}&channelId=${obj.channelId}`;

      this.httpService.getKeyForProductivityReport(body, url).subscribe(data => {
        let res: any = data

        let obj2 = {
          key: res.key,
          fileType: 'json.fileType'
        }
        let url = 'downloadReport'
        this.getproductivityDownload(obj2, url)

      }, error => {

        console.log(error, 'summary report')

      })
    } else {
      this.toastr.info('End date must be greater than start date', 'Date Selection')

    }

    // let url = 'oosSummaryReport';
    // this.httpService.DownloadResource(obj, url);
  }

  MProductivityReport() {
    if (this.endDate >= this.startDate) {
      this.loadingData = true;
      this.loadingReportMessage = true;
      let obj = {
        zoneId: this.selectedZone.id || -1,
        regionId: this.selectedRegion.id || -1,
        startDate: moment(this.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.endDate).format('YYYY-MM-DD'),
        // totalShops: this.selectedImpactType,

      };
      let url = 'productivityreport'
      let body = `type=2&pageType=1&zoneId=${obj.zoneId}&regionId=${obj.regionId}&startDate=${obj.startDate}&endDate=${obj.endDate}`;

      this.httpService.getKeyForProductivityReport(body, url).subscribe(data => {
        let res: any = data

        let obj2 = {
          key: res.key,
          fileType: 'json.fileType'
        }
        let url = 'downloadReport'
        this.getproductivityDownload(obj2, url)

      }, error => {

        console.log(error, 'productivity error')

      })
    } else {
      this.toastr.info('End date must be greater than start date', 'Date Selection')

    }

  }

  getproductivityDownload(obj, url) {
    let u = url
    this.httpService.DownloadResource(obj, u);

    setTimeout(() => {
      this.loadingData = false;

      this.loadingReportMessage = false;
      this.clearAllSections();

    }, 1000);
  }


  getTabsData(data?: any, dateType?: string) {
    this.loading = true;
    let obj: any = {
      zoneId: (this.selectedZone.id) ? this.selectedZone.id : -1,
      regionId: (this.selectedRegion.id) ? this.selectedRegion.id : -1,
      startDate: (dateType == 'start') ? moment(data).format('YYYY-MM-DD') : moment(this.startDate).format('YYYY-MM-DD'),
      endDate: (dateType == 'end') ? moment(data).format('YYYY-MM-DD') : moment(this.endDate).format('YYYY-MM-DD')
    }

    this.httpService.getDashboardData(obj).subscribe(data => {
      console.log(data, 'home data');
      let res: any = data
      this.tabsData = data;
      this.loading = false;
      // if (res.planned == 0)
      //   this.toastr.info('No data available for current selection', 'Summary')
    }, error => {
      console.log(error, 'home error')

    })

  }
}