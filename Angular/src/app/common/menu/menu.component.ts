import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '../../service/language.service';
import { appSetting } from '../../app-settings';
import { ThemeService } from 'src/app/service/theme.service';
import { Subscription } from 'rxjs';
import { ThemeType } from '../../models/theme-type.model'
import { ClubDetail, LoginDetails } from 'src/app/models/login-details.model';
import { AuthorizationAccess, CreateAccess, ParticipateAccess, UserAccess } from 'src/app/models/user-access.model';
import { CommonFunctionService } from 'src/app/service/common-function.service';
declare var $: any;

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit, OnDestroy {
    language: any;
    userDetails: LoginDetails;
    userAccess: UserAccess;
    createAccess: CreateAccess;
    participateAccess: ParticipateAccess;
    authorizationAccess: AuthorizationAccess;
    clubData: ClubDetail;
    setTheme: ThemeType;
    isActive: string = "dashboard";
    userRoleInfo: string;
    isUpcomingCourse: boolean = true;
    private activatedSub: Subscription;
    headline_word_option: number = 0;
    private activatedHeadline: Subscription;
    open_clubTool:boolean = false;
    open_setUp:boolean = false;
    open_more:boolean = false;
    open_adminArea:boolean = false;
    open_tineonAdmin:boolean = false;
    open_owner:boolean = false;

    constructor(
        private lang: LanguageService,
        private themes: ThemeService,
        private commonFunctionService: CommonFunctionService
    ) { }

    ngOnInit(): void {
        this.setTheme = null;
        if (localStorage.getItem('club_theme') != null) {
            let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
            this.setTheme = theme;
        }
        this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
            this.setTheme = resp;
        });

        this.activatedHeadline = this.commonFunctionService.changeHeadline.subscribe((resp:any) => {
            this.headline_word_option = resp;
        });

        this.language = this.lang.getLanguaageFile();
        this.userDetails = JSON.parse(localStorage.getItem('user-data'));
        this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
        let userRole = this.userDetails.roles[0];
        this.userRoleInfo = this.userDetails.roles[0];
        this.userAccess = appSetting.role;
        this.createAccess = this.userAccess[userRole].create;
        this.participateAccess = this.userAccess[userRole].participate;
        this.authorizationAccess = this.userAccess[userRole].authorization;
        this.getClubData();
    }

    public ngInit() {
        $("div").attr("id", "SomeID");
        $(document).ready(function () {
            $(".sidebar-wrapper").hover(
                function () {
                    $(this).addClass("sidebar-hover");
                },
                function () {
                    $(this).removeClass("sidebar-hover");
                }
            );
        });
    }

    getClubData() {
        if (sessionStorage.getItem('token')) {
            let userData = JSON.parse(localStorage.getItem('user-data'));
            this.clubData = userData.Club;
        }
    }

    dropDown1() {
        $('.toggleSubmenu1').next('ul').toggleClass('show');
        this.open_clubTool = !this.open_clubTool;
        this.open_setUp = false;
        this.open_more = false;
        this.open_adminArea = false;
        this.open_tineonAdmin = false;
        this.open_owner = false;
    }
    dropDown2() {
        $('.toggleSubmenu2').next('ul').toggleClass('show');
        this.open_setUp = !this.open_setUp;
        this.open_clubTool = false;
        this.open_more = false;
        this.open_adminArea = false;
        this.open_tineonAdmin = false;
        this.open_owner = false;
    }
    dropDown3() {
        $('.toggleSubmenu3').next('ul').toggleClass('show');
        this.open_more = !this.open_more;
        this.open_clubTool = false;
        this.open_setUp = false;
        this.open_adminArea = false;
        this.open_tineonAdmin = false;
        this.open_owner = false;
    }
    dropDown4() {
        $('.toggleSubmenu4').next('ul').toggleClass('show');
        this.open_adminArea = !this.open_adminArea;
        this.open_clubTool = false;
        this.open_setUp = false;
        this.open_more = false;
        this.open_tineonAdmin = false;
        this.open_owner = false;
    }
    dropDown5() {
        $('.toggleSubmenu5').next('ul').toggleClass('show');
        this.open_tineonAdmin = !this.open_tineonAdmin;
        this.open_clubTool = false;
        this.open_setUp = false;
        this.open_more = false;
        this.open_adminArea = false;
        this.open_owner = false;
    }
    dropDown6() {
        $('.toggleSubmenu6').next('ul').toggleClass('show');
        this.open_owner = !this.open_owner;
        this.open_clubTool = false;
        this.open_setUp = false;
        this.open_more = false;
        this.open_adminArea = false;
        this.open_tineonAdmin = false;
    }

    isValue: number = 0;
    toggle(num: number) {
         this.isValue = num;
    }

    ngOnDestroy(): void {
        this.activatedSub.unsubscribe();
        this.activatedHeadline.unsubscribe();
    }
}
