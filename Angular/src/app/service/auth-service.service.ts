import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { baseUrl, memberUrl } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AuthServiceService {
    uncaughtError: boolean = false;
    chatMessage: any = new Subject();
    chat: any;

    constructor(private http: HttpClient, private router: Router, private sanitizer: DomSanitizer) {
    }

    sendRequest(method: string, endPoint: string, data: any) {
        let response: any;
        let ls: any = localStorage.getItem('loggedIn');
        let experiesOn: any;
        let now: any = new Date().getTime();
        return this._actualSendRequest(method, endPoint, data);
    }

    memberSendRequest(method: string, endPoint: string, data: any) {
        let response: any;
        let ls: any = localStorage.getItem('loggedIn');
        let experiesOn: any;
        let now: any = new Date().getTime();
        return this._actualSendRequest(method, endPoint, data);
    }

    _actualSendRequest(method: string, endPoint: string, data: any) {
        let isOffile = this.showOffile;
        if (!isOffile) {
            /* Show golbal error cause by HTTP service */
            this.uncaughtError = false;
            setInterval(() => {
                this.uncaughtError = false;
            }, 5000);
            /* ------------------------------------ */
            let language: string = localStorage.getItem('language');
            language = (language) ? language : 'de';
            const myHeaders: HttpHeaders = new HttpHeaders({
                'authorization': this.getToken(),
                'accept': 'application/json',
                'lang': language
            });

            let endPointUrl: string;
            endPointUrl = `${baseUrl}` + endPoint + ``;
            if (method == 'post') {
                return this.http.post(endPointUrl,
                    data,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else if (method == 'put') {
                return this.http.put(endPointUrl,
                    data,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else if (method == 'delete') {
                return this.http.delete(endPointUrl,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else {
                return this.http.get(endPointUrl,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            }
        }
    }

    memberInfoRequest(method: string, endPoint: string, data: any) {
        return this._memberSendRequest(method, endPoint, data);
    }

    _memberSendRequest(method: string, endPoint: string, data: any) {
        let isOffile: boolean = this.showOffile;
        if (!isOffile) {
            /* Show golbal error cause by HTTP service */
            this.uncaughtError = false;
            setInterval(() => {
                this.uncaughtError = false;
            }, 5000);
            /* ------------------------------------ */
            let language: string = localStorage.getItem('language');
            language = (language) ? language : 'de';
            const myHeaders: HttpHeaders = new HttpHeaders({
                'authorization': this.getToken(),
                'accept': 'application/json',
                'lang': language
            });
            let endPointUrl: string;
            endPointUrl = `${memberUrl}` + endPoint + ``;
            if (method == 'post') {
                return this.http.post(endPointUrl,
                    data,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else if (method == 'put') {
                return this.http.put(endPointUrl,
                    data,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else if (method == 'delete') {
                return this.http.delete(endPointUrl,
                    { headers: myHeaders }).pipe(
                        map(this.handleData),
                        catchError(this.handleError));
            } else {
                const myHeaders1: HttpHeaders = new HttpHeaders({
                    'authorization': this.getToken(),
                    'accept': 'image/webp,*/*'
                });
                const salt: number = (new Date()).getTime();
                return this.http.get<Blob>(endPointUrl + '&' + salt, { headers: myHeaders1, responseType: 'blob' as 'json' }).pipe(map(blob => {
                    var urlCreator: any = window.URL || window.webkitURL;;
                    return this.sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(blob));
                }))
            }
        }
    }

    /* Error handler from HTTP service  */
    private handleError: any = (error: any) => {
        if (error.name == 'TimeoutError') {
            this.timeoutErrorFlag = true;
            setInterval(() => {
                this.timeoutErrorFlag = false;
            }, 10000);
            return this.timeoutError();
        }
        else if (error.status == 401) {
            this.clearStorageLogout();
        }
        else if (error.status == 403) {
            this.clearStorageLogout();
            sessionStorage.clear();
            localStorage.clear();
            window.location.reload();
        }
        else if (error.status == 400) {
            return this.error400(error);
        }
        else {
            const resData: any = error;
            if (resData['success']) {
                return resData;
            }
            else {
                this.uncaughtError = true;
                return this.serverError();
            }
        }
    }
    /* Data handler from HTTP service  */
    private handleData: any = (response: Response) => {
        const resData: Response = response;
        return resData;
    }

    private timeoutError() {
        return [{
            "success": false,
            "code": 500,
            "message": "I’m experiencing some difficulty due to connectivity issues. Please type your query again!"
        }]
    }

    private error400(error: any) {
        return [{
            "success": false,
            "code": error.status,
            "message": error.error.message
        }]
    }

    private serverError() {
        return [{
            "success": false,
            "code": 500,
            "message": "Something went wrong. Please try again after some time"
        }]
    }

    clearStorageLogout() {
        localStorage.clear();
    }

    loader: Boolean = false;
    setLoader(value: Boolean) {
        this.loader = value;
    }
    get showLoader() {
        return this.loader;
    }

    timeoutErrorFlag: Boolean = false;
    setTimeoutErrorFlag(value: Boolean) {
        this.timeoutErrorFlag = value;
    }
    get getTimeoutErrorFlag() {
        return this.timeoutErrorFlag;
    }

    get showOffile() {
        return !navigator.onLine;
    }

    reloadRequest(method: string, endPoint: string, data: any) {
        return this._actualSendRequest(method, endPoint, data);
    }


    IsLoggedIn() {
        //it returns a boolean value, if the token exsist then true else vice versa
        return !!localStorage.getItem('token');

    }

    getToken() {
        let session: string = 'Bearer ' + localStorage.getItem('token');
        return session;
    }

    sendMessage(chat) {
        this.chat = chat
        this.chatMessage.next(chat);
    }

    get message() {
        return this.chat
    }

    downloadDocument(method: string, endPoint: string, data: any) {
        let isOffile = this.showOffile;
        if (!isOffile) {
            /* Show golbal error cause by HTTP service */
            this.uncaughtError = false;
            setInterval(() => {
                this.uncaughtError = false;
            }, 5000);
            /* ------------------------------------ */
            let language: string = localStorage.getItem('language');
            language = (language) ? language : 'de';
            const myHeaders: HttpHeaders = new HttpHeaders({
                'authorization': this.getToken(),
                'accept': 'application/json',
                'lang': language
            });

            let endPointUrl: string;
            endPointUrl = `${baseUrl}` + endPoint + ``;
            return this.http.post(endPointUrl, data,
                { headers: myHeaders, responseType: "blob" }).pipe(
                    map(this.handleData),
                    catchError(this.handleError));
        }
    }

    /**
     * Function is usesd for return uniqe array
     * @author MangoIt Solutions
     * @param {array}
     * @returns {array} uniqe array
     */

    uniqueData(uniqueData:any){
       return uniqueData.filter((value, index, array) => array.indexOf(value) === index);
    }

     /**
     * Function is usesd for return uniqe object array
     * @author MangoIt Solutions
     * @param {object array}
     * @returns {object array} uniqe object array
     */
    uniqueObjData(uniqueData:any, key:any){
        return [...new Map(uniqueData.map(item => [item[key], item])).values()];
    }
}
