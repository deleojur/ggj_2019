import { Injectable } from '@angular/core';

@Injectable
({
    providedIn: 'root'
})
export class ModalService 
{
    private modals = { };
 
    add(id: string, modal: any) 
    {
        // add modal to array of active modals
        this.modals[id] = modal;
    }
 
    open(id: string, callback: Function)
    {
        let modal: any = this.modals[id];
        modal.open(callback); //callback is called when the modal is closed.
        return modal;
    }
 
    close(id: string)
    {
        // close modal specified by id
        let modal: any = this.modals[id];
        modal.close();
    }
}
