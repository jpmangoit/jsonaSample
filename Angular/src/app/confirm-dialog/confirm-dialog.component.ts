import { Component, Input, OnInit } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { LanguageService } from './../service/language.service';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: 'confirm-dialog.component.html',
    styleUrls: ['confirm-dialog.component.scss']
})

export class ConfirmDialogComponent implements OnInit {
    language: any;
    message: any;

    constructor(
        private confirmDialogService: ConfirmDialogService, private lang: LanguageService) { }

    ngOnInit(): any {
        /**
         *   This function waits for a message from alert service, it gets
         *   triggered when we call this from any other component
         */
        this.language = this.lang.getLanguaageFile();
        this.confirmDialogService.getMessage().subscribe(message => {
            this.message = message;
        });
    }
}
