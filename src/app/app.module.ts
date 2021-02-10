import { RegisterComponent } from './auth/register/register.component';
import { GooglePlacesComponent } from './shared/googlemaps/google-places/google-places.component';
import { UserPathGuard } from './auth/user-path.guard';
import { AuthService } from './auth/services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SendEmailComponent } from './auth/send-email/send-email.component';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './main/dashboard/dashboard.component';
import { RoomComponent } from './main/room/room.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SendEmailComponent,
    GooglePlacesComponent,
    RegisterComponent,
    LoginComponent,
    ForgotPasswordComponent,
    HomeComponent,
    DashboardComponent,
    RoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AgmCoreModule.forRoot({
      apiKey:'AIzaSyB43xdCiRB2Oe23bTblaZrEZefPdBrhxks'
    }),
    HttpClientModule,
    FormsModule



  ],
  providers: [AuthService, UserPathGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
