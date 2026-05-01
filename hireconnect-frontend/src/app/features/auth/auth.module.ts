import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { GithubCallbackComponent } from './github-callback/github-callback.component';

const routes: Routes = [
  { path: 'login',           component: LoginComponent },
  { path: 'register',        component: RegisterComponent },
  { path: 'github/callback', component: GithubCallbackComponent }
];

@NgModule({
  declarations: [LoginComponent, RegisterComponent, GithubCallbackComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class AuthModule {}
