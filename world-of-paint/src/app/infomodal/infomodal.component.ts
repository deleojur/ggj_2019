import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../modal.service';
import { ConnectionService } from '../connection.service';

@Component
({
    selector: 'app-infomodal',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class InfomodalComponent implements OnInit 
{
    @ViewChild('content') content;

    color:      string;
    header:     string;
    message:    string;

    constructor(private ngbModal: NgbModal, private modalService: ModalService, private connectionService: ConnectionService) 
    {
        
    }

    private open(callback: Function)
    {
        this.color = this.connectionService.$color;
        this.ngbModal.open(this.content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => 
        {
            callback();
        }, (reason) => 
        {
            console.log('close it!');
            callback();
        });
    }

    ngOnInit()
    {
        this.modalService.add('info', this);
    }
}
