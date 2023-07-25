import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable() export class UpdateConfirmDialogService {
    private subject = new Subject<any>();
    message:any;
    denyDialogResponse = new Subject<any>();

    confirmThis(message: string, yesFn: () => void, noFn: () => void): any {
        this.setConfirmation(message, yesFn, noFn);
    }

    setConfirmation(message: string, yesFn: () => void, noFn: () => void): any {
        const that:this = this;
        this.subject.next({ type: 'confirm', text: message,
            yesFn(): any {
                    that.subject.next(); // This will close the modal
                    that.denyDialogResponse.next(message);
                    yesFn();
                },
            noFn(): any {
                that.subject.next();
                noFn();
            }
        });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
