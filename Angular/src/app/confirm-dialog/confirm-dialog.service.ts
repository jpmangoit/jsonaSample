import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable() export class ConfirmDialogService {
    private subject = new Subject<any>();
    dialogResponse = new Subject<any>();

    confirmThis(message: string, yesFn: () => void, noFn: () => void,isAction?:any): any {
        this.setConfirmation(message, yesFn, noFn,isAction);
    }

    setConfirmation(message: string, yesFn: () => void, noFn: () => void , isAction?:any): any {
        const that:this = this;
        this.subject.next({ type: 'confirm', text: message,
            yesFn(): any {
                that.subject.next(); // This will close the modal
                yesFn();
                if(isAction){
                    that.dialogResponse.next(message);
                }
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
