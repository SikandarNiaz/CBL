import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "section-six",
  templateUrl: "./section-six.component.html",
  styleUrls: ["./section-six.component.scss"],
})
export class SectionSixComponent implements OnInit {
  @Input("data") data;
  @Input("isEditable") isEditable: any;
  @Output("productList") productForEmit: any = new EventEmitter<any>();
  @Output("showModal") showModal: any = new EventEmitter<any>();
  tableData: any = [];

  constructor() {}

  ngOnInit() {}

  openModal(item) {
    this.showModal.emit(item);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.tableData = changes.data.currentValue.mslTable;
  }
}
