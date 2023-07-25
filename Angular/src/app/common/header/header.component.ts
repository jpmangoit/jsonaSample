import { CommonFunctionService } from './../../service/common-function.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appSetting } from '../../app-settings';
import { AuthServiceService } from '../../service/auth-service.service';
import { ConfirmDialogService } from '../../confirm-dialog/confirm-dialog.service';
import { UpdateConfirmDialogService } from '../../update-confirm-dialog/update-confirm-dialog.service';
import { LanguageService } from '../../service/language.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/service/theme.service';
import { ClubDetail, LoginDetails } from 'src/app/models/login-details.model';
import { AuthorizationAccess, CreateAccess, ParticipateAccess, UserAccess } from 'src/app/models/user-access.model';
import { ThemeType } from 'src/app/models/theme-type.model';
import { DenyReasonConfirmDialogService } from 'src/app/deny-reason-confirm-dialog/deny-reason-confirm-dialog.service';
import { NotificationsService } from 'src/app/service/notifications.service';
import { serverUrl } from 'src/environments/environment';
import { io, Socket } from "socket.io-client";
import { NotificationService } from 'src/app/service/notification.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
declare var $: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {
    language: any;
    userDetails: LoginDetails;
    userAccess: UserAccess;
    clubData: ClubDetail;
    createAccess: CreateAccess;
    participateAccess: ParticipateAccess;
    authorizationAccess: AuthorizationAccess;
    displayFlag: string = 'de';
    alluserDetails: String[] = [];
    getNotificationInterval: number;
    userRespData: string;
    thumbnail: string;
    alreadyAcceptMsg: string;
    showNotifications: string[] = [];
    showNotificationsss: string[] = [];
    responseMessage: string = '';
    memberPhotosuccess: string;
    documentForm: UntypedFormGroup;
    globalSearchForm: UntypedFormGroup;
    setTheme: ThemeType;
    pageUrl: any;
    socket: Socket;
    chatUserArr: any;
    totalUnreadChats: any = 0;
    userId:any;
    file: File;
    fileToReturn: File;
    imageChangedEvent:Event = null;
    image:File
    imgName:string;
    imgErrorMsg: boolean  = false;
    docErrorMsg: boolean = false;
    croppedImage: string = '';
    isImage: boolean = false;
    private activatedSub: Subscription;
    private activatedPro: Subscription;
    private refreshPage:Subscription
    private denyRefreshPage:Subscription
    private removeUpdate:Subscription
    private activatedHeadline:Subscription
    headline_word_option: number = 0;


    constructor(private _router: Router, private route: ActivatedRoute, private themes: ThemeService, private authService: AuthServiceService, private confirmDialogService: ConfirmDialogService,
        private lang: LanguageService, private sanitizer: DomSanitizer,private tostrNotificationService: NotificationService, private notificationService: NotificationsService, private updateConfirmDialogService: UpdateConfirmDialogService,
        private denyReasonService: DenyReasonConfirmDialogService, private formbuilder: UntypedFormBuilder,
         private imageCompress: NgxImageCompressService,private commonFunctionService: CommonFunctionService) { }

    ngOnInit(): void {
        if (localStorage.getItem('club_theme') != null) {
            let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
            this.setTheme = theme;
        }
        this.activatedSub = this.themes.club_theme.subscribe(
            (resp: ThemeType) => {this.setTheme = resp; }
        );
        this.activatedPro = this.themes.profile_imge.subscribe(
            (resp: string) => { this.getUserImage(); }
        );

        this.refreshPage =  this.confirmDialogService.dialogResponse.subscribe(message => {
            setTimeout(() => {
                this.ngOnInit();
            }, 1000);
        });
        this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp =>{
            setTimeout(() => {
                this.ngOnInit();
            }, 1000);
        });
        this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp =>{
            setTimeout(() => {
                this.ngOnInit();
            }, 1000);
        })
        this.activatedHeadline = this.commonFunctionService.changeHeadline.subscribe((resp:any) => {
            this.headline_word_option = resp;
        });

        this.showNotifications = [];
        this.showNotificationsss = this.notificationService.getNotifications();

        setTimeout(() => {
            var uniqueArray: any;
            uniqueArray = this.showNotificationsss.sort((a: any, b: any) => Number(new Date(a.created_at)) - Number(new Date(b.created_at))).reverse();
            if (uniqueArray.length > 0) {
                this.showNotifications = uniqueArray.filter((thing, index) => {
                    const _thing = JSON.stringify(thing);
                    return index === uniqueArray.findIndex(obj => {
                        return JSON.stringify(obj) === _thing;
                    });
                });
            }
        }, 3000);
        this.displayFlag = localStorage.getItem('language');
        this.language = this.lang.getLanguaageFile();
        this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
        this.userDetails = JSON.parse(localStorage.getItem('user-data'));
        this.userId = this.userDetails.userId;
        this.getUserImage();
        let userRole: string = this.userDetails.roles[0];
        this.userAccess = appSetting.role;
        this.createAccess = this.userAccess[userRole].create;
        this.participateAccess = this.userAccess[userRole].participate;
        this.authorizationAccess = this.userAccess[userRole].authorization;
        this.globalSearchForm = this.formbuilder.group({
            searchOption: ['', [Validators.required]],
        });
    }
    get formControls() { return this.globalSearchForm.controls; }

    globalSearch() {
        if (this.globalSearchForm.invalid) {
            return;
        } else {
            this._router.navigate(['search/' + this.globalSearchForm.value.searchOption]);
            this.globalSearchForm.reset();
        }
    }

    getUserImage() {
        if (sessionStorage.getItem('token')) {
            let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
            this.authService.memberInfoRequest('get', 'member-photo?database_id=' + userData.database_id + '&club_id=' + userData.team_id + '&member_id=' + userData.member_id, null)
            .subscribe(
                (respData: any) => {
                    this.authService.setLoader(false);
                    if (respData['code'] == 400) {
                        this.responseMessage = respData['message'].message;
                        this.tostrNotificationService.showError(this.responseMessage,null);
                    } else {
                        this.userRespData = respData;
                        this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(respData.changingThisBreaksApplicationSecurity) as string;
                    }
                }
            );
        }
    }

    onLanguageSelect(lan: string) {
        localStorage.setItem('language', lan);
        window.location.reload();
    }

    chats() {
        this.totalUnreadChats = 0;
        if(!this.userDetails.isMember_light && !this.userDetails.isMember_light_admin){
            this.authService.memberSendRequest('get', 'get-usersgroup-chat/' + this.userDetails.userId, '')
                .subscribe(
                    (resp: any) => {
                        this.chatUserArr = resp;
                        let grp: any;
                        if(this.chatUserArr && this.chatUserArr.length > 0){
                            this.chatUserArr.forEach(element => {
                                this.totalUnreadChats += element.count
                            });
                        }
                    }
                );
        }
    }


    reloadCurrentRoute() {
        let self = this;
        let currentUrl: string = self._router.url;
        self._router.navigate([currentUrl]);
    }

    

    isVisible: boolean = false;
    showDropdown() {
        if (!this.isVisible)
            this.isVisible = true;
        else
            this.isVisible = false;
    }

    showMenu: boolean = false;
    onOpen() {
        let el: HTMLCollectionOf<Element> = document.getElementsByClassName("sidebar");
        if (!this.showMenu) {
            this.showMenu = true;
            el[0].className = "sidebar open";
        } else {
            this.showMenu = false;
            el[0].className = "sidebar";
        }
    }

    showToggle: boolean = false;
    onShow() {
        let el: HTMLCollectionOf<Element> = document.getElementsByClassName("navbar-collapse");
        if (!this.showToggle) {
            this.showToggle = true;
            el[0].className = "navbar-collapse show";
        } else {
            this.showToggle = false;
            el[0].className = "navbar-collapse";
        }
    }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        this._router.navigate(["/login"]);
    }

    goToProfile() {
        this.showDropdown();
        this._router.navigate(["/profile"]);
    }

    ngOnDestroy(): void {
        clearInterval(this.getNotificationInterval);
        this.activatedSub.unsubscribe();
        this.activatedPro.unsubscribe();
        this.refreshPage.unsubscribe();
        this.denyRefreshPage.unsubscribe();
        this.removeUpdate.unsubscribe();
        this.activatedHeadline.unsubscribe();
    }
}


