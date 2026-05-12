import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

type StyleId = 'vision' | 'horizon' | 'infinity' | 'eclipse';
type ColourId = 'black' | 'white';
type OrientationId = 'horizontal' | 'vertical';
type MechId = '10a-switch' | '16a-switch' | 'usb-a' | 'usb-ac' | 'satellite' | 'tv' | 'data';

interface ConfigOption<T> {
  id: T;
  label: string;
  code: string;
}

interface StyleOption extends ConfigOption<StyleId> {
  supportsCustomColours: boolean;
  combinations: string[];
}

interface ColourCombination {
  id: string;
  label: string;
  code: string;
  colours: {
    backplate: ColourId;
    faceplate: ColourId;
    mech: ColourId;
  };
}

interface ProductMap {
  styles: StyleOption[];
  colours: Array<ConfigOption<ColourId>>;
  orientations: Array<ConfigOption<OrientationId>>;
  mechs: Array<ConfigOption<MechId> & { supportsColour: boolean }>;
  combinations: ColourCombination[];
}

const PRODUCT_MAP: ProductMap = {
  styles: [
    { id: 'vision', label: 'Vision', code: 'VSW', supportsCustomColours: true, combinations: [] },
    { id: 'horizon', label: 'Horizon', code: 'HSW', supportsCustomColours: false, combinations: ['full-white'] },
    { id: 'infinity', label: 'Infinity', code: 'ISW', supportsCustomColours: false, combinations: ['full-white', 'full-black'] },
    { id: 'eclipse', label: 'Eclipse', code: 'ESW', supportsCustomColours: false, combinations: ['full-white'] },
  ],
  colours: [
    { id: 'black', label: 'Black', code: 'B' },
    { id: 'white', label: 'White', code: 'W' },
  ],
  orientations: [
    { id: 'horizontal', label: 'Horizontal', code: 'H' },
    { id: 'vertical', label: 'Vertical', code: 'V' },
  ],
  mechs: [
    { id: '10a-switch', label: '10A Switch', code: '10', supportsColour: true },
    { id: '16a-switch', label: '16A Switch', code: '16', supportsColour: true },
    { id: 'usb-a', label: 'USB A', code: 'USBA', supportsColour: false },
    { id: 'usb-ac', label: 'USB A/C', code: 'USBAC', supportsColour: false },
    { id: 'satellite', label: 'Satellite', code: 'SAT', supportsColour: false },
    { id: 'tv', label: 'TV', code: 'TV', supportsColour: false },
    { id: 'data', label: 'Data', code: 'DATA', supportsColour: false },
  ],
  combinations: [
    {
      id: 'full-white',
      label: 'Full White',
      code: 'WWW',
      colours: { backplate: 'white', faceplate: 'white', mech: 'white' },
    },
    {
      id: 'full-black',
      label: 'Full Black',
      code: 'BBB',
      colours: { backplate: 'black', faceplate: 'black', mech: 'black' },
    },
  ],
};

