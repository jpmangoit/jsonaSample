import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEl from '@angular/common/locales/en';
import myLocaleTr from '@angular/common/locales/tr';
import myLocaleRu from '@angular/common/locales/ru';
import localeIt from '@angular/common/locales/it';
import localeFr from '@angular/common/locales/fr';
import localeSp from '@angular/common/locales/es';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './guard/auth.guard';
import { LimitTextPipe } from './pipe/limit-text.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { LanguageService } from './service/language.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TooltipDirective } from './tooltip.directive';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import { UpdateConfirmDialogComponent } from './update-confirm-dialog/update-confirm-dialog.component';
import { UpdateConfirmDialogService } from './update-confirm-dialog/update-confirm-dialog.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressBarModule } from 'angular-progress-bar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { MatSelectModule} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatDatepickerModule} from '@angular/material/datepicker';

import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { ClubNewsComponent } from './member/news/club-news/club-news.component';
import { AuthServiceService } from './service/auth-service.service';
import { ClubWallComponent } from './member/club-wall/club-wall.component';


import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ShortNumberPipe } from 'src/app/pipe/short-number.pipe';
import {MatDialogModule} from '@angular/material/dialog';




import { DenyReasonConfirmDialogComponent } from './deny-reason-confirm-dialog/deny-reason-confirm-dialog.component';
import { DenyReasonConfirmDialogService } from './deny-reason-confirm-dialog/deny-reason-confirm-dialog.service';


;
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


import { NgxImageCompressService } from 'ngx-image-compress';
import { LazyImgDirective } from './lazyimg.directive';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';
import { LayoutModule } from '@angular/cdk/layout';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CustomDateAdapter } from './service/custom.date.adapter';
import { DateAdapter } from '@angular/material/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
// import { FlexLayoutModule } from '@angular/flex-layout';

export function getCulture() {
    let language = localStorage.getItem('language');
    if (language == 'en') {
        registerLocaleData(localeEl, 'en');
        return 'en';
    } else if (language == 'ru') {
        registerLocaleData(myLocaleRu);
        return 'ru';
    } else if (language == 'tr') {
        registerLocaleData(myLocaleTr);
        return 'tr';
    } else if (language == 'it') {
        registerLocaleData(localeIt);
        return 'it';
    } else if (language == 'es') {
        registerLocaleData(localeSp);
        return 'es';
    } else if (language == 'fr') {
        registerLocaleData(localeFr);
        return 'fr';
    } else {
        registerLocaleData(localeDe);
        return 'de';
    }
}

FullCalendarModule.registerPlugins([
    interactionPlugin,
    dayGridPlugin,
    timeGridPlugin,
]);

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		PageNotFoundComponent,
		ClubNewsComponent,
		ClubWallComponent,
		LimitTextPipe,
		ConfirmDialogComponent,
        UpdateConfirmDialogComponent,
		TooltipDirective,		
        ShortNumberPipe,
        DenyReasonConfirmDialogComponent,
        ComingSoonComponent,
		LazyImgDirective,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		AngularEditorModule,
		FullCalendarModule,
		NgMultiSelectDropDownModule.forRoot(),
		NgxPaginationModule,
		NgxDocViewerModule,
		MatTabsModule,
		MatProgressBarModule,
		ProgressBarModule,
		ImageCropperModule,
		// NgxMatColorPickerModule,
		ColorPickerModule,
		MatButtonToggleModule,
		CarouselModule,
		MatMenuModule,
		MatSidenavModule,
		MatBottomSheetModule,
		MatSelectModule,
		MatInputModule,
		MatExpansionModule,
        ToastrModule.forRoot({
            timeOut: 2000,
            disableTimeOut: false,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            closeButton: false,
          }),
        ToastContainerModule,
        NgChartsModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatRadioModule,
        MatGridListModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
        // FlexLayoutModule,
        NgxMaterialTimepickerModule
	],
	exports: [
		ConfirmDialogComponent,UpdateConfirmDialogComponent
	],

    providers: [
        AuthServiceService,
        LanguageService,
        AuthGuard,
        ConfirmDialogService,
        UpdateConfirmDialogService,
        DenyReasonConfirmDialogService,
		NgxImageCompressService,
        { provide: LOCALE_ID, useValue: getCulture()},
        { provide: DateAdapter, useClass: CustomDateAdapter }
        // { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS },
    ],

    bootstrap: [AppComponent],

    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
