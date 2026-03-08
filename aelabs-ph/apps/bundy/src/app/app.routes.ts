import { Route } from '@angular/router';
import { BundyClockComponent } from './bundy-clock/bundy-clock';

export const appRoutes: Route[] = [
  {
    path: '',
    component: BundyClockComponent
    // loadChildren: () => import('./app-shell/app-shell.module').then(m => m.AppShellModule),
    // canActivate: [AuthGuard],
  },
    
];
