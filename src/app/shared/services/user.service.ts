import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, where, getDocs, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';




@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  userActivated:string = '';
  userEmail:any;
  currentUser:any;

  constructor(private auth: Auth,
              private firestore: Firestore,
              private router: Router) {}

  register(email:any, password:any){
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async createUser(data:any){
    //console.log(data)
    data.role = 'user';
    const usersRef = collection(this.firestore, 'users');
    return await setDoc(doc(usersRef, data.email), {
            username: data.username,
            email: data.email,
            role: data.role,
            password: data.password});
  }

  login(email:any, password:any){
    const auth = getAuth();
    signInWithEmailAndPassword(this.auth, email, password).then((res) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.userEmail = user.email;
          this.loggedIn.next(true);
          this.getUser(this.userEmail)
          this.router.navigate(['/index']);
          return console.log(this.userEmail);
        } else {
          this.userEmail = null;
          return console.log('Se ha cerrado sesion');
        }
      })
    }).catch((err) => {console.log(err)})
  }

  logout(){
    this.userEmail = '';
    this.auth.signOut();
    this.router.navigate(['/login']);
    this.loggedIn.next(false);
  }

  getUserEmail(){
    return this.userEmail;
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  async getUser(email:any){
    const usersRef = collection(this.firestore, 'users');
    const userQuery = query(usersRef, where('email', '==', email));
    const querySnapshot = getDocs(userQuery).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        this.currentUser = doc.data();
      })
    });

  }

}