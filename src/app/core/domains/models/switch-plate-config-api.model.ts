// this is to mapping the Backend API response to the Angular domain model

/** Backend `successResponse` envelope. */
export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

export interface SwitchPlateStyleDto {
  id: string;
  name: string;
  code: string;
  supportsCustomColours: boolean;
}

export interface SwitchPlateColourDto {
  id: string;
  name: string;
  code: string;
}

export interface SwitchPlateOrientationDto {
  id: string;
  name: string;
  code: string;
}

export interface SwitchPlateMechDto {
  id: string;
  name: string;
  code: string;
  supportsColour: boolean;
}

export interface SwitchPlateColourCombinationDto {
  id: string;
  name: string;
  code: string;
  backplateColour: SwitchPlateColourDto;
  faceplateColour: SwitchPlateColourDto;
  mechColour: SwitchPlateColourDto;
}

export interface SwitchPlateStyleColourCombinationDto {
  id: string;
  style: SwitchPlateStyleDto;
  colourCombination: SwitchPlateColourCombinationDto;
}

/** Payload of `GET .../config` → `result`. */
export interface SwitchPlateConfigResultDto {
  styles: SwitchPlateStyleDto[];
  colours: SwitchPlateColourDto[];
  orientations: SwitchPlateOrientationDto[];
  mechs: SwitchPlateMechDto[];
  colourCombinations: SwitchPlateColourCombinationDto[];
  styleColourCombinations: SwitchPlateStyleColourCombinationDto[];
}
