import { NgModule } from '@angular/core';
import { PreloadAllModules, Router, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { LayoutComponent } from './common/layout/layout.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { ClubWallComponent } from './member/club-wall/club-wall.component';
import { LoginComponent } from './pages/login/login.component';


import { ClubNewsComponent } from './member/news/club-news/club-news.component';
import { ClubDatesComponent } from './member/club-dates/club-dates.component';

import { RouteGuard } from './guard/route.guard';
import { MembersGuard } from './guard/members.guard';
import { ClubEventsComponent } from './member/events/club-events/club-events.component';
import { ApplicationstateService } from './service/applicationstate.service';

import { MemberLightGuard } from './guard/member-light.guard';

var userDetails = JSON.parse(localStorage.getItem('user-data'));

const desktop_routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '', component: LayoutComponent, canActivate: [AuthGuard], children: [
            {
                path: '', component: ClubWallComponent, children: [
                    { path: 'club-news', component: ClubNewsComponent },
                    { path: 'club-dates', component: ClubDatesComponent },
                    { path: 'club-events', component: ClubEventsComponent }
                ]
            },
            {
                path: 'clubwall', component: ClubWallComponent, children: [
                    { path: 'club-news', component: ClubNewsComponent },
                    { path: 'club-dates', component: ClubDatesComponent },
                    { path: 'club-events', component: ClubEventsComponent }
                ]
            },           
        ]
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];



@NgModule({
    imports: [RouterModule.forRoot(desktop_routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
// export class AppRoutingModule { }

export class AppRoutingModule {

    public constructor(private router: Router,
        private applicationStateService: ApplicationstateService) {

        // if (applicationStateService.getIsMobileResolution()) {
        //     router.resetConfig(mobile_routes);
        // }
    }

    /**
     * this function inject new routes for the given module instead the current routes. the operation happens on the given current routes object so after
     * this method a call to reset routes on router should be called with the the current routes object.
     * @param currentRoutes
     * @param routesToInject
     * @param childNameToReplaceRoutesUnder - the module name to replace its routes.
     */
    private injectModuleRoutes(currentRoutes: Routes, routesToInject: Routes, childNameToReplaceRoutesUnder: string): void {
        for (let i = 0; i < currentRoutes.length; i++) {
            if (currentRoutes[i].loadChildren != null &&
                currentRoutes[i].loadChildren.toString().indexOf(childNameToReplaceRoutesUnder) != -1) {
                // we found it. taking the route prefix
                let prefixRoute: string = currentRoutes[i].path;
                // first removing the module line
                currentRoutes.splice(i, 1);
                // now injecting the new routes
                // we need to add the prefix route first
                this.addPrefixToRoutes(routesToInject, prefixRoute);
                for (let route of routesToInject) {
                    currentRoutes.push(route);
                }
                // since we found it we can break the injection
                return;
            }

            if (currentRoutes[i].children != null) {
                this.injectModuleRoutes(currentRoutes[i].children, routesToInject, childNameToReplaceRoutesUnder);
            }
        }
    }

    private addPrefixToRoutes(routes: Routes, prefix: string) {
        for (let i = 0; i < routes.length; i++) {
            routes[i].path = prefix + '/' + routes[i].path;
        }
    }

    changeRoute() {
        this.router.resetConfig(desktop_routes);
    }
}
