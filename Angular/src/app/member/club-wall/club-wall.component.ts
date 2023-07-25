import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '../../service/language.service';
import { appSetting } from '../../app-settings';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/service/theme.service';
import { Subscription } from 'rxjs'
import { LoginDetails } from 'src/app/models/login-details.model';
import { CreateAccess, ParticipateAccess, UserAccess } from 'src/app/models/user-access.model';
import { ThemeType } from 'src/app/models/theme-type.model';
import { AuthServiceService } from 'src/app/service/auth-service.service';
declare var $: any;

@Component({
    selector: 'app-club-wall',
    templateUrl: './club-wall.component.html',
    styleUrls: ['./club-wall.component.css']
})

export class ClubWallComponent implements OnInit, OnDestroy {
    language: any;
    userDetails: LoginDetails;
    userAccess: UserAccess;
    createAccess: CreateAccess;
    participateAccess: ParticipateAccess;
    displayNews: boolean = false;
    displayDates: boolean = false;
    displayEvents: boolean = false;
    setTheme: ThemeType;
    private activatedSub: Subscription;
    userRole: string;

    // isLoading: boolean = true;
      // Set the number of child components that should load data
    totalChildComponents = 2;
    loadedChildComponents = 0;


    constructor(private lang: LanguageService,  public authService: AuthServiceService,private router: Router, private themes: ThemeService) {
        this.authService.setLoader(true);
        if (localStorage.getItem('club_theme') != null) {
            let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
            this.setTheme = theme;
        }
        this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
            this.setTheme = resp;
        });

        var getParamFromUrl = this.router.url.split("/")['2'];
        if (getParamFromUrl == 'club-events') {
            this.displayEvents = true;

        } else if (getParamFromUrl == 'club-dates') {
            this.displayDates = true;

        } else {
            this.displayNews = true;
        }
    }

    onChildDataLoaded() {
        this.loadedChildComponents++;
        // Check if all child components have loaded data
        if (this.loadedChildComponents === this.totalChildComponents) {
            // this.isLoading = false; // Set the loading state to false
            this.authService.setLoader(false);
        }
    }

    ngOnInit(): void {
        this.authService.setLoader(true);
        this.language = this.lang.getLanguaageFile();
        this.userDetails = JSON.parse(localStorage.getItem('user-data'));
        this.userRole = this.userDetails.roles[0];
        this.userAccess = appSetting.role;
        this.createAccess = this.userAccess[this.userRole].create;
        this.participateAccess = this.userAccess[this.userRole].participate;
    }

    /**
    * Function is used to display news tab
    * @author  MangoIt Solutions
    */
    onNews() {
        // this.authService.setLoader(true);
        this.displayNews = true;
        this.displayDates = false;
        this.displayEvents = false;
    }

    /**
    * Function is used to display dates tab
    * @author  MangoIt Solutions
    */
    onDates() {
        this.displayNews = false;
        this.displayDates = true;
        this.displayEvents = false;
    }

    /**
    * Function is used to display event tab
    * @author  MangoIt Solutions
    */
    onEvents() {
        this.displayNews = false;
        this.displayDates = false;
        this.displayEvents = true;
    }

    ngOnDestroy(): void {
        this.activatedSub.unsubscribe();
    }
}
