import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit, AfterViewInit
{
	@Input() text: string;

    @ViewChild('button', {static: false}) buttonimg: ElementRef;
	private buttonElement: any;
	
	private isDragging: boolean = false;

    constructor() 
    {
        
    }

    ngOnInit() 
    {
        
    }

    ngAfterViewInit()
    {
        this.buttonElement = this.buttonimg.nativeElement;
	}

    touchstart(): void
    {
		this.buttonElement.src = 'assets/UI/window/btn_brown_hover.svg';
	}

    touchend(): void
    {
		this.buttonElement.src = 'assets/UI/window/btn_brown_normal.svg';
    }
}