import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OwnerDataService } from '../../../dataservice/owners.service';
import { Owner } from '../../../model/owner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';



@Component({
  selector: 'app-view-files',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIcon],
  templateUrl: './view-files.component.html',
  styleUrl: './view-files.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewFilesComponent implements OnInit {

  ownerId?: any;
  accountId?: number;
  ownerName?: string;
  contactName?: string;
  email?: string;
  phone?: number;
  address?: string;
  city?: string;
  state?: string;
  postal?: number;

  constructor(
    private ownerDataService: OwnerDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ownerId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchData();
  }

  populateCard(ownerData: Owner) {
    console.log(ownerData);
    this.accountId = ownerData.accountId,
      this.ownerName = ownerData.contactName,
      this.email = ownerData.email,
      this.phone = ownerData.phone,
      this.address = ownerData.address,
      this.city = ownerData.city,
      this.state = ownerData.state,
      this.postal = ownerData.zip
  }

  async fetchData(): Promise<void> {
    // If ownerId exists, fetch the owner data
    
      await this.ownerDataService.getOwnersDataById(this.ownerId).then((ownerData: Owner) => {
        this.populateCard(ownerData)
      }).catch((error: any) => {
        console.error('Error fetching owner data:', error);
      });
  }
}