@Component({
  selector: 'app-switch-plate-configurator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="configurator" [formGroup]="form">
      <header class="hero">
        <h1>Switch Plate Configurator</h1>
      </header>

      <div class="layout">
        <div class="card">
          <h2>Plate Configuration</h2>

          <label>
            Style
            <select formControlName="style">
              <option *ngFor="let style of productMap.styles" [value]="style.id">{{ style.label }}</option>
            </select>
          </label>

          <label>
            Number of Gangs
            <select formControlName="gangs">
              <option *ngFor="let gang of gangOptions" [value]="gang">{{ gang }} Gang</option>
            </select>
          </label>

          <label>
            Orientation
            <select formControlName="orientation">
              <option *ngFor="let orientation of productMap.orientations" [value]="orientation.id">
                {{ orientation.label }}
              </option>
            </select>
          </label>

          <ng-container *ngIf="isVisionStyle(); else fixedCombination">
            <h3>Vision Colours</h3>
            <label>
              Backplate Colour
              <select formControlName="backplateColour">
                <option *ngFor="let colour of productMap.colours" [value]="colour.id">{{ colour.label }}</option>
              </select>
            </label>
            <label>
              Faceplate Colour
              <select formControlName="faceplateColour">
                <option *ngFor="let colour of productMap.colours" [value]="colour.id">{{ colour.label }}</option>
              </select>
            </label>
            <label>
              Default Mech Colour
              <select formControlName="mechColour">
                <option *ngFor="let colour of productMap.colours" [value]="colour.id">{{ colour.label }}</option>
              </select>
            </label>
          </ng-container>

          <ng-template #fixedCombination>
            <h3>Colour Combination</h3>
            <label>
              Combination
              <select formControlName="combination">
                <option *ngFor="let combination of availableCombinations()" [value]="combination.id">
                  {{ combination.label }}
                </option>
              </select>
            </label>
          </ng-template>
        </div>

        <div class="card">
          <h2>Mech Selection</h2>
          <p class="hint">The selector count follows the selected gang count.</p>

          <div formArrayName="mechs" class="mechs">
            <fieldset *ngFor="let mech of mechs.controls; let i = index" [formGroupName]="i">
              <legend>Gang {{ i + 1 }}</legend>
              <label>
                Mech Type
                <select formControlName="type">
                  <option *ngFor="let option of productMap.mechs" [value]="option.id">{{ option.label }}</option>
                </select>
              </label>
              <label *ngIf="isVisionStyle() && supportsMechColour(mech.value.type)">
                Switch Colour
                <select formControlName="colour">
                  <option *ngFor="let colour of productMap.colours" [value]="colour.id">{{ colour.label }}</option>
                </select>
              </label>
            </fieldset>
          </div>
        </div>
      </div>

      <section class="output">
        <p class="eyebrow">Generated Part Number</p>
        <strong>{{ partNumber }}</strong>
      </section>
    </section>
  `,
  styleUrls: ['./switch-plate-configurator.component.css'],
})
export class SwitchPlateConfiguratorComponent implements OnInit {
  @Input() productMap: ProductMap = PRODUCT_MAP;
  @Output() configurationChange = new EventEmitter<{ value: unknown; partNumber: string }>();

  readonly gangOptions = [1, 2, 3, 4, 5, 6];
  partNumber = '';

  readonly form = this.fb.group({
    style: this.fb.nonNullable.control<StyleId>('vision'),
    gangs: this.fb.nonNullable.control(1),
    orientation: this.fb.nonNullable.control<OrientationId>('horizontal'),
    backplateColour: this.fb.nonNullable.control<ColourId>('black'),
    faceplateColour: this.fb.nonNullable.control<ColourId>('white'),
    mechColour: this.fb.nonNullable.control<ColourId>('white'),
    combination: this.fb.nonNullable.control('full-white'),
    mechs: this.fb.array([this.createMech()]),
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.controls.gangs.valueChanges.subscribe((gangs) => this.syncMechCount(Number(gangs)));
    this.form.controls.style.valueChanges.subscribe(() => this.applyStyleDefaults());
    this.form.valueChanges.subscribe(() => this.updatePartNumber());
    this.updatePartNumber();
  }

  get mechs(): FormArray {
    return this.form.controls.mechs;
  }

  isVisionStyle(): boolean {
    return this.currentStyle()?.supportsCustomColours ?? false;
  }

  availableCombinations(): ColourCombination[] {
    const allowed = this.currentStyle()?.combinations ?? [];

    return this.productMap.combinations.filter((combination) => allowed.includes(combination.id));
  }

  supportsMechColour(type: MechId): boolean {
    return this.productMap.mechs.find((mech) => mech.id === type)?.supportsColour ?? false;
  }

  private syncMechCount(gangs: number): void {
    while (this.mechs.length < gangs) {
      this.mechs.push(this.createMech());
    }

    while (this.mechs.length > gangs) {
      this.mechs.removeAt(this.mechs.length - 1);
    }

    this.updatePartNumber();
  }

  private applyStyleDefaults(): void {
    if (this.isVisionStyle()) {
      this.updatePartNumber();
      return;
    }

    const firstCombination = this.availableCombinations()[0];

    if (firstCombination) {
      this.form.patchValue(
        {
          combination: firstCombination.id,
          backplateColour: firstCombination.colours.backplate,
          faceplateColour: firstCombination.colours.faceplate,
          mechColour: firstCombination.colours.mech,
        },
        { emitEvent: false },
      );
    }

    this.updatePartNumber();
  }

  private createMech() {
    return this.fb.group({
      type: this.fb.nonNullable.control<MechId>('10a-switch'),
      colour: this.fb.nonNullable.control<ColourId>('white'),
    });
  }

  private updatePartNumber(): void {
    this.partNumber = this.generatePartNumber();
    this.configurationChange.emit({
      value: this.form.getRawValue(),
      partNumber: this.partNumber,
    });
  }

  private generatePartNumber(): string {
    const value = this.form.getRawValue();
    const styleCode = this.currentStyle()?.code ?? 'NA';
    const orientationCode = this.productMap.orientations.find((item) => item.id === value.orientation)?.code ?? 'NA';
    const finishCode = this.isVisionStyle()
      ? `${this.colourCode(value.backplateColour)}${this.colourCode(value.faceplateColour)}`
      : this.productMap.combinations.find((item) => item.id === value.combination)?.code ?? 'NA';
    const mechCodes = value.mechs.map((mech) => {
      const code = this.productMap.mechs.find((item) => item.id === mech.type)?.code ?? 'NA';
      return this.isVisionStyle() && this.supportsMechColour(mech.type)
        ? `${code}${this.colourCode(mech.colour)}`
        : code;
    });

    return [styleCode, `${value.gangs}G`, orientationCode, finishCode, ...mechCodes].join('-');
  }

  private colourCode(colour: ColourId): string {
    return this.productMap.colours.find((item) => item.id === colour)?.code ?? 'NA';
  }

  private currentStyle(): StyleOption | undefined {
    return this.productMap.styles.find((style) => style.id === this.form.controls.style.value);
  }
}
