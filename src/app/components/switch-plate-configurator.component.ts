import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';

import type { ColourCombination, ProductMap } from '../core/domains/models/switch-plate-catalog.model';
import { SwitchPlateCatalogService } from '../core/domains/services/switch-plate-catalog.service';

@Component({
  selector: 'app-switch-plate-configurator',
  imports: [ReactiveFormsModule],
  template: `
    @if (loadError) {
      <section class="configurator">
        <p class="error" role="alert">{{ loadError }}</p>
      </section>
    } @else if (loading || !form) {
      <section class="configurator">
        <p>Loading catalog…</p>
      </section>
    } @else {
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
                @for (style of productMap!.styles; track style.id) {
                  <option [value]="style.id">{{ style.label }}</option>
                }
              </select>
            </label>

            <label>
              Number of Gangs
              <select formControlName="gangs">
                @for (gang of gangOptions; track gang) {
                  <option [value]="gang">{{ gang }} Gang</option>
                }
              </select>
            </label>

            <label>
              Orientation
              <select formControlName="orientation">
                @for (orientation of productMap!.orientations; track orientation.id) {
                  <option [value]="orientation.id">
                    {{ orientation.label }}
                  </option>
                }
              </select>
            </label>

            @if (isVisionStyle()) {
              <h3>Vision Colours</h3>
              <label>
                Backplate Colour
                <select formControlName="backplateColour">
                  @for (colour of productMap!.colours; track colour.id) {
                    <option [value]="colour.id">{{ colour.label }}</option>
                  }
                </select>
              </label>
              <label>
                Faceplate Colour
                <select formControlName="faceplateColour">
                  @for (colour of productMap!.colours; track colour.id) {
                    <option [value]="colour.id">{{ colour.label }}</option>
                  }
                </select>
              </label>
              <label>
                Default Mech Colour
                <select formControlName="mechColour">
                  @for (colour of productMap!.colours; track colour.id) {
                    <option [value]="colour.id">{{ colour.label }}</option>
                  }
                </select>
              </label>
            } @else {
              <h3>Colour Combination</h3>
              <label>
                Combination
                <select formControlName="combination">
                  @for (combination of availableCombinations(); track combination.id) {
                    <option [value]="combination.id">
                      {{ combination.label }}
                    </option>
                  }
                </select>
              </label>
            }
          </div>

          <div class="card">
            <h2>Mech Selection</h2>
            <p class="hint">The selector count follows the selected gang count.</p>

            <div formArrayName="mechs" class="mechs">
              @for (mech of mechs.controls; track $index) {
                <fieldset [formGroupName]="$index">
                  <legend>Gang {{ $index + 1 }}</legend>
                  <label>
                    Mech Type
                    <select formControlName="type">
                      @for (option of productMap!.mechs; track option.id) {
                        <option [value]="option.id">{{ option.label }}</option>
                      }
                    </select>
                  </label>
                  @if (isVisionStyle() && supportsMechColour(mech.value.type)) {
                    <label>
                      Switch Colour
                      <select formControlName="colour">
                        @for (colour of productMap!.colours; track colour.id) {
                          <option [value]="colour.id">{{ colour.label }}</option>
                        }
                      </select>
                    </label>
                  }
                </fieldset>
              }
            </div>
          </div>
        </div>

        <section class="output">
          <p class="eyebrow">Generated Part Number</p>
          <strong>{{ partNumber }}</strong>
        </section>
      </section>
    }
  `,
  styleUrls: ['./switch-plate-configurator.component.css'],
})
export class SwitchPlateConfiguratorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(SwitchPlateCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() configurationChange = new EventEmitter<{
    value: unknown;
    partNumber: string;
  }>();

  readonly gangOptions = [1, 2, 3, 4, 5, 6];
  partNumber = '';
  loading = true;
  loadError: string | null = null;
  productMap: ProductMap | null = null;
  form: FormGroup | null = null;

  ngOnInit(): void {
    this.catalog
      .loadCatalog()
      .pipe(take(1))
      .subscribe({
        next: (pm: ProductMap) => {
          this.productMap = pm;
          const form = this.fb.group({
            style: this.fb.nonNullable.control(pm.styles[0]?.id ?? ''),
            gangs: this.fb.nonNullable.control(1),
            orientation: this.fb.nonNullable.control(pm.orientations[0]?.id ?? ''),
            backplateColour: this.fb.nonNullable.control(pm.colours[0]?.id ?? ''),
            faceplateColour: this.fb.nonNullable.control(pm.colours[0]?.id ?? ''),
            mechColour: this.fb.nonNullable.control(pm.colours[0]?.id ?? ''),
            combination: this.fb.nonNullable.control(''),
            mechs: this.fb.array([this.createMechGroup(pm)]),
          });
          this.form = form;

          form.controls['gangs'].valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((gangs) => this.syncMechCount(Number(gangs)));

          form.controls['style'].valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.applyStyleDefaults());

          form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updatePartNumber();
          });

          this.applyStyleDefaults();
          this.updatePartNumber();
          this.loading = false;
        },
        error: (err: unknown) => {
          this.loading = false;
          this.loadError = err instanceof Error ? err.message : String(err);
        },
      });
  }

  get mechs(): FormArray {
    return this.form?.get('mechs') as FormArray;
  }

  isVisionStyle(): boolean {
    return this.currentStyle()?.supportsCustomColours ?? false;
  }

  availableCombinations(): ColourCombination[] {
    const pm = this.productMap;
    const style = this.currentStyle();
    if (!pm || !style) {
      return [];
    }
    const allowed = new Set(style.allowedColourCombinationIds);
    return pm.combinations.filter((c) => allowed.has(c.id));
  }

  supportsMechColour(type: string): boolean {
    const pm = this.productMap;
    if (!pm) {
      return false;
    }
    return pm.mechs.find((m) => m.id === type)?.supportsColour ?? false;
  }

  private syncMechCount(gangs: number): void {
    const pm = this.productMap;
    const form = this.form;
    if (!pm || !form) {
      return;
    }
    const arr = form.get('mechs') as FormArray;
    while (arr.length < gangs) {
      arr.push(this.createMechGroup(pm));
    }
    while (arr.length > gangs) {
      arr.removeAt(arr.length - 1);
    }
    this.updatePartNumber();
  }

  private applyStyleDefaults(): void {
    const pm = this.productMap;
    const form = this.form;
    if (!pm || !form) {
      return;
    }
    if (this.isVisionStyle()) {
      this.updatePartNumber();
      return;
    }

    const first = this.availableCombinations()[0];
    if (first) {
      form.patchValue(
        {
          combination: first.id,
          backplateColour: first.colours.backplate,
          faceplateColour: first.colours.faceplate,
          mechColour: first.colours.mech,
        },
        { emitEvent: false },
      );
    }

    this.updatePartNumber();
  }

  private createMechGroup(pm: ProductMap): FormGroup {
    return this.fb.group({
      type: this.fb.nonNullable.control(pm.mechs[0]?.id ?? ''),
      colour: this.fb.nonNullable.control(pm.colours[0]?.id ?? ''),
    });
  }

  private updatePartNumber(): void {
    const form = this.form;
    const pm = this.productMap;
    if (!form || !pm) {
      return;
    }
    this.partNumber = this.generatePartNumber(pm, form);
    this.configurationChange.emit({
      value: form.getRawValue(),
      partNumber: this.partNumber,
    });
  }

  private generatePartNumber(pm: ProductMap, form: FormGroup): string {
    const value = form.getRawValue() as {
      style: string;
      gangs: number;
      orientation: string;
      backplateColour: string;
      faceplateColour: string;
      mechColour: string;
      combination: string;
      mechs: Array<{ type: string; colour: string }>;
    };
    const styleCode = this.currentStyle()?.code ?? 'NA';
    const orientationCode =
      pm.orientations.find((o) => o.id === value.orientation)?.code ?? 'NA';
    const finishCode = this.isVisionStyle()
      ? `${this.colourCode(pm, value.backplateColour)}${this.colourCode(pm, value.faceplateColour)}`
      : (pm.combinations.find((c) => c.id === value.combination)?.code ?? 'NA');
    const mechCodes = value.mechs.map((mech) => {
      const code = pm.mechs.find((m) => m.id === mech.type)?.code ?? 'NA';
      return this.isVisionStyle() && this.supportsMechColour(mech.type)
        ? `${code}${this.colourCode(pm, mech.colour)}`
        : code;
    });

    return [styleCode, `${value.gangs}G`, orientationCode, finishCode, ...mechCodes].join('-');
  }

  private colourCode(pm: ProductMap, colourId: string): string {
    return pm.colours.find((c) => c.id === colourId)?.code ?? 'NA';
  }

  private currentStyle() {
    const pm = this.productMap;
    const form = this.form;
    if (!pm || !form) {
      return undefined;
    }
    const styleId = form.controls['style'].value as string;
    return pm.styles.find((s) => s.id === styleId);
  }
}
