import { GUIObject, GUIObjectOptions } from './gui-object';

export interface GUITextOptions extends GUIObjectOptions
{
    text: string;
    text_color: string;
    font_family: string;
    font_size: number;
}

export class GUIText extends GUIObject
{
    private 
}