import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../services/modal.service';
import { ConnectionService } from '../../services/connection.service';

@Component
({
    selector: 'app-menumodal',
    templateUrl: './menumodal.component.html',
    styleUrls: ['./menumodal.component.scss']
})
export class MenumodalComponent implements OnInit 
{
    @ViewChild('content', {static: false}) content;

    buttons:    [];
    color:      string;
    header:     string;
    message:    string;

    constructor(private ngbModal: NgbModal, private modalService: ModalService) 
    {
        
    }

    private open(callback: Function, params: any)
    {
        this.buttons = params;
        this.ngbModal.open(this.content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => 
        {
            callback();
        }, (reason) => 
        {
            callback();
        });
    }

    ngOnInit()
    {
        this.modalService.add('menu', this);
    }
}
