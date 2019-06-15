import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { MovableDirective } from './movable.directive';
import { MovableAreaDirective } from './movable-area.directive';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule
  ],
  declarations: [MovableDirective, MovableAreaDirective],
  exports: [MovableDirective, MovableAreaDirective]
})
export class DraggableModule { }
