// this is the Angular domain model

/**
 * View-model for the switch-plate configurator UI (catalog only).
 * All `id` fields align with backend entity UUIDs (or stable codes where noted).
 */
export interface ConfigOption {
  id: string;
  label: string;
  code: string;
}

export interface StyleOption extends ConfigOption {
  supportsCustomColours: boolean;
  /** Colour-combination row ids allowed for this style (from style–colour join). */
  allowedColourCombinationIds: string[];
}

export interface ColourCombination {
  id: string;
  label: string;
  code: string;
  colours: {
    backplate: string;
    faceplate: string;
    mech: string;
  };
}

export interface MechOption extends ConfigOption {
  supportsColour: boolean;
}

export interface ProductMap {
  styles: StyleOption[];
  colours: ConfigOption[];
  orientations: ConfigOption[];
  mechs: MechOption[];
  combinations: ColourCombination[];
}
