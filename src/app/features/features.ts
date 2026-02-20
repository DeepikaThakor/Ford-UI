import { Component, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Geolocation } from '../geolocation';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { map, startWith } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import * as XLSX from 'xlsx'
import { HttpClient } from '@angular/common/http'
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

type ApiResponse = {
  data?: {
    features_options_generated_link?: string;
  };
};
@Component({
  selector: 'app-features',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule,
     MatFormFieldModule, MatButtonModule, NgxMatSelectSearchModule
   ],
  standalone: true,
  templateUrl: './features.html',
  styleUrl: './features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Features {
  fordLogoUrl = 'https://www.ford.com/etc/designs/brand_ford/brand/skin/ford/img/bri-icons/FordOval.svg';

  years = ['2021', '2022', '2023', '2024','2025','2026'];
  platforms = ['C2', 'GE1'];
  models = ['Bronco Sport', 'Maverick', 'Corsair', 'Escape' , 'Mach-E'];
  systems = ['Country Groups', 'Vehicle Configuration', 'Vehicle Capacity', 'Labels and Handbooks', 
    'Body General (Including TREAD Act, Env', 'Paint and Protection', 'Bumpers and Grilles', 
    'Exterior Trim', 'Exterior Mirrors', 'Exterior Lighting', 'Wash / Wipe', 'Glass / Visibility',
     'Roof', 'Moonroof / Sunroof / Panoramic', 'Badging and Nomenclature', 'License Plate Brackets', 
     'Climate Control', 'Floor Consoles', 'Instrument Panel', 'Interior Lighting',  'Interior Roof', 
     'Stowage', 'Floor Trim', 'Warnings (non-electronic)', 'Front Seats', '2nd Row Seats', 'Suspension',
      'Brakes', 'Steering', 'Towing', 'Stability Controls / Cruise Controls', 'Wheels and Tires', 
      'Spare Wheel and Tire, Tire Repair Kit', 'Engine', 'Transmission', 'PowertrainCooling', 'Drive Axle', 
      'Fuel System', 'Emissions', 'Power Supply', 'Rear Backing Aid / Parking Sensors', 'Powered Glass', 
      'Outlets, Plugs, Powerpoints, Chargers, Cigar Light', 'Speakers', 'In Car Entertainment Pack', 
      'In Car Entertainment Interfaces', 'Driver Information (Electronic)', 'Occupant Restraints', 
      'Security and Locking', 'Exterior Paints', 'Interior Features'];
  artifact_type = ['PDL', 'Order Guide','Monroney Label'];
  validations:boolean[] = [true, false];

   yearSearchCtrl = new FormControl('');
  platformSearchCtrl = new FormControl('');
  modelSearchCtrl = new FormControl('');
  systemSearchCtrl = new FormControl('');

  filteredYears = this.yearSearchCtrl.valueChanges.pipe(
    startWith(''),
    map(search => this.filterOptions(this.years, search))
  );

  filteredPlatforms = this.platformSearchCtrl.valueChanges.pipe(
    startWith(''),
    map(search => this.filterOptions(this.platforms, search))
  );

  filteredModels = this.modelSearchCtrl.valueChanges.pipe(
    startWith(''),
    map(search => this.filterOptions(this.models, search))
  );

  filteredSystems = this.systemSearchCtrl.valueChanges.pipe(
    startWith(''),
    map(search => this.filterOptions(this.systems, search))
  );

  selectedYears: string[] = [];
  selectedPlatforms= '';
  selectedModels: string[] = [];
  selectedSystems: string[] = [];
  selectedArtifact = '';
  selectedValidation = '';
  tableData: any[]=[];

  isPreparing = false;
  downloadURL: string | null = null;
  loading = false;
  Error = false;

 
isAllYearsSelected(): boolean {
  return this.selectedYears.length === this.years.length;
}
toggleAllYears() {
  if (this.isAllYearsSelected()) {
    this.selectedYears = [];
    
  } else {
    this.selectedYears = [...this.years];
    
  }
}

// isAllPlatformSelected(): boolean {
//   return this.selectedPlatforms.length === this.platforms.length;
// }
// toggleAllPlatform() {
//   if (this.isAllPlatformSelected()) {
//     this.selectedPlatforms = [];
    
//   } else {
//     this.selectedPlatforms = [...this.platforms];
    
//   }
// }

isAllModelSelected(): boolean {
  return this.selectedModels.length === this.models.length;
}
toggleAllModel() {
  if (this.isAllModelSelected()) {
    this.selectedModels = [];
    
  } else {
    this.selectedModels = [...this.models];
    
  }
}

isAllSystemSelected(): boolean {
  return this.selectedSystems.length === this.systems.length;
}
toggleAllSystem() {
  if (this.isAllSystemSelected()) {
    this.selectedSystems = [];
    
  } else {
    this.selectedSystems = [...this.systems];
    
  }
}
  constructor(public api: Geolocation, private http: HttpClient, private cdk: ChangeDetectorRef) {}

   private filterOptions(options: string[], searchTerm: string | null): string[] {
    if (!searchTerm) {
      return options;
    }
    const search = searchTerm.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(search));
  }

  isValid(): boolean {
    return this.selectedYears.length > 0 &&
           this.selectedPlatforms.length > 0 &&
           this.selectedModels.length > 0 &&
           this.selectedSystems.length > 0 &&
           !!this.selectedArtifact &&
            this.selectedValidation !== null;
 
  }

  canSubmit(): boolean {
    return this.isValid() && !this.loading && !this.isPreparing;
  }

 
  generateDummyExcelBlob(): Blob {
    const dummyContent = 'Name,Age\nXYZ,22\nJohn,32';
    return new Blob([dummyContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  async prepareDownloadLink() {
    this.isPreparing = true;
    this.downloadURL = null;
    await new Promise(resolve => setTimeout(resolve, 2000));
    const blob = this.generateDummyExcelBlob();
    this.downloadURL = URL.createObjectURL(blob);
    this.isPreparing = false;
    this.cdk.markForCheck();
  }

  Apidata(name: string) {
    this.loading = true;
    this.api.getLocation(name).subscribe({
      next: async (res) => {
        const r = res?.results[0];
        if (res == null || !r) {
          this.Error = true;
          this.loading = false;
          this.cdk.markForCheck();
          return;
        }
        this.Error = false;
        await this.prepareFile();
        this.loading = false;
        this.cdk.markForCheck();
      }
    });
  }
  

  // onSubmitClick() {
  //   this.Apidata('Pune');
  // }

  
  async prepareFile(){
    this.isPreparing = true
    this.downloadURL = null
    this.tableData = []
 
    await new Promise(resolve => setTimeout(resolve,2000))
 
    this.http.get(`assets/dummy.xlsx`,{ responseType: 'arraybuffer'}).subscribe((data:ArrayBuffer)=>{
      const workbook = XLSX.read(data,{type:"array"})
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName]
      this.tableData = XLSX.utils.sheet_to_json(worksheet)
 
      const blob = new Blob([data], {
        type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
      this.downloadURL = URL.createObjectURL(blob)
      this.isPreparing = false
      this.cdk.markForCheck()
     
  }
    )
  }
  showTable:boolean = false
 
  toggleTabledata(){
    this.showTable = !this.showTable
    this.cdk.markForCheck()
  }
 

  private buildRequestBody() {
  return {
    years: this.selectedYears,
    platforms: this.selectedPlatforms,
    models: this.selectedModels,
    systems: this.selectedSystems,
    artifact_type: this.selectedArtifact,
    manual_validation: this.selectedValidation,
  };
}
 
private loadExcelFromArrayBuffer(data: ArrayBuffer) {
  // Parse to table
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  this.tableData = XLSX.utils.sheet_to_json(worksheet);
 
  // Create download link
  if (this.downloadURL) URL.revokeObjectURL(this.downloadURL);
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  this.downloadURL = URL.createObjectURL(blob);
}
 
submitAndLoadExcel() {
  if (!this.isValid()) return;
 
  this.loading = true;
  this.isPreparing = true;
  this.Error = false;
 
  this.downloadURL = null;
  this.tableData = []; // optional if you’re not displaying parsed excel anymore
  this.cdk.markForCheck();
 
  const body = this.buildRequestBody();
 
  this.http.post<ApiResponse>('api/data', body).subscribe({
    next: (res) => {
      const link = res?.data?.features_options_generated_link;
      
      if (!link) {
        this.Error = true;
        this.loading = false;
        this.isPreparing = false;
        this.cdk.markForCheck();
        return;
      }
 
      this.downloadURL = link;
 
      this.loading = false;
      this.isPreparing = false;
      this.cdk.markForCheck();
    },
    error: (err) => {
      console.error('API call failed:', err);
      this.Error = true;
 
      this.loading = false;
      this.isPreparing = false;
      this.cdk.markForCheck();
    },
  });
}
 
onSubmitClick() {
  this.submitAndLoadExcel();
}
}


