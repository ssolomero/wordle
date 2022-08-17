import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appWordleInput]'
})
export class WordleDirective {

  @Input() letterNum!:any;
  @Input() attemptNum!:any;
  @Input() color = '';
  
  elementRef:any;

  constructor(el: ElementRef) {
    this.elementRef = el;
  }

  @HostListener('input', ['$event.target']) onInput(input:any) {
    const length = input.value.length;
    const maxLength = input.attributes.maxlength.value;
    const nextElem = this.elementRef.nativeElement.nextSibling;
    const currentElem = this.elementRef.nativeElement;
    
    if (nextElem && nextElem.disabled != undefined && length >= maxLength) {
      nextElem.disabled = false;
      nextElem.focus();
      currentElem.disabled = true;
    }
  }

}