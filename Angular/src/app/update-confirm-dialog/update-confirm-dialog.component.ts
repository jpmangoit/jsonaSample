import { Component, Input, OnInit } from '@angular/core';
import { UpdateConfirmDialogService } from './update-confirm-dialog.service';
import { LanguageService } from './../service/language.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
    selector: 'app-update-confirm-dialog',
    templateUrl: 'update-confirm-dialog.component.html',
    styleUrls: ['update-confirm-dialog.component.scss']
})

export class UpdateConfirmDialogComponent implements OnInit {
    language :any;
    message: any;
    updateForm: UntypedFormGroup;

    constructor(
        private updateConfirmDialogService: UpdateConfirmDialogService,  private lang : LanguageService,  public formBuilder: UntypedFormBuilder,) { }

    ngOnInit(): any {
       /**
        *
        *   This function waits for a message from alert service, it gets
        *   triggered when we call this from any other component
        */

        this.updateForm = this.formBuilder.group({
            reason: ['', Validators.required]
        });

        this.language = this.lang.getLanguaageFile();
        this.updateConfirmDialogService.getMessage().subscribe(message => {
            this.message = message;
        });
    }
}
