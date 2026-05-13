import type {
  SwitchPlateConfigResultDto,
  SwitchPlateStyleColourCombinationDto,
} from '../domains/models/switch-plate-config-api.model';
import type {
  ColourCombination,
  ConfigOption,
  MechOption,
  ProductMap,
  StyleOption,
} from '../domains/models/switch-plate-catalog.model';

function mapColour(d: { id: string; name: string; code: string }): ConfigOption {
  return { id: d.id, label: d.name, code: d.code };
}

function mapMech(d: {
  id: string;
  name: string;
  code: string;
  supportsColour: boolean;
}): MechOption {
  return {
    id: d.id,
    label: d.name,
    code: d.code,
    supportsColour: d.supportsColour,
  };
}

function mapColourCombination(
  d: SwitchPlateConfigResultDto['colourCombinations'][number],
): ColourCombination {
  return {
    id: d.id,
    label: d.name,
    code: d.code,
    colours: {
      backplate: d.backplateColour.id,
      faceplate: d.faceplateColour.id,
      mech: d.mechColour.id,
    },
  };
}

function buildAllowedCombinationIdsByStyleId(
  links: SwitchPlateStyleColourCombinationDto[],
): Map<string, string[]> {
  const map = new Map<string, Set<string>>();
  for (const link of links) {
    const styleId = link.style.id;
    const comboId = link.colourCombination.id;
    if (!map.has(styleId)) {
      map.set(styleId, new Set());
    }
    map.get(styleId)!.add(comboId);
  }
  const out = new Map<string, string[]>();
  for (const [styleId, set] of map) {
    out.set(styleId, [...set]);
  }
  return out;
}

export function mapSwitchPlateConfigToCatalog(
  dto: SwitchPlateConfigResultDto,
): ProductMap {
  const allowed = buildAllowedCombinationIdsByStyleId(dto.styleColourCombinations);

  const styles: StyleOption[] = dto.styles.map((s) => ({
    id: s.id,
    label: s.name,
    code: s.code,
    supportsCustomColours: s.supportsCustomColours,
    allowedColourCombinationIds: allowed.get(s.id) ?? [],
  }));

  const combinations = dto.colourCombinations.map(mapColourCombination);

  return {
    styles,
    colours: dto.colours.map(mapColour),
    orientations: dto.orientations.map(mapColour),
    mechs: dto.mechs.map(mapMech),
    combinations,
  };
}
