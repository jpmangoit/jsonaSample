import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthServiceService } from '../app/service/auth-service.service';
import { AppRoutingModule } from './app-routing.module';
import { ApplicationstateService } from './service/applicationstate.service';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'tineon';
    timeoutId: any;
    scrHeight: any;
    scrWidth: any;
    public isMobileResolution: boolean;

    getScreenSize(event?) {
        this.scrHeight = window.innerHeight;
        this.scrWidth = window.innerWidth;
        if (window.innerWidth < 768) {
            this.applicationStateService.isMobileResolution = true;
            this.routerModule.changeRoute();
            this.router.navigate([this.router.url]);
        }
    }

    constructor(
        private authService: AuthServiceService,
        private router: Router,
        private applicationStateService: ApplicationstateService,
        private route: ActivatedRoute,
        private routerModule: AppRoutingModule,
        private cdref: ChangeDetectorRef
    ) {
        // this.checkTimeOut();
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(
            (event: NavigationEnd) => {
                localStorage.setItem('previousUrl', event.url);
            }
        );
    }

    ngOnInit(): void {
        sessionStorage.setItem('token', localStorage.getItem('token'));
        const bodyTag = document.body;
        bodyTag.classList.remove('mobile-red');
        bodyTag.classList.remove('mobile-green');
        bodyTag.classList.add(localStorage.getItem('mobileThemeOption'));
    }


    // checkTimeOut() {
    //     this.timeoutId = setTimeout(() => {
    //         if (this.authService.IsLoggedIn()) {
    //             this.logout();
    //         }
    //         // alert("User has been inactive for a long time")
    //     }, 30 * 60 * 1000);
    // }

    @HostListener("window:keydown")
    @HostListener("window:keypress")
    @HostListener("window:mousedown")
    checkUserActivity() {
        // clearTimeout(this.timeoutId);
        // this.checkTimeOut();
    }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(["/login"]);
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }
}
