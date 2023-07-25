import { Component, OnDestroy, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
import { Router } from '@angular/router';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/service/theme.service';
import { LoginDetails } from 'src/app/models/login-details.model';
import { NewsType } from 'src/app/models/news-type.model';
import { ThemeType } from 'src/app/models/theme-type.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationService } from 'src/app/service/notification.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CommonFunctionService } from 'src/app/service/common-function.service';
import { Jsona } from 'jsona';
const dataFormatter = new Jsona();

declare var $: any;

@Component({
    selector: 'app-club-news',
    templateUrl: './club-news.component.html',
    styleUrls: ['./club-news.component.css']
})

export class ClubNewsComponent implements OnInit, OnDestroy {
    @Output() dataLoaded: EventEmitter<any> = new EventEmitter<any>();
    @Input() bannerData: any;

    language: any;
    role: string = '';
    thumbnail: string;
    num: number = 4;
    num1: number = 3;
    memberid: number;
    displayError: boolean = false;
    displayPopup: boolean = false;
    responseMessage: string = null;
    userData: LoginDetails;
    dashboardData: NewsType[];
    guestNews: NewsType[] = [];
    newsData: NewsType;
    newsDetails: NewsType[] = [];
    newsDisplay: number;
    url: string;
    thumb: SafeUrl;
    proImage: SafeUrl;
    newImg: string;
    setTheme: ThemeType;
    private activatedSub: Subscription;
    allowAdvertisment: any;
    headline_word_option: number = 0;
    sliderOptions: OwlOptions = {
        loop: true,
        mouseDrag: true,
        touchDrag: true,
        pullDrag: true,
        dots: true,
        navSpeed: 700,
        navText: ['', ''],
        margin: 24,
        responsive: {
            0: {
                items: 1
            },
            400: {
                items: 1
            },
            740: {
                items: 1
            },
            940: {
                items: 1
            }
        },
        nav: false,
        autoplay:true
    };
    newsResult: any;;
    newsTop4Result: any;;
    constructor(
        public authService: AuthServiceService,
        private lang: LanguageService,
        private router: Router,
        private confirmDialogService: ConfirmDialogService,
        private themes: ThemeService,
        private notificationService: NotificationService,
        private commonFunctionService: CommonFunctionService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        if (localStorage.getItem('club_theme') != null) {
            let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
            this.setTheme = theme;
        }
        this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
            this.setTheme = resp;
        });

        this.language = this.lang.getLanguaageFile();
        this.userData = JSON.parse(localStorage.getItem('user-data'));
        this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
        this.allowAdvertisment = localStorage.getItem('allowAdvertis');
        this.role = this.userData.roles[0];
        this.url = this.router.url;

        if (this.url == '/dashboard' || this.url == '/') {
            this.displayPopup = true;
            this.newsDisplay = 4;
        } else if (this.url == '/clubwall/club-news' || this.url == '/clubwall') {
            this.displayPopup = false;
            this.newsDisplay = 4;
        }
        this.getAllNews();
    }

    /**
    * Function is used to get top 5 news for user
    * @author  MangoIt Solutions
    * @param   {userId}
    * @return  {Object}
    */
    getAllNews() {
        if (sessionStorage.getItem('token')) {
            let userId: string = localStorage.getItem('user-id');
            this.authService.memberSendRequest('get', 'topNews/user/' + userId, null)
                .subscribe(
                    (respData: any) => {
                        console.log(respData)
                        const news = dataFormatter.deserialize(respData);                        
                        this.newsTop4Result = news;
                        if (this.newsTop4Result && this.newsTop4Result.length > 0) {
                            this.newsTop4Result.forEach((element, index) => {
                                if (element?.['imageUrls']) {
                                    element['imageUrls'] = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element['imageUrls'].substring(20)));
                                }
                                element.user.image = '';
                            });
                            this.dataLoaded.emit();
                          }
                    }
                );
        }
    }

    /**
    * Function is used to get news details by news id
    * @author  MangoIt Solutions
    * @param   {newsid}
    * @return  {Object}
    */
    getNewsDetails(newsid: number) {
        this.newImg = '';
        if (sessionStorage.getItem('token')) {
            this.authService.memberSendRequest('get', 'get-news-by-id/' + newsid, null)
                .subscribe(
                    (respData: any) => {
                        const news = dataFormatter.deserialize(respData.result);                        
                        this.newsResult = news;
                        if (this.newsResult.imageUrls) {
                            this.newsResult.imageUrls = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(this.newsResult.imageUrls.substring(20)));
                            this.newImg = this.newsResult.imageUrls;
                        }
                        console.log(this.newsResult)
                    }
                );
        }
    }

    /**
    * Function is used to serialize the decode data
    * @author  MangoIt Solutions
    * @param   {newsid}
    * @return  {Object}
    */
    sendDecodeData(){
        const newJson = dataFormatter.serialize({
            stuff: this.newsResult, // can handle array
            includeNames: ['user'] // can include deep relations via dot
        });
        
        console.log(newJson)
        const news = dataFormatter.deserialize(newJson);  
        console.log(news) 
    }

    showToggle: boolean = false;
    removeHtml(str) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = str;
        return tmp.textContent || tmp.innerText || "";
    }

    showToggles: boolean = false;
    onShow() {
        let el: HTMLCollectionOf<Element> = document.getElementsByClassName("bunch_drop");
        if (!this.showToggle) {
            this.showToggle = true;
            el[0].className = "bunch_drop show";
        }
        else {
            this.showToggle = false;
            el[0].className = "bunch_drop";
        }
    }

    ngOnDestroy(): void {
        this.activatedSub.unsubscribe();
    }
}
