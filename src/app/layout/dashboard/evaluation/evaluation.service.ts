import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DashboardService } from '../dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  // ip:any=environment.ip;

  ip:any=''
  user_id: string;
  // 'http://192.168.3.94:8080/audit/';

  constructor(private http: HttpClient,private dashboardService:DashboardService) { 

    this.ip=dashboardService.ip;
    this.user_id=localStorage.getItem('user_id')
  }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    withCredentials: true
  };

  UrlEncodeMaker(obj) {
    let url = '';
      for (const key in obj) {
      url += `${key}=${obj[key]}&`;
    }
    const newUrl = url.substring(0, url.length - 1);
    return newUrl;
  }

  getData(obj){
    let urlencoded=this.UrlEncodeMaker(obj)
    let url=this.ip+'shopList';
    return this.http.post(url,urlencoded,this.httpOptions);
  }


  getShopDetails(obj){
    let urlencoded=this.UrlEncodeMaker(obj)
    let url=this.ip+'evaluationShop';   //EvaluationShopListController
    return this.http.post(url,urlencoded,this.httpOptions);
  }

  evaluateShop(obj){
    let urlencoded=this.UrlEncodeMaker(obj)
    let url=this.ip+'evaluateSingleShop';
    return this.http.post(url,obj);
  }
  updateMSLStatus(obj){
    let urlencoded=this.UrlEncodeMaker(obj)
    
    let url=this.ip+'updateMSL';
    return this.http.post(url,urlencoded,this.httpOptions);

  }

  updateSOS(obj){
    const urlEncode = this.UrlEncodeMaker(obj);
    const url = this.ip + 'update-shopsos';
    return this.http.post(url, urlEncode, this.httpOptions); 
  }

}
