import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/service/theme.service';
import { LoginDetails } from 'src/app/models/login-details.model';
import { ThemeType } from 'src/app/models/theme-type.model';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})

export class LayoutComponent implements OnInit,OnDestroy {
    userDetails: LoginDetails;
    setTheme:ThemeType;
    private activatedSub: Subscription;

    constructor(public authService: AuthServiceService, private cdref: ChangeDetectorRef, private router: Router,private themes: ThemeService) { }

    ngOnInit(): void {
        if(localStorage.getItem('club_theme') != null){
            let theme :ThemeType =  JSON.parse(localStorage.getItem('club_theme'));
            this.setTheme = theme;
        }
        this.activatedSub = this.themes.club_theme.subscribe((resp:ThemeType) => {
            this.setTheme = resp;
        });
        this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
        if (!localStorage.getItem('token') || localStorage.getItem('token') == null) {
            window.location.reload();
        }
    }

    ngOnDestroy() {
        this.activatedSub.unsubscribe();
    }
}
