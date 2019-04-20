import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UiModule } from '../ui';
import { AccountRoutingModule } from './account.routing';
import { LoginComponent } from './login/login.component';

const component = [
  LoginComponent,
];

@NgModule({
  imports: [SharedModule, UiModule, AccountRoutingModule],
  declarations: [...component]
})
export class AccountModule { }
