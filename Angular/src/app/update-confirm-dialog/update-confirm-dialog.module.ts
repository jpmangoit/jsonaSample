import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import {UpdateConfirmDialogComponent} from './update-confirm-dialog.component';
import {UpdateConfirmDialogService} from './update-confirm-dialog.service';

@NgModule({
    declarations: [
        // UpdateConfirmDialogComponent
    ],
    imports: [
        BrowserModule,
        CommonModule
    ],
    exports: [
        // UpdateConfirmDialogComponent
    ],
    providers: [
       UpdateConfirmDialogService
    ]
})
export class UpdateConfirmDialogModule
{
}
