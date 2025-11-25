import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent implements ControlValueAccessor {
  @Input() readonly = false;
  @Input() size: 'normal' | 'small' = 'normal';
  @Input() showValue = false;
  @Input() set value(val: number) {
    if (val !== undefined) {
      this._value = val;
      this.onChange(this._value);
    }
  }
  get value(): number {
    return this._value;
  }

  private _value = 0;
  hoverValue = 0;
  disabled = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: number): void {
    this._value = value || 0;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRate(value: number): void {
    if (!this.disabled && !this.readonly) {
      this.value = value;
      this.onTouched();
    }
  }

  onHover(value: number): void {
    if (!this.disabled && !this.readonly) {
      this.hoverValue = value;
    }
  }

  isHalfStar(star: number): boolean {
    return Math.ceil(this._value) === star && this._value % 1 !== 0;
  }
}
